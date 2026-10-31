import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import {
  Product,
  Order,
  EventInquiry,
  SiteContent,
  NavItem,
  SupabaseConfig,
  HeroSlide,
  CmsPage,
} from '../types';

const LEGACY_LOCAL_CREDENTIAL_KEYS = [
  'delightful_juice_supabase_cfg_v1',
  'delightful_juice_admin_session_v1',
];

export interface LiveServerStatus {
  stripeConfigured: boolean;
  stripeWebhookConfigured: boolean;
}

class SupabaseService {
  private client: SupabaseClient | null = null;
  private currentSession: Session | null = null;
  private currentUser: User | null = null;
  private authInitialized = false;
  private authListeners: Set<(user: User | null, initialized: boolean) => void> = new Set();
  private realtimeListeners: Set<() => void> = new Set();
  private realtimeChannel: any = null;
  private activeClientKey = '';
  private runtimePublicConfig: {
    url: string;
    anonKey: string;
    stripeConfigured: boolean;
    stripeWebhookConfigured: boolean;
  } | null = null;
  private runtimeConfigPromise: Promise<boolean> | null = null;
  private lastTestedAt: string | undefined = undefined;
  private lastWriteError: string | null = null;

  constructor() {
    this.purgeLegacyLocalCredentials();
    this.init();
  }

