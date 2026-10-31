# Delightful Juices — Live Supabase & Stripe Production Setup Guide

This guide covers the production environment configuration, idempotent database schema migrations, and Supabase Auth administrator setup for **Delightful Juices**.

---

## 1. Live Environment Variables

All credentials are managed strictly via server/deployment environment variables (no local credentials or API key inputs exist in the browser UI):

```env
APP_URL="https://www.delightfuljuices.com"
VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_ANON_KEY="<your-supabase-anon-public-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-supabase-service-role-key>"
STRIPE_SECRET_KEY="<your-live-stripe-secret-key>"
STRIPE_WEBHOOK_SECRET="<your-live-stripe-webhook-secret>"
```

- `/api/public-config` automatically supplies public runtime connection metadata to every visitor browser while keeping `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` strictly server-side.
- `/api/create-checkout-session` creates live Stripe Checkout Sessions for card, Apple Pay, and Google Pay orders.
- `/api/stripe-webhook` verifies `Stripe-Signature` against `STRIPE_WEBHOOK_SECRET` and marks orders paid (`preparing`) in `public.orders`.

---

## 2. Database Schema & Seed Setup

1. Open your Supabase project's **SQL Editor**.
2. Run `supabase/migrations/20261016000000_init_delightful_juice.sql` (initial tables, RLS policies, and `delightful_assets` storage bucket).
3. Run `supabase/migrations/20261030000000_cms_expansion_delightful_juices.sql` (idempotent CMS expansion for `hero_slides`, `cms_pages`, nested `navigation_items`, and Stripe order columns).
4. Optionally run `supabase/seed.sql` if initializing a fresh project for the first time.

---

## 3. Live Administrator Authentication (Supabase Auth)

Administrator access at `/admin` is authenticated exclusively through **Supabase Auth**:

1. In your Supabase Dashboard, navigate to **Authentication → Users**.
2. Click **Add User → Create new user**.
3. Enter your administrator email (e.g., `orders@delightfuljuices.com`) and a strong password, with **Auto Confirm User** enabled.
4. Register the user in `public.admin_profiles` if needed:
   ```sql
   INSERT INTO public.admin_profiles (id, email, role)
   SELECT id, email, 'admin'
   FROM auth.users
   WHERE email = 'orders@delightfuljuices.com'
   ON CONFLICT (id) DO NOTHING;
   ```
5. Visit `/admin` on the live website and sign in with your Supabase Auth email and password.
