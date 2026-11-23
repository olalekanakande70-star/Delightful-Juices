import crypto from 'node:crypto';
import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type StripeMode = 'test' | 'live';

export const CANONICAL_WEBHOOK_URL = 'https://www.delightfuljuices.com/api/stripe-webhook';

export const REQUIRED_WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
  'payment_intent.payment_failed',
];

export interface GatewaySecretRow {
  id: string;
  provider: string;
  connected: boolean;
  active_mode: StripeMode;
  account_id: string | null;
  account_name: string | null;
  test_publishable_key: string | null;
  test_secret_key_enc: string | null;
  test_secret_key_hint: string | null;
  test_webhook_secret_enc: string | null;
  test_webhook_secret_hint: string | null;
  test_webhook_endpoint_id: string | null;
  live_publishable_key: string | null;
  live_secret_key_enc: string | null;
  live_secret_key_hint: string | null;
  live_webhook_secret_enc: string | null;
  live_webhook_secret_hint: string | null;
  live_webhook_endpoint_id: string | null;
  webhook_url: string;
  webhook_status: string;
  webhook_last_error: string | null;
  last_validated_at: string | null;
  connected_by_email: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ResolvedStripeConfig {
  connected: boolean;
  explicitlyDisconnected: boolean;
  mode: StripeMode;
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  source: 'cms' | 'env' | 'none';
  webhookStatus: string;
  accountId?: string | null;
  accountName?: string | null;
}

export interface SanitizedGatewayStatus {
  connected: boolean;
  activeMode: StripeMode;
  source: 'cms' | 'env' | 'none';
  accountId: string | null;
  accountName: string | null;
  webhookUrl: string;
  webhookStatus: string;
  webhookLastError: string | null;
  lastValidatedAt: string | null;
  connectedByEmail: string | null;
  serverReady: boolean;
  missingServerRequirements: string[];
  encryptionActive: boolean;
  encryptionMismatch: boolean;
  envReadiness: {
    supabaseUrl: boolean;
    supabaseServiceRoleKey: boolean;
    paymentEncryptionKey: boolean;
    gatewaySecretsTable: boolean;
  };
  modes: {
    test: {
      publishableKey: string;
      hasSecretKey: boolean;
      secretKeyHint: string | null;
      hasWebhookSecret: boolean;
      webhookSecretHint: string | null;
      webhookEndpointId: string | null;
    };
    live: {
      publishableKey: string;
      hasSecretKey: boolean;
      secretKeyHint: string | null;
      hasWebhookSecret: boolean;
      webhookSecretHint: string | null;
      webhookEndpointId: string | null;
    };
  };
}

export function getConfiguredSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  ).trim();
}

export function getConfiguredServiceRoleKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    ''
  ).trim();
}

export function getMissingServiceCredentialNames(): string[] {
  const missing: string[] = [];
  if (!getConfiguredSupabaseUrl()) missing.push('SUPABASE_URL');
  if (!getConfiguredServiceRoleKey()) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return missing;
}

