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
  EventShowcaseItem,
  PackPricingSettings,
  PackPricingTier,
  BrandSettings,
  ProductSliderSettings,
} from '../types';
import { supabaseService } from './supabaseClient';
import { applyTheme } from './theme';
import { parseSizeString, sanitizeBrandText } from './units';

/**
 * Strips any legacy bundled local asset path or stock Unsplash placeholder URL
 * so only genuine live Supabase images (Storage URLs, data URLs, or custom live URLs) render.
 */
export function sanitizeLiveImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('/src/assets/') ||
    trimmed.startsWith('src/assets/') ||
    trimmed.startsWith('/assets/hero_') ||
    trimmed.startsWith('/assets/product_') ||
    trimmed.startsWith('/assets/about_') ||
    trimmed.includes('assets/images/') ||
    trimmed.includes('images.unsplash.com')
  ) {
    return '';
  }
  return trimmed;
}

const LEGACY_LOCAL_CACHE_KEYS = [
  'delightful_juice_products_v1',
  'delightful_juice_orders_v1',
  'delightful_juice_inquiries_v1',
  'delightful_juice_content_v1',
  'delightful_juice_nav_v2',
  'delightful_juice_nav_v1',
  'delightful_juice_hero_slides_v1',
  'delightful_juice_cms_pages_v1',
  'delightful_juice_supabase_cfg_v1',
  'delightful_juice_admin_session_v1',
];

function purgeLegacyLocalState(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of LEGACY_LOCAL_CACHE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access restrictions
  }
}

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    heading: 'US-Approved Wholesale Distribution for Stores & Restaurants.',
    subheading:
      'Delightful Juices products are US-approved and manufactured to strict food safety standards for commercial wholesale distribution to retail grocery stores, cafés, restaurants, and hospitality partners.',
    kicker: 'US-APPROVED • MANUFACTURED FOR WHOLESALE DISTRIBUTION',
    ctaLabel: 'Wholesale Inquiries',
    ctaUrl: '/wholesale',
    secondaryCtaLabel: 'View Products',
    secondaryCtaUrl: '/shop',
    desktopImageUrl: '',
    mobileImageUrl: '',
    overlayOpacity: 0.52,
    displayOrder: 1,
    active: true,
  },
  {
    id: 'slide-2',
    heading: 'Fiery Organic Ginger, Ruby Zobo & Tropical Botanical Elixirs.',
    subheading:
      'Handcrafted daily in Quakertown, PA using whole hibiscus flowers, fresh organic ginger root, creamy tigernut, and ripe tropical fruits with affordable delivery directly to your door.',
    kicker: '100% REAL WHOLE BOTANICALS • AFFORDABLE DELIVERY',
    ctaLabel: 'Shop Flavors',
    ctaUrl: '/shop',
    secondaryCtaLabel: 'About Us',
    secondaryCtaUrl: '/about-us',
    desktopImageUrl: '',
    mobileImageUrl: '',
    overlayOpacity: 0.50,
    displayOrder: 2,
    active: true,
  },
  {
    id: 'slide-3',
    heading: 'Bulk Orders for Weddings, Gatherings & Corporate Events.',
    subheading:
      'Elevate your next celebration with custom monogrammed bottles of Zobo, Ginger elixirs, and dairy-free Tigernut Milk delivered chilled in high volume across Pennsylvania.',
    kicker: 'BULK ORDERS & EVENT CATERING',
    ctaLabel: 'Bulk Order Now',
    ctaUrl: '/events-catering',
    secondaryCtaLabel: 'Shop Variety Packs',
    secondaryCtaUrl: '/shop',
    desktopImageUrl: '',
    mobileImageUrl: '',
    overlayOpacity: 0.54,
    displayOrder: 3,
    active: true,
  },
];

