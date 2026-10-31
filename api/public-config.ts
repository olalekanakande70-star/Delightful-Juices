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

  const stripePublishableKey =
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    '';

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const stripeWebhookConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET);

  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30');
  return res.status(200).json({
    environment: 'live',
    supabaseUrl,
    supabaseAnonKey,
    stripePublishableKey,
    stripeConfigured,
    stripeWebhookConfigured,
  });
}