export function getServiceSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = getConfiguredSupabaseUrl();
  const serviceKey = getConfiguredServiceRoleKey();
  if (!supabaseUrl || !serviceKey) {
    return null;
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isEncryptionKeyConfigured(): boolean {
  return Boolean((process.env.PAYMENT_ENCRYPTION_KEY || '').trim());
}

function deriveEncryptionKey(): Buffer | null {
  const keyMaterial = (process.env.PAYMENT_ENCRYPTION_KEY || '').trim();
  if (!keyMaterial) return null;

  return crypto
    .createHmac('sha256', 'delightful-juices-stripe-gateway-v1')
    .update(keyMaterial)
    .digest();
}

export function encryptSecret(plaintext: string): string {
  const key = deriveEncryptionKey();
  if (!key) {
    throw new Error(
      'PAYMENT_ENCRYPTION_KEY must be configured in server environment variables before encrypting Stripe credentials.'
    );
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptSecret(payload: string | null | undefined): string {
  if (!payload) return '';
  if (!payload.startsWith('v1:')) return '';

  const key = deriveEncryptionKey();
  if (!key) return '';

  try {
    const parts = payload.split(':');
    if (parts.length !== 4) return '';
    const iv = Buffer.from(parts[1], 'base64');
    const tag = Buffer.from(parts[2], 'base64');
    const ciphertext = Buffer.from(parts[3], 'base64');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return '';
  }
}

export function maskSecret(secret: string): string {
  const clean = secret.trim();
  if (!clean) return '';
  if (clean.length <= 8) return '••••••••';
  const prefix = clean.slice(0, 7);
  const suffix = clean.slice(-4);
  return `${prefix}••••${suffix}`;
}

export function detectStripeSecretMode(secretKey: string): StripeMode | null {
  const clean = secretKey.trim();
  if (clean.startsWith('sk_test_') || clean.startsWith('rk_test_')) return 'test';
  if (clean.startsWith('sk_live_') || clean.startsWith('rk_live_')) return 'live';
  return null;
}

export function detectStripePublishableMode(publishableKey: string): StripeMode | null {
  const clean = publishableKey.trim();
  if (clean.startsWith('pk_test_')) return 'test';
  if (clean.startsWith('pk_live_')) return 'live';
  return null;
}

export function isMissingTableError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '');
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    /relation .*payment_gateway_secrets.* does not exist/i.test(msg) ||
    /Could not find the table 'public\.payment_gateway_secrets'/i.test(msg)
  );
}

export async function readGatewaySecretRow(
  supabase: SupabaseClient
): Promise<{ row: GatewaySecretRow | null; tableExists: boolean }> {
  const { data, error } = await supabase
    .from('payment_gateway_secrets')
    .select('*')
    .eq('id', 'stripe')
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      return { row: null, tableExists: false };
    }
    throw new Error(`Failed to read payment gateway settings: ${error.message}`);
  }

  return { row: (data as GatewaySecretRow | null) || null, tableExists: true };
}

export async function verifyStripeSecretKey(secretKey: string): Promise<{
  valid: boolean;
  mode: StripeMode;
  accountId: string | null;
  accountName: string | null;
  error?: string;
}> {
  const detectedMode = detectStripeSecretMode(secretKey);
  if (!detectedMode) {
    return {
      valid: false,
      mode: 'test',
      accountId: null,
      accountName: null,
      error: 'Invalid Stripe Secret Key format. Key must start with sk_test_, sk_live_, rk_test_, or rk_live_.',
    };
  }

  const stripe = new Stripe(secretKey.trim(), {
    apiVersion: '2025-02-24.acacia' as any,
  });

  try {
    const account = await stripe.accounts.retrieveCurrent();
    const accountName =
      account.settings?.dashboard?.display_name ||
      account.business_profile?.name ||
      account.email ||
      account.id ||
      'Connected Stripe Account';

    return {
      valid: true,
      mode: detectedMode,
      accountId: account.id,
      accountName,
    };
  } catch (acctErr: any) {
    // Restricted keys may lack account:read; test balance endpoint as fallback verification
    try {
      await stripe.balance.retrieve();
      return {
        valid: true,
        mode: detectedMode,
        accountId: null,
        accountName: 'Stripe Account (Restricted Key Verified)',
      };
    } catch (balErr: any) {
      return {
        valid: false,
        mode: detectedMode,
        accountId: null,
        accountName: null,
        error: acctErr?.message || balErr?.message || 'Stripe rejected the provided API key.',
      };
    }
  }
}