  private purgeLegacyLocalCredentials() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    for (const key of LEGACY_LOCAL_CREDENTIAL_KEYS) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore storage access issues
      }
    }
  }

  public getLastWriteError(): string | null {
    return this.lastWriteError;
  }

  public getServerStatus(): LiveServerStatus {
    return {
      stripeConfigured: Boolean(this.runtimePublicConfig?.stripeConfigured),
      stripeWebhookConfigured: Boolean(this.runtimePublicConfig?.stripeWebhookConfigured),
    };
  }

  private recordError(context: string, error: any) {
    if (!error) {
      this.lastWriteError = null;
      return;
    }
    const msg = error?.message || error?.details || String(error);
    const code = error?.code ? ` (${error.code})` : '';
    this.lastWriteError = `${context}: ${msg}${code}`;
    console.warn(`[Supabase ${context}]`, error);
  }

  private getResolvedCredentials(): { url: string; anonKey: string } {
    const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
    const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();
    const runtimeUrl = (this.runtimePublicConfig?.url || '').trim();
    const runtimeKey = (this.runtimePublicConfig?.anonKey || '').trim();

    return {
      url: envUrl || runtimeUrl,
      anonKey: envKey || runtimeKey,
    };
  }

  public init() {
    const { url, anonKey } = this.getResolvedCredentials();
    if (url && anonKey) {
      const nextKey = `${url}::${anonKey}`;
      if (this.client && this.activeClientKey === nextKey) {
        return;
      }
      try {
        if (this.realtimeChannel && this.client) {
          try {
            this.client.removeChannel(this.realtimeChannel);
          } catch {
            // ignore cleanup error
          }
          this.realtimeChannel = null;
        }

        this.client = createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
        this.activeClientKey = nextKey;

        this.client.auth.onAuthStateChange((_event, session) => {
          this.currentSession = session;
          this.currentUser = session?.user || null;
          this.authInitialized = true;
          this.notifyAuthListeners();
        });

        this.client.auth
          .getSession()
          .then(({ data: { session } }) => {
            this.currentSession = session;
            this.currentUser = session?.user || null;
            this.authInitialized = true;
            this.notifyAuthListeners();
          })
          .catch((err) => {
            console.warn('Supabase getSession notice:', err);
            this.authInitialized = true;
            this.notifyAuthListeners();
          });

        this.setupRealtimeSubscription();
      } catch (err) {
        console.error('Failed to initialize live Supabase client:', err);
        this.client = null;
        this.activeClientKey = '';
        this.authInitialized = true;
        this.notifyAuthListeners();
      }
    } else {
      this.client = null;
      this.activeClientKey = '';
    }
  }

  private setupRealtimeSubscription() {
    if (!this.client) return;
    try {
      this.realtimeChannel = this.client
        .channel('delightful-public-cms-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, () =>
          this.notifyRealtimeListeners()
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () =>
          this.notifyRealtimeListeners()
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, () =>
          this.notifyRealtimeListeners()
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'navigation_items' }, () =>
          this.notifyRealtimeListeners()
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cms_pages' }, () =>
          this.notifyRealtimeListeners()
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () =>
          this.notifyRealtimeListeners()
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'event_inquiries' }, () =>
          this.notifyRealtimeListeners()
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription notice:', e);
    }
  }

  public subscribeRealtime(listener: () => void): () => void {
    this.realtimeListeners.add(listener);
    return () => {
      this.realtimeListeners.delete(listener);
    };
  }

  private notifyRealtimeListeners() {
    this.realtimeListeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error(e);
      }
    });
  }

  /**
   * Discovers live Supabase & Stripe readiness from /api/public-config on the live server.
   */
  public async ensurePublicConfig(forceRefresh = false): Promise<boolean> {
    if (!forceRefresh && this.runtimeConfigPromise) {
      return this.runtimeConfigPromise;
    }

    this.runtimeConfigPromise = (async () => {
      try {
        const res = await fetch('/api/public-config', { method: 'GET' });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            this.runtimePublicConfig = {
              url: data?.supabaseUrl || '',
              anonKey: data?.supabaseAnonKey || '',
              stripeConfigured: Boolean(data?.stripeConfigured),
              stripeWebhookConfigured: Boolean(data?.stripeWebhookConfigured),
            };
            this.init();
          }
        }
      } catch {
        // Ignore network transient errors if Vite build-time env vars already initialized client
      }
      if (!this.isConfigured() && !this.authInitialized) {
        this.authInitialized = true;
        this.notifyAuthListeners();
      }
      return this.isConfigured();
    })();

    return this.runtimeConfigPromise;
  }

  public getConfig(): SupabaseConfig {
    const { url, anonKey } = this.getResolvedCredentials();
    return {
      url,
      connected: Boolean(url && anonKey),
      lastTestedAt: this.lastTestedAt,
    };
  }

  public getClient(): SupabaseClient | null {
    if (!this.client) {
      this.init();
    }
    return this.client;
  }

  public isConfigured(): boolean {
    const { url, anonKey } = this.getResolvedCredentials();
    return Boolean(url && anonKey);
  }

  // --- AUTHENTICATION (STRICT LIVE SUPABASE AUTH ONLY) ---
  public subscribeAuth(listener: (user: User | null, initialized: boolean) => void): () => void {
    this.authListeners.add(listener);
    listener(this.currentUser, this.authInitialized);
    return () => {
      this.authListeners.delete(listener);
    };
  }

  private notifyAuthListeners() {
    this.authListeners.forEach((fn) => {
      try {
        fn(this.currentUser, this.authInitialized);
      } catch (e) {
        console.error(e);
      }
    });
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthInitialized(): boolean {
    return this.authInitialized;
  }

  public async signInWithEmail(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    if (!this.getClient()) {
      await this.ensurePublicConfig(true);
    }
    const client = this.getClient();
    if (!client) {
      return {
        success: false,
        error: 'Live Supabase environment variables are not configured on the server.',
      };
    }
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      this.currentUser = data.user;
      this.currentSession = data.session;
      this.authInitialized = true;
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

  // --- VERIFY LIVE CONNECTION & TABLE INSPECTION ---
  public async testConnection(): Promise<{
    success: boolean;
    message: string;
    tablesFound: string[];
  }> {
    if (!this.getClient()) {
      await this.ensurePublicConfig(true);
    }
    const client = this.getClient();
    if (!client) {
      return {
        success: false,
        message: 'Live Supabase environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are not configured.',
        tablesFound: [],
      };
    }

    try {
      const tablesFound: string[] = [];

      const { error: prodErr } = await client.from('products').select('id').limit(1);
      if (!prodErr) tablesFound.push('products');

      const { error: contentErr } = await client.from('site_content').select('key').limit(1);
      if (!contentErr) tablesFound.push('site_content');

      const { error: navErr } = await client.from('navigation_items').select('id').limit(1);
      if (!navErr) tablesFound.push('navigation_items');

      const { error: slideErr } = await client.from('hero_slides').select('id').limit(1);
      if (!slideErr) tablesFound.push('hero_slides');

      const { error: pageErr } = await client.from('cms_pages').select('id').limit(1);
      if (!pageErr) tablesFound.push('cms_pages');

      const { error: ordErr } = await client.from('orders').select('id').limit(1);
      if (!ordErr || ordErr.code === 'PGRST116' || ordErr.message.includes('permission denied')) {
        tablesFound.push('orders');
      }

      const { error: inqErr } = await client.from('event_inquiries').select('id').limit(1);
      if (!inqErr || inqErr.code === 'PGRST116' || inqErr.message.includes('permission denied')) {
        tablesFound.push('event_inquiries');
      }

      this.lastTestedAt = new Date().toISOString();

      const msg =
        tablesFound.length > 0
          ? `Live Supabase verified! Active tables (${tablesFound.length}/7): ${tablesFound.join(', ')}.`
          : `Connected to live Supabase instance, but tables are not yet initialized. Run the SQL migration script below.`;

      return {
        success: true,
        message: msg,
        tablesFound,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to reach live Supabase database.',
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

      if (error || !data) return null;

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
      this.recordError('upsertProduct', error);
      return !error;
    } catch (err) {
      this.recordError('upsertProduct', err);
      return false;
    }
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('products').delete().eq('id', id);
      this.recordError('deleteProduct', error);
      return !error;
    } catch (err) {
      this.recordError('deleteProduct', err);
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
      return { url: null, error: 'Live Supabase client is not connected.' };
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
      return { url: null, error: err.message || 'Failed to upload asset to live storage' };
    }
  }

  // --- HERO SLIDES CRUD ---
  public async fetchHeroSlides(): Promise<HeroSlide[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data) return null;

      return data.map((row: any) => {
        const isSlideActive =
          row.active !== undefined ? row.active !== false : row.enabled !== false;
        return {
          id: row.id,
          heading: row.heading,
          subheading: row.subheading || '',
          kicker: row.kicker || undefined,
          ctaLabel: row.cta_label || 'Shop Now',
          ctaUrl: row.cta_url || '/shop',
          secondaryCtaLabel: row.secondary_cta_label || undefined,
          secondaryCtaUrl: row.secondary_cta_url || undefined,
          desktopImageUrl: row.desktop_image_url,
          mobileImageUrl: row.mobile_image_url || undefined,
          overlayOpacity: Number(row.overlay_opacity) || 0.55,
          displayOrder: Number(row.display_order) || 1,
          active: isSlideActive,
          enabled: isSlideActive,
          updatedAt: row.updated_at,
        };
      });
    } catch (err) {
      console.warn('fetchHeroSlides error:', err);
      return null;
    }
  }

  private buildHeroSlideBaseRow(slide: HeroSlide) {
    return {
      id: slide.id,
      heading: slide.heading,
      subheading: slide.subheading || '',
      kicker: slide.kicker || '',
      cta_label: slide.ctaLabel || 'Shop Now',
      cta_url: slide.ctaUrl || '/shop',
      secondary_cta_label: slide.secondaryCtaLabel || '',
      secondary_cta_url: slide.secondaryCtaUrl || '',
      desktop_image_url: slide.desktopImageUrl,
      mobile_image_url: slide.mobileImageUrl || '',
      overlay_opacity: slide.overlayOpacity ?? 0.52,
      display_order: slide.displayOrder,
      updated_at: new Date().toISOString(),
    };
  }

  private async upsertHeroRowsCompat(slides: HeroSlide[]): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    const withBoth = slides.map((s) => {
      const isAct = s.active ?? s.enabled ?? true;
      return {
        ...this.buildHeroSlideBaseRow(s),
        active: isAct,
        enabled: isAct,
      };
    });

    const { error: bothErr } = await client.from('hero_slides').upsert(withBoth);
    if (!bothErr) {
      this.lastWriteError = null;
      return true;
    }

    const msg = (bothErr.message || '').toLowerCase();
    if (msg.includes('enabled') || bothErr.code === 'PGRST204') {
      const withActiveOnly = slides.map((s) => ({
        ...this.buildHeroSlideBaseRow(s),
        active: s.active ?? s.enabled ?? true,
      }));
      const { error: activeErr } = await client.from('hero_slides').upsert(withActiveOnly);
      if (!activeErr) {
        this.lastWriteError = null;
        return true;
      }
      const activeErrMsg = (activeErr.message || '').toLowerCase();
      if (activeErrMsg.includes('active') || activeErr.code === 'PGRST204') {
        const withEnabledOnly = slides.map((s) => ({
          ...this.buildHeroSlideBaseRow(s),
          enabled: s.active ?? s.enabled ?? true,
        }));
        const { error: enabledErr } = await client.from('hero_slides').upsert(withEnabledOnly);
        this.recordError('hero_slides upsert', enabledErr);
        return !enabledErr;
      }
      this.recordError('hero_slides upsert', activeErr);
      return false;
    }

    if (msg.includes('active')) {
      const withEnabledOnly = slides.map((s) => ({
        ...this.buildHeroSlideBaseRow(s),
        enabled: s.active ?? s.enabled ?? true,
      }));
      const { error: enabledErr } = await client.from('hero_slides').upsert(withEnabledOnly);
      this.recordError('hero_slides upsert', enabledErr);
      return !enabledErr;
    }

    this.recordError('hero_slides upsert', bothErr);
    return false;
  }

  public async upsertHeroSlide(slide: HeroSlide): Promise<boolean> {
    try {
      return await this.upsertHeroRowsCompat([slide]);
    } catch (err) {
      this.recordError('upsertHeroSlide', err);
      return false;
    }
  }

  public async saveAllHeroSlides(slides: HeroSlide[]): Promise<boolean> {
    try {
      return await this.upsertHeroRowsCompat(slides);
    } catch (err) {
      this.recordError('saveAllHeroSlides', err);
      return false;
    }
  }

  public async deleteHeroSlide(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('hero_slides').delete().eq('id', id);
      this.recordError('deleteHeroSlide', error);
      return !error;
    } catch (err) {
      this.recordError('deleteHeroSlide', err);
      return false;
    }
  }

  // --- DYNAMIC CMS PAGES CRUD ---
  public async fetchCmsPages(): Promise<CmsPage[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('cms_pages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data) return null;

      return data.map((row: any) => {
        const parentNav = row.parent_nav_id ?? row.nav_parent_id ?? null;
        return {
          id: row.id,
          title: row.title,
          slug: row.slug,
          status: row.status === 'draft' ? 'draft' : 'published',
          seoTitle: row.seo_title || undefined,
          metaDescription: row.meta_description || undefined,
          showInNav: !!row.show_in_nav,
          parentNavId: parentNav,
          navParentId: parentNav,
          navLabel: row.nav_label || undefined,
          isSystemRoute: !!row.is_system_route,
          sections: Array.isArray(row.sections) ? row.sections : [],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      });
    } catch (err) {
      console.warn('fetchCmsPages error:', err);
      return null;
    }
  }

  public async upsertCmsPage(page: CmsPage): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const parentVal = page.parentNavId ?? page.navParentId ?? null;
      const basePayload = {
        id: page.id,
        title: page.title,
        slug: page.slug,
        status: page.status,
        seo_title: page.seoTitle || '',
        meta_description: page.metaDescription || '',
        show_in_nav: page.showInNav,
        sections: page.sections,
        created_at: page.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const fullPayload = {
        ...basePayload,
        nav_parent_id: parentVal,
        nav_label: page.navLabel || null,
        is_system_route: !!page.isSystemRoute,
      };

      const { error } = await client.from('cms_pages').upsert(fullPayload);
      if (!error) {
        this.lastWriteError = null;
        return true;
      }

      if (error.code === 'PGRST204' || (error.message || '').includes('column')) {
        const altPayload = {
          ...basePayload,
          parent_nav_id: parentVal,
        };
        const { error: altErr } = await client.from('cms_pages').upsert(altPayload);
        this.recordError('upsertCmsPage', altErr);
        return !altErr;
      }

      this.recordError('upsertCmsPage', error);
      return false;
    } catch (err) {
      this.recordError('upsertCmsPage', err);
      return false;
    }
  }

  public async deleteCmsPage(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('cms_pages').delete().eq('id', id);
      this.recordError('deleteCmsPage', error);
      return !error;
    } catch (err) {
      this.recordError('deleteCmsPage', err);
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
        paymentStatus: row.payment_status || undefined,
        stripeSessionId: row.stripe_session_id || undefined,
        stripePaymentIntentId: row.stripe_payment_intent_id || undefined,
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
    if (!this.getClient()) {
      await this.ensurePublicConfig();
    }
    const client = this.getClient();
    if (!client) return false;
    try {
      const baseRow = {
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
      };

      const { error } = await client.from('orders').insert([baseRow]);
      if (!error) return true;

      // Compatibility fallback if legacy orders_payment_method_check constraint hasn't been dropped yet
      if (
        order.paymentMethod === 'stripe_card' &&
        (error.code === '23514' || (error.message || '').includes('payment_method'))
      ) {
        const compatRow = {
          ...baseRow,
          payment_method: 'card_at_pickup',
          notes: order.notes ? `${order.notes} [Stripe Card]` : '[Stripe Card]',
        };
        const { error: retryErr } = await client.from('orders').insert([compatRow]);
        return !retryErr;
      }

      console.warn('insertOrder error:', error);
      return false;
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
      this.recordError('updateOrderStatus', error);
      return !error;
    } catch (err) {
      this.recordError('updateOrderStatus', err);
      return false;
    }
  }

  public async deleteOrder(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('orders').delete().eq('id', id);
      this.recordError('deleteOrder', error);
      return !error;
    } catch (err) {
      this.recordError('deleteOrder', err);
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
    if (!this.getClient()) {
      await this.ensurePublicConfig();
    }
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
      this.recordError('updateInquiryStatus', error);
      return !error;
    } catch (err) {
      this.recordError('updateInquiryStatus', err);
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
        chatButtonLabel: data.chat_button_label || 'Chat with Kitchen',
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
      this.recordError('upsertSiteContent', error);
      return !error;
    } catch (err) {
      this.recordError('upsertSiteContent', err);
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

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        label: row.label,
        href: row.href,
        visible: row.visible,
        order: row.order_index,
        parentId: row.parent_id || null,
        isDropdown: !!row.is_dropdown,
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
        parent_id: item.parentId || null,
        is_dropdown: !!item.isDropdown,
        updated_at: new Date().toISOString(),
      }));

      let upsertOk = false;
      const { error } = await client.from('navigation_items').upsert(payload);
      if (!error) {
        upsertOk = true;
        this.lastWriteError = null;
      } else if (
        error.code === 'PGRST204' ||
        (error.message || '').includes('parent_id') ||
        (error.message || '').includes('is_dropdown')
      ) {
        const legacyPayload = items.map((item) => ({
          id: item.id,
          label: item.label,
          href: item.href,
          visible: item.visible,
          order_index: item.order,
          updated_at: new Date().toISOString(),
        }));
        const { error: legacyErr } = await client.from('navigation_items').upsert(legacyPayload);
        this.recordError('saveNavigation', legacyErr);
        upsertOk = !legacyErr;
      } else {
        this.recordError('saveNavigation', error);
        return false;
      }

      if (upsertOk && items.length > 0) {
        const keepIds = new Set(items.map((i) => i.id));
        const { data: existingRows } = await client.from('navigation_items').select('id');
        if (existingRows && existingRows.length > 0) {
          const staleIds = existingRows
            .map((r: any) => String(r.id))
            .filter((existingId) => !keepIds.has(existingId));
          if (staleIds.length > 0) {
            await client.from('navigation_items').delete().in('id', staleIds);
          }
        }
      }

      return upsertOk;
    } catch (err) {
      this.recordError('saveNavigation', err);
      return false;
    }
  }

  public async deleteNavigationItem(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('navigation_items').delete().eq('id', id);
      this.recordError('deleteNavigationItem', error);
      return !error;
    } catch (err) {
      this.recordError('deleteNavigationItem', err);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
