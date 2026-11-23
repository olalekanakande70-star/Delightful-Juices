import Stripe from 'stripe';
import {
  autoConfigureStripeWebhook,
  buildSanitizedGatewayStatus,
  CANONICAL_WEBHOOK_URL,
  decryptSecret,
  detectStripePublishableMode,
  detectStripeSecretMode,
  encryptSecret,
  GatewaySecretRow,
  getMissingServiceCredentialNames,
  getServiceSupabaseClient,
  isEncryptionKeyConfigured,
  maskSecret,
  readGatewaySecretRow,
  requireAdminUser,
  StripeMode,
  syncSiteContentStripeMeta,
  verifyStripeSecretKey,
} from './_lib/stripeGateway.ts';

async function loadTransactionSummary() {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return {
      successfulCount: 0,
      pendingCount: 0,
      failedCount: 0,
      totalPaidRevenue: 0,
      recentTransactions: [],
    };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(
        'id, order_number, customer_name, customer_email, total, payment_method, payment_status, status, stripe_session_id, stripe_payment_intent_id, created_at'
      )
      .eq('payment_method', 'stripe_card')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      return {
        successfulCount: 0,
        pendingCount: 0,
        failedCount: 0,
        totalPaidRevenue: 0,
        recentTransactions: [],
      };
    }

    let successfulCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let totalPaidRevenue = 0;

    for (const row of data) {
      const pStatus = row.payment_status || 'pending';
      if (pStatus === 'paid') {
        successfulCount += 1;
        totalPaidRevenue += Number(row.total) || 0;
      } else if (pStatus === 'failed') {
        failedCount += 1;
      } else {
        pendingCount += 1;
      }
    }

    const recentTransactions = data.slice(0, 20).map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      amount: Number(row.total) || 0,
      paymentStatus: row.payment_status || 'pending',
      orderStatus: row.status || 'pending',
      stripeSessionId: row.stripe_session_id || null,
      stripePaymentIntentId: row.stripe_payment_intent_id || null,
      createdAt: row.created_at,
    }));

    return {
      successfulCount,
      pendingCount,
      failedCount,
      totalPaidRevenue,
      recentTransactions,
    };
  } catch {
    return {
      successfulCount: 0,
      pendingCount: 0,
      failedCount: 0,
      totalPaidRevenue: 0,
      recentTransactions: [],
    };
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  const auth = await requireAdminUser(req);
  if (!auth.authorized) {
    return res.status(auth.statusCode).json({ error: 'UNAUTHORIZED', message: auth.error });
  }

  const supabase = getServiceSupabaseClient();

  if (req.method === 'GET') {
    if (!supabase) {
      return res.status(200).json({
        gateway: buildSanitizedGatewayStatus({ row: null, tableExists: false }),
        transactions: await loadTransactionSummary(),
      });
    }

    try {
      const [{ row, tableExists }, transactions] = await Promise.all([
        readGatewaySecretRow(supabase),
        loadTransactionSummary(),
      ]);

      return res.status(200).json({
        gateway: buildSanitizedGatewayStatus({ row, tableExists }),
        transactions,
      });
    } catch (err: any) {
      return res.status(500).json({
        error: 'GATEWAY_READ_ERROR',
        message: err?.message || 'Unable to load payment gateway status.',
      });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!supabase) {
    const missingNames = getMissingServiceCredentialNames();
    return res.status(500).json({
      error: 'SUPABASE_NOT_CONFIGURED',
      message: `Missing server environment variable(s): ${missingNames.join(', ')}. Add them in Vercel Project Settings → Environment Variables (Production) and redeploy your site so serverless functions receive them.`,
    });
  }

  const body = req.body || {};
  const action = String(body.action || '').trim();

  try {
    const { row, tableExists } = await readGatewaySecretRow(supabase);

    if (!tableExists) {
      return res.status(400).json({
        error: 'MIGRATION_REQUIRED',
        message:
          'Database table payment_gateway_secrets has not been created yet. Run the SQL migration in Supabase SQL Editor first.',
        gateway: buildSanitizedGatewayStatus({ row: null, tableExists: false }),
      });
    }

    const existingRow: Partial<GatewaySecretRow> = row || {
      id: 'stripe',
      provider: 'stripe',
      connected: false,
      active_mode: 'test',
      webhook_url: CANONICAL_WEBHOOK_URL,
      webhook_status: 'not_configured',
    };

    if (action === 'connect') {
      if (!isEncryptionKeyConfigured()) {
        return res.status(500).json({
          error: 'PAYMENT_ENCRYPTION_KEY_MISSING',
          message:
            'PAYMENT_ENCRYPTION_KEY is not configured in the server environment. Add PAYMENT_ENCRYPTION_KEY in Vercel Environment Variables (or Google AI Studio Secrets for server dev) before connecting Stripe.',
        });
      }

      const requestedMode: StripeMode = body.mode === 'live' ? 'live' : 'test';
      const rawPk = String(body.publishableKey || '').trim();
      const rawSk = String(body.secretKey || '').trim();
      const rawWh = String(body.webhookSecret || '').trim();
      const recreateWebhook = Boolean(body.recreateWebhook);

      const storedSk = decryptSecret(
        requestedMode === 'live' ? existingRow.live_secret_key_enc : existingRow.test_secret_key_enc
      );
      const effectiveSk = rawSk || storedSk;

      if (!effectiveSk) {
        return res.status(400).json({
          error: 'MISSING_SECRET_KEY',
          message: `Please enter your Stripe ${requestedMode === 'live' ? 'Live' : 'Test'} Secret Key.`,
        });
      }

      const detectedSkMode = detectStripeSecretMode(effectiveSk);
      if (!detectedSkMode) {
        return res.status(400).json({
          error: 'INVALID_SECRET_KEY',
          message: 'Stripe Secret Key must start with sk_test_, sk_live_, rk_test_, or rk_live_.',
        });
      }

      const storedPk =
        (requestedMode === 'live'
          ? existingRow.live_publishable_key
          : existingRow.test_publishable_key) || '';
      const effectivePk = rawPk || storedPk;

      if (effectivePk) {
        const pkMode = detectStripePublishableMode(effectivePk);
        if (!pkMode) {
          return res.status(400).json({
            error: 'INVALID_PUBLISHABLE_KEY',
            message: 'Stripe Publishable Key must start with pk_test_ or pk_live_.',
          });
        }
        if (pkMode !== detectedSkMode) {
          return res.status(400).json({
            error: 'MODE_MISMATCH',
            message: `Mode mismatch: Publishable Key is ${pkMode.toUpperCase()} mode, but Secret Key is ${detectedSkMode.toUpperCase()} mode.`,
          });
        }
      }

      // Validate credentials live against Stripe
      const verification = await verifyStripeSecretKey(effectiveSk);
      if (!verification.valid) {
        return res.status(400).json({
          error: 'STRIPE_AUTH_FAILED',
          message: verification.error || 'Could not validate secret key with Stripe.',
        });
      }

      const finalMode = verification.mode;
      const existingWh = decryptSecret(
        finalMode === 'live' ? existingRow.live_webhook_secret_enc : existingRow.test_webhook_secret_enc
      );
      const existingEndpointId =
        finalMode === 'live'
          ? existingRow.live_webhook_endpoint_id
          : existingRow.test_webhook_endpoint_id;

      // Attempt automatic webhook registration or save manual signing secret
      const webhookResult = await autoConfigureStripeWebhook({
        secretKey: effectiveSk,
        existingEndpointId,
        existingWebhookSecret: existingWh,
        manualWebhookSecret: rawWh,
        recreateEndpoint: recreateWebhook,
      });

      if (rawWh && webhookResult.error) {
        return res.status(400).json({
          error: 'INVALID_WEBHOOK_SECRET',
          message: webhookResult.error,
        });
      }

      const nowIso = new Date().toISOString();
      const upsertPayload: Record<string, any> = {
        id: 'stripe',
        provider: 'stripe',
        connected: true,
        active_mode: finalMode,
        account_id: verification.accountId,
        account_name: verification.accountName,
        webhook_url: CANONICAL_WEBHOOK_URL,
        webhook_status: webhookResult.status,
        webhook_last_error: webhookResult.error || null,
        last_validated_at: nowIso,
        connected_by_email: auth.email,
        updated_at: nowIso,
      };

      if (finalMode === 'live') {
        if (effectivePk) upsertPayload.live_publishable_key = effectivePk;
        upsertPayload.live_secret_key_enc = encryptSecret(effectiveSk);
        upsertPayload.live_secret_key_hint = maskSecret(effectiveSk);
        if (webhookResult.webhookSecret) {
          upsertPayload.live_webhook_secret_enc = encryptSecret(webhookResult.webhookSecret);
          upsertPayload.live_webhook_secret_hint = maskSecret(webhookResult.webhookSecret);
        }
        if (webhookResult.endpointId) {
          upsertPayload.live_webhook_endpoint_id = webhookResult.endpointId;
        }
      } else {
        if (effectivePk) upsertPayload.test_publishable_key = effectivePk;
        upsertPayload.test_secret_key_enc = encryptSecret(effectiveSk);
        upsertPayload.test_secret_key_hint = maskSecret(effectiveSk);
        if (webhookResult.webhookSecret) {
          upsertPayload.test_webhook_secret_enc = encryptSecret(webhookResult.webhookSecret);
          upsertPayload.test_webhook_secret_hint = maskSecret(webhookResult.webhookSecret);
        }
        if (webhookResult.endpointId) {
          upsertPayload.test_webhook_endpoint_id = webhookResult.endpointId;
        }
      }

      const { data: savedRow, error: saveErr } = await supabase
        .from('payment_gateway_secrets')
        .upsert(upsertPayload)
        .select('*')
        .single();

      if (saveErr) {
        throw new Error(`Failed to store encrypted credentials: ${saveErr.message}`);
      }

      await syncSiteContentStripeMeta(supabase, { enabled: true, mode: finalMode });

      return res.status(200).json({
        success: true,
        detectedMode: finalMode,
        message: `Connected Stripe in ${finalMode.toUpperCase()} mode (${verification.accountName}). ${webhookResult.message}`,
        webhookMessage: webhookResult.message,
        gateway: buildSanitizedGatewayStatus({
          row: savedRow as GatewaySecretRow,
          tableExists: true,
        }),
        transactions: await loadTransactionSummary(),
      });
    }

    if (action === 'switch_mode') {
      const targetMode: StripeMode = body.mode === 'live' ? 'live' : 'test';
      const targetEnc =
        targetMode === 'live'
          ? existingRow.live_secret_key_enc
          : existingRow.test_secret_key_enc;

      if (!targetEnc) {
        return res.status(400).json({
          error: 'MODE_NOT_CONFIGURED',
          message: `No Stripe ${targetMode.toUpperCase()} credentials have been saved yet. Enter your ${targetMode.toUpperCase()} keys and click Connect Stripe.`,
        });
      }

      if (!decryptSecret(targetEnc)) {
        return res.status(400).json({
          error: 'ENCRYPTION_KEY_MISMATCH',
          message: `Stored Stripe ${targetMode.toUpperCase()} credentials cannot be decrypted with the current PAYMENT_ENCRYPTION_KEY. Re-enter your ${targetMode.toUpperCase()} Secret Key and click Connect Stripe to re-encrypt them.`,
        });
      }

      const nowIso = new Date().toISOString();
      const { data: updatedRow, error: upErr } = await supabase
        .from('payment_gateway_secrets')
        .update({
          active_mode: targetMode,
          connected: true,
          updated_at: nowIso,
        })
        .eq('id', 'stripe')
        .select('*')
        .single();

      if (upErr) throw new Error(upErr.message);

      await syncSiteContentStripeMeta(supabase, { enabled: true, mode: targetMode });

      return res.status(200).json({
        success: true,
        message: `Switched active Stripe payment gateway to ${targetMode.toUpperCase()} mode.`,
        gateway: buildSanitizedGatewayStatus({
          row: updatedRow as GatewaySecretRow,
          tableExists: true,
        }),
        transactions: await loadTransactionSummary(),
      });
    }

    if (action === 'configure_webhook') {
      if (!isEncryptionKeyConfigured()) {
        return res.status(500).json({
          error: 'PAYMENT_ENCRYPTION_KEY_MISSING',
          message:
            'PAYMENT_ENCRYPTION_KEY is not configured in the server environment. Add PAYMENT_ENCRYPTION_KEY before saving encrypted webhook secrets.',
        });
      }

      const targetMode: StripeMode =
        body.mode === 'live' || body.mode === 'test'
          ? body.mode
          : existingRow.active_mode || 'test';
      const sk = decryptSecret(
        targetMode === 'live' ? existingRow.live_secret_key_enc : existingRow.test_secret_key_enc
      );

      if (!sk) {
        return res.status(400).json({
          error: 'STRIPE_NOT_CONNECTED',
          message: `Connect your Stripe ${targetMode.toUpperCase()} Secret Key before configuring webhooks.`,
        });
      }

      const manualWh = String(body.webhookSecret || '').trim();
      const existingWh = decryptSecret(
        targetMode === 'live'
          ? existingRow.live_webhook_secret_enc
          : existingRow.test_webhook_secret_enc
      );
      const existingEpId =
        targetMode === 'live'
          ? existingRow.live_webhook_endpoint_id
          : existingRow.test_webhook_endpoint_id;

      const webhookResult = await autoConfigureStripeWebhook({
        secretKey: sk,
        existingEndpointId: existingEpId,
        existingWebhookSecret: existingWh,
        manualWebhookSecret: manualWh,
        recreateEndpoint: Boolean(body.recreateWebhook),
      });

      if (manualWh && webhookResult.error) {
        return res.status(400).json({
          error: 'INVALID_WEBHOOK_SECRET',
          message: webhookResult.error,
        });
      }

      const patch: Record<string, any> = {
        webhook_url: CANONICAL_WEBHOOK_URL,
        webhook_status: webhookResult.status,
        webhook_last_error: webhookResult.error || null,
        updated_at: new Date().toISOString(),
      };

      if (targetMode === 'live') {
        if (webhookResult.webhookSecret) {
          patch.live_webhook_secret_enc = encryptSecret(webhookResult.webhookSecret);
          patch.live_webhook_secret_hint = maskSecret(webhookResult.webhookSecret);
        }
        if (webhookResult.endpointId) patch.live_webhook_endpoint_id = webhookResult.endpointId;
      } else {
        if (webhookResult.webhookSecret) {
          patch.test_webhook_secret_enc = encryptSecret(webhookResult.webhookSecret);
          patch.test_webhook_secret_hint = maskSecret(webhookResult.webhookSecret);
        }
        if (webhookResult.endpointId) patch.test_webhook_endpoint_id = webhookResult.endpointId;
      }

      const { data: savedRow, error: upErr } = await supabase
        .from('payment_gateway_secrets')
        .update(patch)
        .eq('id', 'stripe')
        .select('*')
        .single();

      if (upErr) throw new Error(upErr.message);

      return res.status(200).json({
        success: webhookResult.status !== 'manual_required' || Boolean(webhookResult.webhookSecret),
        message: webhookResult.message,
        gateway: buildSanitizedGatewayStatus({
          row: savedRow as GatewaySecretRow,
          tableExists: true,
        }),
        transactions: await loadTransactionSummary(),
      });
    }

    if (action === 'test_connection') {
      const targetMode: StripeMode =
        body.mode === 'live' || body.mode === 'test'
          ? body.mode
          : existingRow.active_mode || 'test';
      const targetEnc =
        targetMode === 'live' ? existingRow.live_secret_key_enc : existingRow.test_secret_key_enc;
      const sk = decryptSecret(targetEnc);

      if (!sk) {
        if (targetEnc) {
          return res.status(400).json({
            error: 'ENCRYPTION_KEY_MISMATCH',
            message: `Stored Stripe ${targetMode.toUpperCase()} credentials could not be decrypted with the current PAYMENT_ENCRYPTION_KEY. Re-enter your ${targetMode.toUpperCase()} Secret Key below and click Connect Stripe to re-encrypt them.`,
          });
        }
        return res.status(400).json({
          error: 'NOT_CONNECTED',
          message: `No ${targetMode.toUpperCase()} Stripe Secret Key stored yet. Connect Stripe first.`,
        });
      }

      const verify = await verifyStripeSecretKey(sk);
      if (!verify.valid) {
        return res.status(400).json({
          error: 'STRIPE_CONNECTION_FAILED',
          message: verify.error || 'Stripe API validation failed.',
        });
      }

      const stripe = new Stripe(sk, { apiVersion: '2025-02-24.acacia' as any });
      let webhookVerified = false;
      try {
        const list = await stripe.webhookEndpoints.list({ limit: 50 });
        webhookVerified = list.data.some(
          (ep) => ep.url === CANONICAL_WEBHOOK_URL && ep.status === 'enabled'
        );
      } catch {
        // Ignore if key lacks webhook read permission
      }

      const whEnc =
        targetMode === 'live'
          ? existingRow.live_webhook_secret_enc
          : existingRow.test_webhook_secret_enc;

      const { data: savedRow } = await supabase
        .from('payment_gateway_secrets')
        .update({
          account_id: verify.accountId,
          account_name: verify.accountName,
          last_validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'stripe')
        .select('*')
        .single();

      return res.status(200).json({
        success: true,
        message: `Verified ${verify.mode.toUpperCase()} connection with ${verify.accountName}. ${
          whEnc && webhookVerified
            ? 'Webhook endpoint is enabled and signing secret is stored.'
            : whEnc
            ? 'Webhook signing secret is stored on server.'
            : 'Webhook signing secret is not configured yet.'
        }`,
        gateway: buildSanitizedGatewayStatus({
          row: (savedRow as GatewaySecretRow) || (row as GatewaySecretRow),
          tableExists: true,
        }),
        transactions: await loadTransactionSummary(),
      });
    }

    if (action === 'disconnect') {
      const clearSecrets = Boolean(body.clearSecrets);
      const nowIso = new Date().toISOString();

      const disconnectPatch: Record<string, any> = {
        id: 'stripe',
        provider: 'stripe',
        connected: false,
        updated_at: nowIso,
      };

      if (clearSecrets) {
        disconnectPatch.account_id = null;
        disconnectPatch.account_name = null;
        disconnectPatch.test_publishable_key = null;
        disconnectPatch.test_secret_key_enc = null;
        disconnectPatch.test_secret_key_hint = null;
        disconnectPatch.test_webhook_secret_enc = null;
        disconnectPatch.test_webhook_secret_hint = null;
        disconnectPatch.test_webhook_endpoint_id = null;
        disconnectPatch.live_publishable_key = null;
        disconnectPatch.live_secret_key_enc = null;
        disconnectPatch.live_secret_key_hint = null;
        disconnectPatch.live_webhook_secret_enc = null;
        disconnectPatch.live_webhook_secret_hint = null;
        disconnectPatch.live_webhook_endpoint_id = null;
        disconnectPatch.webhook_status = 'not_configured';
        disconnectPatch.webhook_last_error = null;
      }

      const { data: savedRow, error: disErr } = await supabase
        .from('payment_gateway_secrets')
        .upsert(disconnectPatch)
        .select('*')
        .single();

      if (disErr) throw new Error(disErr.message);

      await syncSiteContentStripeMeta(supabase, { enabled: false });

      return res.status(200).json({
        success: true,
        message: clearSecrets
          ? 'Stripe disconnected and stored credentials removed.'
          : 'Stripe disconnected from storefront checkout.',
        gateway: buildSanitizedGatewayStatus({
          row: savedRow as GatewaySecretRow,
          tableExists: true,
        }),
        transactions: await loadTransactionSummary(),
      });
    }

    return res.status(400).json({ error: 'UNKNOWN_ACTION', message: `Unsupported action: ${action}` });
  } catch (err: any) {
    console.error('Stripe gateway API error:', err);
    return res.status(500).json({
      error: 'GATEWAY_ERROR',
      message: err?.message || 'An error occurred managing Stripe gateway settings.',
    });
  }
}