function normalizeHeroSlide(slide: HeroSlide): HeroSlide {
  const desktopUrl = sanitizeLiveImageUrl(slide.desktopImageUrl);
  const rawMobileUrl = sanitizeLiveImageUrl(slide.mobileImageUrl);
  const cleanedMobileUrl = rawMobileUrl === desktopUrl ? '' : rawMobileUrl;

  let heading = sanitizeBrandText(slide.heading || '');
  let subheading = sanitizeBrandText(slide.subheading || '');
  let kicker = sanitizeBrandText(slide.kicker || '');
  let ctaLabel = slide.ctaLabel;
  let ctaUrl = slide.ctaUrl;
  let secondaryCtaLabel = slide.secondaryCtaLabel;
  let secondaryCtaUrl = slide.secondaryCtaUrl;

  // Slide 1: Focus on wholesale orders, US-approved & manufactured for stores and restaurants
  if (slide.id === 'slide-1' || slide.displayOrder === 1) {
    if (!subheading || heading.includes('Savor the Pure Goodness')) {
      heading = 'US-Approved Wholesale Distribution for Stores & Restaurants.';
      subheading =
        'Delightful Juices products are US-approved and manufactured to strict food safety standards for commercial wholesale distribution to retail grocery stores, cafés, restaurants, and hospitality partners.';
      kicker = 'US-APPROVED • MANUFACTURED FOR WHOLESALE DISTRIBUTION';
      ctaLabel = 'Wholesale Inquiries';
      ctaUrl = '/wholesale';
      secondaryCtaLabel = 'View Products';
      secondaryCtaUrl = '/shop';
    }
  }

  // Slide 2: Promote shopping with "Shop Flavors" CTA
  if (slide.id === 'slide-2' || slide.displayOrder === 2) {
    if (!ctaLabel || ctaLabel === 'Shop Fresh Flavors' || ctaLabel === 'Shop Now') {
      ctaLabel = 'Shop Flavors';
      ctaUrl = '/shop';
    }
    if (!subheading) {
      subheading =
        'Handcrafted daily in Quakertown, PA using whole hibiscus flowers, fresh organic ginger root, creamy tigernut, and ripe tropical fruits with affordable delivery directly to your door.';
    }
  }

  // Slide 3: Promote bulk orders
  if (slide.id === 'slide-3' || slide.displayOrder === 3) {
    if (!subheading || heading.includes('Elevate Weddings, Celebrations & Corporate Gatherings')) {
      heading = 'Bulk Orders for Weddings, Gatherings & Corporate Events.';
      subheading =
        'Elevate your next celebration with custom monogrammed bottles of Zobo, Ginger elixirs, and dairy-free Tigernut Milk delivered chilled in high volume across Pennsylvania.';
      kicker = 'BULK ORDERS & EVENT CATERING';
      ctaLabel = 'Bulk Order Now';
      ctaUrl = '/events-catering';
      secondaryCtaLabel = 'Shop Variety Packs';
      secondaryCtaUrl = '/shop';
    }
  }

  return {
    ...slide,
    heading,
    subheading,
    kicker,
    ctaLabel,
    ctaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
    desktopImageUrl: desktopUrl,
    mobileImageUrl: cleanedMobileUrl,
  };
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-zobo',
    name: 'Home Made Hibiscus Juice - Sorrel (Zobo)',
    slug: 'zobo-hibiscus-sorrel',
    category: 'zobo',
    categoryLabel: 'Signature Zobo',
    tagline: 'Authentic Nigerian Hibiscus infused with organic cloves, pineapple & sweet dates',
    description:
      'Our signature ruby-red elixir brewed from premium dried hibiscus flowers, fresh ginger root, whole cloves, ripe pineapple, and sweet dates. With zero artificial preservatives and naturally sweetened with organic cane sugar and dates, this time-honored West African recipe delivers an invigorating, tart, and floral refreshment.',
    ingredients: [
      'Water',
      'Sweet Date',
      'Fresh Ginger Root',
      'Whole Pineapple',
      'Hibiscus flower',
      'Sorrel leaf',
      'Organic Cane Sugar',
    ],
    tasteProfile: 'Tart, bold floral berry notes with a lingering spicy botanical finish',
    healthBenefits: [
      'Rich in Anthocyanins & Vitamin C',
      'Supports healthy blood pressure',
      'Natural electrolyte booster',
      'Caffeine-free energy',
    ],
    sizes: [
      { size: '12oz', label: '12oz Single Refresh', price: 5.0, quantityValue: 12, unit: 'oz' },
      { size: '16oz', label: '16oz Daily Refresh', price: 7.0, quantityValue: 16, unit: 'oz' },
      { size: '18oz', label: '18oz Sharing Bottle', price: 10.0, quantityValue: 18, unit: 'oz' },
    ],
    imageUrl: '/assets/aistudio/18oz_zobo_label_17754013.png',
    galleryImages: [],
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
    name: 'Home Made Ginger Juice (Pure Organic Ginger)',
    slug: 'pure-organic-ginger',
    category: 'ginger',
    categoryLabel: 'Ginger Elixirs',
    tagline: 'Fiery organic ginger root balanced with fresh lemon, sweet date & whole cloves',
    description:
      'An invigorating wellness powerhouse from Delightful Juices! Crafted from whole fresh ginger root to preserve active gingerol compounds, balanced with fresh lemon juice, whole cloves, and sweet dates. Bold, fiery, and deeply comforting, this drink supports natural digestion and clear breathing with zero preservatives added.',
    ingredients: [
      'Water',
      'Lemon Juice',
      'Sweet Date',
      'Cloves',
      'Fresh Ginger Root',
    ],
    tasteProfile: 'Fiery ginger spice upfront with crisp lemon tang and smooth honeyed date undertone',
    healthBenefits: [
      'Potent natural digestive aid',
      'Anti-inflammatory gingerols',
      'Immunity defense booster',
      'Soothes throat & sinuses',
    ],
    sizes: [
      { size: '12oz', label: '12oz Immunity Bottle', price: 5.5, quantityValue: 12, unit: 'oz' },
      { size: '16oz', label: '16oz Standard Refresh', price: 7.5, quantityValue: 16, unit: 'oz' },
      { size: '18oz', label: '18oz Sharing Bottle', price: 14.0, quantityValue: 18, unit: 'oz' },
    ],
    imageUrl: '/assets/aistudio/12oz_ginger_d302545f.png',
    galleryImages: [],
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
    name: 'Home Made Ginger Juice - Mango',
    slug: 'ginger-mango-crush',
    category: 'ginger',
    categoryLabel: 'Ginger Elixirs',
    tagline: 'Velvety tropical mango nectar harmonized with fiery fresh ginger & sweet dates',
    description:
      'A vibrant tropical symphony where rich, sun-ripened mango puree meets the invigorating warmth of fresh ginger root, fresh lemon juice, whole cloves, and sweet dates. Velvety smooth with just the right amount of spicy kick, perfect for sunny afternoons, event celebrations, and everyday refreshment with no preservatives added.',
    ingredients: [
      'Water',
      'Lemon Juice',
      'Sweet Date',
      'Cloves',
      'Fresh Ginger Root',
      'Mango Puree',
    ],
    tasteProfile: 'Rich, luscious tropical mango sweetness with a warming, zesty ginger finish',
    healthBenefits: [
      'High in Vitamin A & Beta-Carotene',
      'Promotes glowing skin',
      'Revitalizes tired energy',
      'Naturally sweet without refined syrups',
    ],
    sizes: [
      { size: '12oz', label: '12oz Single Bottle', price: 5.5, quantityValue: 12, unit: 'oz' },
    ],
    imageUrl: '/assets/aistudio/12oz_mango_dcfd0401.png',
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
    name: 'Home Made Ginger Juice - Pineapple',
    slug: 'ginger-pineapple-splash',
    category: 'ginger',
    categoryLabel: 'Ginger Elixirs',
    tagline: 'Golden tropical pineapple juice kissed by spicy handcrafted ginger & cloves',
    description:
      'Crisp, bright, and intensely refreshing. Pure pineapple puree harmoniously united with fresh ginger root, lemon juice, sweet dates, and whole cloves. Naturally packed with bromelain and enzymes, this drink elevates your palate with every sip and contains zero preservatives.',
    ingredients: [
      'Water',
      'Lemon Juice',
      'Sweet Date',
      'Cloves',
      'Fresh Ginger Root',
      'Pineapple Puree',
    ],
    tasteProfile: 'Vibrant sweet-tart pineapple punch followed by a clean, warming ginger sparkle',
    healthBenefits: [
      'Rich in Bromelain enzyme',
      'Aids post-meal digestion',
      'Hydrates deeply',
      'Natural mood enhancer',
    ],
    sizes: [
      { size: '12oz', label: '12oz Single Bottle', price: 5.0, quantityValue: 12, unit: 'oz' },
    ],
    imageUrl: '/assets/aistudio/12oz_pineapple_28b92d79.png',
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
    name: 'Home Made Ginger Juice - Lychee',
    slug: 'ginger-lychee-floral',
    category: 'ginger',
    categoryLabel: 'Ginger Elixirs',
    tagline: 'Delicate floral exotic lychee blended with gentle warming ginger & citrus',
    description:
      'An exotic culinary delight from Delightful Juices! Delicate lychee fruit puree infused into our signature homemade ginger base with fresh lemon juice, sweet dates, and aromatic cloves. Sweet, floral, and deeply cooling with a light aromatic zest and zero artificial additives.',
    ingredients: [
      'Water',
      'Lemon Juice',
      'Sweet Date',
      'Cloves',
      'Fresh Ginger Root',
      'Lychee Puree',
    ],
    tasteProfile: 'Silky, aromatic lychee florals with a gentle, rounded ginger warmth',
    healthBenefits: [
      'Packed with polyphenols',
      'Cellular hydration',
      'Calming, restorative sensation',
      'Low acid gentleness',
    ],
    sizes: [
      { size: '12oz', label: '12oz Single Bottle', price: 5.5, quantityValue: 12, unit: 'oz' },
    ],
    imageUrl: '/assets/aistudio/12oz_Lychee_771f865d.png',
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
    name: 'Home Made Tigernut Juice (Tigernut Milk)',
    slug: 'tigernut-milk-kunu-aya',
    category: 'other',
    categoryLabel: 'Artisanal Milks',
    tagline: 'Creamy, dairy-free traditional tigernut milk enriched with dates, cloves & ginger',
    description:
      'A creamy, velvety heritage plant milk crafted from whole soaked tigernuts (chufa tubers), naturally enriched with sweet dates, fresh ginger root, whole cloves, and organic cane sugar. 100% dairy-free, nut-free, and prebiotic-dense, with a rich, velvety, naturally sweet flavor and zero preservatives added.',
    ingredients: [
      'Water',
      'Tigernut',
      'Ginger',
      'Cloves',
      'Date',
      'Organic Cane Sugar',
    ],
    tasteProfile: 'Naturally sweet, rich, nutty (yet nut-free), and comforting with hints of caramel and date',
    healthBenefits: [
      'Rich in Resistant Starch Prebiotics',
      '100% Dairy-Free & Vegan',
      'Natural source of Magnesium & Iron',
      'Sustained steady energy',
    ],
    sizes: [
      { size: '12oz', label: '12oz Morning Bottle', price: 6.0, quantityValue: 12, unit: 'oz' },
      { size: '16oz', label: '16oz Standard Bottle', price: 8.0, quantityValue: 16, unit: 'oz' },
      { size: '18oz', label: '18oz Sharing Bottle', price: 15.0, quantityValue: 18, unit: 'oz' },
    ],
    imageUrl: '/assets/aistudio/12oz_Tigernut_a2076757.png',
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
      'The ultimate Delightful Juices tasting collection! Includes 2x Signature Zobo, 1x Pure Organic Ginger, 1x Ginger Mango, 1x Ginger Pineapple, and 1x Tigernut Milk in 16oz bottles. Packed cold in an insulated carrier, perfect for weekend brunch, gift giving, and small parties.',
    ingredients: [
      '6 × 16oz assorted bottles (Zobo, Ginger blends, Tigernut Milk)',
      'Fresh whole botanical ingredients',
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
        label: '6 × 16oz Fresh Bottles Variety Pack',
        price: 28.0,
        quantityValue: 6,
        unit: 'Pack',
        packBottleQuantity: 16,
        packBottleUnit: 'oz',
      },
    ],
    imageUrl: '/assets/aistudio/18oz_zobo_label_17754013.png',
    galleryImages: [],
    inStock: true,
    featured: true,
    badge: 'Popular Gift & Party Pack',
    rating: 4.98,
    reviewCount: 76,
    isFlyerConfirmed: true,
    displayOrder: 7,
  },
];

export const DEFAULT_PACK_PRICING: PackPricingSettings = {
  heading: 'Delightful Juice Value Packs',
  subheading: 'Stock up your fridge, office, or event with curated multi-packs handcrafted daily.',
  tiers: [
    {
      id: 'pack-6',
      name: '6-pack',
      bottlesCount: 6,
      price: 28,
      badge: 'Popular Sampler',
      description: 'Choice of 6 fresh assorted bottles. Perfect for personal weekly refreshment.',
      enabled: true,
    },
    {
      id: 'pack-12',
      name: '12-pack',
      bottlesCount: 12,
      price: 48,
      badge: 'Most Popular',
      description: 'Best everyday value. Ideal for families, busy weeks, and wellness sharing.',
      enabled: true,
    },
    {
      id: 'pack-24',
      name: '24-pack',
      bottlesCount: 24,
      price: 90,
      badge: 'Best Value',
      description: 'Full party & office case. Maximum freshness and wholesale savings.',
      enabled: true,
    },
  ],
  pricingNote:
    'Prices vary depending on delivery location and order quantity. Wholesale discounts are available for bulk purchases.',
};

export const DEFAULT_ABOUT_SHOWCASE: AboutShowcaseSettings = {
  imageUrl: '',
  imageAlt: 'Fresh whole hibiscus, ginger root, and tropical botanicals for Delightful Juices',
  badgeText: 'Quakertown, PA Craft',
  showBadge: true,
  showCeoCard: false,
  ceoInitials: 'DJ',
  ceoAvatarUrl: '',
  ceoRole: 'Craft Kitchen Team',
  ceoQuote:
    'We believe everyday refreshment should nourish your body, never drain it with artificial chemicals.',
  sectionKicker: 'OUR HERITAGE & WHOLESALE CRAFT',
  sectionHeading: 'Authentic Heritage, Pure Botanicals & Uncompromised Quality.',
  extraStoryParagraph1:
    'From our signature ruby-red Zobo (Hibiscus) and invigorating Organic Ginger Elixirs to our velvety, dairy-free Tigernut Milk (Kunu Aya), every bottle is prepared in small batches to deliver vibrant taste, freshness, and uncompromised quality.',
  extraStoryParagraph2:
    'Delightful Juices products are US-approved and manufactured to strict food safety standards for wholesale distribution to retail stores, restaurants, and everyday family tables.',
};

