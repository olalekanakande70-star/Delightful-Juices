-- ==============================================================================
-- DELIGHTFUL JUICES: SUPABASE PRODUCTION DATABASE SEED SCRIPT
-- Brand: Delightful Juices ("Savor the Pure Goodness | Naturally Made. Healthy Sips.")
-- C.E.O.: Oluyemi B. Ajibolade
-- Address: 500 W Broad St, Quakertown, PA 18951, USA
-- Phone: (484) 792-8023
-- ==============================================================================

-- 1. SEED SITE CONTENT CMS
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
  'Delightful Juices',
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
  'Naturally made, cold-pressed healthy sips handcrafted in Quakertown, PA. From our signature hibiscus Zobo to organic ginger infusions and rich tigernut milk, every bottle from Delightful Juices is thoughtfully prepared for authentic flavor and vitality.',
  '🌿 Fresh Batch Pressed Daily in Quakertown, PA • Free Local Delivery over $40 • Now Booking Weddings, Birthdays & Corporate Gatherings • Call/WhatsApp (484) 792-8023 🌿',
  'Delightful Juices was founded on a simple, passionate mission: to create truly nourishing, uncompromised drinks using nature’s most potent botanicals, fruits, herbs, and spices. Rooted in authentic West African heritage flavors like Zobo (Hibiscus) and Kunu Aya (Tigernut Milk), alongside revitalizing cold-pressed ginger roots, every recipe is hand-blended with care by CEO Oluyemi B. Ajibolade and our dedicated kitchen team.',
  'Every bottle of Delightful Juices is handcrafted with care and whole botanical ingredients, giving you a pure, refreshing experience you can enjoy again and again.',
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
  hero_subheadline = EXCLUDED.hero_subheadline,
  about_story = EXCLUDED.about_story,
  signature_promise = EXCLUDED.signature_promise,
  updated_at = NOW();

-- 2. SEED MULTI-PAGE NAVIGATION ITEMS WITH DROPDOWN SUPPORT
INSERT INTO public.navigation_items (id, label, href, visible, order_index, parent_id, is_dropdown, updated_at) VALUES
  ('nav-home', 'Home', '/', true, 1, NULL, false, NOW()),
  ('nav-shop', 'Shop Now', '/shop', true, 2, NULL, false, NOW()),
  ('nav-about', 'About', '/about-us', true, 3, NULL, true, NOW()),
  ('nav-about-company', 'About Delightful Juices', '/about-us', true, 1, 'nav-about', false, NOW()),
  ('nav-our-story', 'Our Story & Promise', '/our-story', true, 2, 'nav-about', false, NOW()),
  ('nav-delivery-info', 'Delivery & Freshness FAQ', '/delivery-information', true, 3, 'nav-about', false, NOW()),
  ('nav-services', 'Catering & Wholesale', '/events-catering', true, 4, NULL, true, NOW()),
  ('nav-events-link', 'Events & Catering', '/events-catering', true, 1, 'nav-services', false, NOW()),
  ('nav-wholesale-link', 'Wholesale & Retail', '/wholesale', true, 2, 'nav-services', false, NOW()),
  ('nav-contact', 'Contact Us', '/contact-us', true, 5, NULL, false, NOW())
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  href = EXCLUDED.href,
  order_index = EXCLUDED.order_index,
  parent_id = EXCLUDED.parent_id,
  is_dropdown = EXCLUDED.is_dropdown;

