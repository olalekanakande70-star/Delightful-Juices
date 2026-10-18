import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { Product, Order, EventInquiry, SiteContent, NavItem, SupabaseConfig } from '../types';

export const DEFAULT_SUPABASE_URL = 'https://abrgqtrobgorsaggooxv.supabase.co';
const STORAGE_CONFIG_KEY = 'delightful_juice_supabase_cfg_v1';

class SupabaseService {
  private client: SupabaseClient | null = null;
  private currentSession: Session | null = null;
  private currentUser: User | null = null;
  private authListeners: Set<(user: User | null) => void> = new Set();

  constructor() {
    this.init();
  }

  public init() {
    const config = this.getConfig();
    if (config.url && config.anonKey) {
      try {
        this.client = createClient(config.url, config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });

        // Listen for Supabase Auth state changes
        this.client.auth.onAuthStateChange((_event, session) => {
          this.currentSession = session;
          this.currentUser = session?.user || null;
          this.notifyAuthListeners();
        });

        // Retrieve initial session
        this.client.auth.getSession().then(({ data: { session } }) => {
          this.currentSession = session;
          this.currentUser = session?.user || null;
          this.notifyAuthListeners();
        }).catch((err) => {
          console.warn('Supabase getSession notice:', err);
        });

      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  public getConfig(): SupabaseConfig {
    let storedConfig: Partial<SupabaseConfig> = {};
    try {
      const stored = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (stored) storedConfig = JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }

    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

    const url = storedConfig.url || envUrl || DEFAULT_SUPABASE_URL;
    const anonKey = storedConfig.anonKey || envKey || '';
    const connected = !!(storedConfig.connected && url && anonKey);

    return {
      url,
      anonKey,
      connected,
      lastTestedAt: storedConfig.lastTestedAt,
    };
  }

  public saveConfig(config: SupabaseConfig) {
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn(e);
    }
    this.init();
  }

  public getClient(): SupabaseClient | null {
    if (!this.client) {
      this.init();
    }
    return this.client;
  }

  public isConfigured(): boolean {
    const cfg = this.getConfig();
    return !!(cfg.url && cfg.anonKey);
  }

  // --- AUTHENTICATION ---
  public subscribeAuth(listener: (user: User | null) => void): () => void {
    this.authListeners.add(listener);
    listener(this.currentUser);
    return () => {
      this.authListeners.delete(listener);
    };
  }

  private notifyAuthListeners() {
    this.authListeners.forEach((fn) => {
      try {
        fn(this.currentUser);
      } catch (e) {
        console.error(e);
      }
    });
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public async signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, error: 'Supabase client is not configured with URL and Anon key.' };
    }
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      this.currentUser = data.user;
      this.currentSession = data.session;
      this.notifyAuthListeners();
      return { success: true, user: data.user || undefined };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication failed' };
    }
  }

  public async signOut(): Promise<void> {
    const client = this.getClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    this.currentUser = null;
    this.currentSession = null;
    this.notifyAuthListeners();
  }

  // --- TEST CONNECTION & TABLE INSPECTION ---
  public async testConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string; tablesFound: string[] }> {
    if (!url || !anonKey) {
      return { success: false, message: 'Both Supabase URL and Anon Key are required.', tablesFound: [] };
    }
    try {
      const testClient = createClient(url, anonKey);
      const tablesFound: string[] = [];

      // Check products table
      const { data: prodData, error: prodErr } = await testClient.from('products').select('id').limit(1);
      if (!prodErr) tablesFound.push('products');

      // Check site_content table
      const { data: contentData, error: contentErr } = await testClient.from('site_content').select('key').limit(1);
      if (!contentErr) tablesFound.push('site_content');

      // Check navigation_items table
      const { data: navData, error: navErr } = await testClient.from('navigation_items').select('id').limit(1);
      if (!navErr) tablesFound.push('navigation_items');

      // Check orders table
      const { error: ordErr } = await testClient.from('orders').select('id').limit(1);
      if (!ordErr || ordErr.code === 'PGRST116' || ordErr.message.includes('permission denied')) {
        // Even if RLS denies public select on orders, the table exists!
        tablesFound.push('orders');
      }

      // Check event_inquiries table
      const { error: inqErr } = await testClient.from('event_inquiries').select('id').limit(1);
      if (!inqErr || inqErr.code === 'PGRST116' || inqErr.message.includes('permission denied')) {
        tablesFound.push('event_inquiries');
      }

      this.client = testClient;
      this.saveConfig({
        url,
        anonKey,
        connected: true,
        lastTestedAt: new Date().toISOString(),
      });

      const msg = tablesFound.length > 0
        ? `Successfully connected to Supabase! Detected ${tablesFound.length} initialized tables (${tablesFound.join(', ')}).`
        : `Connected to Supabase project, but tables are not yet initialized. Please run the SQL migration script from supabase/migrations/.`;

      return {
        success: true,
        message: msg,
        tablesFound,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to reach Supabase project. Please verify URL and Anon key.',
        tablesFound: [],
      };
    }
  }

  // --- PRODUCTS CRUD ---
  public async fetchProducts(): Promise<Product[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) return null;

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        category: row.category,
        categoryLabel: row.category_label,
        tagline: row.tagline,
        description: row.description,
        ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
        tasteProfile: row.taste_profile,
        healthBenefits: Array.isArray(row.health_benefits) ? row.health_benefits : [],
        sizes: Array.isArray(row.sizes) ? row.sizes : [],
        imageUrl: row.image_url,
        galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
        inStock: row.in_stock,
        featured: row.featured,
        badge: row.badge,
        rating: Number(row.rating) || 5.0,
        reviewCount: Number(row.review_count) || 0,
        isFlyerConfirmed: !!row.is_flyer_confirmed,
        displayOrder: Number(row.display_order) || 1,
      }));
    } catch (err) {
      console.warn('fetchProducts Supabase error:', err);
      return null;
    }
  }

  public async upsertProduct(product: Product): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const payload = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        category_label: product.categoryLabel,
        tagline: product.tagline,
        description: product.description,
        ingredients: product.ingredients,
        taste_profile: product.tasteProfile,
        health_benefits: product.healthBenefits,
        sizes: product.sizes,
        image_url: product.imageUrl,
        gallery_images: product.galleryImages || [],
        in_stock: product.inStock,
        featured: product.featured,
        badge: product.badge,
        rating: product.rating,
        review_count: product.reviewCount,
        is_flyer_confirmed: product.isFlyerConfirmed,
        display_order: product.displayOrder,
        updated_at: new Date().toISOString(),
      };
      const { error } = await client.from('products').upsert(payload);
      return !error;
    } catch (err) {
      console.warn('upsertProduct error:', err);
      return false;
    }
  }

  // --- STORAGE & ASSET UPLOAD ---
  public async uploadAsset(
    bucket: string,
    filePath: string,
    file: File | Blob
  ): Promise<{ url: string | null; error?: string }> {
    const client = this.getClient();
    if (!client) {
      return { url: null, error: 'Supabase client is not connected.' };
    }
    try {
      const { data, error } = await client.storage.from(bucket).upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      });
      if (error) {
        return { url: null, error: error.message };
      }
      const { data: publicData } = client.storage.from(bucket).getPublicUrl(data.path);
      return { url: publicData.publicUrl };
    } catch (err: any) {
      return { url: null, error: err.message || 'Failed to upload asset' };
    }
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('products').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.warn('deleteProduct error:', err);
      return false;
    }
  }

  // --- ORDERS ---
  public async fetchOrders(): Promise<Order[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        orderNumber: row.order_number,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone,
        deliveryMethod: row.delivery_method,
        deliveryAddress: row.delivery_address,
        deliveryDate: row.delivery_date,
        deliveryTimeSlot: row.delivery_time_slot,
        notes: row.notes,
        items: Array.isArray(row.items) ? row.items : [],
        subtotal: Number(row.subtotal),
        deliveryFee: Number(row.delivery_fee),
        total: Number(row.total),
        paymentMethod: row.payment_method,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.warn('fetchOrders Supabase error:', err);
      return null;
    }
  }

  public async insertOrder(order: Order): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('orders').insert([
        {
          id: order.id,
          order_number: order.orderNumber,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_phone: order.customerPhone,
          delivery_method: order.deliveryMethod,
          delivery_address: order.deliveryAddress,
          delivery_date: order.deliveryDate,
          delivery_time_slot: order.deliveryTimeSlot,
          notes: order.notes,
          items: order.items,
          subtotal: order.subtotal,
          delivery_fee: order.deliveryFee,
          total: order.total,
          payment_method: order.paymentMethod,
          status: order.status,
          created_at: order.createdAt,
          updated_at: order.updatedAt,
        },
      ]);
      return !error;
    } catch (err) {
      console.warn('insertOrder error:', err);
      return false;
    }
  }

  public async updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      return !error;
    } catch (err) {
      console.warn('updateOrderStatus error:', err);
      return false;
    }
  }

  // --- EVENT INQUIRIES ---
  public async fetchInquiries(): Promise<EventInquiry[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('event_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        eventType: row.event_type,
        eventDate: row.event_date,
        guestCount: Number(row.guest_count),
        eventLocation: row.event_location,
        bottleSizesNeeded: Array.isArray(row.bottle_sizes_needed) ? row.bottle_sizes_needed : [],
        selectedFlavors: Array.isArray(row.selected_flavors) ? row.selected_flavors : [],
        customLabelingNeeded: !!row.custom_labeling_needed,
        budgetRange: row.budget_range,
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('fetchInquiries Supabase error:', err);
      return null;
    }
  }

  public async insertInquiry(inquiry: EventInquiry): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('event_inquiries').insert([
        {
          id: inquiry.id,
          full_name: inquiry.fullName,
          email: inquiry.email,
          phone: inquiry.phone,
          event_type: inquiry.eventType,
          event_date: inquiry.eventDate,
          guest_count: inquiry.guestCount,
          event_location: inquiry.eventLocation,
          bottle_sizes_needed: inquiry.bottleSizesNeeded,
          selected_flavors: inquiry.selectedFlavors,
          custom_labeling_needed: inquiry.customLabelingNeeded,
          budget_range: inquiry.budgetRange,
          message: inquiry.message,
          status: inquiry.status,
          created_at: inquiry.createdAt,
        },
      ]);
      return !error;
    } catch (err) {
      console.warn('insertInquiry error:', err);
      return false;
    }
  }

  public async updateInquiryStatus(id: string, status: EventInquiry['status']): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client
        .from('event_inquiries')
        .update({ status })
        .eq('id', id);
      return !error;
    } catch (err) {
      console.warn('updateInquiryStatus error:', err);
      return false;
    }
  }

  // --- SITE CONTENT ---
  public async fetchSiteContent(): Promise<SiteContent | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('site_content')
        .select('*')
        .eq('key', 'main')
        .maybeSingle();

      if (error || !data) return null;

      return {
        businessName: data.business_name,
        ceoName: data.ceo_name,
        motto: data.motto,
        tagline: data.tagline,
        phone: data.phone,
        whatsappNumber: data.whatsapp_number,
        email: data.email,
        address: data.address,
        cityStateZip: data.city_state_zip,
        instagram: data.instagram,
        tiktok: data.tiktok,
        websiteDomain: data.website_domain,
        heroHeadline: data.hero_headline,
        heroSubheadline: data.hero_subheadline,
        announcementTicker: data.announcement_ticker,
        aboutStory: data.about_story,
        signaturePromise: data.signature_promise,
        freeDeliveryThreshold: Number(data.free_delivery_threshold) || 40.0,
        standardDeliveryFee: Number(data.standard_delivery_fee) || 4.99,
        pickupAddress: data.pickup_address,
        operatingHours: data.operating_hours,
        chatButtonLabel: data.chat_button_label || 'Chat with us',
        branding: data.branding || undefined,
        colors: data.colors || undefined,
        typography: data.typography || undefined,
        stripe: data.stripe || undefined,
      };
    } catch (err) {
      console.warn('fetchSiteContent Supabase error:', err);
      return null;
    }
  }

  public async upsertSiteContent(content: SiteContent): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const payload: any = {
        key: 'main',
        business_name: content.businessName,
        ceo_name: content.ceoName,
        motto: content.motto,
        tagline: content.tagline,
        phone: content.phone,
        whatsapp_number: content.whatsappNumber,
        email: content.email,
        address: content.address,
        city_state_zip: content.cityStateZip,
        instagram: content.instagram,
        tiktok: content.tiktok,
        website_domain: content.websiteDomain,
        hero_headline: content.heroHeadline,
        hero_subheadline: content.heroSubheadline,
        announcement_ticker: content.announcementTicker,
        about_story: content.aboutStory,
        signature_promise: content.signaturePromise,
        free_delivery_threshold: content.freeDeliveryThreshold,
        standard_delivery_fee: content.standardDeliveryFee,
        pickup_address: content.pickupAddress,
        operating_hours: content.operatingHours,
        chat_button_label: content.chatButtonLabel,
        branding: content.branding,
        colors: content.colors,
        typography: content.typography,
        stripe: content.stripe,
        updated_at: new Date().toISOString(),
      };
      const { error } = await client.from('site_content').upsert(payload);
      return !error;
    } catch (err) {
      console.warn('upsertSiteContent error:', err);
      return false;
    }
  }

  // --- NAVIGATION ---
  public async fetchNavigation(): Promise<NavItem[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('navigation_items')
        .select('*')
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) return null;

      return data.map((row: any) => ({
        id: row.id,
        label: row.label,
        href: row.href,
        visible: row.visible,
        order: row.order_index,
      }));
    } catch (err) {
      console.warn('fetchNavigation Supabase error:', err);
      return null;
    }
  }

  public async saveNavigation(items: NavItem[]): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const payload = items.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        visible: item.visible,
        order_index: item.order,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await client.from('navigation_items').upsert(payload);
      return !error;
    } catch (err) {
      console.warn('saveNavigation error:', err);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
