-- ==============================================================================
-- DELIGHTFUL JUICE: SUPABASE PRODUCTION DATABASE SEED SCRIPT
-- Brand: Delightful Juice ("Savor the Pure Goodness | Naturally Made. Healthy Sips.")
-- Sources of truth: Business Requirements PDF & Verified Brand Assets
-- C.E.O.: Oluyemi B. Ajibolade
-- Address: 500 W Broad St, Quakertown, PA 18951, USA
-- Phone: (484) 792-8023
-- ==============================================================================

-- 1. SEED SITE CONTENT CMS
-- Uses key 'main', updates only if not manually edited or safely upserts
INSERT INTO public.site_content (
  key,
  business_name,
  ceo_name,
  motto,
  tagline,
  phone,
  whatsapp_number,
  email,
  address,
  city_state_zip,
  instagram,
  tiktok,
  website_domain,
  hero_headline,
  hero_subheadline,
  announcement_ticker,
  about_story,
  signature_promise,
  free_delivery_threshold,
  standard_delivery_fee,
  pickup_address,
  operating_hours,
  updated_at
) VALUES (
  'main',
  'Delightful Juice',
  'Oluyemi B. Ajibolade',
  'Savor the Pure Goodness',
  'Naturally Made. Healthy Sips.',
  '(484) 792-8023',
  '14847928023',
  'orders@delightfuljuices.com',
  '500 W Broad St',
  'Quakertown, PA 18951, USA',
  '@delightful_juicecreation',
  '@delightfuljuice',
  'www.delightfuljuices.com',
  'Savor the Pure Goodness.',
  'Naturally made, cold-pressed healthy sips handcrafted in Quakertown, PA. From our signature hibiscus Zobo to organic ginger infusions and rich tigernut milk, every bottle is thoughtfully prepared with our signature DelightOil for authentic flavor and vitality.',
  '🌿 Fresh Batch Pressed Daily in Quakertown, PA • Free Local Delivery over $40 • Now Booking Weddings, Birthdays & Corporate Gatherings • Call/WhatsApp (484) 792-8023 🌿',
  'Delightful Juice was founded on a simple, passionate mission: to create truly nourishing, uncompromised drinks using nature’s most potent botanicals, fruits, herbs, and spices. Rooted in authentic West African heritage flavors like Zobo (Hibiscus) and Kunu Aya (Tigernut Milk), alongside revitalizing cold-pressed ginger roots, every recipe is hand-blended with care by CEO Oluyemi B. Ajibolade and our dedicated kitchen team.',
  'Every bottle is made with care and quality ingredients, with our signature DelightOil in every bottle, giving you a refreshing experience you can enjoy again and again.',
  40.00,
  4.99,
  '500 W Broad St, Quakertown, PA 18951',
  'Mon - Sat: 9:00 AM - 6:30 PM | Sun: 11:00 AM - 4:00 PM',
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  ceo_name = EXCLUDED.ceo_name,
  motto = EXCLUDED.motto,
  tagline = EXCLUDED.tagline,
  phone = EXCLUDED.phone,
  whatsapp_number = EXCLUDED.whatsapp_number,
  address = EXCLUDED.address,
  city_state_zip = EXCLUDED.city_state_zip,
  instagram = EXCLUDED.instagram,
  signature_promise = EXCLUDED.signature_promise,
  updated_at = NOW();

-- 2. SEED NAVIGATION ITEMS
INSERT INTO public.navigation_items (id, label, href, visible, order_index, updated_at) VALUES
  ('nav-menu', 'Fresh Juices & Menu', '#menu', true, 1, NOW()),
  ('nav-signature', 'Our Signature Promise', '#signature-promise', true, 2, NOW()),
  ('nav-events', 'Events & Catering', '#events-catering', true, 3, NOW()),
  ('nav-wholesale', 'Wholesale & Retail', '#wholesale', true, 4, NOW()),
  ('nav-story', 'About Us', '#about', true, 5, NOW()),
  ('nav-faq', 'FAQ & Delivery', '#faq', true, 6, NOW()),
  ('nav-contact', 'Contact', '#contact', true, 7, NOW())
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  href = EXCLUDED.href,
  order_index = EXCLUDED.order_index;

-- 3. SEED THE 6 OFFICIAL DRINKS & PARTY BUNDLE (FROM PDF BRIEF)
-- Flavor 1: Zobo (Hibiscus / Sorrel)
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_label,
  tagline,
  description,
  ingredients,
  taste_profile,
  health_benefits,
  sizes,
  image_url,
  in_stock,
  featured,
  badge,
  rating,
  review_count,
  is_flyer_confirmed,
  display_order,
  updated_at
) VALUES (
  'prod-zobo',
  'Zobo (Hibiscus / Sorrel)',
  'zobo-hibiscus-sorrel',
  'zobo',
  'Signature Zobo',
  'Authentic Nigerian Hibiscus infused with organic cloves, pineapple & warm botanicals',
  'Our signature ruby-red elixir brewed from premium dried hibiscus calyces, ginger root, cloves, and sweet pineapple peels. Rich in antioxidants and vitamin C, this time-honored West African recipe delivers an invigorating, tart, and floral refreshment with our signature DelightOil touch.',
  '["Organic Hibiscus Flowers (Sorrel / Zobo)", "Fresh Ginger Root", "Pineapple Puree", "Cloves", "Natural Cane Touch", "Signature DelightOil Infusion"]'::jsonb,
  'Tart, bold floral berry notes with a lingering spicy botanical finish',
  '["Rich in Anthocyanins & Vitamin C", "Supports healthy blood pressure", "Natural electrolyte booster", "Caffeine-free energy"]'::jsonb,
  '[
    {"size": "35cl", "label": "35cl (12 oz Pocket Sip)", "price": 5.50},
    {"size": "50cl", "label": "50cl (16.9 oz Daily Refresh)", "price": 7.50},
    {"size": "1L", "label": "1 Litre (Family Sharing Jug)", "price": 14.00}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80',
  true,
  true,
  'Customer #1 Favorite',
  4.95,
  142,
  true,
  1,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  sizes = EXCLUDED.sizes,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Flavor 2: Pure Organic Ginger
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_label,
  tagline,
  description,
  ingredients,
  taste_profile,
  health_benefits,
  sizes,
  image_url,
  in_stock,
  featured,
  badge,
  rating,
  review_count,
  is_flyer_confirmed,
  display_order,
  updated_at
) VALUES (
  'prod-organic-ginger',
  'Pure Organic Ginger',
  'pure-organic-ginger',
  'ginger',
  'Ginger Elixirs',
  'Fiery cold-pressed ginger root balanced with fresh lemon & golden honey',
  'An invigorating wellness powerhouse! Crafted from whole fresh ginger root cold-pressed to preserve active gingerol compounds. Balanced with fresh citrus lemon and wildflower honey for a bold, fiery kick that instantly energizes your body and soothes the throat.',
  '["Whole Organic Ginger Root", "Fresh Squeezed Lemon Juice", "Raw Wildflower Honey", "Pure Filtered Water", "DelightOil Herbal Extract"]'::jsonb,
  'Fiery ginger spice upfront with crisp lemon tang and smooth honey undertone',
  '["Potent natural digestive aid", "Anti-inflammatory gingerols", "Immunity defense booster", "Soothes throat & sinuses"]'::jsonb,
  '[
    {"size": "35cl", "label": "35cl (12 oz Immunity Shot Bottle)", "price": 5.50},
    {"size": "50cl", "label": "50cl (16.9 oz Standard Refresh)", "price": 7.50},
    {"size": "1L", "label": "1 Litre (Family Sharing Jug)", "price": 14.00}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  true,
  true,
  'Immunity Powerhouse',
  4.92,
  98,
  true,
  2,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  sizes = EXCLUDED.sizes,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Flavor 3: Ginger Mango
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_label,
  tagline,
  description,
  ingredients,
  taste_profile,
  health_benefits,
  sizes,
  image_url,
  in_stock,
  featured,
  badge,
  rating,
  review_count,
  is_flyer_confirmed,
  display_order,
  updated_at
) VALUES (
  'prod-ginger-mango',
  'Ginger Mango',
  'ginger-mango-crush',
  'ginger',
  'Ginger Elixirs',
  'Velvety tropical Alfonso mango nectar harmonized with zesty fresh ginger',
  'A vibrant tropical symphony where rich, sun-ripened mango puree meets the invigorating warmth of cold-pressed ginger. Velvety smooth with just the right amount of spicy kick, perfect for sunny afternoons, event celebrations, and everyday refreshment.',
  '["Sun-Ripened Mango Puree", "Cold-Pressed Fresh Ginger", "Pure Pressed Apple & Orange Juice", "Lime Touch", "Signature DelightOil"]'::jsonb,
  'Rich, luscious tropical mango sweetness with a warming, zesty ginger finish',
  '["High in Vitamin A & Beta-Carotene", "Promotes glowing skin", "Revitalizes tired energy", "Naturally sweet without refined syrups"]'::jsonb,
  '[
    {"size": "35cl", "label": "35cl (12 oz Pocket Sip)", "price": 5.50},
    {"size": "50cl", "label": "50cl (16.9 oz Daily Refresh)", "price": 7.50},
    {"size": "1L", "label": "1 Litre (Family Sharing Jug)", "price": 14.00}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&auto=format&fit=crop&q=80',
  true,
  true,
  'Best Tropical Blend',
  4.97,
  114,
  true,
  3,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  sizes = EXCLUDED.sizes,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Flavor 4: Ginger Pineapple
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_label,
  tagline,
  description,
  ingredients,
  taste_profile,
  health_benefits,
  sizes,
  image_url,
  in_stock,
  featured,
  badge,
  rating,
  review_count,
  is_flyer_confirmed,
  display_order,
  updated_at
) VALUES (
  'prod-ginger-pineapple',
  'Ginger Pineapple',
  'ginger-pineapple-splash',
  'ginger',
  'Ginger Elixirs',
  'Golden tropical pineapple juice kissed by spicy handcrafted ginger',
  'Crisp, bright, and intensely refreshing. We extract the pure juice of ripe golden pineapples and harmonize it with our signature ginger press. Naturally loaded with bromelain and enzymes, this drink elevates your palate with every sip.',
  '["Golden Pineapple Cold-Pressed Juice", "Fresh Ginger Root", "Mint Leaf Infusion", "Touch of Lime", "DelightOil Extract"]'::jsonb,
  'Vibrant sweet-tart pineapple punch followed by a clean, warming ginger sparkle',
  '["Rich in Bromelain enzyme", "Aids post-meal digestion", "Hydrates deeply", "Natural mood enhancer"]'::jsonb,
  '[
    {"size": "35cl", "label": "35cl (12 oz Pocket Sip)", "price": 5.50},
    {"size": "50cl", "label": "50cl (16.9 oz Daily Refresh)", "price": 7.50},
    {"size": "1L", "label": "1 Litre (Family Sharing Jug)", "price": 14.00}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=800&auto=format&fit=crop&q=80',
  true,
  true,
  'Top Refreshment',
  4.89,
  87,
  true,
  4,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  sizes = EXCLUDED.sizes,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Flavor 5: Ginger Lychee
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_label,
  tagline,
  description,
  ingredients,
  taste_profile,
  health_benefits,
  sizes,
  image_url,
  in_stock,
  featured,
  badge,
  rating,
  review_count,
  is_flyer_confirmed,
  display_order,
  updated_at
) VALUES (
  'prod-ginger-lychee',
  'Ginger Lychee',
  'ginger-lychee-floral',
  'ginger',
  'Ginger Elixirs',
  'Delicate floral exotic lychee blended with gentle warming ginger',
  'An exotic culinary delight! Fragrant lychee fruit nectar paired gracefully with subtle, micro-pressed ginger. Sweet, floral, and deeply cooling with a light aromatic zest that pairs exceptionally well with festive dinners and catering spreads.',
  '["Exotic Lychee Nectar", "Micro-Pressed Ginger Root", "Spring Water", "Botanical Blossom Essence", "Signature DelightOil"]'::jsonb,
  'Silky, aromatic lychee florals with a gentle, rounded ginger warmth',
  '["Packed with polyphenols", "Cellular hydration", "Calming, restorative sensation", "Low acid gentleness"]'::jsonb,
  '[
    {"size": "35cl", "label": "35cl (12 oz Pocket Sip)", "price": 5.50},
    {"size": "50cl", "label": "50cl (16.9 oz Daily Refresh)", "price": 7.50},
    {"size": "1L", "label": "1 Litre (Family Sharing Jug)", "price": 14.00}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
  true,
  false,
  'Exotic Artisan Pick',
  4.88,
  63,
  false,
  5,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  sizes = EXCLUDED.sizes,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Flavor 6: Tigernut Milk (Kunu Aya)
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_label,
  tagline,
  description,
  ingredients,
  taste_profile,
  health_benefits,
  sizes,
  image_url,
  in_stock,
  featured,
  badge,
  rating,
  review_count,
  is_flyer_confirmed,
  display_order,
  updated_at
) VALUES (
  'prod-tigernut-milk',
  'Tigernut Milk (Kunu Aya)',
  'tigernut-milk-kunu-aya',
  'other',
  'Artisanal Milks',
  'Creamy, dairy-free traditional tigernut milk enriched with dates & organic coconut',
  'A creamy, velvety heritage plant milk crafted from nutrient-dense tubers known as Tigernuts (Cyperus esculentus), sweetened naturally with soft Medjool dates and infused with organic coconut and a whisper of ginger. 100% dairy-free, nut-free, and prebiotic-rich.',
  '["Whole Soaked Tigernuts (Chufa Tubers)", "Medjool Date Puree", "Creamy Coconut Nectar", "Touch of Ginger Root", "Pure Filtered Spring Water"]'::jsonb,
  'Naturally sweet, rich, nutty (yet nut-free), and comforting with hints of caramel and date',
  '["Rich in Resistant Starch Prebiotics", "100% Dairy-Free & Vegan", "Natural source of Magnesium & Iron", "Sustained steady energy"]'::jsonb,
  '[
    {"size": "35cl", "label": "35cl (12 oz Morning Bottle)", "price": 6.00},
    {"size": "50cl", "label": "50cl (16.9 oz Standard Bottle)", "price": 8.00},
    {"size": "1L", "label": "1 Litre (Family Sharing Jug)", "price": 15.00}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800&auto=format&fit=crop&q=80',
  true,
  true,
  '100% Dairy-Free Superfood',
  4.96,
  129,
  true,
  6,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  sizes = EXCLUDED.sizes,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Party & Sampler Pack: Delightful 6-Pack Sampler
INSERT INTO public.products (
  id,
  name,
  slug,
  category,
  category_label,
  tagline,
  description,
  ingredients,
  taste_profile,
  health_benefits,
  sizes,
  image_url,
  in_stock,
  featured,
  badge,
  rating,
  review_count,
  is_flyer_confirmed,
  display_order,
  updated_at
) VALUES (
  'prod-celebration-bundle',
  'Delightful 6-Pack Party Sampler',
  'delightful-party-sampler-6pack',
  'bundles',
  'Party & Event Packs',
  'Curated 6-bottle variety pack featuring our top client favorites for family or gatherings',
  'The ultimate tasting collection! Includes 2x Signature Zobo, 1x Pure Organic Ginger, 1x Ginger Mango, 1x Ginger Pineapple, and 1x Tigernut Milk in 50cl bottles. Packed cold in an insulated carrier, perfect for weekend brunch, gift giving, and small parties.',
  '["6 x 50cl assorted bottles (Zobo, Ginger blends, Tigernut Milk)", "Fresh cold pressed ingredients", "Our signature DelightOil touch"]'::jsonb,
  'Complete journey from tart floral hibiscus to fiery ginger and creamy tigernut sweetness',
  '["Full spectrum of botanical vitamins", "Perfect crowd-pleaser for all ages", "Great savings vs individual bottles"]'::jsonb,
  '[
    {"size": "Pack", "label": "6 x 50cl Fresh Bottles Variety Pack", "price": 38.00}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1622484216853-4dc9b8e8f804?w=800&auto=format&fit=crop&q=80',
  true,
  true,
  'Popular Gift & Party Pack',
  4.98,
  76,
  true,
  7,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  sizes = EXCLUDED.sizes,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- ==============================================================================
-- 4. ADMINISTRATOR AUTHENTICATION INSTRUCTIONS
-- To provision your initial administrator via Supabase Dashboard:
-- 1. Go to Authentication -> Users in your Supabase Dashboard.
-- 2. Click "Add User" -> "Create User".
-- 3. Enter the administrator email (e.g. olalekanakande70@gmail.com or admin@delightfuljuices.com)
--    and set a secure password. Check "Auto Confirm User".
-- 4. In the SQL Editor, link that user ID to the admin_profiles table:
--
--    INSERT INTO public.admin_profiles (id, email, role)
--    SELECT id, email, 'admin'
--    FROM auth.users
--    WHERE email = 'olalekanakande70@gmail.com'
--    ON CONFLICT (id) DO NOTHING;
-- ==============================================================================
