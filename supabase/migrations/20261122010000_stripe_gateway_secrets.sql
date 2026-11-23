-- ==============================================================================
-- DELIGHTFUL JUICE: ENCRYPTED SERVER-SIDE PAYMENT GATEWAY SECRETS (IDEMPOTENT)
-- Stores AES-256-GCM encrypted Stripe credentials managed from the Admin CMS.
-- Strictly locked down with RLS enabled and NO public/anon/authenticated policies.
-- Only backend serverless/API routes authenticated with SUPABASE_SERVICE_ROLE_KEY
-- can read or write rows in this table.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.payment_gateway_secrets (
  id TEXT PRIMARY KEY DEFAULT 'stripe',
  provider TEXT NOT NULL DEFAULT 'stripe',
  connected BOOLEAN NOT NULL DEFAULT false,
  active_mode TEXT NOT NULL DEFAULT 'test' CHECK (active_mode IN ('test', 'live')),
  account_id TEXT,
  account_name TEXT,
  test_publishable_key TEXT,
  test_secret_key_enc TEXT,
  test_secret_key_hint TEXT,
  test_webhook_secret_enc TEXT,
  test_webhook_secret_hint TEXT,
  test_webhook_endpoint_id TEXT,
  live_publishable_key TEXT,
  live_secret_key_enc TEXT,
  live_secret_key_hint TEXT,
  live_webhook_secret_enc TEXT,
  live_webhook_secret_hint TEXT,
  live_webhook_endpoint_id TEXT,
  webhook_url TEXT NOT NULL DEFAULT 'https://www.delightfuljuices.com/api/stripe-webhook',
  webhook_status TEXT NOT NULL DEFAULT 'not_configured',
  webhook_last_error TEXT,
  last_validated_at TIMESTAMPTZ,
  connected_by_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS with NO client policies (blocks all browser/anon/authenticated queries completely)
ALTER TABLE public.payment_gateway_secrets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.payment_gateway_secrets FROM anon;
REVOKE ALL ON TABLE public.payment_gateway_secrets FROM authenticated;
