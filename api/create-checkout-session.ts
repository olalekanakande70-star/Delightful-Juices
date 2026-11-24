import Stripe from 'stripe';
import {
  getServiceSupabaseClient,
  resolveStripeRuntimeConfig,
} from './_lib/stripeGateway.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    orderId,
    orderNumber,
    items,
    customerEmail,
    customerName,
    deliveryFee,
    deliveryLabel,
    deliveryDescription,
    successUrl,
    cancelUrl,
    currency = 'usd',
  } = req.body || {};

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order items.' });
  }

  for (const item of items) {
    const unitPrice = Number(item?.unitPrice);
    const qty = Number(item?.quantity);
    if (
      !item?.productName ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0 ||
      !Number.isInteger(qty) ||
      qty < 1
    ) {
      return res.status(400).json({ error: 'Invalid order item pricing or quantity.' });
    }
  }

  const stripeConfig = await resolveStripeRuntimeConfig();
  if (stripeConfig.explicitlyDisconnected) {
    return res.status(400).json({
      error: 'STRIPE_DISCONNECTED',
      message:
        'Stripe checkout is currently disconnected in the Admin CMS. Reconnect Stripe in CMS Settings to accept card payments.',
    });
  }

  if (!stripeConfig.secretKey) {
    return res.status(400).json({
      error: 'STRIPE_NOT_CONFIGURED',
      message:
        'Stripe is not configured yet. Connect your Stripe API keys in the Admin CMS Payment Gateway settings.',
    });
  }

  try {
    const stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: String(currency).toLowerCase(),
        product_data: {
          name: `${item.productName} (${item.size})`,
          images:
            item.imageUrl && String(item.imageUrl).startsWith('http')
              ? [item.imageUrl]
              : [],
          description: `Handcrafted fresh bottle • Size: ${item.sizeLabel || item.size}`,
        },
        unit_amount: Math.round(Number(item.unitPrice) * 100),
      },
      quantity: item.quantity,
    }));

    if (deliveryFee && Number(deliveryFee) > 0) {
      line_items.push({
        price_data: {
          currency: String(currency).toLowerCase(),
          product_data: {
            name: String(deliveryLabel || 'Local Cold Delivery Fee'),
            images: [],
            description: String(
              deliveryDescription || 'Quakertown & Regional Insulated Delivery'
            ),
          },
          unit_amount: Math.round(Number(deliveryFee) * 100),
        },
        quantity: 1,
      });
    }

    const proto = req.headers['x-forwarded-proto'] || 'https';
    const rawOrigin =
      req.headers.origin ||
      process.env.APP_URL ||
      (req.headers.host ? `${proto}://${req.headers.host}` : 'https://www.delightfuljuices.com');
    const host = String(rawOrigin).replace(/\/+$/, '');

    const sessionMetadata = {
      orderId: orderId ? String(orderId) : '',
      orderNumber: orderNumber ? String(orderNumber) : '',
      customerName: customerName ? String(customerName) : '',
      stripeMode: stripeConfig.mode,
    };

    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: customerEmail || undefined,
      client_reference_id: orderId || orderNumber || undefined,
      metadata: sessionMetadata,
      payment_intent_data: {
        metadata: {
          orderId: sessionMetadata.orderId,
          orderNumber: sessionMetadata.orderNumber,
          stripeMode: stripeConfig.mode,
        },
      },
      success_url:
        successUrl ||
        `${host}/?order_success=true&order_number=${encodeURIComponent(orderNumber || '')}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl ||
        `${host}/?order_cancelled=true&order_number=${encodeURIComponent(orderNumber || '')}`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Best-effort link of stripe_session_id to the pending Supabase order
    const supabase = getServiceSupabaseClient();
    if (supabase && (orderNumber || orderId)) {
      try {
        const updateQuery = supabase
          .from('orders')
          .update({
            stripe_session_id: session.id,
            payment_status: 'pending',
            updated_at: new Date().toISOString(),
          });
        if (orderNumber) {
          await updateQuery.eq('order_number', orderNumber);
        } else if (orderId) {
          await updateQuery.eq('id', orderId);
        }
      } catch {
        // Non-blocking best-effort metadata link
      }
    }

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      mode: stripeConfig.mode,
    });
  } catch (err: any) {
    console.error('Stripe session creation error:', err);
    return res.status(500).json({
      error: 'STRIPE_ERROR',
      message: err.message || 'An error occurred while creating Stripe checkout session.',
    });
  }
}
