import Stripe from 'stripe';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const {
    orderId,
    orderNumber,
    items,
    customerEmail,
    customerName,
    deliveryFee,
    successUrl,
    cancelUrl,
    currency = 'usd',
  } = req.body || {};

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order items.' });
  }

  if (!stripeSecretKey) {
    return res.status(400).json({
      error: 'STRIPE_NOT_CONFIGURED',
      message:
        'STRIPE_SECRET_KEY is not configured in the live server environment variables.',
    });
  }

  try {
    const stripe = new Stripe(stripeSecretKey, {
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
            name: 'Local Cold Delivery Fee',
            images: [],
            description: 'Quakertown & Regional Insulated Delivery',
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

    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: customerEmail || undefined,
      client_reference_id: orderId || orderNumber,
      metadata: {
        orderId: orderId || '',
        orderNumber: orderNumber || '',
        customerName: customerName || '',
      },
      success_url:
        successUrl ||
        `${host}/?order_success=true&order_number=${encodeURIComponent(orderNumber || '')}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl ||
        `${host}/?order_cancelled=true&order_number=${encodeURIComponent(orderNumber || '')}`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err: any) {
    console.error('Stripe session creation error:', err);
    return res.status(500).json({
      error: 'STRIPE_ERROR',
      message: err.message || 'An error occurred while creating Stripe checkout session.',
    });
  }
}