export async function autoConfigureStripeWebhook(params: {
  secretKey: string;
  existingEndpointId?: string | null;
  existingWebhookSecret?: string;
  manualWebhookSecret?: string;
  recreateEndpoint?: boolean;
}): Promise<{
  webhookSecret: string;
  endpointId: string | null;
  status: 'auto_configured' | 'manual_configured' | 'manual_required';
  message: string;
  error?: string;
}> {
  const cleanManual = (params.manualWebhookSecret || '').trim();
  if (cleanManual) {
    if (!cleanManual.startsWith('whsec_')) {
      return {
        webhookSecret: '',
        endpointId: params.existingEndpointId || null,
        status: 'manual_required',
        message: 'Webhook Signing Secret must start with whsec_.',
        error: 'Invalid Webhook Signing Secret format (must start with whsec_).',
      };
    }

    // Best-effort ensure endpoint exists or stays subscribed in Stripe
    try {
      const stripe = new Stripe(params.secretKey, {
        apiVersion: '2025-02-24.acacia' as any,
      });
      const list = await stripe.webhookEndpoints.list({ limit: 100 });
      const matching = list.data.find((ep) => ep.url === CANONICAL_WEBHOOK_URL);
      if (matching) {
        await stripe.webhookEndpoints.update(matching.id, {
          enabled_events: REQUIRED_WEBHOOK_EVENTS,
          disabled: false,
        });
        return {
          webhookSecret: cleanManual,
          endpointId: matching.id,
          status: 'manual_configured',
          message: 'Webhook signing secret saved and linked to your existing Stripe webhook endpoint.',
        };
      }
    } catch {
      // Saving manual secret still succeeds cleanly even if restricted key cannot list endpoints
    }

    return {
      webhookSecret: cleanManual,
      endpointId: params.existingEndpointId || null,
      status: 'manual_configured',
      message: 'Webhook signing secret encrypted and saved securely.',
    };
  }

  const stripe = new Stripe(params.secretKey, {
    apiVersion: '2025-02-24.acacia' as any,
  });

  try {
    const list = await stripe.webhookEndpoints.list({ limit: 100 });
    const matchingEndpoints = list.data.filter((ep) => ep.url === CANONICAL_WEBHOOK_URL);

    if (matchingEndpoints.length > 0 && !params.recreateEndpoint) {
      const primary = matchingEndpoints[0];
      await stripe.webhookEndpoints.update(primary.id, {
        enabled_events: REQUIRED_WEBHOOK_EVENTS,
        disabled: false,
      });

      if (params.existingWebhookSecret) {
        return {
          webhookSecret: params.existingWebhookSecret,
          endpointId: primary.id,
          status: 'auto_configured',
          message: 'Existing Stripe webhook endpoint verified and required events synced.',
        };
      }

      return {
        webhookSecret: '',
        endpointId: primary.id,
        status: 'manual_required',
        message:
          'A webhook endpoint for this URL already exists in Stripe, and Stripe does not reveal existing signing secrets. Paste the signing secret below or click "Re-issue Webhook Secret" to rotate it automatically.',
        error: 'Existing endpoint signing secret not stored locally yet.',
      };
    }

    if (matchingEndpoints.length > 0 && params.recreateEndpoint) {
      for (const ep of matchingEndpoints) {
        try {
          await stripe.webhookEndpoints.del(ep.id);
        } catch {
          // Ignore individual cleanup failures
        }
      }
    }

    const created = await stripe.webhookEndpoints.create({
      url: CANONICAL_WEBHOOK_URL,
      enabled_events: REQUIRED_WEBHOOK_EVENTS,
      description: 'Delightful Juices CMS Managed Payment Webhook',
    });

    if (created.secret) {
      return {
        webhookSecret: created.secret,
        endpointId: created.id,
        status: 'auto_configured',
        message: 'Stripe webhook endpoint automatically registered and signing secret encrypted.',
      };
    }

    return {
      webhookSecret: params.existingWebhookSecret || '',
      endpointId: created.id,
      status: 'manual_required',
      message:
        'Webhook endpoint created in Stripe, but no signing secret was returned. Paste whsec_... manually if needed.',
    };
  } catch (err: any) {
    return {
      webhookSecret: params.existingWebhookSecret || '',
      endpointId: params.existingEndpointId || null,
      status: 'manual_required',
      message: `Automatic webhook registration could not complete (${err?.message || 'Stripe API error'}). Enter your Webhook Signing Secret manually below.`,
      error: err?.message || 'Automatic webhook registration failed.',
    };
  }
}

