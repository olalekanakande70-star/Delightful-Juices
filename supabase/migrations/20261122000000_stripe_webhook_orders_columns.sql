-- ==============================================================================
-- DELIGHTFUL JUICE: STRIPE WEBHOOK ORDER COLUMNS MIGRATION (IDEMPOTENT)
-- Ensures public.orders stores payment_status, stripe_session_id, and
-- stripe_payment_intent_id for reliable webhook reconciliation.
-- ==============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'failed'));

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id
  ON public.orders(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id
  ON public.orders(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON public.orders(payment_status);
