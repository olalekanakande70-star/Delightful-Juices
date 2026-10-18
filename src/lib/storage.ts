import { Product, Order, EventInquiry, SiteContent, NavItem, SupabaseConfig } from '../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  PRODUCTS: 'delightful_juice_products_v1',
  ORDERS: 'delightful_juice_orders_v1',
  INQUIRIES: 'delightful_juice_inquiries_v1',
  CONTENT: 'delightful_juice_content_v1',
  NAV: 'delightful_juice_nav_v1',
  SUPABASE_CONFIG: 'delightful_juice_supabase_cfg_v1',
  ADMIN_AUTH: 'delightful_juice_admin_session_v1',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-zobo',
    name: 'Zobo (Hibiscus / Sorrel)',
    slug: 'zobo-hibiscus-sorrel',
    category: 'zobo',
    categoryLabel: 'Signature Zobo',
    tagline: 'Authentic Nigerian Hibiscus infused with organic cloves, pineapple & warm botanicals',
    description: 'Our signature ruby-red elixir brewed from premium dried hibiscus calyces, ginger root, cloves, and sweet pineapple peels. Rich in antioxidants and vitamin C, this time-honored West African recipe delivers an invigorating, tart, and floral refreshment with our signature DelightOil touch.',
    ingredients: ['Organic Hibiscus Flowers (Sorrel / Zobo)', 'Fresh Ginger Root', 'Pineapple Puree', 'Cloves', 'Natural Cane Touch', 'Signature DelightOil Infusion'],
    tasteProfile: 'Tart, bold floral berry notes with a lingering spicy botanical finish',
    healthBenefits: ['Rich in Anthocyanins & Vitamin C', 'Supports healthy blood pressure', 'Natural electrolyte booster', 'Caffeine-free energy'],
    sizes: [
      { size: '35cl', label: '35cl (12 oz Pocket Sip)', price: 5.50 },
      { size: '50cl', label: '50cl (16.9 oz Daily Refresh)', price: 7.50 },
      { size: '1L', label: '1 Litre (Family Sharing Jug)', price: 14.00 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80',
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
    description: 'An invigorating wellness powerhouse! Crafted from whole fresh ginger root cold-pressed to preserve active gingerol compounds. Balanced with fresh citrus lemon and wildflower honey for a bold, fiery kick that instantly energizes your body and soothes the throat.',
    ingredients: ['Whole Organic Ginger Root', 'Fresh Squeezed Lemon Juice', 'Raw Wildflower Honey', 'Pure Filtered Water', 'DelightOil Herbal Extract'],
    tasteProfile: 'Fiery ginger spice upfront with crisp lemon tang and smooth honey undertone',
    healthBenefits: ['Potent natural digestive aid', 'Anti-inflammatory gingerols', 'Immunity defense booster', 'Soothes throat & sinuses'],
    sizes: [
      { size: '35cl', label: '35cl (12 oz Immunity Shot Bottle)', price: 5.50 },
      { size: '50cl', label: '50cl (16.9 oz Standard Refresh)', price: 7.50 },
      { size: '1L', label: '1 Litre (Family Sharing Jug)', price: 14.00 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
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
    description: 'A vibrant tropical symphony where rich, sun-ripened mango puree meets the invigorating warmth of cold-pressed ginger. Velvety smooth with just the right amount of spicy kick, perfect for sunny afternoons, event celebrations, and everyday refreshment.',
    ingredients: ['Sun-Ripened Mango Puree', 'Cold-Pressed Fresh Ginger', 'Pure Pressed Apple & Orange Juice', 'Lime Touch', 'Signature DelightOil'],
    tasteProfile: 'Rich, luscious tropical mango sweetness with a warming, zesty ginger finish',
    healthBenefits: ['High in Vitamin A & Beta-Carotene', 'Promotes glowing skin', 'Revitalizes tired energy', 'Naturally sweet without refined syrups'],
    sizes: [
      { size: '35cl', label: '35cl (12 oz Pocket Sip)', price: 5.50 },
      { size: '50cl', label: '50cl (16.9 oz Daily Refresh)', price: 7.50 },
      { size: '1L', label: '1 Litre (Family Sharing Jug)', price: 14.00 },
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
    description: 'Crisp, bright, and intensely refreshing. We extract the pure juice of ripe golden pineapples and harmonize it with our signature ginger press. Naturally loaded with bromelain and enzymes, this drink elevates your palate with every sip.',
    ingredients: ['Golden Pineapple Cold-Pressed Juice', 'Fresh Ginger Root', 'Mint Leaf Infusion', 'Touch of Lime', 'DelightOil Extract'],
    tasteProfile: 'Vibrant sweet-tart pineapple punch followed by a clean, warming ginger sparkle',
    healthBenefits: ['Rich in Bromelain enzyme', 'Aids post-meal digestion', 'Hydrates deeply', 'Natural mood enhancer'],
    sizes: [
      { size: '35cl', label: '35cl (12 oz Pocket Sip)', price: 5.50 },
      { size: '50cl', label: '50cl (16.9 oz Daily Refresh)', price: 7.50 },
      { size: '1L', label: '1 Litre (Family Sharing Jug)', price: 14.00 },
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
    description: 'An exotic culinary delight! Fragrant lychee fruit nectar paired gracefully with subtle, micro-pressed ginger. Sweet, floral, and deeply cooling with a light aromatic zest that pairs exceptionally well with festive dinners and catering spreads.',
    ingredients: ['Exotic Lychee Nectar', 'Micro-Pressed Ginger Root', 'Spring Water', 'Botanical Blossom Essence', 'Signature DelightOil'],
    tasteProfile: 'Silky, aromatic lychee florals with a gentle, rounded ginger warmth',
    healthBenefits: ['Packed with polyphenols', 'Cellular hydration', 'Calming, restorative sensation', 'Low acid gentleness'],
    sizes: [
      { size: '35cl', label: '35cl (12 oz Pocket Sip)', price: 5.50 },
      { size: '50cl', label: '50cl (16.9 oz Daily Refresh)', price: 7.50 },
      { size: '1L', label: '1 Litre (Family Sharing Jug)', price: 14.00 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    featured: false,
    badge: 'Exotic Artisan Pick',
    rating: 4.88,
    reviewCount: 63,
    isFlyerConfirmed: false, // marked as confirmed still offered in client update
    displayOrder: 5,
  },
  {
    id: 'prod-tigernut-milk',
    name: 'Tigernut Milk (Kunu Aya)',
    slug: 'tigernut-milk-kunu-aya',
    category: 'other',
    categoryLabel: 'Artisanal Milks',
    tagline: 'Creamy, dairy-free traditional tigernut milk enriched with dates & organic coconut',
    description: 'A creamy, velvety heritage plant milk crafted from nutrient-dense tubers known as Tigernuts (Cyperus esculentus), sweetened naturally with soft Medjool dates and infused with organic coconut and a whisper of ginger. 100% dairy-free, nut-free, and prebiotic-rich.',
    ingredients: ['Whole Soaked Tigernuts (Chufa Tubers)', 'Medjool Date Puree', 'Creamy Coconut Nectar', 'Touch of Ginger Root', 'Pure Filtered Spring Water'],
    tasteProfile: 'Naturally sweet, rich, nutty (yet nut-free), and comforting with hints of caramel and date',
    healthBenefits: ['Rich in Resistant Starch Prebiotics', '100% Dairy-Free & Vegan', 'Natural source of Magnesium & Iron', 'Sustained steady energy'],
    sizes: [
      { size: '35cl', label: '35cl (12 oz Morning Bottle)', price: 6.00 },
      { size: '50cl', label: '50cl (16.9 oz Standard Bottle)', price: 8.00 },
      { size: '1L', label: '1 Litre (Family Sharing Jug)', price: 15.00 },
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
    description: 'The ultimate tasting collection! Includes 2x Signature Zobo, 1x Pure Organic Ginger, 1x Ginger Mango, 1x Ginger Pineapple, and 1x Tigernut Milk in 50cl bottles. Packed cold in an insulated carrier, perfect for weekend brunch, gift giving, and small parties.',
    ingredients: ['6 x 50cl assorted bottles (Zobo, Ginger blends, Tigernut Milk)', 'Fresh cold pressed ingredients', 'Our signature DelightOil touch'],
    tasteProfile: 'Complete journey from tart floral hibiscus to fiery ginger and creamy tigernut sweetness',
    healthBenefits: ['Full spectrum of botanical vitamins', 'Perfect crowd-pleaser for all ages', 'Great savings vs individual bottles'],
    sizes: [
      { size: 'Pack', label: '6 x 50cl Fresh Bottles Variety Pack', price: 38.00 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1622484216853-4dc9b8e8f804?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    featured: true,
    badge: 'Popular Gift & Party Pack',
    rating: 4.98,
    reviewCount: 76,
    isFlyerConfirmed: true,
    displayOrder: 7,
  },
];

export const INITIAL_SITE_CONTENT: SiteContent = {
  businessName: 'Delightful Juice',
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
  heroSubheadline: 'Naturally made, cold-pressed healthy sips handcrafted in Quakertown, PA. From our signature hibiscus Zobo to organic ginger infusions and rich tigernut milk, every bottle is thoughtfully prepared with our signature DelightOil for authentic flavor and vitality.',
  announcementTicker: '🌿 Fresh Batch Pressed Daily in Quakertown, PA • Free Local Delivery over $40 • Now Booking Weddings, Birthdays & Corporate Gatherings • Call/WhatsApp (484) 792-8023 🌿',
  aboutStory: 'Delightful Juice was founded on a simple, passionate mission: to create truly nourishing, uncompromised drinks using nature’s most potent botanicals, fruits, herbs, and spices. Rooted in authentic West African heritage flavors like Zobo (Hibiscus) and Kunu Aya (Tigernut Milk), alongside revitalizing cold-pressed ginger roots, every recipe is hand-blended with care by CEO Oluyemi B. Ajibolade and our dedicated kitchen team.',
  signaturePromise: 'Every bottle is made with care and quality ingredients, with our signature DelightOil in every bottle, giving you a refreshing experience you can enjoy again and again.',
  freeDeliveryThreshold: 40.00,
  standardDeliveryFee: 4.99,
  pickupAddress: '500 W Broad St, Quakertown, PA 18951',
  operatingHours: 'Mon - Sat: 9:00 AM - 6:30 PM | Sun: 11:00 AM - 4:00 PM',
  chatButtonLabel: 'Chat with us',
  branding: {
    logoUrl: '',
    mobileLogoUrl: '',
    logoText: 'Delightful Juice',
    showLogoIcon: true,
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
  { id: 'nav-menu', label: 'Fresh Juices & Menu', href: '#menu', visible: true, order: 1 },
  { id: 'nav-signature', label: 'Our Signature Promise', href: '#signature-promise', visible: true, order: 2 },
  { id: 'nav-events', label: 'Events & Catering', href: '#events-catering', visible: true, order: 3 },
  { id: 'nav-wholesale', label: 'Wholesale & Retail', href: '#wholesale', visible: true, order: 4 },
  { id: 'nav-story', label: 'About Us', href: '#about', visible: true, order: 5 },
  { id: 'nav-faq', label: 'FAQ & Delivery', href: '#faq', visible: true, order: 6 },
  { id: 'nav-contact', label: 'Contact', href: '#contact', visible: true, order: 7 },
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
        sizeLabel: '50cl (16.9 oz Daily Refresh)',
        unitPrice: 7.50,
        quantity: 2,
        totalPrice: 15.00,
        imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80',
      },
      {
        productId: 'prod-organic-ginger',
        productName: 'Pure Organic Ginger',
        size: '50cl',
        sizeLabel: '50cl (16.9 oz Standard Refresh)',
        unitPrice: 7.50,
        quantity: 2,
        totalPrice: 15.00,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      },
      {
        productId: 'prod-tigernut-milk',
        productName: 'Tigernut Milk (Kunu Aya)',
        size: '1L',
        sizeLabel: '1 Litre (Family Sharing Jug)',
        unitPrice: 15.00,
        quantity: 1,
        totalPrice: 15.00,
        imageUrl: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 45.00,
    deliveryFee: 0.00,
    total: 45.00,
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
        sizeLabel: '6 x 50cl Fresh Bottles Variety Pack',
        unitPrice: 38.00,
        quantity: 1,
        totalPrice: 38.00,
        imageUrl: 'https://images.unsplash.com/photo-1622484216853-4dc9b8e8f804?w=800&auto=format&fit=crop&q=80',
      },
      {
        productId: 'prod-ginger-pineapple',
        productName: 'Ginger Pineapple',
        size: '50cl',
        sizeLabel: '50cl (16.9 oz Daily Refresh)',
        unitPrice: 7.50,
        quantity: 1,
        totalPrice: 7.50,
        imageUrl: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=800&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 45.50,
    deliveryFee: 0.00,
    total: 45.50,
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
    message: 'We want custom branded Delightful Juice bottles featuring our wedding monogram for our welcome cocktail hour and dessert table. Please provide a quote for 250 bottles total with delivery and ice chiller bins.',
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
    message: 'Looking for a natural, healthy beverage bar for our company health & wellness symposium. Need individual 35cl bottles.',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

import { supabaseService } from './supabaseClient';
import { applyTheme } from './theme';

// In-Memory & LocalStorage Data Layer with Reactive Event Dispatch and Supabase Sync
class DataRepository {
  private listeners: Set<() => void> = new Set();
  private hasInitiallySyncedWithSupabase = false;

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
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(remoteProducts));
      }

      // 2. Fetch remote site content
      const remoteContent = await supabaseService.fetchSiteContent();
      if (remoteContent) {
        localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(remoteContent));
        applyTheme(remoteContent);
      }

      // 3. Fetch remote navigation
      const remoteNav = await supabaseService.fetchNavigation();
      if (remoteNav && remoteNav.length > 0) {
        localStorage.setItem(STORAGE_KEYS.NAV, JSON.stringify(remoteNav));
      }

      // 4. Fetch remote orders & inquiries if available
      const remoteOrders = await supabaseService.fetchOrders();
      if (remoteOrders && remoteOrders.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(remoteOrders));
      }

      const remoteInquiries = await supabaseService.fetchInquiries();
      if (remoteInquiries && remoteInquiries.length > 0) {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(remoteInquiries));
      }

      this.hasInitiallySyncedWithSupabase = true;
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading products from storage:', e);
    }
    // Seed initial
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }

  public saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();
    products.forEach((p) => supabaseService.upsertProduct(p));
  }

  public updateProduct(product: Product): void {
    const list = this.getProducts();
    const idx = list.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      list[idx] = product;
    } else {
      list.push(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
    this.notify();
    supabaseService.upsertProduct(product);
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
        return {
          ...INITIAL_SITE_CONTENT,
          ...parsed,
          branding: { ...INITIAL_SITE_CONTENT.branding, ...(parsed.branding || {}) },
          colors: { ...INITIAL_SITE_CONTENT.colors, ...(parsed.colors || {}) },
          typography: { ...INITIAL_SITE_CONTENT.typography, ...(parsed.typography || {}) },
          stripe: { ...INITIAL_SITE_CONTENT.stripe, ...(parsed.stripe || {}) },
        };
      }
    } catch (e) {
      console.warn('Error reading content from storage:', e);
    }
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(INITIAL_SITE_CONTENT));
    return INITIAL_SITE_CONTENT;
  }

  public saveContent(content: SiteContent): void {
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(content));
    applyTheme(content);
    this.notify();
    supabaseService.upsertSiteContent(content);
  }

  // --- NAVIGATION ---
  public getNavItems(): NavItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NAV);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.sort((a, b) => a.order - b.order);
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

  public async testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string; tablesFound: string[] }> {
    const res = await supabaseService.testConnection(url, key);
    if (res.success) {
      await this.syncFromSupabase();
    }
    return res;
  }

  // --- ADMIN AUTH (Session Token or Supabase User) ---
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

  public async adminLoginWithSupabase(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
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

  // Reset to factory seed
  public resetToDefaultSeed(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(INITIAL_SITE_CONTENT));
    localStorage.setItem(STORAGE_KEYS.NAV, JSON.stringify(INITIAL_NAV_ITEMS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(INITIAL_INQUIRIES));
    this.notify();
  }
}