export async function resolveStripeRuntimeConfig(
  preferredMode?: StripeMode
): Promise<ResolvedStripeConfig> {
  const supabase = getServiceSupabaseClient();

  if (supabase) {
    try {
      const { row } = await readGatewaySecretRow(supabase);
      if (row) {
        if (!row.connected) {
          return {
            connected: false,
            explicitlyDisconnected: true,
            mode: row.active_mode || 'test',
            publishableKey: '',
            secretKey: '',
            webhookSecret: '',
            source: 'cms',
            webhookStatus: 'not_configured',
            accountId: row.account_id,
            accountName: row.account_name,
          };
        }

        const mode: StripeMode = preferredMode || row.active_mode || 'test';
        const publishableKey =
          (mode === 'live' ? row.live_publishable_key : row.test_publishable_key) || '';
        const secretKey = decryptSecret(
          mode === 'live' ? row.live_secret_key_enc : row.test_secret_key_enc
        );
        const webhookSecret = decryptSecret(
          mode === 'live' ? row.live_webhook_secret_enc : row.test_webhook_secret_enc
        );

        return {
          connected: Boolean(secretKey),
          explicitlyDisconnected: false,
          mode,
          publishableKey,
          secretKey,
          webhookSecret,
          source: 'cms',
          webhookStatus: row.webhook_status || (webhookSecret ? 'manual_configured' : 'not_configured'),
          accountId: row.account_id,
          accountName: row.account_name,
        };
      }
    } catch {
      // Fall through cleanly to environment variable configuration if DB read fails
    }
  }

  const envSecretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
  const envWebhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  const envPublishableKey = (
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    ''
  ).trim();
  const detectedMode = detectStripeSecretMode(envSecretKey) || 'live';

  if (envSecretKey) {
    return {
      connected: true,
      explicitlyDisconnected: false,
      mode: detectedMode,
      publishableKey: envPublishableKey,
      secretKey: envSecretKey,
      webhookSecret: envWebhookSecret,
      source: 'env',
      webhookStatus: envWebhookSecret ? 'env_configured' : 'not_configured',
    };
  }

  return {
    connected: false,
    explicitlyDisconnected: false,
    mode: 'test',
    publishableKey: envPublishableKey,
    secretKey: '',
    webhookSecret: envWebhookSecret,
    source: 'none',
    webhookStatus: 'not_configured',
  };
}

export async function getWebhookVerificationCandidates(): Promise<
  Array<{ mode: StripeMode | 'env'; secretKey: string; webhookSecret: string }>
> {
  const candidates: Array<{ mode: StripeMode | 'env'; secretKey: string; webhookSecret: string }> =
    [];
  const seenSecrets = new Set<string>();

  const pushCandidate = (
    mode: StripeMode | 'env',
    secretKey: string,
    webhookSecret: string
  ) => {
    if (!webhookSecret || seenSecrets.has(webhookSecret)) return;
    seenSecrets.add(webhookSecret);
    candidates.push({ mode, secretKey, webhookSecret });
  };

  const supabase = getServiceSupabaseClient();
  if (supabase) {
    try {
      const { row } = await readGatewaySecretRow(supabase);
      if (row) {
        const primaryMode: StripeMode = row.active_mode === 'live' ? 'live' : 'test';
        const secondaryMode: StripeMode = primaryMode === 'live' ? 'test' : 'live';

        for (const mode of [primaryMode, secondaryMode]) {
          const sk = decryptSecret(
            mode === 'live' ? row.live_secret_key_enc : row.test_secret_key_enc
          );
          const wh = decryptSecret(
            mode === 'live' ? row.live_webhook_secret_enc : row.test_webhook_secret_enc
          );
          pushCandidate(mode, sk, wh);
        }
      }
    } catch {
      // Fallback to env candidate below
    }
  }

  const envSk = (process.env.STRIPE_SECRET_KEY || '').trim();
  const envWh = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  pushCandidate('env', envSk, envWh);

  return candidates;
}

