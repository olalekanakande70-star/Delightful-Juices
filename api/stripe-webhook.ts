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
    return res.status(400).json({ error: 'Stripe is not configured on the server.' });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia' as any,
  });

  let event: Stripe.Event;

  // Verify webhook signature if secret provided
  if (webhookSecret) {
    const signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody || JSON.stringify(req.body),
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // If webhook secret is not set, use body directly (in development/test environments)
    event = req.body as Stripe.Event;
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderNumber = session.metadata?.orderNumber;
    const orderId = session.metadata?.orderId;

    console.log(`Verified Stripe Payment for Order: ${orderNumber} (Session: ${session.id})`);

    // Update Supabase orders table if configured
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://abrgqtrobgorsaggooxv.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('orders')
          .update({
            status: 'preparing',
            payment_status: 'paid',
            stripe_session_id: session.id,
            stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('order_number', orderNumber);
      } catch (dbErr) {
        console.error('Failed to update order status in database from webhook:', dbErr);
      }
    }
  }

  return res.status(200).json({ received: true });
}
