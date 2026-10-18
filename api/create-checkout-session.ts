import type { Request, Response } from 'express';
import Stripe from 'stripe';

export default async function handler(req: any, res: any) {
  // Support both Vercel Serverless Functions and Express
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const { orderId, orderNumber, items, customerEmail, customerName, deliveryFee, successUrl, cancelUrl, currency = 'usd' } = req.body || {};

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order items.' });
  }

  // If Stripe Secret Key is missing, respond with clear diagnostic instructions
  if (!stripeSecretKey) {
    return res.status(400).json({
      error: 'STRIPE_NOT_CONFIGURED',
      message: 'STRIPE_SECRET_KEY environment variable is not configured on the server. Please set STRIPE_SECRET_KEY in your Vercel Project Settings > Environment Variables.',
    });
  }

  try {
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    // Format line items
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: `${item.productName} (${item.size})`,
          images: item.imageUrl ? [item.imageUrl] : [],
          description: `Handcrafted fresh bottle • Size: ${item.sizeLabel || item.size}`,
        },
        unit_amount: Math.round(Number(item.unitPrice) * 100),
      },
      quantity: item.quantity,
    }));

    // If delivery fee applies, add as a line item
    if (deliveryFee && Number(deliveryFee) > 0) {
      line_items.push({
        price_data: {
          currency: currency.toLowerCase(),
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

    const host = req.headers.origin || req.headers.host ? `https://${req.headers.host}` : 'https://www.delightfuljuices.com';

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
      success_url: successUrl || `${host}/?order_success=true&order_number=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${host}/?order_cancelled=true&order_number=${orderNumber}`,
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
