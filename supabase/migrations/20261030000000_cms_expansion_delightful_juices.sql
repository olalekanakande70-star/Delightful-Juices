-- ==============================================================================
-- DELIGHTFUL JUICES: POST-DEPLOYMENT CMS EXPANSION MIGRATION (IDEMPOTENT)
-- Adds Hero Slider CMS, Dynamic Pages & Content Blocks CMS, Nested Navigation,
-- Brand Name Updates (DelightOil -> Delightful Juices), and Unit Metadata
-- Safe to run multiple times without resetting or altering existing orders/products.
-- ==============================================================================

-- 1. HERO SLIDES TABLE
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id TEXT PRIMARY KEY,
  heading TEXT NOT NULL,
  subheading TEXT NOT NULL,
  kicker TEXT,
  cta_label TEXT NOT NULL DEFAULT 'Shop Now',
  cta_url TEXT NOT NULL DEFAULT '/shop',
  secondary_cta_label TEXT,
  secondary_cta_url TEXT,
  desktop_image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  overlay_opacity NUMERIC(3,2) NOT NULL DEFAULT 0.55,
  display_order INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON public.hero_slides(display_order);
CREATE INDEX IF NOT EXISTS idx_hero_slides_enabled ON public.hero_slides(enabled);

-- 2. DYNAMIC WEBSITE PAGES & REUSABLE CONTENT BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  seo_title TEXT,
  meta_description TEXT,
  show_in_nav BOOLEAN NOT NULL DEFAULT true,
  nav_parent_id TEXT,
  nav_label TEXT,
  is_system_route BOOLEAN NOT NULL DEFAULT false,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON public.cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON public.cms_pages(status);

-- 3. EXTEND NAVIGATION ITEMS FOR DROPDOWNS & NESTED LINKS
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 1,
  parent_id TEXT,
  is_dropdown BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.navigation_items ADD COLUMN IF NOT EXISTS parent_id TEXT;
ALTER TABLE public.navigation_items ADD COLUMN IF NOT EXISTS is_dropdown BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_nav_parent ON public.navigation_items(parent_id);

-- 4. ROW LEVEL SECURITY FOR NEW CMS TABLES
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

-- Hero Slides Policies: Public reads active slides; authenticated admins manage all
DROP POLICY IF EXISTS "Public read active hero slides" ON public.hero_slides;
CREATE POLICY "Public read active hero slides"
  ON public.hero_slides FOR SELECT
  USING (enabled = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage hero slides" ON public.hero_slides;
CREATE POLICY "Admin manage hero slides"
  ON public.hero_slides FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- CMS Pages Policies: Public reads published pages only; authenticated admins read & write all (including drafts)
DROP POLICY IF EXISTS "Public read published cms pages" ON public.cms_pages;
CREATE POLICY "Public read published cms pages"
  ON public.cms_pages FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage cms pages" ON public.cms_pages;
CREATE POLICY "Admin manage cms pages"
  ON public.cms_pages FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Ensure Navigation Policies exist
DROP POLICY IF EXISTS "Public read navigation" ON public.navigation_items;
CREATE POLICY "Public read navigation"
  ON public.navigation_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin manage navigation" ON public.navigation_items;
CREATE POLICY "Admin manage navigation"
  ON public.navigation_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 5. SAFE DATA UPDATE: REPLACE LEGACY "DelightOil" REFERENCES IN STORED CMS CONTENT
-- Preserves all prices, stock, IDs, and customer orders!
UPDATE public.site_content
SET
  business_name = CASE WHEN business_name IN ('DelightOil', 'Delightful Juice') THEN 'Delightful Juices' ELSE business_name END,
  hero_subheadline = REPLACE(hero_subheadline, 'DelightOil', 'Delightful Juices botanical blend'),
  signature_promise = REPLACE(signature_promise, 'DelightOil', 'Delightful Juices signature blend'),
  about_story = REPLACE(REPLACE(about_story, 'DelightOil', 'Delightful Juices'), 'Delightful Juice ', 'Delightful Juices '),
  branding = CASE
    WHEN branding IS NOT NULL AND branding->>'logoText' IN ('DelightOil', 'Delightful Juice')
    THEN jsonb_set(branding, '{logoText}', '"Delightful Juices"')
    ELSE branding
  END,
  updated_at = NOW()
WHERE key = 'main';

UPDATE public.products
SET
  description = REPLACE(description, 'DelightOil', 'Delightful Juices botanical'),
  ingredients = REPLACE(ingredients::text, 'DelightOil', 'Delightful Juices Botanical')::jsonb,
  updated_at = NOW()
WHERE description ILIKE '%DelightOil%' OR ingredients::text ILIKE '%DelightOil%';

-- 6. ENSURE PUBLIC STORAGE BUCKET FOR SLIDER & PAGE MEDIA
INSERT INTO storage.buckets (id, name, public)
VALUES ('delightful_assets', 'delightful_assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Assets" ON storage.objects;
CREATE POLICY "Public Read Assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'delightful_assets');

DROP POLICY IF EXISTS "Authenticated Upload Assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow Assets Upload" ON storage.objects;
CREATE POLICY "Allow Assets Upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'delightful_assets');

DROP POLICY IF EXISTS "Allow Assets Update" ON storage.objects;
CREATE POLICY "Allow Assets Update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'delightful_assets');
