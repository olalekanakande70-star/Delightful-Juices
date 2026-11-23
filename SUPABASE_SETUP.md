# Delightful Juices — Live Supabase & Stripe Production Setup Guide

This guide covers the production environment configuration, idempotent database schema migrations, and Supabase Auth administrator setup for **Delightful Juices**.

---

## 1. Environment Variables & Secrets Handling

- **Production:** Configure all server secrets in **Vercel Project Settings → Environment Variables**.
- **Server-side development:** Configure development secrets in **Google AI Studio Secrets**.
- Never commit `.env` files or secret values to GitHub, and never prefix secret credentials with `VITE_`.

### Public Client Variables (`VITE_*` — safe for browser)
```env
VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_ANON_KEY="<your-supabase-anon-public-key>"
```

### Strictly Server-Side Secrets (never exposed to the browser)
```env
APP_URL="https://www.delightfuljuices.com"
SUPABASE_URL="https://<your-project-ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<your-supabase-service-role-key>"
PAYMENT_ENCRYPTION_KEY="<random-32-plus-char-secret-for-aes-256-gcm>"

# Optional fallback Stripe credentials (only needed if not configured via Admin CMS vault):
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

- `PAYMENT_ENCRYPTION_KEY` is used **only** on the server (`/api/_lib/stripeGateway.ts`) to AES-256-GCM encrypt and decrypt Stripe secret credentials stored in the RLS-locked `public.payment_gateway_secrets` table.
- `/api/public-config` returns only non-secret public metadata (`supabaseUrl`, `supabaseAnonKey`, active `stripePublishableKey`, `stripeMode`, and boolean readiness flags).
- `/api/stripe-gateway` requires a verified Supabase Auth administrator token (`Authorization: Bearer <jwt>`) and manages encrypted Stripe Test/Live credentials and automatic webhook registration.
- `/api/create-checkout-session` creates Stripe Checkout Sessions server-side.
- `/api/stripe-webhook` verifies `Stripe-Signature` against the encrypted webhook signing secret (or `STRIPE_WEBHOOK_SECRET` fallback) before updating `public.orders`.

---

## 2. Database Schema & Migrations

Execute these idempotent SQL migrations in **Supabase Dashboard → SQL Editor** in order:
1. `supabase/migrations/20261016000000_init_delightful_juice.sql`
2. `supabase/migrations/20261030000000_cms_expansion_delightful_juices.sql`
3. `supabase/migrations/20261122000000_stripe_webhook_orders_columns.sql`
4. `supabase/migrations/20261122010000_stripe_gateway_secrets.sql`

---

## 3. Live Administrator Authentication (Supabase Auth)

Administrator access at `/admin` is authenticated through **Supabase Auth**:

1. In Supabase Dashboard, navigate to **Authentication → Users**.
2. Click **Add User → Create new user** with your administrator email and strong password (**Auto Confirm User** enabled).
3. Ensure your administrator account is listed in `public.admin_profiles`:
   ```sql
   INSERT INTO public.admin_profiles (id, email, role)
   SELECT id, email, 'admin'
   FROM auth.users
   WHERE email = 'orders@delightfuljuices.com'
   ON CONFLICT (id) DO NOTHING;
   ```
4. Visit `/admin`, sign in, and open **CMS Settings → Payment Gateway**.
