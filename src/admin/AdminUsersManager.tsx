import React, { useCallback, useEffect, useState } from 'react';
import { supabaseService } from '../lib/supabaseClient';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';

interface AdminAccountRecord {
  id: string;
  email: string;
  role: 'admin' | 'superadmin' | 'manager';
  confirmed: boolean;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  createdAt: string | null;
  inAdminProfiles: boolean;
}

interface AdminUsersManagerProps {
  onToast: (msg: string) => void;
  onOpenDatabaseTab?: () => void;
}

const REQUESTED_SECONDARY_ADMIN = 'delightfuljuicess@gmail.com';

function generateStrongPassword(length = 16): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  const array = new Uint32Array(length);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * charset.length);
    }
  }
  return Array.from(array, (n) => charset[n % charset.length]).join('');
}

export const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({
  onToast,
  onOpenDatabaseTab,
}) => {
  const [admins, setAdmins] = useState<AdminAccountRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceConfigured, setServiceConfigured] = useState(true);
  const [missingCredentials, setMissingCredentials] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Create CMS admin form state
  const [emailInput, setEmailInput] = useState(REQUESTED_SECONDARY_ADMIN);
  const [roleInput, setRoleInput] = useState<'admin' | 'superadmin' | 'manager'>('admin');
  const [creationMode, setCreationMode] = useState<'password' | 'invite'>('password');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copiedSqlFallback, setCopiedSqlFallback] = useState(false);

  const authorizedFetch = useCallback(async (method: 'GET' | 'POST', body?: Record<string, any>) => {
    const token = await supabaseService.getAccessToken();
    if (!token) {
      throw new Error('Administrator session expired. Please sign out and sign back in.');
    }

    const res = await fetch('/api/admin-users', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.message || data.error || `Request failed (${res.status})`);
      err.payload = data;
      throw err;
    }
    return data;
  }, []);

  const loadAdmins = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await authorizedFetch('GET');
      setServiceConfigured(data.serviceConfigured !== false);
      setMissingCredentials(Array.isArray(data.missingCredentials) ? data.missingCredentials : []);
      setCurrentUserId(data.currentUserId || null);
      setCurrentUserEmail(data.currentUserEmail || null);
      setAdmins(Array.isArray(data.admins) ? data.admins : []);
    } catch (err: any) {
      setLoadError(err?.message || 'Unable to load CMS administrator accounts.');
    } finally {
      setIsLoading(false);
    }
  }, [authorizedFetch]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionFeedback(null);

    const normalizedEmail = emailInput.trim().toLowerCase();
    if (!normalizedEmail) {
      setActionFeedback({ success: false, message: 'Please enter an email address.' });
      return;
    }
    if (creationMode === 'password' && passwordInput.length < 8) {
      setActionFeedback({
        success: false,
        message: 'Please enter or generate a password with at least 8 characters.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authorizedFetch('POST', {
        action: 'create_admin',
        email: normalizedEmail,
        role: roleInput,
        mode: creationMode,
        password: creationMode === 'password' ? passwordInput : undefined,
      });

      if (Array.isArray(data.admins)) {
        setAdmins(data.admins);
      }
      setPasswordInput('');
      setActionFeedback({
        success: true,
        message: data.message || `CMS administrator account configured for ${normalizedEmail}.`,
      });
      onToast(data.message || `Added CMS admin: ${normalizedEmail}`);
    } catch (err: any) {
      setActionFeedback({
        success: false,
        message: err?.message || 'Could not create CMS administrator.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (
    userId: string,
    role: 'admin' | 'superadmin' | 'manager'
  ) => {
    setActionFeedback(null);
    try {
      const data = await authorizedFetch('POST', {
        action: 'update_role',
        userId,
        role,
      });
      if (Array.isArray(data.admins)) setAdmins(data.admins);
      onToast(data.message || 'Administrator role updated.');
    } catch (err: any) {
      setActionFeedback({
        success: false,
        message: err?.message || 'Could not update role.',
      });
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    setActionFeedback(null);
    try {
      const data = await authorizedFetch('POST', {
        action: 'send_reset',
        email,
      });
      onToast(data.message || `Password reset sent to ${email}`);
      setActionFeedback({
        success: true,
        message: data.message || `Password reset link emailed to ${email}.`,
      });
    } catch (err: any) {
      setActionFeedback({
        success: false,
        message: err?.message || 'Unable to dispatch password reset email.',
      });
    }
  };

  const handleRevokeAdmin = async (userId: string, email: string) => {
    setActionFeedback(null);
    try {
      const data = await authorizedFetch('POST', {
        action: 'remove_admin',
        userId,
      });
      if (Array.isArray(data.admins)) setAdmins(data.admins);
      onToast(data.message || `Revoked CMS access for ${email}`);
    } catch (err: any) {
      setActionFeedback({
        success: false,
        message: err?.message || 'Unable to revoke CMS access.',
      });
    }
  };

  const hasRequestedSecondary = admins.some(
    (a) => a.email.toLowerCase() === REQUESTED_SECONDARY_ADMIN
  );

  const sqlGrantSnippet = `INSERT INTO public.admin_profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE lower(email) IN ('orders@delightfuljuices.com', '${REQUESTED_SECONDARY_ADMIN}')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;`;

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/15 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-widest text-[#1B4D2E]">
            <Users className="w-4 h-4 text-[#E1AD01]" />
            <span>CMS Team &amp; Permissions</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1B4D2E]">
            CMS Administrator Accounts
          </h2>
          <p className="text-xs sm:text-sm text-[#1B4D2E]/80 leading-relaxed">
            Provision additional CMS admin logins (such as <strong>{REQUESTED_SECONDARY_ADMIN}</strong>) with full dashboard, product, wholesale, and order management access via Supabase Authentication.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAdmins}
          disabled={isLoading}
          className="bg-[#FFF8E7] hover:bg-[#1B4D2E]/10 text-[#1B4D2E] border border-[#1B4D2E]/20 font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 self-start lg:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Accounts</span>
        </button>
      </div>

      {/* Diagnostic banner if SUPABASE_SERVICE_ROLE_KEY is missing */}
      {!serviceConfigured && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 space-y-4 text-xs text-amber-950">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-base text-amber-950">
                Server Admin Key Needed for 1-Click Account Creation
              </h3>
              <p className="leading-relaxed">
                Missing environment variable(s):{' '}
                <strong className="font-mono">{missingCredentials.join(', ')}</strong>. You can either add{' '}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">
                  SUPABASE_SERVICE_ROLE_KEY
                </code>{' '}
                in Vercel Environment Variables, or create{' '}
                <strong>{REQUESTED_SECONDARY_ADMIN}</strong> directly in Supabase Dashboard right now:
              </p>
              <ol className="list-decimal pl-5 space-y-1 pt-1">
                <li>
                  Open <strong>Supabase Dashboard → Authentication → Users → Add user → Create new user</strong>.
                </li>
                <li>
                  Enter <strong>{REQUESTED_SECONDARY_ADMIN}</strong> and choose a password (check <em>Auto Confirm User</em>).
                </li>
                <li>
                  Run the SQL snippet below in <strong>Supabase SQL Editor</strong> so both admins have active rows in{' '}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">public.admin_profiles</code>:
                </li>
              </ol>
            </div>
          </div>

          <div className="relative bg-[#0F2618] text-emerald-200 font-mono text-[11px] p-4 rounded-2xl overflow-x-auto">
            <pre>{sqlGrantSnippet}</pre>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(sqlGrantSnippet);
                setCopiedSqlFallback(true);
                setTimeout(() => setCopiedSqlFallback(false), 2000);
              }}
              className="mt-3 inline-flex items-center space-x-1.5 bg-[#E1AD01] text-[#1B4D2E] font-sans font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer"
            >
              {copiedSqlFallback ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSqlFallback ? 'Copied SQL' : 'Copy Admin Profile SQL'}</span>
            </button>
          </div>
        </div>
      )}

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-3">
          <span>{loadError}</span>
          {onOpenDatabaseTab && (
            <button
              type="button"
              onClick={onOpenDatabaseTab}
              className="font-bold underline shrink-0 cursor-pointer"
            >
              Open Database Tab
            </button>
          )}
        </div>
      )}

      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center space-x-2 ${
            actionFeedback.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {actionFeedback.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Quick Action Banner for requested delightfuljuicess@gmail.com */}
      {!hasRequestedSecondary && (
        <div className="bg-[#FFF8E7] border border-[#E1AD01]/50 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 text-xs">
            <div className="inline-flex items-center space-x-1.5 font-extrabold text-[#1B4D2E]">
              <Sparkles className="w-4 h-4 text-[#E1AD01]" />
              <span>Ready to Add Secondary CMS Admin</span>
            </div>
            <p className="text-[#1B4D2E]/80">
              Set a password or send an email invite below to activate CMS sign-in for{' '}
              <strong>{REQUESTED_SECONDARY_ADMIN}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmailInput(REQUESTED_SECONDARY_ADMIN);
              setRoleInput('admin');
              setPasswordInput(generateStrongPassword());
              setCreationMode('password');
            }}
            className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shrink-0"
          >
            Prefill + Generate Password
          </button>
        </div>
      )}

      {/* Create / Grant CMS Admin Form */}
      <form
        onSubmit={handleCreateAdmin}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-[#1B4D2E]/15 shadow-xs space-y-5 text-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-[#1B4D2E]" />
            <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
              Create or Grant CMS Admin Access
            </h3>
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-[#FFF8E7] rounded-xl border border-[#1B4D2E]/15">
            <button
              type="button"
              onClick={() => setCreationMode('password')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                creationMode === 'password'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7]'
                  : 'text-[#1B4D2E]/75 hover:bg-white'
              }`}
            >
              Set Password (Instant)
            </button>
            <button
              type="button"
              onClick={() => setCreationMode('invite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                creationMode === 'invite'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7]'
                  : 'text-[#1B4D2E]/75 hover:bg-white'
              }`}
            >
              Send Email Invite
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
              Administrator Email *
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="delightfuljuicess@gmail.com"
              className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3.5 py-2.5 font-semibold text-[#1B4D2E]"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
              CMS Role
            </label>
            <select
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value as typeof roleInput)}
              className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2.5 font-bold text-[#1B4D2E]"
            >
              <option value="admin">Admin (Full CMS)</option>
              <option value="superadmin">Superadmin (Owner)</option>
              <option value="manager">Manager (Orders &amp; Catalog)</option>
            </select>
          </div>

          {creationMode === 'password' ? (
            <div className="md:col-span-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70">
                  Temporary Password (8+ chars)
                </label>
                <button
                  type="button"
                  onClick={() => setPasswordInput(generateStrongPassword())}
                  className="text-[10px] font-bold text-[#1B4D2E] underline cursor-pointer"
                >
                  Generate Strong
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-[#1B4D2E]/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  minLength={8}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter initial password"
                  className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl pl-8 pr-3 py-2.5 font-mono text-[#1B4D2E]"
                />
              </div>
            </div>
          ) : (
            <div className="md:col-span-4 text-[11px] text-[#1B4D2E]/75 bg-[#FFF8E7] rounded-xl px-3.5 py-2.5 border border-[#1B4D2E]/15">
              Sends a secure Supabase onboarding link so the admin sets their own password.
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-[#1B4D2E]/70">
            Both admins sign in at the same CMS Login portal using their own email &amp; password.
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !serviceConfigured}
            className="bg-[#1B4D2E] hover:bg-[#143822] disabled:opacity-50 text-[#FFF8E7] font-black text-xs px-6 py-3 rounded-xl shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#E1AD01]" />
            <span>
              {isSubmitting
                ? 'Creating Account...'
                : creationMode === 'invite'
                ? 'Send CMS Invite'
                : 'Create CMS Admin Account'}
            </span>
          </button>
        </div>
      </form>

      {/* Active CMS Admins Table */}
      <div className="bg-white rounded-3xl border border-[#1B4D2E]/15 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
              Authorized CMS Administrators ({admins.length})
            </h3>
            {currentUserEmail && (
              <p className="text-xs text-[#1B4D2E]/70">
                Signed in as <strong>{currentUserEmail}</strong>
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#1B4D2E]/70">
            Loading Supabase administrator records...
          </div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#1B4D2E]/70">
            No administrator records returned yet. Create or configure an admin above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums">
              <thead className="bg-[#FFF8E7] text-[#1B4D2E]/75 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Admin Email</th>
                  <th className="py-3.5 px-5">Role</th>
                  <th className="py-3.5 px-5">Account Status</th>
                  <th className="py-3.5 px-5">Last Sign-In</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin) => {
                  const isSelf = currentUserId === admin.id;
                  return (
                    <tr key={admin.id} className="hover:bg-[#FFF8E7]/40">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#1B4D2E] flex items-center gap-2">
                          <span>{admin.email}</span>
                          {isSelf && (
                            <span className="text-[10px] font-bold text-emerald-800">
                              (You)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <select
                          aria-label={`Role for ${admin.email}`}
                          value={admin.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              admin.id,
                              e.target.value as 'admin' | 'superadmin' | 'manager'
                            )
                          }
                          className="bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-lg px-2.5 py-1 text-xs font-bold text-[#1B4D2E] cursor-pointer"
                        >
                          <option value="admin">Admin</option>
                          <option value="superadmin">Superadmin</option>
                          <option value="manager">Manager</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`text-xs font-bold ${
                            admin.confirmed ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {admin.confirmed ? 'Confirmed' : 'Pending Invite'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-gray-600">
                        {admin.lastSignInAt
                          ? new Date(admin.lastSignInAt).toLocaleDateString()
                          : 'Never signed in'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleSendPasswordReset(admin.email)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FFF8E7] hover:bg-[#1B4D2E]/10 text-[#1B4D2E] font-bold inline-flex items-center space-x-1 cursor-pointer"
                            title="Send password reset email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Reset Password</span>
                          </button>
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => handleRevokeAdmin(admin.id, admin.email)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Revoke CMS Admin Access"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
