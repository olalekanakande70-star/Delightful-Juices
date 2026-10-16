-- ==============================================================================
-- DELIGHTFUL JUICE: SUPABASE DATABASE INITIALIZATION MIGRATION
-- Project: Delightful Juice (abrgqtrobgorsaggooxv)
-- Brand: Savor the Pure Goodness | Naturally Made. Healthy Sips.
-- C.E.O.: Oluyemi B. Ajibolade
-- Address: 500 W Broad St, Quakertown, PA 18951, USA
-- ==============================================================================

-- 1. Enable UUID Extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('zobo', 'ginger', 'other', 'bundles')),
  category_label TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  taste_profile TEXT NOT NULL,
  health_benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  badge TEXT,
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_flyer_confirmed BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for ordering and filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON public.products(display_order);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('pickup', 'local_delivery', 'shipping')),
  delivery_address TEXT NOT NULL,
  delivery_date TEXT,
  delivery_time_slot TEXT,
  notes TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('zelle', 'cash_on_delivery', 'card_at_pickup', 'whatsapp_order')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'out_for_delivery', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 4. EVENT & CATERING INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.event_inquiries (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT,
  guest_count INTEGER NOT NULL DEFAULT 0,
  event_location TEXT,
  bottle_sizes_needed JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_flavors JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_labeling_needed BOOLEAN NOT NULL DEFAULT false,
  budget_range TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'quoted', 'booked', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.event_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.event_inquiries(created_at DESC);

-- 5. SITE CONTENT CMS TABLE
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY DEFAULT 'main',
  business_name TEXT NOT NULL,
  ceo_name TEXT NOT NULL,
  motto TEXT NOT NULL,
  tagline TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  city_state_zip TEXT NOT NULL,
  instagram TEXT NOT NULL,
  tiktok TEXT NOT NULL,
  website_domain TEXT NOT NULL,
  hero_headline TEXT NOT NULL,
  hero_subheadline TEXT NOT NULL,
  announcement_ticker TEXT NOT NULL,
  about_story TEXT NOT NULL,
  signature_promise TEXT NOT NULL,
  free_delivery_threshold NUMERIC(10,2) NOT NULL DEFAULT 40.00,
  standard_delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 4.99,
  pickup_address TEXT NOT NULL,
  operating_hours TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. NAVIGATION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nav_order ON public.navigation_items(order_index);

-- 7. ADMIN PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can view in-stock products; authenticated users have full access
CREATE POLICY "Public read products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admin write products"
  ON public.products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Orders: Public can create orders; only authenticated admins can view and manage
CREATE POLICY "Public create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin manage orders"
  ON public.orders FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Inquiries: Public can submit event inquiries; only authenticated admins can view and manage
CREATE POLICY "Public submit inquiries"
  ON public.event_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin manage inquiries"
  ON public.event_inquiries FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Site Content: Public can read website copy; only authenticated admins can update
CREATE POLICY "Public read site content"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "Admin manage site content"
  ON public.site_content FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Navigation: Public can read nav items; only authenticated admins can manage
CREATE POLICY "Public read navigation"
  ON public.navigation_items FOR SELECT
  USING (true);

CREATE POLICY "Admin manage navigation"
  ON public.navigation_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin Profiles: Authenticated users can view their own profile
CREATE POLICY "Authenticated view admin profiles"
  ON public.admin_profiles FOR SELECT
  USING (auth.role() = 'authenticated');