export function buildSanitizedGatewayStatus(params: {
  row: GatewaySecretRow | null;
  tableExists: boolean;
}): SanitizedGatewayStatus {
  const supabaseUrl = getConfiguredSupabaseUrl();
  const serviceKey = getConfiguredServiceRoleKey();
  const encryptionConfigured = isEncryptionKeyConfigured();
  const missingServerRequirements: string[] = [];

  if (!supabaseUrl) missingServerRequirements.push('SUPABASE_URL');
  if (!serviceKey) missingServerRequirements.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!encryptionConfigured) missingServerRequirements.push('PAYMENT_ENCRYPTION_KEY');
  if (serviceKey && !params.tableExists) {
    missingServerRequirements.push('Supabase migration: payment_gateway_secrets table');
  }

  const envReadiness = {
    supabaseUrl: Boolean(supabaseUrl),
    supabaseServiceRoleKey: Boolean(serviceKey),
    paymentEncryptionKey: encryptionConfigured,
    gatewaySecretsTable: params.tableExists,
  };

  const envSk = (process.env.STRIPE_SECRET_KEY || '').trim();
  const envWh = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  const envPk = (
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    ''
  ).trim();
  const envMode = detectStripeSecretMode(envSk) || 'live';

  const row = params.row;
  if (row) {
    const activeMode: StripeMode = row.active_mode === 'live' ? 'live' : 'test';
    const testSkOk = Boolean(row.test_secret_key_enc && decryptSecret(row.test_secret_key_enc));
    const testWhOk = Boolean(row.test_webhook_secret_enc && decryptSecret(row.test_webhook_secret_enc));
    const liveSkOk = Boolean(row.live_secret_key_enc && decryptSecret(row.live_secret_key_enc));
    const liveWhOk = Boolean(row.live_webhook_secret_enc && decryptSecret(row.live_webhook_secret_enc));

    const testSkMismatch = Boolean(encryptionConfigured && row.test_secret_key_enc && !testSkOk);
    const testWhMismatch = Boolean(encryptionConfigured && row.test_webhook_secret_enc && !testWhOk);
    const liveSkMismatch = Boolean(encryptionConfigured && row.live_secret_key_enc && !liveSkOk);
    const liveWhMismatch = Boolean(encryptionConfigured && row.live_webhook_secret_enc && !liveWhOk);
    const encryptionMismatch = testSkMismatch || testWhMismatch || liveSkMismatch || liveWhMismatch;

    const activeModeSkOk = activeMode === 'live' ? liveSkOk : testSkOk;

    return {
      connected: Boolean(row.connected && activeModeSkOk),
      activeMode,
      source: 'cms',
      accountId: row.account_id || null,
      accountName: row.account_name || null,
      webhookUrl: row.webhook_url || CANONICAL_WEBHOOK_URL,
      webhookStatus: encryptionMismatch ? 'manual_required' : row.webhook_status || 'not_configured',
      webhookLastError: encryptionMismatch
        ? 'PAYMENT_ENCRYPTION_KEY changed. Re-enter your Stripe Secret Key and Webhook Signing Secret below and click Connect Stripe.'
        : row.webhook_last_error || null,
      lastValidatedAt: row.last_validated_at || null,
      connectedByEmail: row.connected_by_email || null,
      serverReady: missingServerRequirements.length === 0,
      missingServerRequirements,
      encryptionActive: encryptionConfigured,
      encryptionMismatch,
      envReadiness,
      modes: {
        test: {
          publishableKey: row.test_publishable_key || '',
          hasSecretKey: testSkOk,
          secretKeyHint: testSkOk ? row.test_secret_key_hint || null : null,
          hasWebhookSecret: testWhOk,
          webhookSecretHint: testWhOk ? row.test_webhook_secret_hint || null : null,
          webhookEndpointId: row.test_webhook_endpoint_id || null,
        },
        live: {
          publishableKey: row.live_publishable_key || '',
          hasSecretKey: liveSkOk,
          secretKeyHint: liveSkOk ? row.live_secret_key_hint || null : null,
          hasWebhookSecret: liveWhOk,
          webhookSecretHint: liveWhOk ? row.live_webhook_secret_hint || null : null,
          webhookEndpointId: row.live_webhook_endpoint_id || null,
        },
      },
    };
  }

  return {
    connected: Boolean(envSk),
    activeMode: envSk ? envMode : 'test',
    source: envSk ? 'env' : 'none',
    accountId: null,
    accountName: envSk ? 'Environment Configured Account' : null,
    webhookUrl: CANONICAL_WEBHOOK_URL,
    webhookStatus: envWh ? 'env_configured' : 'not_configured',
    webhookLastError: null,
    lastValidatedAt: null,
    connectedByEmail: null,
    serverReady: missingServerRequirements.length === 0,
    missingServerRequirements,
    encryptionActive: encryptionConfigured,
    encryptionMismatch: false,
    envReadiness,
    modes: {
      test: {
        publishableKey: envMode === 'test' ? envPk : '',
        hasSecretKey: envMode === 'test' && Boolean(envSk),
        secretKeyHint: envMode === 'test' && envSk ? maskSecret(envSk) : null,
        hasWebhookSecret: envMode === 'test' && Boolean(envWh),
        webhookSecretHint: envMode === 'test' && envWh ? maskSecret(envWh) : null,
        webhookEndpointId: null,
      },
      live: {
        publishableKey: envMode === 'live' ? envPk : '',
        hasSecretKey: envMode === 'live' && Boolean(envSk),
        secretKeyHint: envMode === 'live' && envSk ? maskSecret(envSk) : null,
        hasWebhookSecret: envMode === 'live' && Boolean(envWh),
        webhookSecretHint: envMode === 'live' && envWh ? maskSecret(envWh) : null,
        webhookEndpointId: null,
      },
    },
  };
}

