import { resolveStripeRuntimeConfig } from './_lib/stripeGateway.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Expose only public client configuration and boolean server-readiness flags (never secret keys)
  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '';

  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  const resolvedStripe = await resolveStripeRuntimeConfig();
  const stripePublishableKey =
    resolvedStripe.publishableKey ||
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    '';

  const stripeConfigured = Boolean(resolvedStripe.connected && resolvedStripe.secretKey);
  const stripeWebhookConfigured = Boolean(resolvedStripe.webhookSecret);

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    environment: 'live',
    supabaseUrl,
    supabaseAnonKey,
    stripePublishableKey,
    stripeMode: resolvedStripe.mode,
    stripeConnected: stripeConfigured,
    stripeConfigured,
    stripeWebhookConfigured,
  });
}
