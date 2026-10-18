# Delightful Juice — Supabase Setup & Production Integration Guide

This guide details the complete configuration, database migration, seeding, and administrator authentication for **Delightful Juice** using your Supabase project:

- **Project ID:** `abrgqtrobgorsaggooxv`
- **Project URL:** `https://abrgqtrobgorsaggooxv.supabase.co`
- **Direct Supabase Dashboard:** [https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv](https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv)
- **Direct SQL Editor:** [https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv/sql](https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv/sql)

---

## 1. Quick Setup (3 Easy Steps)

### Step 1: Run the Database Migration
1. Go to your Supabase project's **SQL Editor**:
   [https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv/sql](https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv/sql)
2. Click **New query**.
3. Open or copy the entire contents of:
   `supabase/migrations/20261016000000_init_delightful_juice.sql`
4. Paste it into the SQL editor and click **Run**.
5. This creates:
   - `public.products` (Flavors, prices for 35cl / 50cl / 1L, ingredients, photos, gallery images, stock)
   - `public.orders` (Customer delivery details, order items, totals, status, Stripe session references)
   - `public.event_inquiries` (Wedding, birthday, corporate quotes, guest counts, bottle sizes)
   - `public.site_content` (Hero copy, announcement ticker, CEO info, operating hours, branding, colors, typography, Stripe settings)
   - `public.navigation_items` (Header & mobile navigation links)
   - `public.admin_profiles` (Protected administrator roles)
   - `storage.buckets`: `delightful_assets` (Public bucket for website logos and high-res drink photography)
   - Row Level Security (RLS) policies allowing public browsing/ordering and restricted admin access.

---

### Step 2: Run the Database Seed Script
1. In the Supabase **SQL Editor**, open a second **New query**.
2. Open or copy the contents of:
   `supabase/seed.sql`
3. Paste it into the editor and click **Run**.
4. This seeds all 6 official drinks and the party bundle verified in the PDF brief:
   - **Zobo (Hibiscus / Sorrel)**
   - **Pure Organic Ginger**
   - **Ginger Mango**
   - **Ginger Pineapple**
   - **Ginger Lychee**
   - **Tigernut Milk (Kunu Aya)**
   - **Delightful 6-Pack Party Sampler**
   along with verified Quakertown PA business info, C.E.O. Oluyemi B. Ajibolade, and contact links.

---

### Step 3: Connect the Application
1. Go to **Project Settings** → **API** in your Supabase dashboard:
   [https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv/settings/api](https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv/settings/api)
2. Copy your **anon / public** key.
3. In the Delightful Juice application:
   - Click **Admin** in the header or footer (or visit `#admin`).
   - Sign in using master credentials (`admin123` or `delightful2026`).
   - Go to the **Supabase Database** tab.
   - Enter your Anon key (Project URL is prefilled to `https://abrgqtrobgorsaggooxv.supabase.co`).
   - Click **Save & Test Connection**.
   - Optionally, you can also click the **"Seed Supabase Tables (1-Click)"** button right in the UI!
4. Or configure your local `.env` file:
   ```env
   VITE_SUPABASE_URL="https://abrgqtrobgorsaggooxv.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-actual-anon-key-here"
   ```

---

## 2. Administrator Authentication with Supabase Auth

To enable email/password administrator login via Supabase:

1. In your Supabase Dashboard, navigate to **Authentication** → **Users**:
   [https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv/auth/users](https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv/auth/users)
2. Click **Add User** → **Create User**.
3. Enter your administrator email (e.g., `olalekanakande70@gmail.com` or `admin@delightfuljuices.com`) and choose a strong password.
4. Ensure **"Auto Confirm User?"** is checked, then click **Create User**.
5. In the **SQL Editor**, register that user in `admin_profiles`:
   ```sql
   INSERT INTO public.admin_profiles (id, email, role)
   SELECT id, email, 'admin'
   FROM auth.users
   WHERE email = 'olalekanakande70@gmail.com'
   ON CONFLICT (id) DO NOTHING;
   ```
6. Now you can sign into the Admin Dashboard using the **Supabase Auth** tab!

---

## 3. Security & Key Best Practices

- **Never expose your Service Role Key in client code**: Only the **anon public key** is used in frontend code and protected by Row Level Security (RLS) policies.
- **Service Role Key Rotation**: If your service role key was previously pasted in chats, prompts, or shared locations, it is strongly recommended to rotate it in:
  [https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv/settings/api](https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv/settings/api)
  (click **Generate new secret**).

---

## 4. Supabase CLI Alternative (Optional)

If you have the Supabase CLI installed on your machine:
```bash
# Link to project
supabase link --project-ref abrgqtrobgorsaggooxv

# Push migrations
supabase db push

# Run seed
supabase db seed
```

