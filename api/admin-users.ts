import {
  getMissingServiceCredentialNames,
  getServiceSupabaseClient,
  requireAdminUser,
} from './_lib/stripeGateway.ts';

type AdminRole = 'admin' | 'superadmin' | 'manager';

const VALID_ROLES: AdminRole[] = ['admin', 'superadmin', 'manager'];

function normalizeEmail(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toLowerCase() : '';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeRole(raw: unknown): AdminRole {
  if (typeof raw === 'string' && VALID_ROLES.includes(raw as AdminRole)) {
    return raw as AdminRole;
  }
  return 'admin';
}

function resolveOrigin(req: any): string {
  const protoHeader = (req.headers?.['x-forwarded-proto'] || 'https') as string;
  const proto = protoHeader.split(',')[0].trim() || 'https';
  const hostHeader = (req.headers?.['x-forwarded-host'] || req.headers?.host || 'www.delightfuljuices.com') as string;
  const host = hostHeader.split(',')[0].trim();
  return `${proto}://${host}`;
}

async function ensureCallerProfileSeeded(
  supabase: NonNullable<ReturnType<typeof getServiceSupabaseClient>>,
  callerUserId: string,
  callerEmail: string
) {
  // Ensure the active caller stays authorized once admin_profiles has at least 1 row
  if (!callerUserId) return;
  try {
    await supabase
      .from('admin_profiles')
      .upsert(
        {
          id: callerUserId,
          email: (callerEmail || 'admin').toLowerCase(),
          role: 'superadmin',
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );
  } catch {
    // Non-blocking if admin_profiles table isn't migrated yet
  }
}

async function listCombinedAdmins(
  supabase: NonNullable<ReturnType<typeof getServiceSupabaseClient>>
) {
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  });

  if (usersError) {
    throw new Error(usersError.message || 'Unable to list Supabase Auth users.');
  }

  let profileRows: Array<{ id: string; email: string; role: string; created_at?: string }> = [];
  let profilesTableAvailable = true;

  const { data: profiles, error: profilesError } = await supabase
    .from('admin_profiles')
    .select('id, email, role, created_at');

  if (profilesError) {
    profilesTableAvailable = false;
  } else if (Array.isArray(profiles)) {
    profileRows = profiles;
  }

  const profileById = new Map(profileRows.map((p) => [p.id, p]));
  const authUsers = usersData?.users || [];

  const admins = authUsers
    .filter((u) => !profilesTableAvailable || profileRows.length === 0 || profileById.has(u.id))
    .map((u) => {
      const profile = profileById.get(u.id);
      return {
        id: u.id,
        email: u.email || profile?.email || '',
        role: sanitizeRole(profile?.role || (u.user_metadata?.role as string) || 'admin'),
        confirmed: Boolean(u.email_confirmed_at),
        emailConfirmedAt: u.email_confirmed_at || null,
        lastSignInAt: u.last_sign_in_at || null,
        createdAt: u.created_at || profile?.created_at || null,
        inAdminProfiles: Boolean(profile),
      };
    });

  return {
    admins,
    profilesTableAvailable,
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  const auth = await requireAdminUser(req);
  if (!auth.authorized) {
    return res.status(auth.statusCode).json({ error: 'UNAUTHORIZED', message: auth.error });
  }

  const supabase = getServiceSupabaseClient();
  const missingCredentials = getMissingServiceCredentialNames();

  if (!supabase) {
    return res.status(req.method === 'GET' ? 200 : 503).json({
      serviceConfigured: false,
      missingCredentials,
      currentUserId: auth.userId || null,
      currentUserEmail: auth.email || null,
      admins: [],
      profilesTableAvailable: false,
      message: `Missing server credential(s): ${missingCredentials.join(
        ', '
      )}. Configure them in your server environment or add admins directly in Supabase Dashboard → Authentication → Users.`,
    });
  }

  if (req.method === 'GET') {
    try {
      const { admins, profilesTableAvailable } = await listCombinedAdmins(supabase);
      return res.status(200).json({
        serviceConfigured: true,
        missingCredentials: [],
        currentUserId: auth.userId || null,
        currentUserEmail: auth.email || null,
        admins,
        profilesTableAvailable,
      });
    } catch (err: any) {
      return res.status(500).json({
        error: 'LIST_ADMINS_FAILED',
        message: err?.message || 'Unable to fetch administrator accounts.',
      });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Use GET or POST.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const action = typeof body.action === 'string' ? body.action.trim() : '';

  try {
    if (action === 'create_admin') {
      const email = normalizeEmail(body.email);
      const role = sanitizeRole(body.role);
      const mode = body.mode === 'invite' ? 'invite' : 'password';
      const password = typeof body.password === 'string' ? body.password : '';

      if (!email || !isValidEmail(email)) {
        return res.status(400).json({
          error: 'INVALID_EMAIL',
          message: 'Please enter a valid administrator email address.',
        });
      }

      if (mode === 'password' && password.length < 8) {
        return res.status(400).json({
          error: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters long.',
        });
      }

      // Check whether a user with this email already exists
      const { data: existingList, error: listErr } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (listErr) {
        return res.status(500).json({ error: 'AUTH_LOOKUP_FAILED', message: listErr.message });
      }

      const existingUser = (existingList?.users || []).find(
        (u) => (u.email || '').toLowerCase() === email
      );

      let targetUserId = existingUser?.id || '';
      let notice = '';

      if (existingUser) {
        const updatePayload: {
          email_confirm?: boolean;
          password?: string;
          user_metadata?: Record<string, any>;
        } = {
          email_confirm: true,
          user_metadata: { ...(existingUser.user_metadata || {}), role },
        };
        if (mode === 'password' && password.length >= 8) {
          updatePayload.password = password;
        }
        const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          updatePayload
        );
        if (updateErr) {
          return res.status(400).json({
            error: 'UPDATE_ADMIN_FAILED',
            message: updateErr.message || 'Could not update existing Supabase account.',
          });
        }
        targetUserId = updated.user?.id || existingUser.id;
        notice =
          mode === 'password'
            ? `Updated password and granted ${role} CMS access to ${email}.`
            : `Granted ${role} CMS access to existing user ${email}.`;
      } else if (mode === 'invite') {
        const redirectTo = `${resolveOrigin(req)}/`;
        const { data: invited, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(
          email,
          {
            data: { role },
            redirectTo,
          }
        );
        if (inviteErr || !invited?.user) {
          return res.status(400).json({
            error: 'INVITE_ADMIN_FAILED',
            message: inviteErr?.message || 'Unable to send administrator invite email.',
          });
        }
        targetUserId = invited.user.id;
        notice = `Sent CMS administrator invite email to ${email}.`;
      } else {
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role },
        });
        if (createErr || !created?.user) {
          return res.status(400).json({
            error: 'CREATE_ADMIN_FAILED',
            message: createErr?.message || 'Unable to create administrator account.',
          });
        }
        targetUserId = created.user.id;
        notice = `Created confirmed CMS administrator account for ${email}. They can sign in immediately.`;
      }

      if (auth.userId) {
        await ensureCallerProfileSeeded(supabase, auth.userId, auth.email || '');
      }

      const { error: profileUpsertErr } = await supabase.from('admin_profiles').upsert(
        {
          id: targetUserId,
          email,
          role,
        },
        { onConflict: 'id' }
      );

      if (profileUpsertErr) {
        notice +=
          ' (Auth user is active; run the latest SQL migration in the Supabase tab if you want role rows stored in admin_profiles.)';
      }

      const { admins, profilesTableAvailable } = await listCombinedAdmins(supabase);
      return res.status(200).json({
        success: true,
        message: notice,
        admins,
        profilesTableAvailable,
      });
    }

    if (action === 'update_role') {
      const targetUserId = typeof body.userId === 'string' ? body.userId.trim() : '';
      const role = sanitizeRole(body.role);

      if (!targetUserId) {
        return res.status(400).json({ error: 'INVALID_USER', message: 'Missing administrator ID.' });
      }

      const { data: targetUserData, error: fetchErr } = await supabase.auth.admin.getUserById(
        targetUserId
      );
      if (fetchErr || !targetUserData?.user) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Administrator user not found.' });
      }

      await supabase.auth.admin.updateUserById(targetUserId, {
        user_metadata: { ...(targetUserData.user.user_metadata || {}), role },
      });

      if (auth.userId) {
        await ensureCallerProfileSeeded(supabase, auth.userId, auth.email || '');
      }

      await supabase.from('admin_profiles').upsert(
        {
          id: targetUserId,
          email: (targetUserData.user.email || '').toLowerCase(),
          role,
        },
        { onConflict: 'id' }
      );

      const { admins, profilesTableAvailable } = await listCombinedAdmins(supabase);
      return res.status(200).json({
        success: true,
        message: `Updated role for ${targetUserData.user.email} to ${role}.`,
        admins,
        profilesTableAvailable,
      });
    }

    if (action === 'send_reset') {
      const email = normalizeEmail(body.email);
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({ error: 'INVALID_EMAIL', message: 'Invalid email address.' });
      }

      const redirectTo = `${resolveOrigin(req)}/`;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (resetErr) {
        return res.status(400).json({
          error: 'RESET_EMAIL_FAILED',
          message: resetErr.message || 'Unable to dispatch password reset email.',
        });
      }

      return res.status(200).json({
        success: true,
        message: `Password reset email sent to ${email}.`,
      });
    }

    if (action === 'remove_admin') {
      const targetUserId = typeof body.userId === 'string' ? body.userId.trim() : '';
      if (!targetUserId) {
        return res.status(400).json({ error: 'INVALID_USER', message: 'Missing administrator ID.' });
      }

      if (auth.userId && targetUserId === auth.userId) {
        return res.status(400).json({
          error: 'CANNOT_REMOVE_SELF',
          message: 'You cannot revoke your own active CMS administrator session.',
        });
      }

      if (auth.userId) {
        await ensureCallerProfileSeeded(supabase, auth.userId, auth.email || '');
      }

      const { error: delErr } = await supabase
        .from('admin_profiles')
        .delete()
        .eq('id', targetUserId);

      if (delErr) {
        return res.status(400).json({
          error: 'REMOVE_ADMIN_FAILED',
          message: delErr.message || 'Could not revoke CMS administrator role.',
        });
      }

      const { admins, profilesTableAvailable } = await listCombinedAdmins(supabase);
      return res.status(200).json({
        success: true,
        message: 'Revoked CMS administrator access for that account.',
        admins,
        profilesTableAvailable,
      });
    }

    return res.status(400).json({
      error: 'UNKNOWN_ACTION',
      message: 'Unsupported action. Allowed: create_admin, update_role, send_reset, remove_admin.',
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'ADMIN_ACTION_ERROR',
      message: err?.message || 'Unexpected error processing CMS admin action.',
    });
  }
}