-- 3. SEED OFFICIAL DRINKS & PARTY BUNDLE (WITH STRUCTURED OZ CONVERSION METADATA)
INSERT INTO public.products (
  id, name, slug, category, category_label, tagline, description, ingredients,
  taste_profile, health_benefits, sizes, image_url, in_stock, featured, badge,
  rating, review_count, is_flyer_confirmed, display_order, updated_at
) VALUES
(
  'prod-zobo',
  'Zobo (Hibiscus / Sorrel)',
  'zobo-hibiscus-sorrel',
  'zobo',
  'Signature Zobo',
  'Authentic Nigerian Hibiscus infused with organic cloves, pineapple & warm botanicals',
  'Our signature ruby-red elixir brewed from premium dried hibiscus calyces, ginger root, cloves, and sweet pineapple peels. Rich in antioxidants and vitamin C, this time-honored West African recipe delivers an invigorating, tart, and floral refreshment crafted with our signature Delightful Juices botanical infusion.',
  '["Organic Hibiscus Flowers (Sorrel / Zobo)", "Fresh Ginger Root", "Pineapple Puree", "Whole Cloves", "Natural Cane Touch", "Delightful Juices Botanical Infusion"]'::jsonb,
  'Tart, bold floral berry notes with a lingering spicy botanical finish',
  '["Rich in Anthocyanins & Vitamin C", "Supports healthy blood pressure", "Natural electrolyte booster", "Caffeine-free energy"]'::jsonb,
  '[
    {"size": "35cl", "label": "11.8 oz Pocket Sip", "price": 5.50, "quantityValue": 35, "unit": "cl"},
    {"size": "50cl", "label": "16.9 oz Daily Refresh", "price": 7.50, "quantityValue": 50, "unit": "cl"},
    {"size": "1L", "label": "33.8 oz Family Sharing Jug", "price": 14.00, "quantityValue": 1, "unit": "L"}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80',
  true, true, 'Customer #1 Favorite', 4.95, 142, true, 1, NOW()
),
(
  'prod-organic-ginger',
  'Pure Organic Ginger',
  'pure-organic-ginger',
  'ginger',
  'Ginger Elixirs',
  'Fiery cold-pressed ginger root balanced with fresh lemon & golden honey',
  'An invigorating wellness powerhouse from Delightful Juices! Crafted from whole fresh ginger root cold-pressed to preserve active gingerol compounds. Balanced with fresh citrus lemon and wildflower honey for a bold, fiery kick that instantly energizes your body and soothes the throat.',
  '["Whole Organic Ginger Root", "Fresh Squeezed Lemon Juice", "Raw Wildflower Honey", "Pure Filtered Water", "Delightful Juices Herbal Extract"]'::jsonb,
  'Fiery ginger spice upfront with crisp lemon tang and smooth honey undertone',
  '["Potent natural digestive aid", "Anti-inflammatory gingerols", "Immunity defense booster", "Soothes throat & sinuses"]'::jsonb,
  '[
    {"size": "35cl", "label": "11.8 oz Immunity Bottle", "price": 5.50, "quantityValue": 35, "unit": "cl"},
    {"size": "50cl", "label": "16.9 oz Standard Refresh", "price": 7.50, "quantityValue": 50, "unit": "cl"},
    {"size": "1L", "label": "33.8 oz Family Sharing Jug", "price": 14.00, "quantityValue": 1, "unit": "L"}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  true, true, 'Immunity Powerhouse', 4.92, 98, true, 2, NOW()
),
(
  'prod-ginger-mango',
  'Ginger Mango',
  'ginger-mango-crush',
  'ginger',
  'Ginger Elixirs',
  'Velvety tropical Alfonso mango nectar harmonized with zesty fresh ginger',
  'A vibrant tropical symphony where rich, sun-ripened mango puree meets the invigorating warmth of cold-pressed ginger. Velvety smooth with just the right amount of spicy kick, perfect for sunny afternoons, event celebrations, and everyday refreshment.',
  '["Sun-Ripened Mango Puree", "Cold-Pressed Fresh Ginger", "Pure Pressed Apple & Orange Juice", "Lime Touch", "Delightful Juices Botanical Blend"]'::jsonb,
  'Rich, luscious tropical mango sweetness with a warming, zesty ginger finish',
  '["High in Vitamin A & Beta-Carotene", "Promotes glowing skin", "Revitalizes tired energy", "Naturally sweet without refined syrups"]'::jsonb,
  '[
    {"size": "35cl", "label": "11.8 oz Pocket Sip", "price": 5.50, "quantityValue": 35, "unit": "cl"},
    {"size": "50cl", "label": "16.9 oz Daily Refresh", "price": 7.50, "quantityValue": 50, "unit": "cl"},
    {"size": "1L", "label": "33.8 oz Family Sharing Jug", "price": 14.00, "quantityValue": 1, "unit": "L"}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&auto=format&fit=crop&q=80',
  true, true, 'Best Tropical Blend', 4.97, 114, true, 3, NOW()
),
(
  'prod-ginger-pineapple',
  'Ginger Pineapple',
  'ginger-pineapple-splash',
  'ginger',
  'Ginger Elixirs',
  'Golden tropical pineapple juice kissed by spicy handcrafted ginger',
  'Crisp, bright, and intensely refreshing. We extract the pure juice of ripe golden pineapples and harmonize it with our signature ginger press. Naturally loaded with bromelain and enzymes, this drink elevates your palate with every sip.',
  '["Golden Pineapple Cold-Pressed Juice", "Fresh Ginger Root", "Mint Leaf Infusion", "Touch of Lime", "Delightful Juices Botanical Extract"]'::jsonb,
  'Vibrant sweet-tart pineapple punch followed by a clean, warming ginger sparkle',
  '["Rich in Bromelain enzyme", "Aids post-meal digestion", "Hydrates deeply", "Natural mood enhancer"]'::jsonb,
  '[
    {"size": "35cl", "label": "11.8 oz Pocket Sip", "price": 5.50, "quantityValue": 35, "unit": "cl"},
    {"size": "50cl", "label": "16.9 oz Daily Refresh", "price": 7.50, "quantityValue": 50, "unit": "cl"},
    {"size": "1L", "label": "33.8 oz Family Sharing Jug", "price": 14.00, "quantityValue": 1, "unit": "L"}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=800&auto=format&fit=crop&q=80',
  true, true, 'Top Refreshment', 4.89, 87, true, 4, NOW()
),
(
  'prod-ginger-lychee',
  'Ginger Lychee',
  'ginger-lychee-floral',
  'ginger',
  'Ginger Elixirs',
  'Delicate floral exotic lychee blended with gentle warming ginger',
  'An exotic culinary delight from Delightful Juices! Fragrant lychee fruit nectar paired gracefully with subtle, micro-pressed ginger. Sweet, floral, and deeply cooling with a light aromatic zest that pairs exceptionally well with festive dinners and catering spreads.',
  '["Exotic Lychee Nectar", "Micro-Pressed Ginger Root", "Spring Water", "Botanical Blossom Essence", "Delightful Juices Botanical Infusion"]'::jsonb,
  'Silky, aromatic lychee florals with a gentle, rounded ginger warmth',
  '["Packed with polyphenols", "Cellular hydration", "Calming, restorative sensation", "Low acid gentleness"]'::jsonb,
  '[
    {"size": "35cl", "label": "11.8 oz Pocket Sip", "price": 5.50, "quantityValue": 35, "unit": "cl"},
    {"size": "50cl", "label": "16.9 oz Daily Refresh", "price": 7.50, "quantityValue": 50, "unit": "cl"},
    {"size": "1L", "label": "33.8 oz Family Sharing Jug", "price": 14.00, "quantityValue": 1, "unit": "L"}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
  true, false, 'Exotic Artisan Pick', 4.88, 63, false, 5, NOW()
),
(
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
    {"size": "35cl", "label": "11.8 oz Morning Bottle", "price": 6.00, "quantityValue": 35, "unit": "cl"},
    {"size": "50cl", "label": "16.9 oz Standard Bottle", "price": 8.00, "quantityValue": 50, "unit": "cl"},
    {"size": "1L", "label": "33.8 oz Family Sharing Jug", "price": 15.00, "quantityValue": 1, "unit": "L"}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800&auto=format&fit=crop&q=80',
  true, true, '100% Dairy-Free Superfood', 4.96, 129, true, 6, NOW()
),
(
  'prod-celebration-bundle',
  'Delightful 6-Pack Party Sampler',
  'delightful-party-sampler-6pack',
  'bundles',
  'Party & Event Packs',
  'Curated 6-bottle variety pack featuring our top client favorites for family or gatherings',
  'The ultimate Delightful Juices tasting collection! Includes 2x Signature Zobo, 1x Pure Organic Ginger, 1x Ginger Mango, 1x Ginger Pineapple, and 1x Tigernut Milk in 16.9 oz bottles. Packed cold in an insulated carrier, perfect for weekend brunch, gift giving, and small parties.',
  '["6 × 16.9 oz assorted bottles (Zobo, Ginger blends, Tigernut Milk)", "Fresh cold-pressed whole ingredients", "Delightful Juices signature botanical touch"]'::jsonb,
  'Complete journey from tart floral hibiscus to fiery ginger and creamy tigernut sweetness',
  '["Full spectrum of botanical vitamins", "Perfect crowd-pleaser for all ages", "Great savings vs individual bottles"]'::jsonb,
  '[
    {"size": "Pack", "label": "6 × 16.9 oz Fresh Bottles Variety Pack", "price": 38.00, "quantityValue": 6, "unit": "Pack", "packBottleQuantity": 50, "packBottleUnit": "cl"}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80',
  true, true, 'Popular Gift & Party Pack', 4.98, 76, true, 7, NOW()
)
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  ingredients = EXCLUDED.ingredients,
  sizes = EXCLUDED.sizes,
  updated_at = NOW();
