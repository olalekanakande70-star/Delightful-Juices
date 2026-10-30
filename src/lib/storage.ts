import {
  Product,
  Order,
  EventInquiry,
  SiteContent,
  NavItem,
  SupabaseConfig,
  HeroSlide,
  CmsPage,
  SizeOption,
  AboutShowcaseSettings,
} from '../types';
import { supabaseService } from './supabaseClient';
import { applyTheme } from './theme';
import { parseSizeString, sanitizeBrandText } from './units';

import heroSlideZobo from '../assets/images/hero_zobo_hibiscus_craft_1793343611489.jpg';
import heroSlideGinger from '../assets/images/hero_ginger_tropical_elixirs_1793343613276.jpg';
import heroSlideTigernut from '../assets/images/hero_tigernut_catering_spread_1793343615121.jpg';
import aboutBotanicalsImg from '../assets/images/about_artisanal_botanicals_1793343616189.jpg';
import productZoboStudio from '../assets/images/product_zobo_bottle_1793343617852.jpg';
import productGingerStudio from '../assets/images/product_ginger_elixir_1793343618737.jpg';

export const FALLBACK_BEVERAGE_IMAGE = productZoboStudio;
export const ABOUT_ARTISANAL_IMAGE = aboutBotanicalsImg;

const STORAGE_KEYS = {
  PRODUCTS: 'delightful_juice_products_v1',
  ORDERS: 'delightful_juice_orders_v1',
  INQUIRIES: 'delightful_juice_inquiries_v1',
  CONTENT: 'delightful_juice_content_v1',
  NAV: 'delightful_juice_nav_v2',
  LEGACY_NAV: 'delightful_juice_nav_v1',
  HERO_SLIDES: 'delightful_juice_hero_slides_v1',
  CMS_PAGES: 'delightful_juice_cms_pages_v1',
  SUPABASE_CONFIG: 'delightful_juice_supabase_cfg_v1',
  ADMIN_AUTH: 'delightful_juice_admin_session_v1',
};

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    heading: 'Savor the Pure Goodness of Handcrafted Botanicals.',
    subheading:
      'Cold-pressed daily in Quakertown, PA by Delightful Juices. Experience our ruby-red Nigerian Zobo hibiscus infusion, vibrant ginger elixirs, and velvety Tigernut Milk.',
    kicker: 'FRESH COLD-PRESSED IN QUAKERTOWN, PA',
    ctaLabel: 'Shop Now',
    ctaUrl: '/shop',
    secondaryCtaLabel: 'Events & Catering',
    secondaryCtaUrl: '/events-catering',
    desktopImageUrl: heroSlideZobo,
    mobileImageUrl: heroSlideZobo,
    overlayOpacity: 0.52,
    displayOrder: 1,
    active: true,
  },
  {
    id: 'slide-2',
    heading: 'Fiery Organic Ginger & Sun-Ripened Tropical Elixirs.',
    subheading:
      'Whole cold-pressed ginger root harmonized with Alfonso mango, golden pineapple, and fragrant lychee—crafted with zero refined syrups or artificial preservatives.',
    kicker: '100% REAL ROOTS, FRUITS & SPICES',
    ctaLabel: 'Shop Fresh Flavors',
    ctaUrl: '/shop',
    secondaryCtaLabel: 'Our Signature Promise',
    secondaryCtaUrl: '/our-story',
    desktopImageUrl: heroSlideGinger,
    mobileImageUrl: heroSlideGinger,
    overlayOpacity: 0.50,
    displayOrder: 2,
    active: true,
  },
  {
    id: 'slide-3',
    heading: 'Elevate Weddings, Celebrations & Corporate Gatherings.',
    subheading:
      'Custom monogrammed bottles of Zobo, Ginger blends, and dairy-free Kunu Aya Tigernut Milk delivered chilled across Quakertown, Bucks County, and the Lehigh Valley.',
    kicker: 'BESPOKE EVENT & CATERING SERVICE',
    ctaLabel: 'Plan Your Event',
    ctaUrl: '/events-catering',
    secondaryCtaLabel: 'Shop Variety Packs',
    secondaryCtaUrl: '/shop',
    desktopImageUrl: heroSlideTigernut,
    mobileImageUrl: heroSlideTigernut,
    overlayOpacity: 0.54,
    displayOrder: 3,
    active: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-zobo',
    name: 'Zobo (Hibiscus / Sorrel)',
    slug: 'zobo-hibiscus-sorrel',
    category: 'zobo',
    categoryLabel: 'Signature Zobo',
    tagline: 'Authentic Nigerian Hibiscus infused with organic cloves, pineapple & warm botanicals',
    description:
      'Our signature ruby-red elixir brewed from premium dried hibiscus calyces, ginger root, cloves, and sweet pineapple peels. Rich in antioxidants and vitamin C, this time-honored West African recipe delivers an invigorating, tart, and floral refreshment crafted with our signature Delightful Juices botanical infusion.',
    ingredients: [
      'Organic Hibiscus Flowers (Sorrel / Zobo)',
      'Fresh Ginger Root',
      'Pineapple Puree',
      'Whole Cloves',
      'Natural Cane Touch',
      'Delightful Juices Botanical Infusion',
    ],
    tasteProfile: 'Tart, bold floral berry notes with a lingering spicy botanical finish',
    healthBenefits: [
      'Rich in Anthocyanins & Vitamin C',
      'Supports healthy blood pressure',
      'Natural electrolyte booster',
      'Caffeine-free energy',
    ],
    sizes: [
      { size: '35cl', label: '11.8 oz Pocket Sip', price: 5.5, quantityValue: 35, unit: 'cl' },
      { size: '50cl', label: '16.9 oz Daily Refresh', price: 7.5, quantityValue: 50, unit: 'cl' },
      { size: '1L', label: '33.8 oz Family Sharing Jug', price: 14.0, quantityValue: 1, unit: 'L' },
    ],
    imageUrl: productZoboStudio,
    galleryImages: [
      'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80',
    ],
    inStock: true,
    featured: true,
    badge: 'Customer #1 Favorite',
    rating: 4.95,
    reviewCount: 142,
    isFlyerConfirmed: true,
    displayOrder: 1,
  },
  {
    id: 'prod-organic-ginger',
    name: 'Pure Organic Ginger',
    slug: 'pure-organic-ginger',
    category: 'ginger',
    categoryLabel: 'Ginger Elixirs',
    tagline: 'Fiery cold-pressed ginger root balanced with fresh lemon & golden honey',
    description:
      'An invigorating wellness powerhouse from Delightful Juices! Crafted from whole fresh ginger root cold-pressed to preserve active gingerol compounds. Balanced with fresh citrus lemon and wildflower honey for a bold, fiery kick that instantly energizes your body and soothes the throat.',
    ingredients: [
      'Whole Organic Ginger Root',
      'Fresh Squeezed Lemon Juice',
      'Raw Wildflower Honey',
      'Pure Filtered Water',
      'Delightful Juices Herbal Extract',
    ],
    tasteProfile: 'Fiery ginger spice upfront with crisp lemon tang and smooth honey undertone',
    healthBenefits: [
      'Potent natural digestive aid',
      'Anti-inflammatory gingerols',
      'Immunity defense booster',
      'Soothes throat & sinuses',
    ],
    sizes: [
      { size: '35cl', label: '11.8 oz Immunity Bottle', price: 5.5, quantityValue: 35, unit: 'cl' },
      { size: '50cl', label: '16.9 oz Standard Refresh', price: 7.5, quantityValue: 50, unit: 'cl' },
      { size: '1L', label: '33.8 oz Family Sharing Jug', price: 14.0, quantityValue: 1, unit: 'L' },
    ],
    imageUrl: productGingerStudio,
    galleryImages: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    ],
    inStock: true,
    featured: true,
    badge: 'Immunity Powerhouse',
    rating: 4.92,
    reviewCount: 98,
    isFlyerConfirmed: true,
    displayOrder: 2,
  },
  {
    id: 'prod-ginger-mango',
    name: 'Ginger Mango',
    slug: 'ginger-mango-crush',
    category: 'ginger',
    categoryLabel: 'Ginger Elixirs',
    tagline: 'Velvety tropical Alfonso mango nectar harmonized with zesty fresh ginger',
    description:
      'A vibrant tropical symphony where rich, sun-ripened mango puree meets the invigorating warmth of cold-pressed ginger. Velvety smooth with just the right amount of spicy kick, perfect for sunny afternoons, event celebrations, and everyday refreshment.',
    ingredients: [
      'Sun-Ripened Mango Puree',
      'Cold-Pressed Fresh Ginger',
      'Pure Pressed Apple & Orange Juice',
      'Lime Touch',
      'Delightful Juices Botanical Blend',
    ],
    tasteProfile: 'Rich, luscious tropical mango sweetness with a warming, zesty ginger finish',
    healthBenefits: [
      'High in Vitamin A & Beta-Carotene',
      'Promotes glowing skin',
      'Revitalizes tired energy',
      'Naturally sweet without refined syrups',
    ],
    sizes: [
      { size: '35cl', label: '11.8 oz Pocket Sip', price: 5.5, quantityValue: 35, unit: 'cl' },
      { size: '50cl', label: '16.9 oz Daily Refresh', price: 7.5, quantityValue: 50, unit: 'cl' },
      { size: '1L', label: '33.8 oz Family Sharing Jug', price: 14.0, quantityValue: 1, unit: 'L' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    featured: true,
    badge: 'Best Tropical Blend',
    rating: 4.97,
    reviewCount: 114,
    isFlyerConfirmed: true,
    displayOrder: 3,
  },
  {
    id: 'prod-ginger-pineapple',
    name: 'Ginger Pineapple',
    slug: 'ginger-pineapple-splash',
    category: 'ginger',
    categoryLabel: 'Ginger Elixirs',
    tagline: 'Golden tropical pineapple juice kissed by spicy handcrafted ginger',
    description:
      'Crisp, bright, and intensely refreshing. We extract the pure juice of ripe golden pineapples and harmonize it with our signature ginger press. Naturally loaded with bromelain and enzymes, this drink elevates your palate with every sip.',
    ingredients: [
      'Golden Pineapple Cold-Pressed Juice',
      'Fresh Ginger Root',
      'Mint Leaf Infusion',
      'Touch of Lime',
      'Delightful Juices Botanical Extract',
    ],
    tasteProfile: 'Vibrant sweet-tart pineapple punch followed by a clean, warming ginger sparkle',
    healthBenefits: [
      'Rich in Bromelain enzyme',
      'Aids post-meal digestion',
      'Hydrates deeply',
      'Natural mood enhancer',
    ],
    sizes: [
      { size: '35cl', label: '11.8 oz Pocket Sip', price: 5.5, quantityValue: 35, unit: 'cl' },
      { size: '50cl', label: '16.9 oz Daily Refresh', price: 7.5, quantityValue: 50, unit: 'cl' },
      { size: '1L', label: '33.8 oz Family Sharing Jug', price: 14.0, quantityValue: 1, unit: 'L' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    featured: true,
    badge: 'Top Refreshment',
    rating: 4.89,
    reviewCount: 87,
    isFlyerConfirmed: true,
    displayOrder: 4,
  },
  {
    id: 'prod-ginger-lychee',
    name: 'Ginger Lychee',
    slug: 'ginger-lychee-floral',
    category: 'ginger',
    categoryLabel: 'Ginger Elixirs',
    tagline: 'Delicate floral exotic lychee blended with gentle warming ginger',
    description:
      'An exotic culinary delight from Delightful Juices! Fragrant lychee fruit nectar paired gracefully with subtle, micro-pressed ginger. Sweet, floral, and deeply cooling with a light aromatic zest that pairs exceptionally well with festive dinners and catering spreads.',
    ingredients: [
      'Exotic Lychee Nectar',
      'Micro-Pressed Ginger Root',
      'Spring Water',
      'Botanical Blossom Essence',
      'Delightful Juices Botanical Infusion',
    ],
    tasteProfile: 'Silky, aromatic lychee florals with a gentle, rounded ginger warmth',
    healthBenefits: [
      'Packed with polyphenols',
      'Cellular hydration',
      'Calming, restorative sensation',
      'Low acid gentleness',
    ],
    sizes: [
      { size: '35cl', label: '11.8 oz Pocket Sip', price: 5.5, quantityValue: 35, unit: 'cl' },
      { size: '50cl', label: '16.9 oz Daily Refresh', price: 7.5, quantityValue: 50, unit: 'cl' },
      { size: '1L', label: '33.8 oz Family Sharing Jug', price: 14.0, quantityValue: 1, unit: 'L' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    featured: false,
    badge: 'Exotic Artisan Pick',
    rating: 4.88,
    reviewCount: 63,
    isFlyerConfirmed: false,
    displayOrder: 5,
  },
  {
    id: 'prod-tigernut-milk',
    name: 'Tigernut Milk (Kunu Aya)',
    slug: 'tigernut-milk-kunu-aya',
    category: 'other',
    categoryLabel: 'Artisanal Milks',
    tagline: 'Creamy, dairy-free traditional tigernut milk enriched with dates & organic coconut',
    description:
      'A creamy, velvety heritage plant milk crafted from nutrient-dense tubers known as Tigernuts (Cyperus esculentus), sweetened naturally with soft Medjool dates and infused with organic coconut and a whisper of ginger. 100% dairy-free, nut-free, and prebiotic-rich.',
    ingredients: [
      'Whole Soaked Tigernuts (Chufa Tubers)',
      'Medjool Date Puree',
      'Creamy Coconut Nectar',
      'Touch of Ginger Root',
      'Pure Filtered Spring Water',
    ],
    tasteProfile: 'Naturally sweet, rich, nutty (yet nut-free), and comforting with hints of caramel and date',
    healthBenefits: [
      'Rich in Resistant Starch Prebiotics',
      '100% Dairy-Free & Vegan',
      'Natural source of Magnesium & Iron',
      'Sustained steady energy',
    ],
    sizes: [
      { size: '35cl', label: '11.8 oz Morning Bottle', price: 6.0, quantityValue: 35, unit: 'cl' },
      { size: '50cl', label: '16.9 oz Standard Bottle', price: 8.0, quantityValue: 50, unit: 'cl' },
      { size: '1L', label: '33.8 oz Family Sharing Jug', price: 15.0, quantityValue: 1, unit: 'L' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    featured: true,
    badge: '100% Dairy-Free Superfood',
    rating: 4.96,
    reviewCount: 129,
    isFlyerConfirmed: true,
    displayOrder: 6,
  },
  {
    id: 'prod-celebration-bundle',
    name: 'Delightful 6-Pack Party Sampler',
    slug: 'delightful-party-sampler-6pack',
    category: 'bundles',
    categoryLabel: 'Party & Event Packs',
    tagline: 'Curated 6-bottle variety pack featuring our top client favorites for family or gatherings',
    description:
      'The ultimate Delightful Juices tasting collection! Includes 2x Signature Zobo, 1x Pure Organic Ginger, 1x Ginger Mango, 1x Ginger Pineapple, and 1x Tigernut Milk in 16.9 oz bottles. Packed cold in an insulated carrier, perfect for weekend brunch, gift giving, and small parties.',
    ingredients: [
      '6 × 16.9 oz assorted bottles (Zobo, Ginger blends, Tigernut Milk)',
      'Fresh cold-pressed whole ingredients',
      'Delightful Juices signature botanical touch',
    ],
    tasteProfile: 'Complete journey from tart floral hibiscus to fiery ginger and creamy tigernut sweetness',
    healthBenefits: [
      'Full spectrum of botanical vitamins',
      'Perfect crowd-pleaser for all ages',
      'Great savings vs individual bottles',
    ],
    sizes: [
      {
        size: 'Pack',
        label: '6 × 16.9 oz Fresh Bottles Variety Pack',
        price: 38.0,
        quantityValue: 6,
        unit: 'Pack',
        packBottleQuantity: 50,
        packBottleUnit: 'cl',
      },
    ],
    imageUrl: heroSlideTigernut,
    galleryImages: [
      'https://images.unsplash.com/photo-1622484216853-4dc9b8e8f804?w=800&auto=format&fit=crop&q=80',
    ],
    inStock: true,
    featured: true,
    badge: 'Popular Gift & Party Pack',
    rating: 4.98,
    reviewCount: 76,
    isFlyerConfirmed: true,
    displayOrder: 7,
  },
];

export const DEFAULT_ABOUT_SHOWCASE: AboutShowcaseSettings = {
  imageUrl: '',
  imageAlt: 'Fresh whole hibiscus, ginger root, and tropical botanicals for Delightful Juices',
  badgeText: 'Quakertown, PA Craft',
  showBadge: true,
  showCeoCard: true,
  ceoInitials: 'OA',
  ceoAvatarUrl: '',
  ceoRole: 'Founder & C.E.O.',
  ceoQuote:
    'We believe everyday refreshment should nourish your body, never drain it with artificial chemicals.',
  sectionKicker: 'THE DELIGHTFUL JUICES STORY',
  sectionHeading: 'Crafted from Passion, Heritage, and Real Whole Botanicals.',
  extraStoryParagraph1:
    'From our signature ruby-red Zobo (Hibiscus) and invigorating Organic Ginger Elixirs to our velvety, dairy-free Tigernut Milk (Kunu Aya), every bottle is prepared in small batches to deliver vibrant taste, freshness, and uncompromised quality.',
  extraStoryParagraph2:
    'Under the leadership of our C.E.O., Oluyemi B. Ajibolade, Delightful Juices never uses artificial preservatives, synthetic dyes, or high-fructose corn syrups—bottled fresh in 11.8 oz, 16.9 oz, and 33.8 oz sizes.',
};

export const INITIAL_SITE_CONTENT: SiteContent = {
  businessName: 'Delightful Juices',
  ceoName: 'Oluyemi B. Ajibolade',
  motto: 'Savor the Pure Goodness',
  tagline: 'Naturally Made. Healthy Sips.',
  phone: '(484) 792-8023',
  whatsappNumber: '14847928023',
  email: 'orders@delightfuljuices.com',
  address: '500 W Broad St',
  cityStateZip: 'Quakertown, PA 18951, USA',
  instagram: '@delightful_juicecreation',
  tiktok: '@delightfuljuice',
  websiteDomain: 'www.delightfuljuices.com',
  heroHeadline: 'Savor the Pure Goodness.',
  heroSubheadline:
    'Naturally made, cold-pressed healthy sips handcrafted in Quakertown, PA. From our signature hibiscus Zobo to organic ginger infusions and rich tigernut milk, every bottle from Delightful Juices is thoughtfully prepared for authentic flavor and vitality.',
  announcementTicker:
    '🌿 Fresh Batch Pressed Daily in Quakertown, PA • Free Local Delivery over $40 • Now Booking Weddings, Birthdays & Corporate Gatherings • Call/WhatsApp (484) 792-8023 🌿',
  aboutStory:
    'Delightful Juices was founded on a simple, passionate mission: to create truly nourishing, uncompromised drinks using nature’s most potent botanicals, fruits, herbs, and spices. Rooted in authentic West African heritage flavors like Zobo (Hibiscus) and Kunu Aya (Tigernut Milk), alongside revitalizing cold-pressed ginger roots, every recipe is hand-blended with care by CEO Oluyemi B. Ajibolade and our dedicated kitchen team.',
  signaturePromise:
    'Every bottle of Delightful Juices is handcrafted with care and whole botanical ingredients, giving you a pure, refreshing experience you can enjoy again and again.',
  freeDeliveryThreshold: 40.0,
  standardDeliveryFee: 4.99,
  pickupAddress: '500 W Broad St, Quakertown, PA 18951',
  operatingHours: 'Mon - Sat: 9:00 AM - 6:30 PM | Sun: 11:00 AM - 4:00 PM',
  chatButtonLabel: 'Chat with Kitchen',
  branding: {
    logoUrl: '',
    mobileLogoUrl: '',
    logoText: 'Delightful Juices',
    showLogoIcon: true,
    aboutShowcase: DEFAULT_ABOUT_SHOWCASE,
  },
  colors: {
    primaryColor: '#1B4D2E',
    secondaryColor: '#E1AD01',
    accentColor: '#E1AD01',
    pageBgColor: '#FFFFFF',
    cardBgColor: '#FFFFFF',
    headerBgColor: '#FFFFFF',
    footerBgColor: '#12351F',
    textColor: '#1B4D2E',
    buttonBgColor: '#1B4D2E',
    buttonTextColor: '#FFF8E7',
    borderColor: '#1B4D2E26',
  },
  typography: {
    headingFont: "'Playfair Display', Georgia, serif",
    bodyFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    baseFontSize: '16px',
    headingWeight: '700',
    bodyWeight: '400',
  },
  stripe: {
    enabled: true,
    mode: 'test',
    publishableKey: '',
    currency: 'USD',
    customerFacingName: 'Credit / Debit Card (Stripe)',
    description: 'Instant secure payment via Stripe with Visa, Mastercard, Amex, Apple Pay & Google Pay',
  },
};

export const INITIAL_NAV_ITEMS: NavItem[] = [
  { id: 'nav-home', label: 'Home', href: '/', visible: true, order: 1, parentId: null, isDropdown: false },
  { id: 'nav-shop', label: 'Shop Now', href: '/shop', visible: true, order: 2, parentId: null, isDropdown: false },
  { id: 'nav-about', label: 'About', href: '/about-us', visible: true, order: 3, parentId: null, isDropdown: true },
  {
    id: 'nav-about-company',
    label: 'About Delightful Juices',
    href: '/about-us',
    visible: true,
    order: 1,
    parentId: 'nav-about',
    isDropdown: false,
  },
  {
    id: 'nav-our-story',
    label: 'Our Story & Promise',
    href: '/our-story',
    visible: true,
    order: 2,
    parentId: 'nav-about',
    isDropdown: false,
  },
  {
    id: 'nav-delivery-info',
    label: 'Delivery & Freshness FAQ',
    href: '/delivery-information',
    visible: true,
    order: 3,
    parentId: 'nav-about',
    isDropdown: false,
  },
  {
    id: 'nav-services',
    label: 'Catering & Wholesale',
    href: '/events-catering',
    visible: true,
    order: 4,
    parentId: null,
    isDropdown: true,
  },
  {
    id: 'nav-events-link',
    label: 'Events & Catering',
    href: '/events-catering',
    visible: true,
    order: 1,
    parentId: 'nav-services',
    isDropdown: false,
  },
  {
    id: 'nav-wholesale-link',
    label: 'Wholesale & Retail',
    href: '/wholesale',
    visible: true,
    order: 2,
    parentId: 'nav-services',
    isDropdown: false,
  },
  { id: 'nav-contact', label: 'Contact Us', href: '/contact-us', visible: true, order: 5, parentId: null, isDropdown: false },
];

export const INITIAL_CMS_PAGES: CmsPage[] = [
  {
    id: 'page-about-us',
    title: 'About Delightful Juices',
    slug: 'about-us',
    seoTitle: 'About Us | Delightful Juices – Handcrafted Natural Drinks in Quakertown, PA',
    metaDescription:
      'Discover the story behind Delightful Juices, led by C.E.O. Oluyemi B. Ajibolade in Quakertown, PA. Handcrafted Nigerian Zobo, cold-pressed ginger elixirs, and Tigernut Milk.',
    status: 'published',
    showInNav: false,
    parentNavId: 'nav-about',
    sections: [
      {
        id: 'sec-about-hero',
        type: 'hero',
        kicker: 'OUR HERITAGE & KITCHEN CRAFT',
        heading: 'Crafted from Passion, Heritage & Whole Botanicals',
        subheading:
          'Hand-blended in Quakertown, Pennsylvania by C.E.O. Oluyemi B. Ajibolade—honoring West African botanical traditions and pure cold-pressed nutrition.',
        imageUrl: heroSlideZobo,
        buttonLabel: 'Shop Fresh Juices',
        buttonUrl: '/shop',
        secondaryButtonLabel: 'Contact Our Kitchen',
        secondaryButtonUrl: '/contact-us',
        theme: 'dark',
      },
      {
        id: 'sec-about-story',
        type: 'image_text',
        kicker: 'THE DELIGHTFUL JUICES STORY',
        heading: 'Nourishing Everyday Refreshment Without Compromise',
        body:
          'Delightful Juices creates refreshing and nourishing drinks made from carefully selected natural ingredients, whole fruits, roots, herbs, and spices.\n\nOur goal is simple: to make everyday refreshment more enjoyable while offering delicious, healthful beverages made with ingredients your family can trust. From our signature ruby-red Zobo (Hibiscus) and fiery Organic Ginger Elixirs to our velvety dairy-free Tigernut Milk (Kunu Aya), every bottle is prepared in small batches at 500 W Broad St, Quakertown, PA.\n\nUnder the leadership of Founder & C.E.O. Oluyemi B. Ajibolade, we never use artificial preservatives, synthetic dyes, or high-fructose corn syrups—just honest botanical vitality in convenient 11.8 oz, 16.9 oz, and 33.8 oz bottles.',
        imageUrl: aboutBotanicalsImg,
        imagePosition: 'left',
        buttonLabel: 'Explore the Shop',
        buttonUrl: '/shop',
        theme: 'cream',
      },
      {
        id: 'sec-about-featured',
        type: 'featured_products',
        kicker: 'CUSTOMER FAVORITES',
        heading: 'Taste Our Signature Small-Batch Creations',
        subheading: 'Available in 11.8 oz single sips, 16.9 oz daily bottles, and 33.8 oz family sharing jugs.',
        maxProducts: 3,
        theme: 'light',
      },
      {
        id: 'sec-about-cta',
        type: 'cta',
        kicker: 'CELEBRATE WITH DELIGHTFUL JUICES',
        heading: 'Planning a Wedding, Reunion, or Corporate Wellness Event?',
        body: 'We offer custom monogrammed bottle labels, chilled insulated delivery, and curated flavor bars across Bucks County, Lehigh Valley, and Montgomery County.',
        buttonLabel: 'Request Event Catering Quote',
        buttonUrl: '/events-catering',
        secondaryButtonLabel: 'Shop Now',
        secondaryButtonUrl: '/shop',
        theme: 'dark',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-our-story',
    title: 'Our Story & Signature Promise',
    slug: 'our-story',
    seoTitle: 'Our Story & Signature Promise | Delightful Juices',
    metaDescription:
      'Learn about the Delightful Juices four-pillar quality commitment: real whole hibiscus, cold-pressed ginger root, Medjool date sweetened tigernut milk, and zero artificial additives.',
    status: 'published',
    showInNav: false,
    parentNavId: 'nav-about',
    sections: [
      {
        id: 'sec-story-hero',
        type: 'hero',
        kicker: 'THE DELIGHTFUL JUICES PROMISE',
        heading: 'Pure Botanical Integrity in Every Single Bottle.',
        subheading:
          'Why hundreds of families and event hosts trust Delightful Juices for pure, preservative-free hydration.',
        imageUrl: heroSlideGinger,
        buttonLabel: 'Shop Cold-Pressed Juices',
        buttonUrl: '/shop',
        theme: 'dark',
      },
      {
        id: 'sec-story-split',
        type: 'image_text',
        kicker: 'SMALL-BATCH COLD PRESSING',
        heading: 'Whole Roots, Calyces & Tubers—Never Concentrates',
        body:
          'Unlike mass-produced shelf beverages that rely on pasteurized flavor syrups and synthetic coloring, Delightful Juices begins every morning with whole botanicals.\n\nWe steep whole organic hibiscus flowers with aromatic cloves and ripe pineapple peels for our Zobo, cold-press fresh ginger rhizomes to protect active gingerols, and stone-blend soaked tigernuts with soft Medjool dates for naturally prebiotic plant milk.',
        imageUrl: aboutBotanicalsImg,
        imagePosition: 'right',
        buttonLabel: 'Order Fresh Batch',
        buttonUrl: '/shop',
        theme: 'light',
      },
      {
        id: 'sec-story-gallery',
        type: 'image_gallery',
        kicker: 'INSIDE OUR CRAFT',
        heading: 'Vibrant Colors Drawn Straight from Nature',
        subheading: 'Ruby hibiscus, golden mango-ginger, and creamy chufa tigernut.',
        galleryImages: [
          { url: productZoboStudio, caption: 'Signature Ruby Zobo (Hibiscus & Cloves)' },
          { url: productGingerStudio, caption: 'Cold-Pressed Organic Ginger & Citrus' },
          { url: heroSlideTigernut, caption: 'Velvety Tigernut Milk & Event Spreads' },
        ],
        theme: 'cream',
      },
      {
        id: 'sec-story-promo',
        type: 'promo_banner',
        kicker: 'FRESHNESS DELIVERED',
        heading: 'Complimentary Cold-Insulated Local Delivery Over $40',
        body: 'Order online today in 11.8 oz, 16.9 oz, or 33.8 oz sizes for doorstep delivery or free Quakertown kitchen pickup.',
        buttonLabel: 'Shop Now',
        buttonUrl: '/shop',
        theme: 'gold',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-delivery-info',
    title: 'Delivery & Freshness FAQ',
    slug: 'delivery-information',
    seoTitle: 'Delivery Information & FAQ | Delightful Juices Quakertown, PA',
    metaDescription:
      'Delivery zones, free delivery over $40, Quakertown pickup hours, bottle ounce sizes (11.8 oz, 16.9 oz, 33.8 oz), and cold-storage shelf life for Delightful Juices.',
    status: 'published',
    showInNav: false,
    parentNavId: 'nav-about',
    sections: [
      {
        id: 'sec-deliv-hero',
        type: 'hero',
        kicker: 'COLD-CHAIN DOORSTEP DELIVERY & PICKUP',
        heading: 'Freshness Guidelines, Bottle Sizes & Local Delivery',
        subheading:
          'Everything you need to know about how Delightful Juices prepares, chills, and delivers your order.',
        imageUrl: heroSlideTigernut,
        buttonLabel: 'Start Your Order',
        buttonUrl: '/shop',
        theme: 'dark',
      },
      {
        id: 'sec-deliv-text',
        type: 'text_only',
        kicker: 'BOTTLE SIZES IN OUNCES (OZ)',
        heading: 'Three Convenient Sizes for Every Occasion',
        body:
          '• 11.8 oz Pocket Sip: Ideal for lunchboxes, immunity refreshers, wedding favors, and corporate wellness bars.\n• 16.9 oz Daily Refresh: Our most popular everyday bottle for workouts, commutes, and afternoon nourishment.\n• 33.8 oz Family Sharing Jug: Generous multi-glass bottle designed for family dining tables and weekend brunches.\n• 6 × 16.9 oz Party Sampler Pack: Six chilled bottles featuring our top customer favorites.',
        theme: 'cream',
      },
      {
        id: 'sec-deliv-faq',
        type: 'faq_list',
        heading: 'Frequently Asked Questions',
        theme: 'light',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-events-catering',
    title: 'Events & Catering',
    slug: 'events-catering',
    seoTitle: 'Events & Wedding Catering | Delightful Juices PA',
    metaDescription:
      'Book Delightful Juices for weddings, birthdays, corporate events, and family reunions. Interactive bottle estimator, custom monogrammed labels, and chilled delivery.',
    status: 'published',
    showInNav: false,
    parentNavId: 'nav-services',
    sections: [
      {
        id: 'sec-events-hero',
        type: 'hero',
        kicker: 'WEDDINGS • CORPORATE • CELEBRATIONS',
        heading: 'Bespoke Juice Catering & Custom Monogrammed Bottles',
        subheading:
          'Treat your guests to chilled Zobo, Ginger Mango, and Tigernut Milk in 11.8 oz, 16.9 oz, or 33.8 oz bottles tailored to your celebration.',
        imageUrl: heroSlideTigernut,
        buttonLabel: 'Shop Ready-Made Packs',
        buttonUrl: '/shop',
        theme: 'dark',
      },
      {
        id: 'sec-events-calc',
        type: 'catering_calculator',
        theme: 'cream',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-wholesale',
    title: 'Wholesale & Retail Partnerships',
    slug: 'wholesale',
    seoTitle: 'Wholesale & Retail Distribution | Delightful Juices',
    metaDescription:
      'Partner with Delightful Juices to stock cold-pressed Zobo, Ginger Elixirs, and Tigernut Milk in your restaurant, cafe, grocery market, or corporate office.',
    status: 'published',
    showInNav: false,
    parentNavId: 'nav-services',
    sections: [
      {
        id: 'sec-wholesale-hero',
        type: 'hero',
        kicker: 'COMMERCIAL & RETAIL DISTRIBUTION',
        heading: 'Stock Delightful Juices in Your Store, Café, or Office',
        subheading:
          'High-margin, fast-moving natural beverages delivered fresh weekly from our Quakertown commercial kitchen.',
        imageUrl: heroSlideGinger,
        buttonLabel: 'Contact Wholesale Team',
        buttonUrl: '/contact-us',
        secondaryButtonLabel: 'Browse Retail Flavors',
        secondaryButtonUrl: '/shop',
        theme: 'dark',
      },
      {
        id: 'sec-wholesale-tiers',
        type: 'wholesale_tiers',
        theme: 'light',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-contact-us',
    title: 'Contact Us',
    slug: 'contact-us',
    seoTitle: 'Contact Delightful Juices | 500 W Broad St, Quakertown, PA',
    metaDescription:
      'Get in touch with Delightful Juices at 500 W Broad St, Quakertown, PA 18951 or call/WhatsApp (484) 792-8023 for fresh juice orders, pickup, and catering.',
    status: 'published',
    showInNav: false,
    parentNavId: null,
    sections: [
      {
        id: 'sec-contact-info',
        type: 'contact_info',
        theme: 'cream',
      },
      {
        id: 'sec-contact-faq',
        type: 'faq_list',
        theme: 'light',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'DJ-84920',
    customerName: 'Marcus Sterling',
    customerEmail: 'marcus.s@example.com',
    customerPhone: '(215) 555-0192',
    deliveryMethod: 'local_delivery',
    deliveryAddress: '142 S 4th St, Quakertown, PA 18951',
    deliveryDate: 'Today',
    deliveryTimeSlot: '2:00 PM - 4:00 PM',
    notes: 'Please ring side doorbell, keep cold in cooler bag.',
    items: [
      {
        productId: 'prod-zobo',
        productName: 'Zobo (Hibiscus / Sorrel)',
        size: '50cl',
        sizeLabel: '16.9 oz Daily Refresh',
        unitPrice: 7.5,
        quantity: 2,
        totalPrice: 15.0,
        imageUrl: productZoboStudio,
      },
      {
        productId: 'prod-organic-ginger',
        productName: 'Pure Organic Ginger',
        size: '50cl',
        sizeLabel: '16.9 oz Standard Refresh',
        unitPrice: 7.5,
        quantity: 2,
        totalPrice: 15.0,
        imageUrl: productGingerStudio,
      },
      {
        productId: 'prod-tigernut-milk',
        productName: 'Tigernut Milk (Kunu Aya)',
        size: '1L',
        sizeLabel: '33.8 oz Family Sharing Jug',
        unitPrice: 15.0,
        quantity: 1,
        totalPrice: 15.0,
        imageUrl: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 45.0,
    deliveryFee: 0.0,
    total: 45.0,
    paymentMethod: 'zelle',
    status: 'preparing',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'ord-1002',
    orderNumber: 'DJ-84921',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@gmail.com',
    customerPhone: '(484) 555-8319',
    deliveryMethod: 'pickup',
    deliveryAddress: 'Pickup at 500 W Broad St, Quakertown',
    deliveryDate: 'Tomorrow Morning',
    deliveryTimeSlot: '10:00 AM',
    notes: 'Heading to an office brunch, will pick up on way.',
    items: [
      {
        productId: 'prod-celebration-bundle',
        productName: 'Delightful 6-Pack Party Sampler',
        size: 'Pack',
        sizeLabel: '6 × 16.9 oz Fresh Bottles Variety Pack',
        unitPrice: 38.0,
        quantity: 1,
        totalPrice: 38.0,
        imageUrl: heroSlideTigernut,
      },
      {
        productId: 'prod-ginger-pineapple',
        productName: 'Ginger Pineapple',
        size: '50cl',
        sizeLabel: '16.9 oz Daily Refresh',
        unitPrice: 7.5,
        quantity: 1,
        totalPrice: 7.5,
        imageUrl: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=800&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 45.5,
    deliveryFee: 0.0,
    total: 45.5,
    paymentMethod: 'whatsapp_order',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

export const INITIAL_INQUIRIES: EventInquiry[] = [
  {
    id: 'inq-201',
    fullName: 'Aisha & Tunde Adeleke',
    email: 'tunde.adeleke@luxuryweddings.com',
    phone: '(267) 555-9241',
    eventType: 'Wedding Reception',
    eventDate: '2026-11-20',
    guestCount: 175,
    eventLocation: 'The Grand View Estate, Bucks County, PA',
    bottleSizesNeeded: ['35cl', '50cl'],
    selectedFlavors: ['Zobo (Hibiscus / Sorrel)', 'Ginger Mango', 'Tigernut Milk (Kunu Aya)'],
    customLabelingNeeded: true,
    budgetRange: '$1,200 - $1,800',
    message:
      'We want custom branded Delightful Juices bottles featuring our wedding monogram for our welcome cocktail hour and dessert table. Please provide a quote for 250 bottles total with delivery and ice chiller bins.',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'inq-202',
    fullName: 'David Miller',
    email: 'dmiller@lehighhealthcorp.org',
    phone: '(484) 555-3312',
    eventType: 'Corporate Wellness Day',
    eventDate: '2026-11-05',
    guestCount: 80,
    eventLocation: 'Bethlehem Corporate Center, PA',
    bottleSizesNeeded: ['35cl'],
    selectedFlavors: ['Pure Organic Ginger', 'Ginger Pineapple', 'Zobo (Hibiscus / Sorrel)'],
    customLabelingNeeded: false,
    budgetRange: '$500 - $800',
    message:
      'Looking for a natural, healthy beverage bar for our company health & wellness symposium. Need individual 11.8 oz bottles.',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

/**
 * Ensures any product loaded from localStorage or Supabase has structured
 * quantityValue & unit (without altering prices, IDs, or stock) and cleans legacy DelightOil text.
 */
function normalizeProduct(p: Product): Product {
  const normalizedSizes: SizeOption[] = (p.sizes || []).map((s) => {
    if (s.quantityValue !== undefined && s.unit) {
      return {
        ...s,
        label: sanitizeBrandText(s.label || ''),
      };
    }
    const parsed = parseSizeString(String(s.size || ''), s.label);
    return {
      ...s,
      label: sanitizeBrandText(s.label || ''),
      quantityValue: parsed.quantityValue,
      unit: parsed.unit,
      packBottleQuantity: s.packBottleQuantity ?? parsed.packBottleQuantity,
      packBottleUnit: s.packBottleUnit ?? parsed.packBottleUnit,
    };
  });

  // Replace broken Unsplash URL on 6-pack if present
  const brokenUnsplashBundle = 'photo-1622484216853-4dc9b8e8f804';
  const safeImageUrl =
    !p.imageUrl || p.imageUrl.includes(brokenUnsplashBundle)
      ? heroSlideTigernut
      : p.imageUrl;

  return {
    ...p,
    name: sanitizeBrandText(p.name),
    tagline: sanitizeBrandText(p.tagline),
    description: sanitizeBrandText(p.description),
    ingredients: (p.ingredients || []).map((ing) => sanitizeBrandText(ing)),
    sizes: normalizedSizes,
    imageUrl: safeImageUrl,
  };
}

/**
 * Ensures SiteContent replaces legacy DelightOil references and upgrades default Delightful Juice -> Delightful Juices.
 */
function normalizeSiteContent(raw: SiteContent): SiteContent {
  const cleanName =
    !raw.businessName || raw.businessName === 'Delightful Juice' || /Delight\s*Oil/i.test(raw.businessName)
      ? 'Delightful Juices'
      : raw.businessName;

  const rawLogoText = raw.branding?.logoText;
  const cleanLogoText =
    !rawLogoText || rawLogoText === 'Delightful Juice' || /Delight\s*Oil/i.test(rawLogoText)
      ? 'Delightful Juices'
      : rawLogoText;

  return {
    ...raw,
    businessName: cleanName,
    heroHeadline: sanitizeBrandText(raw.heroHeadline),
    heroSubheadline: sanitizeBrandText(raw.heroSubheadline).replace(/\bDelightful Juice\b(?!s)/g, 'Delightful Juices'),
    announcementTicker: sanitizeBrandText(raw.announcementTicker),
    aboutStory: sanitizeBrandText(raw.aboutStory).replace(/\bDelightful Juice\b(?!s)/g, 'Delightful Juices'),
    signaturePromise: sanitizeBrandText(raw.signaturePromise).replace(/\bDelightful Juice\b(?!s)/g, 'Delightful Juices'),
    branding: {
      ...INITIAL_SITE_CONTENT.branding!,
      ...(raw.branding || {}),
      logoText: cleanLogoText,
      aboutShowcase: {
        ...DEFAULT_ABOUT_SHOWCASE,
        ...(raw.branding?.aboutShowcase || {}),
      },
    },
  };
}

/**
 * Checks if navigation list is purely legacy single-page hash anchors (#menu, #about, etc.)
 * If so, upgrades to multi-page routes while preserving any custom non-hash links.
 */
function normalizeNavItems(items: NavItem[]): NavItem[] {
  if (!Array.isArray(items) || items.length === 0) return INITIAL_NAV_ITEMS;
  const allLegacyHashes = items.every((item) => item.href.startsWith('#'));
  if (allLegacyHashes) {
    return INITIAL_NAV_ITEMS;
  }
  return items
    .map((item) => ({
      ...item,
      parentId: item.parentId ?? null,
      isDropdown: Boolean(item.isDropdown),
    }))
    .sort((a, b) => a.order - b.order);
}

class DataRepository {
  private listeners: Set<() => void> = new Set();

  constructor() {
    applyTheme(this.getContent());
    this.syncFromSupabase();
  }

  public async syncFromSupabase() {
    if (!supabaseService.isConfigured()) return;
    try {
      // 1. Fetch remote products
      const remoteProducts = await supabaseService.fetchProducts();
      if (remoteProducts && remoteProducts.length > 0) {
        const cleaned = remoteProducts.map(normalizeProduct);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cleaned));
      }

      // 2. Fetch remote site content
      const remoteContent = await supabaseService.fetchSiteContent();
      if (remoteContent) {
        const cleanedContent = normalizeSiteContent({
          ...INITIAL_SITE_CONTENT,
          ...remoteContent,
          branding: { ...INITIAL_SITE_CONTENT.branding!, ...(remoteContent.branding || {}) },
          colors: { ...INITIAL_SITE_CONTENT.colors!, ...(remoteContent.colors || {}) },
          typography: { ...INITIAL_SITE_CONTENT.typography!, ...(remoteContent.typography || {}) },
          stripe: { ...INITIAL_SITE_CONTENT.stripe!, ...(remoteContent.stripe || {}) },
        });
        localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(cleanedContent));
        applyTheme(cleanedContent);
      }

      // 3. Fetch remote navigation
      const remoteNav = await supabaseService.fetchNavigation();
      if (remoteNav && remoteNav.length > 0) {
        const normalizedNav = normalizeNavItems(remoteNav);
        localStorage.setItem(STORAGE_KEYS.NAV, JSON.stringify(normalizedNav));
      }

      // 4. Fetch remote hero slides
      const remoteSlides = await supabaseService.fetchHeroSlides();
      if (remoteSlides && remoteSlides.length > 0) {
        localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(remoteSlides));
      }

      // 5. Fetch remote CMS pages
      const remotePages = await supabaseService.fetchCmsPages();
      if (remotePages && remotePages.length > 0) {
        // Merge seeded pages that don't exist remotely yet with remote pages
        const remoteSlugs = new Set(remotePages.map((p) => p.slug));
        const merged = [
          ...remotePages,
          ...INITIAL_CMS_PAGES.filter((seedPage) => !remoteSlugs.has(seedPage.slug)),
        ];
        localStorage.setItem(STORAGE_KEYS.CMS_PAGES, JSON.stringify(merged));
      }

      // 6. Fetch remote orders & inquiries if available
      const remoteOrders = await supabaseService.fetchOrders();
      if (remoteOrders && remoteOrders.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(remoteOrders));
      }

      const remoteInquiries = await supabaseService.fetchInquiries();
      if (remoteInquiries && remoteInquiries.length > 0) {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(remoteInquiries));
      }

      this.notify();
    } catch (err) {
      console.warn('Initial Supabase sync notice:', err);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    });
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeProduct);
        }
      }
    } catch (e) {
      console.warn('Error reading products from storage:', e);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }

  public saveProducts(products: Product[]): void {
    const cleaned = products.map(normalizeProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cleaned));
    this.notify();
    cleaned.forEach((p) => supabaseService.upsertProduct(p));
  }

  public updateProduct(product: Product): void {
    const cleanedProduct = normalizeProduct(product);
    const list = this.getProducts();
    const idx = list.findIndex((p) => p.id === cleanedProduct.id);
    if (idx >= 0) {
      list[idx] = cleanedProduct;
    } else {
      list.push(cleanedProduct);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
    this.notify();
    supabaseService.upsertProduct(cleanedProduct);
  }

  public deleteProduct(id: string): void {
    const list = this.getProducts().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
    this.notify();
    supabaseService.deleteProduct(id);
  }

  // --- SITE CONTENT ---
  public getContent(): SiteContent {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONTENT);
      if (stored) {
        const parsed = JSON.parse(stored);
        return normalizeSiteContent({
          ...INITIAL_SITE_CONTENT,
          ...parsed,
          branding: { ...INITIAL_SITE_CONTENT.branding, ...(parsed.branding || {}) },
          colors: { ...INITIAL_SITE_CONTENT.colors, ...(parsed.colors || {}) },
          typography: { ...INITIAL_SITE_CONTENT.typography, ...(parsed.typography || {}) },
          stripe: { ...INITIAL_SITE_CONTENT.stripe, ...(parsed.stripe || {}) },
        });
      }
    } catch (e) {
      console.warn('Error reading content from storage:', e);
    }
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(INITIAL_SITE_CONTENT));
    return INITIAL_SITE_CONTENT;
  }

  public saveContent(content: SiteContent): void {
    const cleaned = normalizeSiteContent(content);
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(cleaned));
    applyTheme(cleaned);
    this.notify();
    supabaseService.upsertSiteContent(cleaned);
  }

  // --- HERO SLIDES ---
  public getHeroSlides(): HeroSlide[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HERO_SLIDES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .map((s: HeroSlide) => ({
              ...s,
              heading: sanitizeBrandText(s.heading),
              subheading: sanitizeBrandText(s.subheading),
            }))
            .sort((a: HeroSlide, b: HeroSlide) => a.displayOrder - b.displayOrder);
        }
      }
    } catch (e) {
      console.warn('Error reading hero slides from storage:', e);
    }
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(INITIAL_HERO_SLIDES));
    return INITIAL_HERO_SLIDES;
  }

  public saveHeroSlides(slides: HeroSlide[]): void {
    const ordered = slides.map((s, idx) => ({
      ...s,
      displayOrder: idx + 1,
    }));
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(ordered));
    this.notify();
    supabaseService.saveAllHeroSlides(ordered);
  }

  public upsertHeroSlide(slide: HeroSlide): void {
    const list = this.getHeroSlides();
    const idx = list.findIndex((s) => s.id === slide.id);
    if (idx >= 0) {
      list[idx] = slide;
    } else {
      list.push(slide);
    }
    const ordered = list
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((s, i) => ({ ...s, displayOrder: i + 1 }));
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(ordered));
    this.notify();
    supabaseService.upsertHeroSlide(slide);
  }

  public deleteHeroSlide(id: string): void {
    const filtered = this.getHeroSlides()
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, displayOrder: i + 1 }));
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(filtered));
    this.notify();
    supabaseService.deleteHeroSlide(id);
  }

  // --- DYNAMIC CMS PAGES ---
  public getCmsPages(): CmsPage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CMS_PAGES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading CMS pages from storage:', e);
    }
    localStorage.setItem(STORAGE_KEYS.CMS_PAGES, JSON.stringify(INITIAL_CMS_PAGES));
    return INITIAL_CMS_PAGES;
  }

  public getPages(): CmsPage[] {
    return this.getCmsPages();
  }

  public getPageBySlug(slug: string, includeDrafts = false): CmsPage | null {
    const normalizedSlug = slug.replace(/^\/+|\/+$/g, '').toLowerCase();
    const pages = this.getCmsPages();
    const match = pages.find(
      (p) => p.slug.replace(/^\/+|\/+$/g, '').toLowerCase() === normalizedSlug
    );
    if (!match) return null;
    if (!includeDrafts && match.status !== 'published') return null;
    return match;
  }

  public saveCmsPage(page: CmsPage): void {
    const cleanSlug = page.slug
      .trim()
      .toLowerCase()
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');

    const updatedPage: CmsPage = {
      ...page,
      slug: cleanSlug,
      updatedAt: new Date().toISOString(),
    };

    const pages = this.getCmsPages();
    const idx = pages.findIndex((p) => p.id === updatedPage.id);
    if (idx >= 0) {
      pages[idx] = updatedPage;
    } else {
      pages.push(updatedPage);
    }
    localStorage.setItem(STORAGE_KEYS.CMS_PAGES, JSON.stringify(pages));
    supabaseService.upsertCmsPage(updatedPage);

    // Sync navigation link automatically if showInNav is configured
    const navId = `nav-cms-${updatedPage.id}`;
    const currentNav = this.getNavItems();
    const existingNavIdx = currentNav.findIndex((n) => n.id === navId);

    if (updatedPage.showInNav && updatedPage.status === 'published') {
      const navEntry: NavItem = {
        id: navId,
        label: updatedPage.title,
        href: `/${cleanSlug}`,
        visible: true,
        order:
          existingNavIdx >= 0
            ? currentNav[existingNavIdx].order
            : currentNav.filter((n) => (n.parentId || null) === (updatedPage.parentNavId || null)).length + 1,
        parentId: updatedPage.parentNavId || null,
        isDropdown: false,
      };
      const nextNav =
        existingNavIdx >= 0
          ? currentNav.map((n, i) => (i === existingNavIdx ? navEntry : n))
          : [...currentNav, navEntry];
      this.saveNavItems(nextNav);
    } else if (existingNavIdx >= 0) {
      const nextNav = currentNav.filter((n) => n.id !== navId);
      localStorage.setItem(STORAGE_KEYS.NAV, JSON.stringify(nextNav));
      supabaseService.deleteNavigationItem(navId);
    }

    this.notify();
  }

  public deleteCmsPage(id: string): void {
    const filtered = this.getCmsPages().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.CMS_PAGES, JSON.stringify(filtered));
    supabaseService.deleteCmsPage(id);

    const navId = `nav-cms-${id}`;
    const currentNav = this.getNavItems();
    if (currentNav.some((n) => n.id === navId)) {
      const nextNav = currentNav.filter((n) => n.id !== navId);
      localStorage.setItem(STORAGE_KEYS.NAV, JSON.stringify(nextNav));
      supabaseService.deleteNavigationItem(navId);
    }

    this.notify();
  }

  // --- NAVIGATION ---
  public getNavItems(): NavItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NAV);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeNavItems(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading nav from storage:', e);
    }
    localStorage.setItem(STORAGE_KEYS.NAV, JSON.stringify(INITIAL_NAV_ITEMS));
    return INITIAL_NAV_ITEMS;
  }

  public saveNavItems(items: NavItem[]): void {
    localStorage.setItem(STORAGE_KEYS.NAV, JSON.stringify(items));
    this.notify();
    supabaseService.saveNavigation(items);
  }

  public deleteNavItem(id: string): void {
    const next = this.getNavItems().filter((n) => n.id !== id && n.parentId !== id);
    localStorage.setItem(STORAGE_KEYS.NAV, JSON.stringify(next));
    this.notify();
    supabaseService.deleteNavigationItem(id);
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading orders from storage:', e);
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }

  public addOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...order,
      id: 'ord-' + Date.now(),
      orderNumber: 'DJ-' + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
    supabaseService.insertOrder(newOrder);
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order['status']): void {
    const orders = this.getOrders();
    const target = orders.find((o) => o.id === id);
    if (target) {
      target.status = status;
      target.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      this.notify();
      supabaseService.updateOrderStatus(id, status);
    }
  }

  public deleteOrder(id: string): void {
    const orders = this.getOrders().filter((o) => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
  }

  // --- INQUIRIES ---
  public getInquiries(): EventInquiry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading inquiries from storage:', e);
    }
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(INITIAL_INQUIRIES));
    return INITIAL_INQUIRIES;
  }

  public addInquiry(inquiry: Omit<EventInquiry, 'id' | 'createdAt' | 'status'>): EventInquiry {
    const inquiries = this.getInquiries();
    const newInquiry: EventInquiry = {
      ...inquiry,
      id: 'inq-' + Date.now(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    inquiries.unshift(newInquiry);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    this.notify();
    supabaseService.insertInquiry(newInquiry);
    return newInquiry;
  }

  public updateInquiryStatus(id: string, status: EventInquiry['status']): void {
    const list = this.getInquiries();
    const target = list.find((i) => i.id === id);
    if (target) {
      target.status = status;
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(list));
      this.notify();
      supabaseService.updateInquiryStatus(id, status);
    }
  }

  // --- SUPABASE CONFIG ---
  public getSupabaseConfig(): SupabaseConfig {
    return supabaseService.getConfig();
  }

  public saveSupabaseConfig(cfg: SupabaseConfig): void {
    supabaseService.saveConfig(cfg);
    this.syncFromSupabase();
    this.notify();
  }

  public async testSupabaseConnection(
    url: string,
    key: string
  ): Promise<{ success: boolean; message: string; tablesFound: string[] }> {
    const res = await supabaseService.testConnection(url, key);
    if (res.success) {
      await this.syncFromSupabase();
    }
    return res;
  }

  // --- ADMIN AUTH ---
  public isAdminLoggedIn(): boolean {
    const hasSupabaseUser = !!supabaseService.getCurrentUser();
    const hasLocalAuth = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'authenticated';
    return hasSupabaseUser || hasLocalAuth;
  }

  public adminLogin(pinOrPass: string): boolean {
    const trimmed = pinOrPass.trim();
    if (trimmed === 'delightful2026' || trimmed === 'admin123' || trimmed === 'puregoodness') {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'authenticated');
      this.notify();
      return true;
    }
    return false;
  }

  public async adminLoginWithSupabase(
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> {
    const res = await supabaseService.signInWithEmail(email, pass);
    if (res.success) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'authenticated');
      await this.syncFromSupabase();
      this.notify();
      return { success: true };
    }
    return { success: false, error: res.error };
  }

  public async adminLogout(): Promise<void> {
    await supabaseService.signOut();
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    this.notify();
  }

  public resetToDefaultSeed(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(INITIAL_SITE_CONTENT));
    localStorage.setItem(STORAGE_KEYS.NAV, JSON.stringify(INITIAL_NAV_ITEMS));
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(INITIAL_HERO_SLIDES));
    localStorage.setItem(STORAGE_KEYS.CMS_PAGES, JSON.stringify(INITIAL_CMS_PAGES));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(INITIAL_INQUIRIES));
    this.notify();
  }
}

