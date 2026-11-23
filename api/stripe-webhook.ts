import Stripe from 'stripe';
import type { IncomingMessage } from 'node:http';
import {
  getServiceSupabaseClient,
  getWebhookVerificationCandidates,
} from './_lib/stripeGateway.ts';

// Required by Vercel serverless functions so req stream stays intact for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

type PaymentOutcome = 'paid' | 'failed' | 'pending';

interface OrderLookupResult {
  id: string;
  order_number?: string;
  status?: string;
  payment_status?: string | null;
}

async function readRawBody(req: any): Promise<Buffer | null> {
  if (Buffer.isBuffer(req.rawBody)) {
    return req.rawBody;
  }
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8');
  }

  // On Vercel with bodyParser: false, read raw chunks from IncomingMessage stream
  if (req && typeof req[Symbol.asyncIterator] === 'function' && !req.readableEnded) {
    const chunks: Buffer[] = [];
    for await (const chunk of req as IncomingMessage) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk));
    }
    if (chunks.length > 0) {
      return Buffer.concat(chunks);
    }
  }

  return null;
}

function isMissingColumnError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '');
  return (
    code === '42703' ||
    code === 'PGRST204' ||
    /column .* does not exist/i.test(msg) ||
    /Could not find the '.*' column/i.test(msg)
  );
}

async function findMatchingOrder(
  supabase: any,
  refs: {
    orderNumber?: string | null;
    orderId?: string | null;
    sessionId?: string | null;
    paymentIntentId?: string | null;
  }
): Promise<{ order: OrderLookupResult | null; hasPaymentStatusColumn: boolean }> {
  let hasPaymentStatusColumn = true;
  let selectFields = 'id, order_number, status, payment_status';

  const runQuery = async (column: string, value: string) => {
    let { data, error } = await supabase
      .from('orders')
      .select(selectFields)
      .eq(column, value)
      .maybeSingle();

    if (error && isMissingColumnError(error)) {
      if (column === 'payment_status' || selectFields.includes('payment_status')) {
        hasPaymentStatusColumn = false;
        selectFields = 'id, order_number, status';
        if (column !== 'stripe_session_id' && column !== 'stripe_payment_intent_id') {
          const retry = await supabase
            .from('orders')
            .select(selectFields)
            .eq(column, value)
            .maybeSingle();
          data = retry.data;
          error = retry.error;
        } else {
          return { data: null, error: null };
        }
      } else if (column === 'stripe_session_id' || column === 'stripe_payment_intent_id') {
        return { data: null, error: null };
      }
    }

    if (error) {
      throw new Error(`Supabase lookup failed (${column}): ${error.message}`);
    }
    return { data: data as OrderLookupResult | null, error: null };
  };

  if (refs.orderNumber) {
    const { data } = await runQuery('order_number', refs.orderNumber);
    if (data) return { order: data, hasPaymentStatusColumn };
  }

  if (refs.orderId) {
    const { data } = await runQuery('id', refs.orderId);
    if (data) return { order: data, hasPaymentStatusColumn };
  }

  if (refs.sessionId) {
    const { data } = await runQuery('stripe_session_id', refs.sessionId);
    if (data) return { order: data, hasPaymentStatusColumn };
  }

  if (refs.paymentIntentId) {
    const { data } = await runQuery('stripe_payment_intent_id', refs.paymentIntentId);
    if (data) return { order: data, hasPaymentStatusColumn };
  }

  return { order: null, hasPaymentStatusColumn };
}

