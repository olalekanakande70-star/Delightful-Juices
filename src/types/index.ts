export type BottleSize = string; // Supports legacy '35cl' | '50cl' | '1L' | 'Pack' and custom quantities/oz

export type MeasurementUnit = 'cl' | 'L' | 'oz' | 'ml' | 'Pack';

export interface SizeOption {
  size: BottleSize; // Unique key for cart/orders (preserved for existing products, e.g. '35cl', '50cl', '1L', 'Pack', or '16.9oz')
  label: string; // Customer-facing descriptive label
  price: number;
  quantityValue?: number; // Numeric quantity entered by admin, e.g. 35, 50, 1, 6
  unit?: MeasurementUnit; // Unit entered by admin: 'cl' | 'L' | 'oz' | 'ml' | 'Pack'
  packBottleQuantity?: number; // For multi-packs: quantity of each bottle (e.g., 50)
  packBottleUnit?: MeasurementUnit; // For multi-packs: unit of each bottle (e.g., 'cl')
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'zobo' | 'ginger' | 'other' | 'bundles';
  categoryLabel: string;
  tagline: string;
  description: string;
  ingredients: string[];
  tasteProfile: string;
  healthBenefits: string[];
  sizes: SizeOption[];
  imageUrl: string;
  galleryImages?: string[];
  inStock: boolean;
  featured: boolean;
  badge?: string;
  rating: number;
  reviewCount: number;
  isFlyerConfirmed: boolean;
  displayOrder: number;
}

export interface CartItem {
  id: string; // unique item id (productId + size)
  product: Product;
  selectedSize: SizeOption;
  quantity: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'out_for_delivery' | 'completed' | 'cancelled';
export type DeliveryMethod = 'pickup' | 'local_delivery' | 'shipping';

export interface OrderItem {
  productId: string;
  productName: string;
  size: BottleSize;
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'zelle' | 'cash_on_delivery' | 'card_at_pickup' | 'whatsapp_order' | 'stripe_card';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type InquiryStatus = 'new' | 'reviewed' | 'quoted' | 'booked' | 'declined';

export interface EventInquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  eventLocation: string;
  bottleSizesNeeded: BottleSize[];
  selectedFlavors: string[];
  customLabelingNeeded: boolean;
  budgetRange?: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  order: number;
  parentId?: string | null;
  isDropdown?: boolean;
  children?: NavItem[];
}

export interface HeroSlide {
  id: string;
  heading: string;
  subheading: string;
  kicker?: string;
  ctaLabel: string;
  ctaUrl: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  overlayOpacity: number; // e.g. 0.45 to 0.75
  displayOrder: number;
  active: boolean;
  enabled?: boolean;
  updatedAt?: string;
}

export type PageSectionType =
  | 'hero'
  | 'image_text'
  | 'full_image'
  | 'text_only'
  | 'promo_banner'
  | 'featured_products'
  | 'image_gallery'
  | 'cta'
  | 'contact_info'
  | 'catering_calculator'
  | 'wholesale_tiers'
  | 'faq_list';

export interface GalleryImageItem {
  url: string;
  caption?: string;
}

export interface PageSection {
  id: string;
  type: PageSectionType;
  kicker?: string;
  heading?: string;
  subheading?: string;
  body?: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
  imageCaption?: string;
  galleryImages?: GalleryImageItem[];
  buttonLabel?: string;
  buttonUrl?: string;
  secondaryButtonLabel?: string;
  secondaryButtonUrl?: string;
  theme?: 'light' | 'white' | 'cream' | 'green' | 'gold' | 'soft' | 'dark';
  backgroundTone?: 'white' | 'soft' | 'dark';
  productCategory?: 'all' | 'featured' | 'zobo' | 'ginger' | 'other' | 'bundles';
  maxProducts?: number;
  order?: number;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string; // e.g. "about-us", "contact-us", "our-story" (without leading slash, rendered at /slug)
  status: 'published' | 'draft';
  seoTitle?: string;
  metaDescription?: string;
  showInNav: boolean;
  parentNavId?: string | null;
  navParentId?: string | null;
  navLabel?: string;
  isSystemRoute?: boolean; // Optional marker if backed by core template
  sections: PageSection[];
  createdAt: string;
  updatedAt: string;
}

export interface AboutShowcaseSettings {
  imageUrl?: string;
  imageAlt?: string;
  badgeText: string;
  showBadge: boolean;
  showCeoCard: boolean;
  ceoInitials: string;
  ceoAvatarUrl?: string;
  ceoRole: string;
  ceoQuote: string;
  sectionKicker?: string;
  sectionHeading?: string;
  extraStoryParagraph1?: string;
  extraStoryParagraph2?: string;
}

export interface BrandSettings {
  logoUrl?: string;
  mobileLogoUrl?: string;
  logoText: string;
  showLogoIcon: boolean;
  aboutShowcase?: AboutShowcaseSettings;
}

export interface ColorThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  pageBgColor: string;
  cardBgColor: string;
  headerBgColor: string;
  footerBgColor: string;
  textColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  borderColor: string;
}

export interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  baseFontSize: string;
  headingWeight: string;
  bodyWeight: string;
}

export interface StripePaymentSettings {
  enabled: boolean;
  mode: 'test' | 'live';
  publishableKey: string;
  currency: string;
  customerFacingName: string;
  description: string;
}

export interface SiteContent {
  businessName: string;
  ceoName: string;
  motto: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  cityStateZip: string;
  instagram: string;
  tiktok: string;
  websiteDomain: string;
  heroHeadline: string;
  heroSubheadline: string;
  announcementTicker: string;
  aboutStory: string;
  signaturePromise: string;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  pickupAddress: string;
  operatingHours: string;
  chatButtonLabel?: string;
  branding?: BrandSettings;
  colors?: ColorThemeSettings;
  typography?: TypographySettings;
  stripe?: StripePaymentSettings;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  lastTestedAt?: string;
}
