import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    return res.status(400).json({ error: 'Stripe is not configured on the live server.' });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia' as any,
  });

  let event: Stripe.Event;

  if (webhookSecret) {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).send('Webhook Error: Missing stripe-signature header.');
    }
    try {
      const payload = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body));
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    return res.status(400).json({
      error: 'STRIPE_WEBHOOK_SECRET is required in the live server environment to verify Stripe webhooks.',
    });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderNumber = session.metadata?.orderNumber;

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (orderNumber && supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const nowIso = new Date().toISOString();
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'preparing',
            payment_status: 'paid',
            stripe_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
            updated_at: nowIso,
          })
          .eq('order_number', orderNumber);

        // Fallback if optional Stripe metadata columns have not yet been added to orders
        if (error) {
          await supabase
            .from('orders')
            .update({
              status: 'preparing',
              updated_at: nowIso,
            })
            .eq('order_number', orderNumber);
        }
      } catch (dbErr) {
        console.error('Failed to update order status in live database from webhook:', dbErr);
      }
    }
  }

  return res.status(200).json({ received: true });
}