async function applyOrderPaymentUpdate(
  outcome: PaymentOutcome,
  refs: {
    orderNumber?: string | null;
    orderId?: string | null;
    sessionId?: string | null;
    paymentIntentId?: string | null;
  }
) {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    throw new Error(
      'SUPABASE_NOT_CONFIGURED: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server environment variables.'
    );
  }

  const { order, hasPaymentStatusColumn } = await findMatchingOrder(supabase, refs);
  if (!order) {
    console.warn('Stripe webhook: no matching order found in Supabase.', refs);
    return { matched: false, updated: false };
  }

  // Never overwrite an already-paid order with failed or pending from delayed/out-of-order events
  if (order.payment_status === 'paid' && outcome !== 'paid') {
    return { matched: true, updated: false, skipped: 'already_paid' };
  }

  const nowIso = new Date().toISOString();
  const nextStatus =
    outcome === 'paid'
      ? order.status === 'pending' || !order.status
        ? 'preparing'
        : order.status
      : order.status || 'pending';

  const fullPatch: Record<string, any> = {
    updated_at: nowIso,
    payment_status: outcome,
  };

  if (outcome === 'paid') {
    fullPatch.status = nextStatus;
  }
  if (refs.sessionId) {
    fullPatch.stripe_session_id = refs.sessionId;
  }
  if (refs.paymentIntentId) {
    fullPatch.stripe_payment_intent_id = refs.paymentIntentId;
  }

  if (hasPaymentStatusColumn) {
    const { error } = await supabase.from('orders').update(fullPatch).eq('id', order.id);
    if (!error) {
      return { matched: true, updated: true, outcome, status: nextStatus };
    }
    if (!isMissingColumnError(error)) {
      throw new Error(`Supabase order update failed: ${error.message}`);
    }
  }

  console.warn(
    'Stripe webhook: orders table is missing payment_status / stripe_* columns. Run the SQL migration to persist full Stripe metadata.'
  );

  if (outcome === 'paid') {
    const { error: fallbackErr } = await supabase
      .from('orders')
      .update({ status: nextStatus, updated_at: nowIso })
      .eq('id', order.id);
    if (fallbackErr) {
      throw new Error(`Supabase fallback order update failed: ${fallbackErr.message}`);
    }
    return { matched: true, updated: true, outcome, status: nextStatus };
  }

  return { matched: true, updated: false, outcome, status: order.status };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const candidates = await getWebhookVerificationCandidates();
  if (candidates.length === 0) {
    return res.status(500).json({
      error: 'STRIPE_WEBHOOK_SECRET_MISSING',
      message:
        'Stripe Webhook Signing Secret is not configured. Connect Stripe in the Admin CMS or set STRIPE_WEBHOOK_SECRET on the server.',
    });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || (Array.isArray(signature) && signature.length === 0)) {
    return res.status(400).json({ error: 'Webhook Error: Missing stripe-signature header.' });
  }

  const rawBody = await readRawBody(req);
  if (!rawBody || rawBody.length === 0) {
    return res.status(400).json({
      error: 'Webhook Error: Empty or unavailable raw request body for signature verification.',
    });
  }

  let event: Stripe.Event | null = null;
  let lastSigError = 'Signature verification failed.';

  for (const candidate of candidates) {
    try {
      const verifierKey =
        candidate.secretKey || process.env.STRIPE_SECRET_KEY || 'sk_webhook_verify_only';
      const stripe = new Stripe(verifierKey, {
        apiVersion: '2025-02-24.acacia' as any,
      });
      event = stripe.webhooks.constructEvent(rawBody, signature, candidate.webhookSecret);
      break;
    } catch (err: any) {
      lastSigError = err?.message || lastSigError;
    }
  }

  if (!event) {
    console.error('Webhook signature verification failed:', lastSigError);
    return res.status(400).json({ error: `Webhook Error: ${lastSigError}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const outcome: PaymentOutcome =
          session.payment_status === 'paid' ? 'paid' : 'pending';

        const result = await applyOrderPaymentUpdate(outcome, {
          orderNumber: session.metadata?.orderNumber || null,
          orderId: session.metadata?.orderId || session.client_reference_id || null,
          sessionId: session.id,
          paymentIntentId:
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
        });

        return res.status(200).json({ received: true, eventType: event.type, ...result });
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        const result = await applyOrderPaymentUpdate('paid', {
          orderNumber: session.metadata?.orderNumber || null,
          orderId: session.metadata?.orderId || session.client_reference_id || null,
          sessionId: session.id,
          paymentIntentId:
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
        });

        return res.status(200).json({ received: true, eventType: event.type, ...result });
      }

      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const result = await applyOrderPaymentUpdate('failed', {
          orderNumber: session.metadata?.orderNumber || null,
          orderId: session.metadata?.orderId || session.client_reference_id || null,
          sessionId: session.id,
          paymentIntentId:
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
        });

        return res.status(200).json({ received: true, eventType: event.type, ...result });
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const result = await applyOrderPaymentUpdate('failed', {
          orderNumber: paymentIntent.metadata?.orderNumber || null,
          orderId: paymentIntent.metadata?.orderId || null,
          paymentIntentId: paymentIntent.id,
        });

        return res.status(200).json({ received: true, eventType: event.type, ...result });
      }

      default:
        return res.status(200).json({ received: true, ignored: true, eventType: event.type });
    }
  } catch (err: any) {
    console.error('Stripe webhook processing error:', err.message || err);
    return res.status(500).json({
      error: 'WEBHOOK_PROCESSING_ERROR',
      message: err.message || 'Failed to process Stripe webhook event.',
    });
  }
}