export const DEFAULT_PRODUCT_SLIDER: ProductSliderSettings = {
  enabled: true,
  heading: 'Discover Our Signature Handcrafted Juices',
  subheading:
    'Explore each small-batch recipe brewed with whole natural botanicals, freshly pressed roots, and tropical fruit with no preservatives added.',
  kicker: 'INTERACTIVE FLAVOR SHOWCASE',
  productIds: [],
  autoplayInterval: 5000,
};

export const INITIAL_SITE_CONTENT: SiteContent = {
  businessName: 'Delightful Juices',
  ceoName: 'Kitchen Leadership',
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
    'Naturally made healthy sips handcrafted in Quakertown, PA with affordable delivery. From our signature hibiscus Zobo to organic ginger infusions and rich tigernut milk, every bottle from Delightful Juices is thoughtfully prepared for authentic flavor and vitality.',
  announcementTicker:
    '🌿 Fresh Batch Pressed Daily in Quakertown, PA • Affordable Local Delivery • Free Delivery Over $40 • Now Booking Weddings & Events • Call/WhatsApp (484) 792-8023 🌿',
  aboutStory:
    'Delightful Juices was founded on a simple, passionate mission: to create truly nourishing, uncompromised drinks using nature’s most potent botanicals, fruits, herbs, and spices. Rooted in authentic West African heritage flavors like Zobo (Hibiscus) and Kunu Aya (Tigernut Milk), alongside revitalizing organic ginger roots, every recipe is hand-blended with care by our dedicated kitchen team in Quakertown, PA.',
  signaturePromise:
    'Every bottle of Delightful Juices is handcrafted with care and whole botanical ingredients, giving you a pure, refreshing experience you can enjoy again and again.',
  freeDeliveryThreshold: 40.0,
  standardDeliveryFee: 4.99,
  pickupAddress: '500 W Broad St, Quakertown, PA 18951',
  operatingHours: 'Mon - Sat: 9:00 AM - 6:30 PM | Sun: 11:00 AM - 4:00 PM',
  chatButtonLabel: 'Chat with Kitchen',
  shopHeading: 'Shop Fresh, Natural Delightful Juices.',
  packPricing: DEFAULT_PACK_PRICING,
  eventShowcase: [],
  productSlider: DEFAULT_PRODUCT_SLIDER,
  branding: {
    logoUrl: '',
    mobileLogoUrl: '',
    logoText: 'Delightful Juices',
    showLogoIcon: true,
    aboutShowcase: DEFAULT_ABOUT_SHOWCASE,
    eventShowcase: [],
    packPricing: DEFAULT_PACK_PRICING,
    shopHeading: 'Shop Fresh, Natural Delightful Juices.',
    productSlider: DEFAULT_PRODUCT_SLIDER,
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
    mode: 'live',
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
    id: 'nav-delivery-info',
    label: 'Delivery & Freshness FAQ',
    href: '/delivery-information',
    visible: true,
    order: 2,
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
    seoTitle: 'About Delightful Juices – Handcrafted Natural Drinks in Quakertown, PA',
    metaDescription:
      'Discover Delightful Juices in Quakertown, PA. Small-batch handcrafted Nigerian Zobo, organic ginger elixirs, and dairy-free Tigernut Milk made with 100% natural botanicals.',
    status: 'published',
    showInNav: false,
    parentNavId: 'nav-about',
    sections: [
      {
        id: 'sec-about-hero',
        type: 'hero',
        kicker: 'OUR HERITAGE & BOTANICAL CRAFT',
        heading: 'Authentic Heritage, Pure Botanicals & Uncompromised Quality',
        subheading:
          'Handcrafted in Quakertown, Pennsylvania—honoring West African botanical traditions, fresh whole roots, and clean natural vitality with affordable delivery.',
        imageUrl: '',
        buttonLabel: 'Shop Fresh Juices',
        buttonUrl: '/shop',
        secondaryButtonLabel: 'Plan Your Event',
        secondaryButtonUrl: '/wholesale',
        theme: 'dark',
      },
      {
        id: 'sec-about-story',
        type: 'image_text',
        kicker: 'THE DELIGHTFUL JUICES STORY',
        heading: 'Nourishing Everyday Refreshment Without Compromise',
        body:
          'Delightful Juices creates refreshing and nourishing drinks made from carefully selected natural ingredients, whole fruits, roots, herbs, and spices.\n\nOur goal is simple: to make everyday refreshment more enjoyable while offering delicious, healthful beverages made with ingredients your family can trust. From our signature ruby-red Zobo (Hibiscus) and fiery Organic Ginger Elixirs to our velvety dairy-free Tigernut Milk (Kunu Aya), every bottle is prepared in small batches at 500 W Broad St, Quakertown, PA.\n\nWe never use artificial preservatives, synthetic dyes, or high-fructose corn syrups—just honest botanical vitality in convenient 12oz, 16oz, and 18oz bottles.',
        imageUrl: '',
        imagePosition: 'left',
        buttonLabel: 'Explore the Shop',
        buttonUrl: '/shop',
        theme: 'cream',
      },
      {
        id: 'sec-about-slider',
        type: 'product_slider',
        kicker: 'INTERACTIVE FLAVOR SHOWCASE',
        heading: 'Discover Our Signature Handcrafted Juices',
        subheading:
          'Slide through our authentic botanical creations, pressed fresh in Quakertown, PA with no preservatives added.',
      },
      {
        id: 'sec-about-products',
        type: 'product_ingredients',
        kicker: 'HANDCRAFTED JUICE CREATIONS',
        heading: 'Our Juice Products & Wholesome Ingredients',
        subheading:
          'Explore each signature recipe crafted from 100% natural whole botanicals, freshly pressed roots, and tropical fruits.',
        theme: 'light',
      },
      {
        id: 'sec-about-craft',
        type: 'image_text',
        kicker: 'SMALL-BATCH BOTANICAL CRAFT',
        heading: 'Whole Roots, Calyces & Tubers — Never Concentrates',
        body:
          'Unlike mass-produced shelf beverages that rely on pasteurized flavor syrups and artificial concentrates, Delightful Juices begins every morning with real whole botanicals.\n\nWe steep organic hibiscus calyces with aromatic cloves and ripe pineapple peels for our Zobo, press fresh organic ginger rhizomes to protect active gingerol compounds, and stone-blend soaked tigernuts with soft Medjool dates for naturally prebiotic plant milk.',
        imageUrl: '',
        imagePosition: 'right',
        buttonLabel: 'Order Fresh Batch',
        buttonUrl: '/shop',
        theme: 'cream',
      },
      {
        id: 'sec-about-cta',
        type: 'cta',
        kicker: 'EXPERIENCE DELIGHTFUL JUICES',
        heading: 'Ready for Wholesome Everyday Refreshment?',
        body:
          'Enjoy affordable doorstep delivery across Pennsylvania, visit our Quakertown kitchen for fresh pickup, or order custom packages for your celebration.',
        buttonLabel: 'Shop Fresh Juices',
        buttonUrl: '/shop',
        secondaryButtonLabel: 'Plan Your Event With Delightful Juices',
        secondaryButtonUrl: '/wholesale',
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
      'Learn about the Delightful Juices four-pillar quality commitment: real whole hibiscus, fresh ginger root, Medjool date sweetened tigernut milk, and zero artificial additives.',
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
        imageUrl: '',
        buttonLabel: 'Shop Fresh Juices',
        buttonUrl: '/shop',
        theme: 'dark',
      },
      {
        id: 'sec-story-split',
        type: 'image_text',
        kicker: 'SMALL-BATCH BOTANICAL CRAFT',
        heading: 'Whole Roots, Calyces & Tubers—Never Concentrates',
        body:
          'Unlike mass-produced shelf beverages that rely on pasteurized flavor syrups and synthetic coloring, Delightful Juices begins every morning with whole botanicals.\n\nWe steep whole organic hibiscus flowers with aromatic cloves and ripe pineapple peels for our Zobo, press fresh ginger rhizomes to protect active gingerols, and stone-blend soaked tigernuts with soft Medjool dates for naturally prebiotic plant milk.',
        imageUrl: '',
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
        galleryImages: [],
        theme: 'cream',
      },
      {
        id: 'sec-story-promo',
        type: 'promo_banner',
        kicker: 'FRESHNESS DELIVERED',
        heading: 'Complimentary Cold-Insulated Local Delivery Over $40',
        body: 'Order online today in 12oz, 16oz, or 18oz sizes for doorstep delivery or free Quakertown kitchen pickup.',
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
      'Delivery zones, free delivery over $40, Quakertown pickup hours, bottle ounce sizes (12oz, 16oz, 18oz), and cold-storage shelf life for Delightful Juices.',
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
        imageUrl: '',
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
          '• 12oz Pocket Sip: Ideal for lunchboxes, immunity refreshers, wedding favors, and corporate wellness bars.\n• 16oz Daily Refresh: Our most popular everyday bottle for workouts, commutes, and afternoon nourishment.\n• 18oz Family Sharing Jug: Generous multi-glass bottle designed for family dining tables and weekend brunches.\n• 6 × 16oz Party Sampler Pack: Six chilled bottles featuring our top customer favorites.',
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
          'Treat your guests to chilled Zobo, Ginger Mango, and Tigernut Milk in 12oz, 16oz, or 18oz bottles tailored to your celebration.',
        imageUrl: '',
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
      'Partner with Delightful Juices to stock handcrafted Zobo, Ginger Elixirs, and Tigernut Milk in your restaurant, cafe, grocery market, or corporate office.',
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
        imageUrl: '',
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

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_INQUIRIES: EventInquiry[] = [];

function cleanCeoMentions(str?: string): string {
  if (!str) return '';
  return str
    .replace(/under the leadership of (our )?(founder & )?(c\.e\.o\.|ceo),?\s*oluyemi(\s+b\.)?\s*ajibolade,?\s*/gi, '')
    .replace(/by (founder & )?(c\.e\.o\.|ceo)\s*oluyemi(\s+b\.)?\s*ajibolade\s*—\s*/gi, '')
    .replace(/by (c\.e\.o\.|ceo)\s*oluyemi(\s+b\.)?\s*ajibolade\s*and our dedicated kitchen team/gi, 'by our dedicated kitchen team')
    .replace(/led by (c\.e\.o\.|ceo)\s*oluyemi(\s+b\.)?\s*ajibolade\s*(in Quakertown, PA)?/gi, 'handcrafted in Quakertown, PA')
    .replace(/oluyemi(\s+b\.)?\s*ajibolade/gi, 'our craft team');
}

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

  const idLower = (p.id || '').toLowerCase();
  const slugLower = (p.slug || '').toLowerCase();
  const nameLower = (p.name || '').toLowerCase();

  const isZobo = idLower === 'prod-zobo' || slugLower.includes('zobo') || nameLower.includes('zobo');
  const isGingerPineapple =
    idLower === 'prod-ginger-pineapple' || slugLower.includes('pineapple') || nameLower.includes('pineapple');
  const isGingerLychee =
    idLower === 'prod-ginger-lychee' || slugLower.includes('lychee') || nameLower.includes('lychee');
  const isGingerMango =
    idLower === 'prod-ginger-mango' || slugLower.includes('mango') || nameLower.includes('mango');

  let activeSizes = normalizedSizes;
  if (isZobo) {
    activeSizes = [
      { size: '12oz', label: '12oz Single Refresh', price: 5.0, quantityValue: 12, unit: 'oz' },
      { size: '16oz', label: '16oz Daily Refresh', price: 7.0, quantityValue: 16, unit: 'oz' },
      { size: '18oz', label: '18oz Sharing Bottle', price: 10.0, quantityValue: 18, unit: 'oz' },
    ];
  } else if (isGingerPineapple) {
    activeSizes = [
      { size: '12oz', label: '12oz Single Bottle', price: 5.0, quantityValue: 12, unit: 'oz' },
    ];
  } else if (isGingerLychee) {
    activeSizes = [
      { size: '12oz', label: '12oz Single Bottle', price: 5.5, quantityValue: 12, unit: 'oz' },
    ];
  } else if (isGingerMango) {
    activeSizes = [
      { size: '12oz', label: '12oz Single Bottle', price: 5.5, quantityValue: 12, unit: 'oz' },
    ];
  } else {
    // Standardise any other products (e.g. Pure Organic Ginger, Tigernut Milk) to 12oz, 16oz, 18oz
    activeSizes = normalizedSizes.map((s) => {
      if (s.unit === 'Pack' || s.size.toLowerCase() === 'pack') {
        return {
          ...s,
          label: s.label.replace(/16\.9\s*oz/gi, '16oz').replace(/12\s*oz/gi, '12oz'),
          packBottleQuantity: 16,
          packBottleUnit: 'oz',
        };
      }
      const parsed = parseSizeString(String(s.size || ''), s.label);
      let standardSize = '12oz';
      let standardLabel = s.label || '12oz Bottle';
      if (parsed.quantityValue === 16) {
        standardSize = '16oz';
        standardLabel = s.label ? s.label.replace(/16\.9\s*oz|16\s*oz|50cl/gi, '16oz') : '16oz Standard Refresh';
      } else if (parsed.quantityValue === 18) {
        standardSize = '18oz';
        standardLabel = s.label ? s.label.replace(/33\.8\s*oz|18\s*oz|1L/gi, '18oz') : '18oz Sharing Bottle';
      } else {
        standardSize = '12oz';
        standardLabel = s.label ? s.label.replace(/11\.8\s*oz|12\s*oz|35cl/gi, '12oz') : '12oz Single Refresh';
      }
      return {
        ...s,
        size: standardSize,
        label: sanitizeBrandText(standardLabel),
        quantityValue: parsed.quantityValue,
        unit: 'oz',
      };
    });
  }

  let safeImageUrl = sanitizeLiveImageUrl(p.imageUrl);
  if (!safeImageUrl) {
    if (isZobo) safeImageUrl = '/assets/aistudio/18oz_zobo_label_17754013.png';
    else if (isGingerPineapple) safeImageUrl = '/assets/aistudio/12oz_pineapple_28b92d79.png';
    else if (isGingerLychee) safeImageUrl = '/assets/aistudio/12oz_Lychee_771f865d.png';
    else if (isGingerMango) safeImageUrl = '/assets/aistudio/12oz_mango_dcfd0401.png';
    else if (idLower.includes('ginger') || slugLower.includes('ginger')) safeImageUrl = '/assets/aistudio/12oz_ginger_d302545f.png';
    else if (idLower.includes('tigernut') || slugLower.includes('tigernut')) safeImageUrl = '/assets/aistudio/12oz_Tigernut_a2076757.png';
  }

  const safeGallery = (p.galleryImages || [])
    .map((img) => sanitizeLiveImageUrl(img))
    .filter(Boolean);

  return {
    ...p,
    name: sanitizeBrandText(p.name),
    tagline: sanitizeBrandText(p.tagline),
    description: sanitizeBrandText(p.description),
    ingredients: (p.ingredients || []).map((ing) => sanitizeBrandText(ing)),
    sizes: activeSizes,
    imageUrl: safeImageUrl,
    galleryImages: safeGallery,
  };
}

function normalizeCmsPage(page: CmsPage): CmsPage {
  return {
    ...page,
    title: sanitizeBrandText(page.title),
    seoTitle: cleanCeoMentions(sanitizeBrandText(page.seoTitle || '')),
    metaDescription: cleanCeoMentions(sanitizeBrandText(page.metaDescription || '')),
    sections: (page.sections || []).map((sec) => {
      let heading = cleanCeoMentions(sec.heading || '');
      if (heading.includes('Crafted from Passion')) {
        heading = 'Authentic Heritage, Pure Botanicals & Uncompromised Quality';
      }
      return {
        ...sec,
        heading,
        subheading: cleanCeoMentions(sec.subheading),
        body: cleanCeoMentions(sec.body),
        imageUrl: sanitizeLiveImageUrl(sec.imageUrl),
        galleryImages: (sec.galleryImages || [])
          .map((g) => ({
            ...g,
            url: sanitizeLiveImageUrl(g.url),
          }))
          .filter((g) => Boolean(g.url)),
      };
    }),
  };
}

/**
 * Ensures SiteContent replaces legacy DelightOil references and strips any stale local/stock image paths.
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

  const mergedShowcase: AboutShowcaseSettings = {
    ...DEFAULT_ABOUT_SHOWCASE,
    ...(raw.branding?.aboutShowcase || {}),
    showCeoCard: false,
  };

  const rawHeading = mergedShowcase.sectionHeading || '';
  const cleanSectionHeading =
    !rawHeading || rawHeading.includes('Crafted from Passion')
      ? 'Authentic Heritage, Pure Botanicals & Uncompromised Quality.'
      : cleanCeoMentions(sanitizeBrandText(rawHeading));

  const rawPackPricing = raw.packPricing || raw.branding?.packPricing || DEFAULT_PACK_PRICING;
  const rawShopHeading = raw.shopHeading || raw.branding?.shopHeading || 'Shop Fresh, Natural Delightful Juices.';
  const rawEventShowcase = (raw.eventShowcase || raw.branding?.eventShowcase || []).map((item, idx) => ({
    ...item,
    url: sanitizeLiveImageUrl(item.url),
    displayOrder: item.displayOrder ?? idx + 1,
    published: item.published !== false,
  }));

  return {
    ...raw,
    businessName: cleanName,
    heroHeadline: sanitizeBrandText(raw.heroHeadline),
    heroSubheadline: sanitizeBrandText(raw.heroSubheadline).replace(/\bDelightful Juice\b(?!s)/g, 'Delightful Juices'),
    announcementTicker: sanitizeBrandText(raw.announcementTicker),
    aboutStory: cleanCeoMentions(sanitizeBrandText(raw.aboutStory)).replace(/\bDelightful Juice\b(?!s)/g, 'Delightful Juices'),
    signaturePromise: sanitizeBrandText(raw.signaturePromise).replace(/\bDelightful Juice\b(?!s)/g, 'Delightful Juices'),
    shopHeading: rawShopHeading,
    packPricing: rawPackPricing,
    eventShowcase: rawEventShowcase,
    branding: {
      ...INITIAL_SITE_CONTENT.branding!,
      ...(raw.branding || {}),
      logoUrl: sanitizeLiveImageUrl(raw.branding?.logoUrl),
      mobileLogoUrl: sanitizeLiveImageUrl(raw.branding?.mobileLogoUrl),
      logoText: cleanLogoText,
      shopHeading: rawShopHeading,
      packPricing: rawPackPricing,
      eventShowcase: rawEventShowcase,
      aboutShowcase: {
        ...mergedShowcase,
        showCeoCard: false,
        sectionHeading: cleanSectionHeading,
        extraStoryParagraph1: cleanCeoMentions(mergedShowcase.extraStoryParagraph1),
        extraStoryParagraph2: cleanCeoMentions(mergedShowcase.extraStoryParagraph2),
        imageUrl: sanitizeLiveImageUrl(mergedShowcase.imageUrl),
        ceoAvatarUrl: sanitizeLiveImageUrl(mergedShowcase.ceoAvatarUrl),
      },
    },
    stripe: {
      ...INITIAL_SITE_CONTENT.stripe!,
      ...(raw.stripe || {}),
      mode: 'live',
      publishableKey: undefined,
    },
  };
}

const CANONICAL_CHILD_PARENTS: Record<string, string> = {
  'nav-about-company': 'nav-about',
  'nav-our-story': 'nav-about',
  'nav-delivery-info': 'nav-about',
  'nav-events-link': 'nav-services',
  'nav-wholesale-link': 'nav-services',
};

/**
 * Self-healing navigation normalizer:
 * 1. Purges legacy V1 single-page hash anchors (#menu, #events-catering, #wholesale, etc.) so they never double alongside multi-page routes.
 * 2. Restores stripped parentId / isDropdown hierarchy if Supabase's legacy navigation_items table lacked those columns during seeding.
 * 3. Deduplicates identical IDs, duplicate CMS auto-links, and duplicate same-level labels/URLs.
 */
function normalizeNavItems(items: NavItem[]): NavItem[] {
  if (!Array.isArray(items) || items.length === 0) return INITIAL_NAV_ITEMS;

  const allLegacyHashes = items.every((item) => !item?.href || item.href.trim().startsWith('#'));
  if (allLegacyHashes) {
    return INITIAL_NAV_ITEMS;
  }

  const hasMultiPageRoutes = items.some((item) => item?.href && item.href.trim().startsWith('/'));

  // Step 1: Filter out all obsolete V1 hash anchors when multi-page routes exist
  let working: NavItem[] = items
    .filter((item) => {
      if (!item || !item.id || !item.label) return false;
      const hrefLower = (item.href || '').trim().toLowerCase();
      if (hasMultiPageRoutes && hrefLower.startsWith('#')) {
        return false;
      }
      return true;
    })
    .map((item) => ({
      ...item,
      label: sanitizeBrandText(item.label.trim()),
      href: (item.href || '/').trim(),
      parentId: item.parentId ? String(item.parentId) : null,
      isDropdown: Boolean(item.isDropdown),
    }));

  if (working.length === 0) return INITIAL_NAV_ITEMS;

  // Step 2: Deduplicate by ID first (preferring canonical order)
  const byId = new Map<string, NavItem>();
  for (const item of working) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }
  working = Array.from(byId.values());

  // Step 3: Self-heal flattened dropdown hierarchy if parent_id / is_dropdown were lost in a legacy table
  const hasNavAbout = working.some((i) => i.id === 'nav-about');
  const hasNavServices = working.some((i) => i.id === 'nav-services');

  const aboutGroupFlattened =
    hasNavAbout &&
    !working.find((i) => i.id === 'nav-about')?.isDropdown &&
    working.some(
      (i) =>
        (i.id === 'nav-about-company' || i.id === 'nav-our-story' || i.id === 'nav-delivery-info') &&
        !i.parentId
    );

  const servicesGroupFlattened =
    hasNavServices &&
    !working.find((i) => i.id === 'nav-services')?.isDropdown &&
    working.some(
      (i) => (i.id === 'nav-events-link' || i.id === 'nav-wholesale-link') && !i.parentId
    );

  if (aboutGroupFlattened || servicesGroupFlattened) {
    const canonicalOrderMap = new Map<string, number>(
      INITIAL_NAV_ITEMS.map((ci) => [ci.id, ci.order])
    );
    working = working.map((item) => {
      if (aboutGroupFlattened && item.id === 'nav-about') {
        return { ...item, parentId: null, isDropdown: true, order: canonicalOrderMap.get(item.id) ?? item.order };
      }
      if (servicesGroupFlattened && item.id === 'nav-services') {
        return { ...item, parentId: null, isDropdown: true, order: canonicalOrderMap.get(item.id) ?? item.order };
      }
      const canonicalParent = CANONICAL_CHILD_PARENTS[item.id];
      if (
        canonicalParent &&
        ((canonicalParent === 'nav-about' && aboutGroupFlattened) ||
          (canonicalParent === 'nav-services' && servicesGroupFlattened))
      ) {
        return {
          ...item,
          parentId: canonicalParent,
          isDropdown: false,
          order: canonicalOrderMap.get(item.id) ?? item.order,
        };
      }
      return item;
    });
  }

  // Ensure valid parent references & mark any parent with children as isDropdown = true
  const validIds = new Set(working.map((i) => i.id));
  working = working.map((item) =>
    item.parentId && !validIds.has(item.parentId) ? { ...item, parentId: null } : item
  );
  const activeParentIds = new Set(
    working.filter((i) => i.parentId).map((i) => i.parentId as string)
  );
  working = working.map((item) =>
    activeParentIds.has(item.id) ? { ...item, isDropdown: true, parentId: null } : item
  );

  // Step 4: Drop duplicate auto-generated nav-cms-* links whose href is already present in explicit nav items
  const explicitHrefs = new Set(
    working
      .filter((i) => !i.id.startsWith('nav-cms-'))
      .map((i) => i.href.replace(/\/+$/, '').toLowerCase() || '/')
  );
  working = working.filter((item) => {
    if (!item.id.startsWith('nav-cms-')) return true;
    const normHref = item.href.replace(/\/+$/, '').toLowerCase() || '/';
    return !explicitHrefs.has(normHref);
  });

  // Step 5: Deduplicate identical label or duplicate non-dropdown href within the same parent level
  // Sort so dropdown parents and canonical 'nav-*' items win over legacy numeric duplicates
  working.sort((a, b) => {
    const aPriority = a.isDropdown ? 0 : a.id.startsWith('nav-') ? 1 : 2;
    const bPriority = b.isDropdown ? 0 : b.id.startsWith('nav-') ? 1 : 2;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.order - b.order;
  });

  const seenLabelPerLevel = new Set<string>();
  const seenHrefPerLevel = new Set<string>();
  const deduped: NavItem[] = [];

  for (const item of working) {
    const levelKey = item.parentId || 'root';
    const normLabel = `${levelKey}::label::${item.label.toLowerCase()}`;
    const normHref = `${levelKey}::href::${item.href.replace(/\/+$/, '').toLowerCase() || '/'}`;

    if (seenLabelPerLevel.has(normLabel)) continue;
    // At the same level, don't allow a second non-dropdown link to repeat an already-present href
    if (!item.isDropdown && seenHrefPerLevel.has(normHref)) continue;

    seenLabelPerLevel.add(normLabel);
    seenHrefPerLevel.add(normHref);
    deduped.push(item);
  }

  return deduped.sort((a, b) => a.order - b.order);
}

export interface SyncWriteResult {
  synced: boolean;
  error?: string;
}

class DataRepository {
  private listeners: Set<() => void> = new Set();
  private lastSyncAt = 0;

  // Start empty until live Supabase responds so stale hardcoded/local images NEVER flash before live Supabase records load
  private products: Product[] = [];
  private productsLoaded = false;
  private content: SiteContent = normalizeSiteContent(INITIAL_SITE_CONTENT);
  private navItems: NavItem[] = normalizeNavItems(INITIAL_NAV_ITEMS);
  private heroSlides: HeroSlide[] = [];
  private heroSlidesLoaded = false;
  private cmsPages: CmsPage[] = [];
  private cmsPagesLoaded = false;
  private orders: Order[] = [];
  private inquiries: EventInquiry[] = [];

  constructor() {
    purgeLegacyLocalState();
    applyTheme(this.content);
    this.bootstrapSync();

    // Live cross-browser updates via Supabase Realtime when connected
    supabaseService.subscribeRealtime(() => {
      this.syncFromSupabase();
    });

    // Re-sync live protected tables (orders, inquiries, drafts) whenever admin auth changes
    let prevUserId: string | null = null;
    supabaseService.subscribeAuth((user, initialized) => {
      const nextId = user?.id || null;
      if (initialized && nextId !== prevUserId) {
        prevUserId = nextId;
        if (nextId) {
          this.syncFromSupabase();
        } else {
          this.orders = [];
          this.inquiries = [];
          this.notify();
        }
      }
    });

    // Re-sync when user returns to browser tab so stale tabs refresh automatically
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && Date.now() - this.lastSyncAt > 12000) {
          this.syncFromSupabase();
        }
      });
    }
  }

  private async bootstrapSync() {
    if (supabaseService.isConfigured()) {
      // Fetch live Supabase data immediately without waiting on /api/public-config waterfall
      await Promise.all([this.syncFromSupabase(), supabaseService.ensurePublicConfig()]);
      return;
    }

    const discovered = await supabaseService.ensurePublicConfig();
    if (discovered) {
      await this.syncFromSupabase();
    } else {
      this.heroSlidesLoaded = true;
      this.productsLoaded = true;
      this.cmsPagesLoaded = true;
      this.notify();
    }
  }

  private buildWriteResult(ok: boolean): SyncWriteResult {
    if (!supabaseService.isConfigured()) {
      return {
        synced: false,
        error: 'Live Supabase environment variables are not configured on the server.',
      };
    }
    if (ok) {
      return { synced: true };
    }
    const rawErr = supabaseService.getLastWriteError() || 'Database rejected write.';
    const needsAuthHint =
      !supabaseService.getCurrentUser() &&
      (rawErr.toLowerCase().includes('row-level security') ||
        rawErr.includes('42501') ||
        rawErr.toLowerCase().includes('permission denied'))
        ? ' Please sign in with your live Supabase Admin Email & Password.'
        : '';
    return {
      synced: false,
      error: `${rawErr}${needsAuthHint}`,
    };
  }

  private applyRemoteHeroSlides(remoteSlides: HeroSlide[] | null, isAdminAuthenticated: boolean) {
    if (remoteSlides && remoteSlides.length > 0) {
      const normalized = remoteSlides
        .map(normalizeHeroSlide)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      this.heroSlides = normalized;
      this.heroSlidesLoaded = true;

      // Persist cleaned image URLs to live Supabase if any slide held a stale dev asset path
      if (isAdminAuthenticated) {
        for (const raw of remoteSlides) {
          const clean = normalized.find((n) => n.id === raw.id);
          if (
            clean &&
            ((raw.desktopImageUrl || '') !== (clean.desktopImageUrl || '') ||
              (raw.mobileImageUrl || '') !== (clean.mobileImageUrl || '') ||
              (raw.heading || '') !== (clean.heading || '') ||
              (raw.subheading || '') !== (clean.subheading || '') ||
              (raw.ctaLabel || '') !== (clean.ctaLabel || ''))
          ) {
            supabaseService.upsertHeroSlide(clean).catch(() => {});
          }
        }
      }
      return;
    }

    if (remoteSlides && remoteSlides.length === 0) {
      this.heroSlides = [];
      this.heroSlidesLoaded = true;
      return;
    }

    this.heroSlidesLoaded = true;
  }

  private applyRemoteProducts(remoteProducts: Product[] | null, isAdminAuthenticated: boolean) {
    if (remoteProducts && remoteProducts.length > 0) {
      const normalized = remoteProducts.map(normalizeProduct);
      this.products = normalized;
      this.productsLoaded = true;

      if (isAdminAuthenticated) {
        for (const raw of remoteProducts) {
          const clean = normalized.find((n) => n.id === raw.id);
          if (clean && (raw.imageUrl || '') !== (clean.imageUrl || '')) {
            supabaseService.upsertProduct(clean).catch(() => {});
          }
        }
      }
      return;
    }

    if (remoteProducts && remoteProducts.length === 0) {
      this.products = [];
      this.productsLoaded = true;
      return;
    }

    this.productsLoaded = true;
  }

  public async syncFromSupabase() {
    if (!supabaseService.isConfigured()) {
      const discovered = await supabaseService.ensurePublicConfig();
      if (!discovered) {
        this.heroSlidesLoaded = true;
        this.productsLoaded = true;
        this.cmsPagesLoaded = true;
        this.notify();
        return;
      }
    }
    this.lastSyncAt = Date.now();
    const isAdminAuthenticated = Boolean(supabaseService.getCurrentUser());

    try {
      // Kick off hero slides and products immediately in parallel and notify as each resolves
      const heroSlidesPromise = supabaseService.fetchHeroSlides().then((remoteSlides) => {
        this.applyRemoteHeroSlides(remoteSlides, isAdminAuthenticated);
        this.notify();
        return remoteSlides;
      });

      const productsPromise = supabaseService.fetchProducts().then((remoteProducts) => {
        this.applyRemoteProducts(remoteProducts, isAdminAuthenticated);
        this.notify();
        return remoteProducts;
      });

      const [remoteContent, remoteNav, remotePages] = await Promise.all([
        supabaseService.fetchSiteContent(),
        supabaseService.fetchNavigation(),
        supabaseService.fetchCmsPages(),
        heroSlidesPromise,
        productsPromise,
      ]);

      // 1. Apply live site content
      if (remoteContent) {
        this.content = normalizeSiteContent({
          ...INITIAL_SITE_CONTENT,
          ...remoteContent,
          branding: { ...INITIAL_SITE_CONTENT.branding!, ...(remoteContent.branding || {}) },
          colors: { ...INITIAL_SITE_CONTENT.colors!, ...(remoteContent.colors || {}) },
          typography: { ...INITIAL_SITE_CONTENT.typography!, ...(remoteContent.typography || {}) },
          stripe: { ...INITIAL_SITE_CONTENT.stripe!, ...(remoteContent.stripe || {}) },
        });
        applyTheme(this.content);
      } else if (isAdminAuthenticated) {
        await supabaseService.upsertSiteContent(this.content);
      }

      // 2. Apply live navigation & self-heal any legacy duplicates / flattened dropdowns
      if (remoteNav && remoteNav.length > 0) {
        const normalizedNav = normalizeNavItems(remoteNav);
        this.navItems = normalizedNav;

        if (
          isAdminAuthenticated &&
          (remoteNav.length !== normalizedNav.length ||
            remoteNav.some((r, idx) => r.parentId !== normalizedNav[idx]?.parentId))
        ) {
          supabaseService.saveNavigation(normalizedNav).catch(() => {});
        }
      } else if (remoteNav && remoteNav.length === 0 && isAdminAuthenticated) {
        await supabaseService.saveNavigation(INITIAL_NAV_ITEMS);
      }

      // 3. Apply live CMS pages (sanitizing any legacy local asset paths from sections)
      if (remotePages && remotePages.length > 0) {
        const cleanedRemotePages = remotePages.map(normalizeCmsPage);
        const remoteSlugs = new Set(cleanedRemotePages.map((p) => p.slug));
        const missingSeedPages = INITIAL_CMS_PAGES.filter((seedPage) => !remoteSlugs.has(seedPage.slug));
        this.cmsPages = [...cleanedRemotePages, ...missingSeedPages];
        this.cmsPagesLoaded = true;

        if (isAdminAuthenticated) {
          for (const rawPage of remotePages) {
            const cleanedPage = cleanedRemotePages.find((p) => p.id === rawPage.id);
            if (cleanedPage && JSON.stringify(rawPage.sections) !== JSON.stringify(cleanedPage.sections)) {
              supabaseService.upsertCmsPage(cleanedPage).catch(() => {});
            }
          }
          for (const pg of missingSeedPages) {
            supabaseService.upsertCmsPage(pg).catch(() => {});
          }
        }
      } else if (remotePages && remotePages.length === 0) {
        this.cmsPages = [...INITIAL_CMS_PAGES];
        this.cmsPagesLoaded = true;
        if (isAdminAuthenticated) {
          for (const pg of INITIAL_CMS_PAGES) {
            await supabaseService.upsertCmsPage(pg);
          }
        }
      } else {
        this.cmsPagesLoaded = true;
      }

      // 4. Fetch live orders & inquiries in parallel when authenticated
      if (isAdminAuthenticated) {
        const [remoteOrders, remoteInquiries] = await Promise.all([
          supabaseService.fetchOrders(),
          supabaseService.fetchInquiries(),
        ]);
        if (remoteOrders !== null) {
          this.orders = remoteOrders;
        }
        if (remoteInquiries !== null) {
          this.inquiries = remoteInquiries;
        }
      }

      this.notify();
    } catch (err) {
      console.warn('Live Supabase sync notice:', err);
      this.heroSlidesLoaded = true;
      this.productsLoaded = true;
      this.cmsPagesLoaded = true;
      this.notify();
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
  public isProductsLoaded(): boolean {
    return this.productsLoaded;
  }

  public getProducts(): Product[] {
    return this.products;
  }

  public async saveProducts(products: Product[]): Promise<SyncWriteResult> {
    const cleaned = products.map(normalizeProduct);
    this.products = cleaned;
    this.productsLoaded = true;
    this.notify();
    const results = await Promise.all(cleaned.map((p) => supabaseService.upsertProduct(p)));
    return this.buildWriteResult(results.every(Boolean));
  }

  public async updateProduct(product: Product): Promise<SyncWriteResult> {
    const cleanedProduct = normalizeProduct(product);
    const list = [...this.products];
    const idx = list.findIndex((p) => p.id === cleanedProduct.id);
    if (idx >= 0) {
      list[idx] = cleanedProduct;
    } else {
      list.push(cleanedProduct);
    }
    this.products = list;
    this.notify();
    const ok = await supabaseService.upsertProduct(cleanedProduct);
    return this.buildWriteResult(ok);
  }

  public async deleteProduct(id: string): Promise<SyncWriteResult> {
    this.products = this.products.filter((p) => p.id !== id);
    this.notify();
    const ok = await supabaseService.deleteProduct(id);
    return this.buildWriteResult(ok);
  }

  // --- SITE CONTENT ---
  public getContent(): SiteContent {
    return this.content;
  }

  public async saveContent(content: SiteContent): Promise<SyncWriteResult> {
    const cleaned = normalizeSiteContent(content);
    this.content = cleaned;
    applyTheme(cleaned);
    this.notify();
    const ok = await supabaseService.upsertSiteContent(cleaned);
    return this.buildWriteResult(ok);
  }

  // --- PACK PRICING ---
  public getPackPricing(): PackPricingSettings {
    return (
      this.content.packPricing ||
      this.content.branding?.packPricing ||
      DEFAULT_PACK_PRICING
    );
  }

  public async savePackPricing(packPricing: PackPricingSettings): Promise<SyncWriteResult> {
    const defaultBranding: BrandSettings = {
      logoText: 'Delightful Juices',
      showLogoIcon: true,
      ...(this.content.branding || {}),
      packPricing,
    };
    const nextContent: SiteContent = {
      ...this.content,
      packPricing,
      branding: defaultBranding,
    };
    return this.saveContent(nextContent);
  }

  // --- SHOP HEADING ---
  public getShopHeading(): string {
    return (
      this.content.shopHeading ||
      this.content.branding?.shopHeading ||
      'Shop Fresh, Natural Delightful Juices.'
    );
  }

  public async saveShopHeading(heading: string): Promise<SyncWriteResult> {
    const cleanHeading = heading.trim() || 'Shop Fresh, Natural Delightful Juices.';
    const defaultBranding: BrandSettings = {
      logoText: 'Delightful Juices',
      showLogoIcon: true,
      ...(this.content.branding || {}),
      shopHeading: cleanHeading,
    };
    const nextContent: SiteContent = {
      ...this.content,
      shopHeading: cleanHeading,
      branding: defaultBranding,
    };
    return this.saveContent(nextContent);
  }

  // --- EVENT SHOWCASE ---
  public getEventShowcase(): EventShowcaseItem[] {
    const items = this.content.eventShowcase || this.content.branding?.eventShowcase || [];
    return Array.isArray(items) ? [...items].sort((a, b) => a.displayOrder - b.displayOrder) : [];
  }

  public async saveEventShowcase(items: EventShowcaseItem[]): Promise<SyncWriteResult> {
    const sanitized = (items || []).map((item, idx) => ({
      ...item,
      url: sanitizeLiveImageUrl(item.url),
      displayOrder: item.displayOrder ?? idx + 1,
      published: item.published !== false,
    }));
    const defaultBranding: BrandSettings = {
      logoText: 'Delightful Juices',
      showLogoIcon: true,
      ...(this.content.branding || {}),
      eventShowcase: sanitized,
    };
    const nextContent: SiteContent = {
      ...this.content,
      eventShowcase: sanitized,
      branding: defaultBranding,
    };
    return this.saveContent(nextContent);
  }

  // --- PRODUCT SLIDER ---
  public getProductSlider(): ProductSliderSettings {
    return (
      this.content.productSlider ||
      this.content.branding?.productSlider ||
      DEFAULT_PRODUCT_SLIDER
    );
  }

  public async saveProductSlider(productSlider: ProductSliderSettings): Promise<SyncWriteResult> {
    const defaultBranding: BrandSettings = {
      logoText: 'Delightful Juices',
      showLogoIcon: true,
      ...(this.content.branding || {}),
      productSlider,
    };
    const nextContent: SiteContent = {
      ...this.content,
      productSlider,
      branding: defaultBranding,
    };
    return this.saveContent(nextContent);
  }

  // --- HERO SLIDES ---
  public isHeroSlidesLoaded(): boolean {
    return this.heroSlidesLoaded;
  }

  public getHeroSlides(): HeroSlide[] {
    return [...this.heroSlides].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public async saveHeroSlides(slides: HeroSlide[]): Promise<SyncWriteResult> {
    const ordered = slides.map((s, idx) =>
      normalizeHeroSlide({
        ...s,
        displayOrder: idx + 1,
      })
    );
    this.heroSlides = ordered;
    this.heroSlidesLoaded = true;
    this.notify();
    const ok = await supabaseService.saveAllHeroSlides(ordered);
    return this.buildWriteResult(ok);
  }

  public async upsertHeroSlide(slide: HeroSlide): Promise<SyncWriteResult> {
    const cleanedSlide = normalizeHeroSlide(slide);
    const list = [...this.heroSlides];
    const idx = list.findIndex((s) => s.id === cleanedSlide.id);
    if (idx >= 0) {
      list[idx] = cleanedSlide;
    } else {
      list.push(cleanedSlide);
    }
    const ordered = list
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((s, i) => ({ ...s, displayOrder: i + 1 }));
    this.heroSlides = ordered;
    this.heroSlidesLoaded = true;
    this.notify();
    const target = ordered.find((s) => s.id === cleanedSlide.id) || cleanedSlide;
    const ok = await supabaseService.upsertHeroSlide(target);
    return this.buildWriteResult(ok);
  }

  public async deleteHeroSlide(id: string): Promise<SyncWriteResult> {
    const filtered = this.heroSlides
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, displayOrder: i + 1 }));
    this.heroSlides = filtered;
    this.heroSlidesLoaded = true;
    this.notify();
    const ok = await supabaseService.deleteHeroSlide(id);
    return this.buildWriteResult(ok);
  }

  // --- DYNAMIC CMS PAGES ---
  public isCmsPagesLoaded(): boolean {
    return this.cmsPagesLoaded;
  }

  public getCmsPages(): CmsPage[] {
    return this.cmsPages;
  }

  public getPages(): CmsPage[] {
    return this.getCmsPages();
  }

  public getPageBySlug(slug: string, includeDrafts = false): CmsPage | null {
    const normalizedSlug = slug.replace(/^\/+|\/+$/g, '').toLowerCase();
    const match = this.cmsPages.find(
      (p) => p.slug.replace(/^\/+|\/+$/g, '').toLowerCase() === normalizedSlug
    );
    if (!match) return null;
    if (!includeDrafts && match.status !== 'published') return null;
    return match;
  }

  public async saveCmsPage(page: CmsPage): Promise<SyncWriteResult> {
    const cleanSlug = page.slug
      .trim()
      .toLowerCase()
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');

    const updatedPage: CmsPage = normalizeCmsPage({
      ...page,
      slug: cleanSlug,
      updatedAt: new Date().toISOString(),
    });

    const pages = [...this.cmsPages];
    const idx = pages.findIndex((p) => p.id === updatedPage.id);
    if (idx >= 0) {
      pages[idx] = updatedPage;
    } else {
      pages.push(updatedPage);
    }
    this.cmsPages = pages;
    this.cmsPagesLoaded = true;
    const pageOk = await supabaseService.upsertCmsPage(updatedPage);

    // Sync navigation link automatically ONLY if no explicit link for this slug already exists
    const navId = `nav-cms-${updatedPage.id}`;
    const currentNav = this.getNavItems();
    const existingNavIdx = currentNav.findIndex((n) => n.id === navId);
    const alreadyCoveredByExplicitLink = currentNav.some(
      (n) =>
        n.id !== navId &&
        (n.href.replace(/\/+$/, '').toLowerCase() || '/') === `/${cleanSlug}`
    );

    if (updatedPage.showInNav && updatedPage.status === 'published' && !alreadyCoveredByExplicitLink) {
      const navEntry: NavItem = {
        id: navId,
        label: updatedPage.navLabel || updatedPage.title,
        href: `/${cleanSlug}`,
        visible: true,
        order:
          existingNavIdx >= 0
            ? currentNav[existingNavIdx].order
            : currentNav.filter((n) => (n.parentId || null) === (updatedPage.parentNavId || null)).length + 1,
        parentId: updatedPage.parentNavId || null,
        isDropdown: false,
      };
      const nextNav = normalizeNavItems(
        existingNavIdx >= 0
          ? currentNav.map((n, i) => (i === existingNavIdx ? navEntry : n))
          : [...currentNav, navEntry]
      );
      await this.saveNavItems(nextNav);
    } else if (existingNavIdx >= 0) {
      this.navItems = currentNav.filter((n) => n.id !== navId);
      await supabaseService.deleteNavigationItem(navId);
    }

    this.notify();
    return this.buildWriteResult(pageOk);
  }

  public async deleteCmsPage(id: string): Promise<SyncWriteResult> {
    this.cmsPages = this.cmsPages.filter((p) => p.id !== id);
    const ok = await supabaseService.deleteCmsPage(id);

    const navId = `nav-cms-${id}`;
    if (this.navItems.some((n) => n.id === navId)) {
      this.navItems = this.navItems.filter((n) => n.id !== navId);
      await supabaseService.deleteNavigationItem(navId);
    }

    this.notify();
    return this.buildWriteResult(ok);
  }

  // --- NAVIGATION ---
  public getNavItems(): NavItem[] {
    return this.navItems;
  }

  public async saveNavItems(items: NavItem[]): Promise<SyncWriteResult> {
    const cleaned = normalizeNavItems(items);
    this.navItems = cleaned;
    this.notify();
    const ok = await supabaseService.saveNavigation(cleaned);
    return this.buildWriteResult(ok);
  }

  public async deleteNavItem(id: string): Promise<SyncWriteResult> {
    this.navItems = this.navItems.filter((n) => n.id !== id && n.parentId !== id);
    this.notify();
    const ok = await supabaseService.deleteNavigationItem(id);
    return this.buildWriteResult(ok);
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    return this.orders;
  }

  public async createOrder(
    order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: 'ord-' + Date.now(),
      orderNumber: 'DJ-' + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orders = [newOrder, ...this.orders];
    this.notify();
    await supabaseService.ensurePublicConfig();
    await supabaseService.insertOrder(newOrder);
    return newOrder;
  }

  public addOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const newOrder: Order = {
      ...order,
      id: 'ord-' + Date.now(),
      orderNumber: 'DJ-' + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orders = [newOrder, ...this.orders];
    this.notify();
    supabaseService.ensurePublicConfig().then(() => {
      supabaseService.insertOrder(newOrder);
    });
    return newOrder;
  }

  public async updateOrderStatus(id: string, status: Order['status']): Promise<SyncWriteResult> {
    const target = this.orders.find((o) => o.id === id);
    if (target) {
      target.status = status;
      target.updatedAt = new Date().toISOString();
      this.notify();
    }
    const ok = await supabaseService.updateOrderStatus(id, status);
    return this.buildWriteResult(ok);
  }

  public async deleteOrder(id: string): Promise<SyncWriteResult> {
    this.orders = this.orders.filter((o) => o.id !== id);
    this.notify();
    const ok = await supabaseService.deleteOrder(id);
    return this.buildWriteResult(ok);
  }

  // --- INQUIRIES ---
  public getInquiries(): EventInquiry[] {
    return this.inquiries;
  }

  public addInquiry(inquiry: Omit<EventInquiry, 'id' | 'createdAt' | 'status'>): EventInquiry {
    const newInquiry: EventInquiry = {
      ...inquiry,
      id: 'inq-' + Date.now(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    this.inquiries = [newInquiry, ...this.inquiries];
    this.notify();
    supabaseService.ensurePublicConfig().then(() => {
      supabaseService.insertInquiry(newInquiry);
    });
    return newInquiry;
  }

  public async updateInquiryStatus(
    id: string,
    status: EventInquiry['status']
  ): Promise<SyncWriteResult> {
    const target = this.inquiries.find((i) => i.id === id);
    if (target) {
      target.status = status;
      this.notify();
    }
    const ok = await supabaseService.updateInquiryStatus(id, status);
    return this.buildWriteResult(ok);
  }

  // --- SUPABASE LIVE STATUS ---
  public getSupabaseConfig(): SupabaseConfig {
    return supabaseService.getConfig();
  }

  public async testSupabaseConnection(): Promise<{
    success: boolean;
    message: string;
    tablesFound: string[];
  }> {
    const res = await supabaseService.testConnection();
    if (res.success) {
      await this.syncFromSupabase();
    }
    return res;
  }

  // --- LIVE SUPABASE ADMIN AUTH ---
  public isAdminLoggedIn(): boolean {
    return Boolean(supabaseService.getCurrentUser());
  }

  public async adminLoginWithSupabase(
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> {
    const res = await supabaseService.signInWithEmail(email, pass);
    if (res.success) {
      await this.syncFromSupabase();
      this.notify();
      return { success: true };
    }
    return { success: false, error: res.error };
  }

  public async adminLogout(): Promise<void> {
    await supabaseService.signOut();
    this.orders = [];
    this.inquiries = [];
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

-- 2. Orders Table (Supports Stripe Card, Zelle, Cash on Delivery, Card at Pickup & WhatsApp)
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
  payment_status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

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
  colors JSONB DEFAULT '{"pageBgColor":"#FFFFFF","headerBgColor":"#FFFFFF","primaryColor":"#1B4D2E","secondaryColor":"#E1AD01","accentColor":"#E1AD01","footerBgColor":"#12351F","cardBgColor":"#FFFFFF","textColor":"#1B4D2E","buttonBgColor":"#1B4D2E","buttonTextColor":"#FFF8E7"}'::jsonb,
  typography JSONB DEFAULT '{"headingFont":"Playfair Display, Georgia, serif","bodyFont":"Plus Jakarta Sans, sans-serif"}'::jsonb,
  stripe JSONB DEFAULT '{"enabled":true,"mode":"live","currency":"USD","customerFacingName":"Credit / Debit Card (Stripe)"}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Navigation Items Table (with Dropdown & Nested Links Support + Duplicate Cleanup)
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

-- Remove obsolete single-page hash anchors that cause menu bar doubling alongside multi-page routes
DELETE FROM public.navigation_items WHERE href LIKE '#%';

-- Restore dropdown hierarchy if previously flattened by an older schema
UPDATE public.navigation_items SET is_dropdown = true, parent_id = NULL WHERE id IN ('nav-about', 'nav-services');
UPDATE public.navigation_items SET parent_id = 'nav-about', is_dropdown = false WHERE id IN ('nav-about-company', 'nav-our-story', 'nav-delivery-info');
UPDATE public.navigation_items SET parent_id = 'nav-services', is_dropdown = false WHERE id IN ('nav-events-link', 'nav-wholesale-link');

-- 6. Hero Slider Table (Supports both active and enabled flags seamlessly)
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
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT true;

-- 7. Dynamic CMS Pages Table (Supports both parent_nav_id and nav_parent_id)
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  seo_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  show_in_nav BOOLEAN NOT NULL DEFAULT false,
  parent_nav_id TEXT DEFAULT NULL,
  nav_parent_id TEXT DEFAULT NULL,
  nav_label TEXT DEFAULT NULL,
  is_system_route BOOLEAN NOT NULL DEFAULT false,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cms_pages ADD COLUMN IF NOT EXISTS parent_nav_id TEXT DEFAULT NULL;
ALTER TABLE public.cms_pages ADD COLUMN IF NOT EXISTS nav_parent_id TEXT DEFAULT NULL;
ALTER TABLE public.cms_pages ADD COLUMN IF NOT EXISTS nav_label TEXT DEFAULT NULL;
ALTER TABLE public.cms_pages ADD COLUMN IF NOT EXISTS is_system_route BOOLEAN NOT NULL DEFAULT false;

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
CREATE POLICY "Admin full products access" ON public.products FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public create orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full orders access" ON public.orders;
DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin full orders access" ON public.orders FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public insert inquiries" ON public.event_inquiries;
DROP POLICY IF EXISTS "Public submit inquiries" ON public.event_inquiries;
CREATE POLICY "Public insert inquiries" ON public.event_inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full inquiries access" ON public.event_inquiries;
DROP POLICY IF EXISTS "Admin manage inquiries" ON public.event_inquiries;
CREATE POLICY "Admin full inquiries access" ON public.event_inquiries FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read content" ON public.site_content;
DROP POLICY IF EXISTS "Public read site content" ON public.site_content;
CREATE POLICY "Public read content" ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full content access" ON public.site_content;
DROP POLICY IF EXISTS "Admin manage site content" ON public.site_content;
CREATE POLICY "Admin full content access" ON public.site_content FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read navigation" ON public.navigation_items;
CREATE POLICY "Public read navigation" ON public.navigation_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage navigation" ON public.navigation_items;
CREATE POLICY "Admin manage navigation" ON public.navigation_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read active hero slides" ON public.hero_slides;
CREATE POLICY "Public read active hero slides" ON public.hero_slides FOR SELECT USING ((active IS DISTINCT FROM false AND enabled IS DISTINCT FROM false) OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage hero slides" ON public.hero_slides;
CREATE POLICY "Admin manage hero slides" ON public.hero_slides FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read published cms pages" ON public.cms_pages;
CREATE POLICY "Public read published cms pages" ON public.cms_pages FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage cms pages" ON public.cms_pages;
CREATE POLICY "Admin manage cms pages" ON public.cms_pages FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 9. Storage Bucket for Hero Sliders, Page Media, Logos & Product Photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('delightful_assets', 'delightful_assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Assets" ON storage.objects;
CREATE POLICY "Public Read Assets" ON storage.objects FOR SELECT USING (bucket_id = 'delightful_assets');

DROP POLICY IF EXISTS "Authenticated Upload Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow Assets Upload" ON storage.objects;
CREATE POLICY "Allow Assets Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'delightful_assets');

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