export const dataRepo = new DataRepository();

export const SUPABASE_SQL_MIGRATION = `-- ==============================================================================
-- DELIGHTFUL JUICES: IDEMPOTENT SUPABASE DATABASE & CMS EXPANSION MIGRATION
-- Brand: Delightful Juices ("Savor the Pure Goodness | Naturally Made. Healthy Sips.")
-- Safe to run multiple times — preserves all existing products, orders & inquiries!
-- ==============================================================================

-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT,
  tagline TEXT,
  description TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  taste_profile TEXT,
  health_benefits JSONB DEFAULT '[]'::jsonb,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  badge TEXT,
  rating NUMERIC(3,2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  is_flyer_confirmed BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_flyer_confirmed BOOLEAN DEFAULT true;

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_method TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_date TEXT,
  delivery_time_slot TEXT,
  notes TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Event & Catering Inquiries Table
CREATE TABLE IF NOT EXISTS public.event_inquiries (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT,
  guest_count INTEGER DEFAULT 0,
  event_location TEXT,
  bottle_sizes_needed JSONB DEFAULT '[]'::jsonb,
  selected_flavors JSONB DEFAULT '[]'::jsonb,
  custom_labeling_needed BOOLEAN DEFAULT false,
  budget_range TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Site Content CMS Table
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
  chat_button_label TEXT DEFAULT 'Chat with Kitchen',
  branding JSONB DEFAULT '{"logoText":"Delightful Juices","showLogoIcon":true}'::jsonb,
  colors JSONB DEFAULT '{"pageBgColor":"#FFFFFF","primaryColor":"#1B4D2E","secondaryColor":"#E1AD01","accentColor":"#E1AD01","footerBgColor":"#12351F","cardBgColor":"#FFFFFF","buttonBgColor":"#1B4D2E","buttonTextColor":"#FFF8E7"}'::jsonb,
  typography JSONB DEFAULT '{"headingFont":"Playfair Display, Georgia, serif","bodyFont":"Plus Jakarta Sans, sans-serif"}'::jsonb,
  stripe JSONB DEFAULT '{"enabled":true,"mode":"test","currency":"USD","customerFacingName":"Credit / Debit Card (Stripe)"}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Navigation Items Table (with Dropdown & Nested Links Support)
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 1,
  parent_id TEXT DEFAULT NULL,
  is_dropdown BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.navigation_items ADD COLUMN IF NOT EXISTS parent_id TEXT DEFAULT NULL;
ALTER TABLE public.navigation_items ADD COLUMN IF NOT EXISTS is_dropdown BOOLEAN NOT NULL DEFAULT false;

-- 6. Hero Slider Table
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id TEXT PRIMARY KEY,
  heading TEXT NOT NULL,
  subheading TEXT NOT NULL DEFAULT '',
  kicker TEXT DEFAULT '',
  cta_label TEXT NOT NULL DEFAULT 'Shop Now',
  cta_url TEXT NOT NULL DEFAULT '/shop',
  secondary_cta_label TEXT DEFAULT '',
  secondary_cta_url TEXT DEFAULT '',
  desktop_image_url TEXT NOT NULL,
  mobile_image_url TEXT DEFAULT '',
  overlay_opacity NUMERIC(3,2) NOT NULL DEFAULT 0.50,
  display_order INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Dynamic CMS Pages Table
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  seo_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  show_in_nav BOOLEAN NOT NULL DEFAULT false,
  parent_nav_id TEXT DEFAULT NULL,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Row Level Security (RLS) — Idempotent DROP POLICY IF EXISTS before CREATE POLICY
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full products access" ON public.products;
DROP POLICY IF EXISTS "Admin write products" ON public.products;
CREATE POLICY "Admin full products access" ON public.products FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public create orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full orders access" ON public.orders;
DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin full orders access" ON public.orders FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public insert inquiries" ON public.event_inquiries;
DROP POLICY IF EXISTS "Public submit inquiries" ON public.event_inquiries;
CREATE POLICY "Public insert inquiries" ON public.event_inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full inquiries access" ON public.event_inquiries;
DROP POLICY IF EXISTS "Admin manage inquiries" ON public.event_inquiries;
CREATE POLICY "Admin full inquiries access" ON public.event_inquiries FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read content" ON public.site_content;
DROP POLICY IF EXISTS "Public read site content" ON public.site_content;
CREATE POLICY "Public read content" ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full content access" ON public.site_content;
DROP POLICY IF EXISTS "Admin manage site content" ON public.site_content;
CREATE POLICY "Admin full content access" ON public.site_content FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read navigation" ON public.navigation_items;
CREATE POLICY "Public read navigation" ON public.navigation_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage navigation" ON public.navigation_items;
CREATE POLICY "Admin manage navigation" ON public.navigation_items FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read active hero slides" ON public.hero_slides;
CREATE POLICY "Public read active hero slides" ON public.hero_slides FOR SELECT USING (active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage hero slides" ON public.hero_slides;
CREATE POLICY "Admin manage hero slides" ON public.hero_slides FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read published cms pages" ON public.cms_pages;
CREATE POLICY "Public read published cms pages" ON public.cms_pages FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage cms pages" ON public.cms_pages;
CREATE POLICY "Admin manage cms pages" ON public.cms_pages FOR ALL USING (auth.role() = 'authenticated');

-- 9. Storage Bucket for Hero Sliders, Page Media, Logos & Product Photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('delightful_assets', 'delightful_assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Assets" ON storage.objects;
CREATE POLICY "Public Read Assets" ON storage.objects FOR SELECT USING (bucket_id = 'delightful_assets');

DROP POLICY IF EXISTS "Authenticated Upload Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow Assets Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'delightful_assets');

DROP POLICY IF EXISTS "Allow Assets Update" ON storage.objects;
CREATE POLICY "Allow Assets Update" ON storage.objects FOR UPDATE USING (bucket_id = 'delightful_assets');

DROP POLICY IF EXISTS "Allow Assets Delete" ON storage.objects;
CREATE POLICY "Allow Assets Delete" ON storage.objects FOR DELETE USING (bucket_id = 'delightful_assets' AND auth.role() = 'authenticated');

-- 10. Safe Brand Update (DelightOil -> Delightful Juices)
UPDATE public.site_content
SET
  business_name = 'Delightful Juices',
  hero_subheadline = REPLACE(hero_subheadline, 'DelightOil', 'Delightful Juices botanical blend'),
  signature_promise = REPLACE(signature_promise, 'with our signature DelightOil in every bottle', 'handcrafted by Delightful Juices with pure botanicals'),
  updated_at = NOW()
WHERE key = 'main';
`;