export async function requireAdminUser(req: any): Promise<
  | { authorized: true; email: string; userId: string }
  | { authorized: false; statusCode: number; error: string }
> {
  const authHeader = String(req.headers?.authorization || '');
  if (!authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      statusCode: 401,
      error: 'Administrator authentication token required.',
    };
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return {
      authorized: false,
      statusCode: 401,
      error: 'Administrator authentication token is empty.',
    };
  }

  const serviceSupabase = getServiceSupabaseClient();
  let authClient = serviceSupabase;

  if (!authClient) {
    const supabaseUrl = getConfiguredSupabaseUrl();
    const anonKey = (
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      ''
    ).trim();

    if (!supabaseUrl || !anonKey) {
      const missingNames = getMissingServiceCredentialNames();
      return {
        authorized: false,
        statusCode: 500,
        error: `Missing server credential(s): ${missingNames.join(', ')}. Configure them in Vercel Project Settings → Environment Variables (Production) and redeploy.`,
      };
    }

    authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
  }

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) {
    return {
      authorized: false,
      statusCode: 401,
      error: 'Invalid or expired administrator session. Please sign in again.',
    };
  }

  // Enforce admin_profiles role check whenever admin_profiles contains records
  try {
    const { count, error: countErr } = await authClient
      .from('admin_profiles')
      .select('id', { count: 'exact', head: true });

    if (!countErr && typeof count === 'number' && count > 0) {
      const { data: profile } = await authClient
        .from('admin_profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profile || !['admin', 'superadmin', 'manager'].includes(profile.role)) {
        return {
          authorized: false,
          statusCode: 403,
          error: 'Forbidden: administrator role required to manage payment gateway settings.',
        };
      }
    }
  } catch {
    // Allow verified Supabase Auth admin session if admin_profiles check is unavailable
  }

  return {
    authorized: true,
    email: data.user.email || 'admin',
    userId: data.user.id,
  };
}

export async function syncSiteContentStripeMeta(
  supabase: SupabaseClient,
  patch: { enabled?: boolean; mode?: StripeMode }
) {
  try {
    const { data } = await supabase
      .from('site_content')
      .select('stripe')
      .eq('key', 'main')
      .maybeSingle();

    const currentStripe = (data?.stripe && typeof data.stripe === 'object' ? data.stripe : {}) as Record<
      string,
      any
    >;

    // Store ONLY non-secret storefront display settings in site_content
    const nextStripe = {
      enabled: patch.enabled !== undefined ? patch.enabled : currentStripe.enabled !== false,
      mode: patch.mode || (currentStripe.mode === 'test' ? 'test' : 'live'),
      currency: currentStripe.currency || 'USD',
      customerFacingName: currentStripe.customerFacingName || 'Credit / Debit Card (Stripe)',
      description:
        currentStripe.description ||
        'Instant secure payment via Visa, Mastercard, Amex, Apple Pay & Google Pay',
    };

    await supabase
      .from('site_content')
      .update({ stripe: nextStripe, updated_at: new Date().toISOString() })
      .eq('key', 'main');
  } catch {
    // Non-blocking sync to site_content
  }
}
