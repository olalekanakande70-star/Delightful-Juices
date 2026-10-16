export type BottleSize = '35cl' | '50cl' | '1L' | 'Pack';

export interface SizeOption {
  size: BottleSize;
  label: string; // e.g. "35cl (12 oz)", "50cl (16.9 oz)", "1 Litre (Family Jug)"
  price: number;
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
  paymentMethod: 'zelle' | 'cash_on_delivery' | 'card_at_pickup' | 'whatsapp_order';
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
  eventType: string; // Wedding, Birthday, Corporate, Pop-up, etc.
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
}

export interface SiteContent {
  businessName: string;
  ceoName: string;
  motto: string;
  tagline: string;
  phone: string;
  whatsappNumber: string; // e.g. "14847928023"
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
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  lastTestedAt?: string;
}