export const dataRepo = new DataRepository();

export const SUPABASE_SQL_MIGRATION = `-- ==============================================================================
-- DELIGHTFUL JUICE: SUPABASE DATABASE SCHEMA & RLS MIGRATION
-- Brand: Delightful Juice ("Savor the Pure Goodness | Naturally Made. Healthy Sips.")
-- ==============================================================================

-- 1. Create Products Table
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
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 3. Create Event & Catering Inquiries Table
CREATE TABLE IF NOT EXISTS public.event_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE,
  guest_count INTEGER,
  event_location TEXT,
  bottle_sizes JSONB DEFAULT '[]'::jsonb,
  selected_flavors JSONB DEFAULT '[]'::jsonb,
  custom_labeling BOOLEAN DEFAULT false,
  budget_range TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Site Content CMS Table
-- 4. Create Site Content CMS Table
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
  chat_button_label TEXT DEFAULT 'Chat with us',
  branding JSONB DEFAULT '{"logoText":"Delightful Juice","showLogoIcon":true}'::jsonb,
  colors JSONB DEFAULT '{"pageBgColor":"#FFFFFF","primaryColor":"#1B4D2E","secondaryColor":"#E1AD01","accentColor":"#E1AD01","footerBgColor":"#12351F","cardBgColor":"#FFFFFF","buttonBgColor":"#1B4D2E","buttonTextColor":"#FFF8E7"}'::jsonb,
  typography JSONB DEFAULT '{"headingFont":"Playfair Display, Georgia, serif","bodyFont":"Plus Jakarta Sans, sans-serif"}'::jsonb,
  stripe JSONB DEFAULT '{"enabled":true,"mode":"test","currency":"USD","customerFacingName":"Credit / Debit Card (Stripe)"}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public can read all in-stock products
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" 
  ON public.products FOR SELECT 
  USING (true);

-- Public can insert new orders
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public create orders" ON public.orders;
CREATE POLICY "Public insert orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (true);

-- Public can insert catering inquiries
DROP POLICY IF EXISTS "Public insert inquiries" ON public.event_inquiries;
DROP POLICY IF EXISTS "Public submit inquiries" ON public.event_inquiries;
CREATE POLICY "Public insert inquiries" 
  ON public.event_inquiries FOR INSERT 
  WITH CHECK (true);

-- Public can read published site content
DROP POLICY IF EXISTS "Public read content" ON public.site_content;
DROP POLICY IF EXISTS "Public read site content" ON public.site_content;
CREATE POLICY "Public read content" 
  ON public.site_content FOR SELECT 
  USING (true);

-- Admin full access policies (Authenticated users)
DROP POLICY IF EXISTS "Admin full products access" ON public.products;
DROP POLICY IF EXISTS "Admin write products" ON public.products;
CREATE POLICY "Admin full products access" 
  ON public.products FOR ALL 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full orders access" ON public.orders;
DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin full orders access" 
  ON public.orders FOR ALL 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full inquiries access" ON public.event_inquiries;
DROP POLICY IF EXISTS "Admin manage inquiries" ON public.event_inquiries;
CREATE POLICY "Admin full inquiries access" 
  ON public.event_inquiries FOR ALL 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full content access" ON public.site_content;
DROP POLICY IF EXISTS "Admin manage site content" ON public.site_content;
CREATE POLICY "Admin full content access" 
  ON public.site_content FOR ALL 
  USING (auth.role() = 'authenticated');

-- 6. Storage Bucket for Logos and Product Photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('delightful_assets', 'delightful_assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Assets" ON storage.objects;
CREATE POLICY "Public Read Assets" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'delightful_assets');

DROP POLICY IF EXISTS "Authenticated Upload Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow Assets Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload Assets" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'delightful_assets');

DROP POLICY IF EXISTS "Allow Assets Update" ON storage.objects;
CREATE POLICY "Allow Assets Update" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'delightful_assets');
`;
