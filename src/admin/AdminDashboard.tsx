import React, { useState, useEffect } from 'react';
import { 
  Product, 
  Order, 
  EventInquiry, 
  SiteContent, 
  NavItem, 
  SizeOption,
  MeasurementUnit,
  HeroSlide,
  CmsPage,
  SupabaseConfig,
  ColorThemeSettings,
  BrandSettings,
  AboutShowcaseSettings,
  StripePaymentSettings
} from '../types';
import {
  dataRepo,
  SUPABASE_SQL_MIGRATION,
  DEFAULT_ABOUT_SHOWCASE,
} from '../lib/storage';
import { supabaseService } from '../lib/supabaseClient';
import { applyTheme, DEFAULT_COLORS, DEFAULT_TYPOGRAPHY } from '../lib/theme';
import { getCustomerSizeDisplay, formatBottleCodeToOz } from '../lib/units';
import { HeroSliderManager } from './HeroSliderManager';
import { PagesManager } from './PagesManager';
import { NavigationManager } from './NavigationManager';
import { 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Calendar, 
  FileText, 
  Navigation, 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ArrowLeft, 
  ExternalLink,
  MessageCircle,
  Copy,
  Save,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Palette,
  Image as ImageIcon,
  CreditCard,
  Upload,
  CheckCircle2,
  Eye,
  RefreshCw,
  Sliders,
  DollarSign,
  HelpCircle,
  Layers,
  Monitor
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
  onNavigate?: (href: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => dataRepo.isAdminLoggedIn());
  const [isAuthReady, setIsAuthReady] = useState<boolean>(() => supabaseService.isAuthInitialized());
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<
    'overview' | 'hero_slider' | 'pages' | 'branding' | 'appearance' | 'products' | 'orders' | 'inquiries' | 'stripe' | 'content' | 'nav' | 'supabase'
  >('overview');

  // Repositories state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<EventInquiry[]>([]);
  const [content, setContent] = useState<SiteContent>(dataRepo.getContent());
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [cmsPages, setCmsPages] = useState<CmsPage[]>([]);
  const [supabaseCfg, setSupabaseCfg] = useState<SupabaseConfig>(dataRepo.getSupabaseConfig());
  const [supabaseUserEmail, setSupabaseUserEmail] = useState<string | null>(
    () => supabaseService.getCurrentUser()?.email || null
  );
  const [serverStatus, setServerStatus] = useState(() => supabaseService.getServerStatus());
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);

  // Modals & form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [confirmDeleteProdId, setConfirmDeleteProdId] = useState<string | null>(null);

  // Stripe test endpoint state
  const [isTestingStripe, setIsTestingStripe] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Subscribe to live repository & Supabase Auth changes
  useEffect(() => {
    const refreshData = () => {
      setProducts(dataRepo.getProducts());
      setOrders(dataRepo.getOrders());
      setInquiries(dataRepo.getInquiries());
      setContent(dataRepo.getContent());
      setNavItems(dataRepo.getNavItems());
      setHeroSlides(dataRepo.getHeroSlides());
      setCmsPages(dataRepo.getPages());
      setSupabaseCfg(dataRepo.getSupabaseConfig());
      setServerStatus(supabaseService.getServerStatus());
    };
    refreshData();

    supabaseService.ensurePublicConfig(true).then(() => {
      setSupabaseCfg(dataRepo.getSupabaseConfig());
      setServerStatus(supabaseService.getServerStatus());
    });

    const unsubscribe = dataRepo.subscribe(refreshData);
    const unsubscribeAuth = supabaseService.subscribeAuth((user, initialized) => {
      setSupabaseUserEmail(user?.email || null);
      setIsAuthenticated(Boolean(user));
      setIsAuthReady(initialized);
    });
    return () => {
      unsubscribe();
      unsubscribeAuth();
    };
  }, []);

  const showToast = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => setSaveSuccessNotice(null), 4200);
  };

  const handlePersistContent = async (targetContent: SiteContent, successMessage: string) => {
    const res = await dataRepo.saveContent(targetContent);
    if (res.synced) {
      showToast(successMessage);
    } else {
      showToast(`Unable to save to live database: ${res.error}`);
    }
  };

  const handleRefreshLiveData = async () => {
    setIsRefreshingLive(true);
    await supabaseService.ensurePublicConfig(true);
    await dataRepo.syncFromSupabase();
    setServerStatus(supabaseService.getServerStatus());
    setIsRefreshingLive(false);
    showToast('Synced latest records from live Supabase database!');
  };

  const handleLogout = async () => {
    await dataRepo.adminLogout();
    setIsAuthenticated(false);
  };

  // Calculations for KPI cards
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;
  const newInquiriesCount = inquiries.filter((i) => i.status === 'new').length;

  // Product save handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const res = await dataRepo.updateProduct(editingProduct);
    if (!res.synced) {
      showToast(`Could not publish "${editingProduct.name}" to live database: ${res.error}`);
      return;
    }
    const savedName = editingProduct.name;
    setEditingProduct(null);
    setIsAddingProduct(false);
    showToast(`Drink "${savedName}" published to live database!`);
  };

  const handleNewProductInit = () => {
    const newId = 'prod-' + Date.now();
    const newP: Product = {
      id: newId,
      name: 'New Seasonal Juice',
      slug: 'new-seasonal-juice-' + Date.now(),
      category: 'ginger',
      categoryLabel: 'Ginger Elixirs',
      tagline: 'Freshly pressed cold drink with botanicals',
      description: 'Crafted in small batches by Delightful Juices with natural organic fruits and cold-pressed botanicals.',
      ingredients: ['Cold-Pressed Ginger', 'Fresh Citrus', 'Organic Botanicals'],
      tasteProfile: 'Zesty, crisp and balanced sweetness',
      healthBenefits: ['Natural immune support', 'Revitalizing enzymes'],
      sizes: [
        { size: '11.8 oz', label: '11.8 oz Pocket Sip', price: 5.50, quantityValue: 11.8, unit: 'oz' },
        { size: '16.9 oz', label: '16.9 oz Daily Refresh', price: 7.50, quantityValue: 16.9, unit: 'oz' },
        { size: '33.8 oz', label: '33.8 oz Family Jug', price: 14.00, quantityValue: 33.8, unit: 'oz' },
      ],
      imageUrl: '',
      galleryImages: [],
      inStock: true,
      featured: false,
      badge: 'New Arrival',
      rating: 5.0,
      reviewCount: 1,
      isFlyerConfirmed: true,
      displayOrder: products.length + 1,
    };
    setEditingProduct(newP);
    setIsAddingProduct(true);
  };

  // Upload Logo file handler (strictly live Supabase Storage)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo file exceeds 5MB limit. Please upload an image under 5MB.');
      return;
    }

    const ext = file.name.split('.').pop() || 'png';
    const path = `logos/${Date.now()}-${isMobile ? 'mobile' : 'desktop'}.${ext}`;
    const res = await supabaseService.uploadAsset('delightful_assets', path, file);
    if (res.url) {
      const updatedBranding: BrandSettings = {
        ...(content.branding || { logoText: 'Delightful Juices', showLogoIcon: true }),
        [isMobile ? 'mobileLogoUrl' : 'logoUrl']: res.url,
      };
      const updatedContent = { ...content, branding: updatedBranding };
      setContent(updatedContent);
      await handlePersistContent(updatedContent, 'Logo uploaded to live Supabase Storage and published!');
    } else {
      showToast(`Logo upload failed: ${res.error || 'Ensure delightful_assets bucket is active in Supabase.'}`);
    }
  };

  const currentShowcase: AboutShowcaseSettings = {
    ...DEFAULT_ABOUT_SHOWCASE,
    ...(content.branding?.aboutShowcase || {}),
  };

  const updateAboutShowcase = (patch: Partial<AboutShowcaseSettings>, autoSave = false) => {
    const nextShowcase: AboutShowcaseSettings = {
      ...currentShowcase,
      ...patch,
    };
    const updatedBranding: BrandSettings = {
      ...(content.branding || { logoText: 'Delightful Juices', showLogoIcon: true }),
      aboutShowcase: nextShowcase,
    };
    const updatedContent: SiteContent = {
      ...content,
      branding: updatedBranding,
    };
    setContent(updatedContent);
    if (autoSave) {
      handlePersistContent(updatedContent, 'Showcase updated in live Supabase database!');
    }
  };

  const handleAboutShowcaseUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: 'imageUrl' | 'ceoAvatarUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file exceeds 5MB limit. Please choose an image under 5MB.');
      return;
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `about/${targetField}-${Date.now()}.${ext}`;
    const res = await supabaseService.uploadAsset('delightful_assets', path, file);
    if (res.url) {
      updateAboutShowcase({ [targetField]: res.url }, true);
    } else {
      showToast(`Showcase image upload failed: ${res.error || 'Check Supabase Storage policies.'}`);
    }
  };

  // Upload Product Image file handler (strictly live Supabase Storage)
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file exceeds 5MB limit.');
      return;
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `products/${editingProduct.slug || 'drink'}-${Date.now()}.${ext}`;
    const res = await supabaseService.uploadAsset('delightful_assets', path, file);
    if (res.url) {
      if (isGallery) {
        const current = editingProduct.galleryImages || [];
        setEditingProduct({ ...editingProduct, galleryImages: [...current, res.url] });
      } else {
        setEditingProduct({ ...editingProduct, imageUrl: res.url });
      }
      showToast('Product image uploaded to live Supabase Storage!');
    } else {
      showToast(`Product image upload failed: ${res.error || 'Check Supabase Storage policies.'}`);
    }
  };

  // Test Live Supabase Connection
  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSyncStatusMsg(null);
    const res = await dataRepo.testSupabaseConnection();
    setIsTestingSupabase(false);
    setSyncStatusMsg({
      text: res.message,
      success: res.success,
    });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_MIGRATION);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const [supabaseEmail, setSupabaseEmail] = useState('');
  const [supabasePass, setSupabasePass] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Seed Supabase state
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    const res = await dataRepo.adminLoginWithSupabase(supabaseEmail, supabasePass);
    setIsLoggingIn(false);
    if (res.success) {
      setIsAuthenticated(true);
    } else {
      setLoginError(res.error || 'Failed to authenticate via live Supabase Auth.');
    }
  };

  // 1-Click Sync & Repair Live Supabase Tables
  const handleSeedSupabase = async () => {
    if (!supabaseUserEmail) {
      setSeedResult(
        'Action needed: Please sign in with your Supabase Admin Email & Password so Row Level Security authorizes live database writes.'
      );
      return;
    }

    setIsSeeding(true);
    setSeedResult(null);
    try {
      const failedTables: string[] = [];

      let prodOk = true;
      for (const p of products) {
        const ok = await supabaseService.upsertProduct(p);
        if (!ok) prodOk = false;
      }
      if (!prodOk) failedTables.push('products');

      const contentOk = await supabaseService.upsertSiteContent(content);
      if (!contentOk) failedTables.push('site_content');

      const navOk = await supabaseService.saveNavigation(navItems);
      if (!navOk) failedTables.push('navigation_items');

      const slidesOk = await supabaseService.saveAllHeroSlides(heroSlides);
      if (!slidesOk) failedTables.push('hero_slides');

      let pagesOk = true;
      for (const pg of cmsPages) {
        const ok = await supabaseService.upsertCmsPage(pg);
        if (!ok) pagesOk = false;
      }
      if (!pagesOk) failedTables.push('cms_pages');

      setIsSeeding(false);
      if (failedTables.length === 0) {
        setSeedResult(
          'Successfully synced all drinks, site copy, clean dropdown navigation, hero slides, and CMS pages to your live Supabase database!'
        );
      } else {
        setSeedResult(
          `Partial sync: failed on [${failedTables.join(', ')}] — ${
            supabaseService.getLastWriteError() || 'Please copy and run the updated Schema Migration SQL below.'
          }`
        );
      }
      await handleTestSupabase();
    } catch (err: any) {
      setIsSeeding(false);
      setSeedResult(`Seeding notice: ${err.message || 'Check table schema'}`);
    }
  };

  // Test Stripe Endpoint
  const handleTestStripeEndpoint = async () => {
    setIsTestingStripe(true);
    setStripeTestResult(null);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'test-' + Date.now(),
          orderNumber: 'DJ-TEST',
          items: [{ productName: 'Zobo Test Sip', size: '11.8 oz', unitPrice: 5.50, quantity: 1 }],
          customerEmail: 'test@delightfuljuices.com',
          customerName: 'Test Customer',
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setStripeTestResult({
          success: true,
          message: `Stripe integration verified! Successfully created live checkout session (ID: ${data.sessionId}).`,
        });
      } else if (data.error === 'STRIPE_NOT_CONFIGURED') {
        setStripeTestResult({
          success: false,
          message: 'Server endpoint reached, but STRIPE_SECRET_KEY is not yet added in your Vercel Project Environment Variables.',
        });
      } else {
        setStripeTestResult({
          success: false,
          message: data.message || data.error || 'Server responded with an error.',
        });
      }
    } catch (err: any) {
      setStripeTestResult({
        success: false,
        message: 'Endpoint /api/create-checkout-session could not be reached. Ensure Vercel or local API server is active.',
      });
    } finally {
      setIsTestingStripe(false);
    }
  };

  // Wait briefly for live Supabase Auth session check before showing login prompt
  if (!isAuthReady) {
    return (
      <div className="fixed inset-0 z-50 bg-[#12351F] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-[#E1AD01] text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-[#1B4D2E] animate-spin mx-auto" />
          <div className="font-display font-bold text-lg text-[#1B4D2E]">
            Verifying Live Admin Session...
          </div>
        </div>
      </div>
    );
  }

  // Live Supabase Auth Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#12351F] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-[#E1AD01] text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div>
            <h2 className="font-display font-black text-2xl text-[#1B4D2E]">
              Delightful Juices Admin
            </h2>
            <p className="text-xs text-[#1B4D2E]/70 mt-1">
              Live Cloud CMS &amp; Store Management Portal
            </p>
          </div>

          <form onSubmit={handleSupabaseLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={supabaseEmail}
                onChange={(e) => setSupabaseEmail(e.target.value)}
                placeholder="admin@delightfuljuices.com"
                className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E] focus:ring-2 focus:ring-[#E1AD01] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={supabasePass}
                onChange={(e) => setSupabasePass(e.target.value)}
                placeholder="Enter your Supabase Auth password"
                className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E] focus:ring-2 focus:ring-[#E1AD01] focus:outline-hidden"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center space-x-3">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="flex-1 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                {isLoggingIn ? 'Signing In...' : 'Sign In to Live Portal'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Exit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F4E8CB] flex flex-col overflow-hidden text-[#1B4D2E]">
      
      {/* Toast Notification */}
      {saveSuccessNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-70 bg-[#1B4D2E] text-[#FFF8E7] px-6 py-3 rounded-2xl shadow-2xl border-2 border-[#E1AD01] text-xs sm:text-sm font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#E1AD01]" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <div className="bg-[#1B4D2E] text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[#E1AD01]/40 shrink-0 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#E1AD01] text-[#1B4D2E] flex items-center justify-center font-black text-sm shadow-xs">
            DJ
          </div>
          <div>
            <div className="font-display font-extrabold text-base text-[#FFF8E7] flex items-center space-x-2">
              <span>Delightful Juices Admin</span>
              <span className="text-[10px] bg-[#E1AD01] text-[#1B4D2E] font-black px-2 py-0.5 rounded-full uppercase">
                Live CMS
              </span>
            </div>
            <div className="text-[10px] text-[#FFF8E7]/70">
              {supabaseUserEmail ? `Signed in as ${supabaseUserEmail}` : `Quakertown Kitchen Operations • C.E.O. ${content.ceoName}`}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Live Supabase status indicator */}
          <div 
            onClick={() => setActiveTab('supabase')} 
            className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border border-white/20 bg-white/10 hover:bg-white/20"
          >
            <span className={`w-2 h-2 rounded-full ${supabaseCfg.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{supabaseCfg.connected ? 'Live Cloud Connected' : 'Connecting...'}</span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="View Public Store"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-red-600/80 hover:bg-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Admin Workspace (Sidebar + Content Body) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-20 md:w-64 bg-white border-r border-[#1B4D2E]/10 flex flex-col justify-between shrink-0 overflow-y-auto">
          <nav className="p-3 md:p-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5 shrink-0 text-[#E1AD01]" />
              <span className="hidden md:inline">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('hero_slider')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'hero_slider'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Monitor className="w-4.5 h-4.5 shrink-0 text-[#E1AD01]" />
                <span className="hidden md:inline">Hero Slider</span>
              </div>
              <span className="hidden md:inline text-[11px] bg-gray-100 text-[#1B4D2E] font-bold px-2 py-0.5 rounded-full">
                {heroSlides.filter((s) => s.active !== false).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pages')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'pages'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Layers className="w-4.5 h-4.5 shrink-0 text-[#E1AD01]" />
                <span className="hidden md:inline">Pages Builder</span>
              </div>
              <span className="hidden md:inline text-[11px] bg-gray-100 text-[#1B4D2E] font-bold px-2 py-0.5 rounded-full">
                {cmsPages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'branding'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <ImageIcon className="w-4.5 h-4.5 shrink-0 text-[#E1AD01]" />
              <span className="hidden md:inline">Branding & Logo</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'appearance'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <Palette className="w-4.5 h-4.5 shrink-0 text-[#E1AD01]" />
              <span className="hidden md:inline">Colours & Theme</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Package className="w-4.5 h-4.5 shrink-0 text-[#E1AD01]" />
                <span className="hidden md:inline">Juice Drinks</span>
              </div>
              <span className="hidden md:inline text-[11px] bg-gray-100 text-[#1B4D2E] font-bold px-2 py-0.5 rounded-full">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-4.5 h-4.5 shrink-0 text-[#E1AD01]" />
                <span className="hidden md:inline">Customer Orders</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="hidden md:inline text-[11px] bg-[#E1AD01] text-[#1B4D2E] font-extrabold px-2 py-0.5 rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-4.5 h-4.5 shrink-0 text-[#E1AD01]" />
                <span className="hidden md:inline">Event Catering</span>
              </div>
              {newInquiriesCount > 0 && (
                <span className="hidden md:inline text-[11px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                  {newInquiriesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('stripe')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'stripe'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <CreditCard className="w-4.5 h-4.5 shrink-0 text-[#E1AD01]" />
              <span className="hidden md:inline">Stripe Payment</span>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <FileText className="w-4.5 h-4.5 shrink-0 text-[#E1AD01]" />
              <span className="hidden md:inline">Website Content</span>
            </button>

            <button
              onClick={() => setActiveTab('nav')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'nav'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <Navigation className="w-4.5 h-4.5 shrink-0 text-[#E1AD01]" />
              <span className="hidden md:inline">Menu Navigation</span>
            </button>

            <button
              onClick={() => setActiveTab('supabase')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'supabase'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <Database className="w-4.5 h-4.5 shrink-0 text-[#E1AD01]" />
              <span className="hidden md:inline">Supabase Database</span>
            </button>
          </nav>

          <div className="p-3 md:p-4 border-t border-[#1B4D2E]/10 space-y-2">
            <button
              onClick={handleRefreshLiveData}
              disabled={isRefreshingLive}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-2 text-[11px] font-semibold text-[#1B4D2E]/80 hover:text-[#1B4D2E] hover:bg-[#FFF8E7] rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLive ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">
                {isRefreshingLive ? 'Syncing Live DB...' : 'Refresh Live Data'}
              </span>
            </button>
          </div>
        </aside>

        {/* Content View Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                  Business Overview
                </h2>
                <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                  Real-time metrics from your Quakertown store database
                </p>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#1B4D2E]/10 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#1B4D2E]/70 font-semibold mb-1">
                    <span>Total Sales</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-display font-extrabold text-2xl text-[#1B4D2E]">
                    ${totalRevenue.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                    {orders.length} orders recorded
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#1B4D2E]/10 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#1B4D2E]/70 font-semibold mb-1">
                    <span>Pending Orders</span>
                    <ShoppingBag className="w-4 h-4 text-[#E1AD01]" />
                  </div>
                  <div className="font-display font-extrabold text-2xl text-[#1B4D2E]">
                    {pendingOrdersCount}
                  </div>
                  <div className="text-[11px] text-[#1B4D2E]/70 mt-1">
                    Requires packaging or delivery
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#1B4D2E]/10 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#1B4D2E]/70 font-semibold mb-1">
                    <span>Catering Inquiries</span>
                    <Calendar className="w-4 h-4 text-[#1B4D2E]" />
                  </div>
                  <div className="font-display font-extrabold text-2xl text-[#1B4D2E]">
                    {inquiries.length}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                    {newInquiriesCount} new event requests
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#1B4D2E]/10 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#1B4D2E]/70 font-semibold mb-1">
                    <span>Active Drinks</span>
                    <Package className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-display font-extrabold text-2xl text-[#1B4D2E]">
                    {products.filter((p) => p.inStock).length} / {products.length}
                  </div>
                  <div className="text-[11px] text-[#1B4D2E]/70 mt-1">
                    All sizes in oz (11.8, 16.9, 33.8 oz)
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Orders Table */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recent Orders List */}
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#1B4D2E]/10 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
                      Recent Customer Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#E1AD01] bg-[#1B4D2E] px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      View All Orders
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FFF8E7] text-[#1B4D2E]/70 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="p-3">Order</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Items</th>
                          <th className="p-3">Total</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-[#FFF8E7]/50">
                            <td className="p-3 font-mono font-bold text-[#1B4D2E]">{ord.orderNumber}</td>
                            <td className="p-3">
                              <div className="font-bold text-[#1B4D2E]">{ord.customerName}</div>
                              <div className="text-[10px] text-gray-500">{ord.customerPhone}</div>
                            </td>
                            <td className="p-3 text-[11px]">
                              {ord.items.map((i) => `${i.quantity}x ${i.productName} (${formatBottleCodeToOz(i.size)})`).join(', ')}
                            </td>
                            <td className="p-3 font-extrabold text-[#1B4D2E]">${ord.total.toFixed(2)}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  ord.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.status === 'preparing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Quick Action Hub */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-[#1B4D2E] text-white p-6 rounded-3xl shadow-sm border border-[#E1AD01]/30 space-y-4">
                    <h3 className="font-display font-bold text-lg text-[#E1AD01]">
                      Quick Management Hub
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab('hero_slider')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#143822] hover:bg-[#0e2717] border border-[#E1AD01]/20 text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Monitor className="w-4 h-4 text-[#E1AD01]" />
                          <span>Manage Hero Slider</span>
                        </div>
                        <span>→</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('pages')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#143822] hover:bg-[#0e2717] border border-[#E1AD01]/20 text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Layers className="w-4 h-4 text-[#E1AD01]" />
                          <span>Create & Edit Pages</span>
                        </div>
                        <span>→</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('content')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#143822] hover:bg-[#0e2717] border border-[#E1AD01]/20 text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-[#E1AD01]" />
                          <span>Edit Craft Showcase &amp; Copy</span>
                        </div>
                        <span>→</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('branding')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#143822] hover:bg-[#0e2717] border border-[#E1AD01]/20 text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="w-4 h-4 text-[#E1AD01]" />
                          <span>Customize Website Logo</span>
                        </div>
                        <span>→</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('appearance')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#143822] hover:bg-[#0e2717] border border-[#E1AD01]/20 text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Palette className="w-4 h-4 text-[#E1AD01]" />
                          <span>Customize Brand Palette</span>
                        </div>
                        <span>→</span>
                      </button>

                      <button
                        onClick={handleNewProductInit}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#143822] hover:bg-[#0e2717] border border-[#E1AD01]/20 text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4 text-[#E1AD01]" />
                          <span>Add New Drink Recipe</span>
                        </div>
                        <span>→</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Cloud Database Tile */}
                  <div className="bg-white p-5 rounded-3xl border border-[#1B4D2E]/10 shadow-xs text-xs space-y-2">
                    <div className="font-bold text-[#1B4D2E]">Live Cloud Database Sync</div>
                    <p className="text-gray-600 text-[11px]">
                      {supabaseCfg.connected
                        ? 'Connected directly to your live Supabase Postgres & Storage instance. All storefront changes, orders, and inquiries sync across every visitor in real time.'
                        : 'Connecting to live Supabase database...'}
                    </p>
                    <button
                      onClick={() => setActiveTab('supabase')}
                      className="text-xs font-bold text-[#1B4D2E] underline cursor-pointer"
                    >
                      Inspect Live Database Status
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: BRANDING & LOGO */}
          {activeTab === 'branding' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                  Branding & Logo Management
                </h2>
                <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                  Upload your business logo, manage transparent PNGs/SVGs, and configure header & footer presentation
                </p>
              </div>

              {/* Logo Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Desktop Header Preview */}
                <div className="bg-white p-5 rounded-3xl border border-[#1B4D2E]/10 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70">
                      Header Logo Preview (Light Background)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Live Preview
                    </span>
                  </div>

                  <div className="h-24 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-3 relative overflow-hidden">
                    {content.branding?.showLogoIcon !== false && (
                      content.branding?.logoUrl ? (
                        <img
                          src={content.branding.logoUrl}
                          alt="Logo Preview"
                          className="max-h-16 max-w-[200px] object-contain"
                        />
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-[#1B4D2E] border-2 border-[#E1AD01] flex items-center justify-center text-[#E1AD01] shadow-md font-display font-black text-xl italic">
                            DJ
                          </div>
                          <div>
                            <div className="font-display font-extrabold text-lg text-[#1B4D2E]">
                              Delightful<span className="text-[#E1AD01]">Juices</span>
                            </div>
                            <div className="text-[10px] text-[#1B4D2E]/60 uppercase font-semibold">
                              {content.motto}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 text-center">
                    {content.branding?.logoUrl ? 'Using custom uploaded logo file' : 'Using default stylized DJ gold & green emblem'}
                  </div>
                </div>

                {/* Dark Footer Preview */}
                <div className="bg-white p-5 rounded-3xl border border-[#1B4D2E]/10 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70">
                      Footer Logo Preview (Dark Background)
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-full">
                      Transparent Check
                    </span>
                  </div>

                  <div className="h-24 bg-[#12351F] rounded-2xl flex items-center justify-center p-3 relative overflow-hidden border border-[#E1AD01]/30">
                    {content.branding?.showLogoIcon !== false && (
                      content.branding?.logoUrl ? (
                        <img
                          src={content.branding.logoUrl}
                          alt="Dark Footer Preview"
                          className="max-h-16 max-w-[200px] object-contain drop-shadow-md"
                        />
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-[#1B4D2E] border-2 border-[#E1AD01] flex items-center justify-center text-[#E1AD01] shadow-md font-display font-black text-xl italic">
                            DJ
                          </div>
                          <div>
                            <div className="font-display font-extrabold text-lg text-white">
                              Delightful<span className="text-[#E1AD01]">Juices</span>
                            </div>
                            <div className="text-[10px] text-[#E1AD01] uppercase font-semibold">
                              {content.motto}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 text-center">
                    Transparent PNGs or SVGs render cleanly across dark backgrounds
                  </div>
                </div>
              </div>

              {/* Logo Controls Form */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-5">
                <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
                  Logo Settings & Upload
                </h3>

                {/* Upload Primary Logo */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-2">
                    Upload Website Logo (PNG, SVG, WebP, JPG)
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <label className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-xs cursor-pointer">
                      <Upload className="w-4 h-4 text-[#E1AD01]" />
                      <span>Choose Logo File...</span>
                      <input
                        type="file"
                        accept="image/png, image/svg+xml, image/webp, image/jpeg"
                        onChange={(e) => handleLogoUpload(e, false)}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const updatedBranding: BrandSettings = {
                          ...(content.branding || { logoText: 'Delightful Juices', showLogoIcon: true }),
                          logoUrl: '',
                          mobileLogoUrl: '',
                        };
                        const updated = { ...content, branding: updatedBranding };
                        setContent(updated);
                        handlePersistContent(updated, 'Default stylized logo restored on live site!');
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Default Logo</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1.5 block">
                    Supported formats: PNG (recommended with transparent background), SVG, WebP, JPG (max 5MB).
                  </span>
                </div>

                {/* Or Direct Logo URL */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Or Enter Hosted Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={content.branding?.logoUrl || ''}
                    onChange={(e) => {
                      const updatedBranding: BrandSettings = {
                        ...(content.branding || { logoText: 'Delightful Juices', showLogoIcon: true }),
                        logoUrl: e.target.value,
                      };
                      setContent({ ...content, branding: updatedBranding });
                    }}
                    placeholder="https://example.com/assets/logo.png"
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E]"
                  />
                </div>

                {/* Optional Mobile Logo */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Optional Dedicated Mobile Logo URL (Leave blank to use primary logo)
                  </label>
                  <input
                    type="url"
                    value={content.branding?.mobileLogoUrl || ''}
                    onChange={(e) => {
                      const updatedBranding: BrandSettings = {
                        ...(content.branding || { logoText: 'Delightful Juices', showLogoIcon: true }),
                        mobileLogoUrl: e.target.value,
                      };
                      setContent({ ...content, branding: updatedBranding });
                    }}
                    placeholder="https://example.com/assets/mobile-logo-icon.png"
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E]"
                  />
                </div>

                {/* Logo Text / Alt */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Brand / Logo Text (Heading Text)
                    </label>
                    <input
                      type="text"
                      value={content.branding?.logoText || ''}
                      onChange={(e) => {
                        const updatedBranding: BrandSettings = {
                          ...(content.branding || { showLogoIcon: true }),
                          logoText: e.target.value,
                        };
                        setContent({ ...content, branding: updatedBranding });
                      }}
                      placeholder="Delightful Juices"
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E]"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-xs text-[#1B4D2E]">
                      <input
                        type="checkbox"
                        checked={content.branding?.showLogoIcon !== false}
                        onChange={(e) => {
                          const updatedBranding: BrandSettings = {
                            ...(content.branding || { logoText: 'Delightful Juices' }),
                            showLogoIcon: e.target.checked,
                          };
                          setContent({ ...content, branding: updatedBranding });
                        }}
                        className="w-4 h-4 accent-[#1B4D2E]"
                      />
                      <span>Show Logo Icon / Graphic in Header & Footer</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => {
                      handlePersistContent(content, 'Branding settings published to live site!');
                    }}
                    className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3 px-6 rounded-xl text-xs flex items-center space-x-2 shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#E1AD01]" />
                    <span>Save Branding Settings</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB: COLOURS & THEME */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                  Branding and Appearance (Colours & Theme)
                </h2>
                <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                  Customize your brand palette, header/footer tones, and button styles. Default page background is strictly <strong>white (#FFFFFF)</strong>.
                </p>
              </div>

              {/* Live Mini Preview Card */}
              <div 
                className="p-6 rounded-3xl shadow-sm border transition-all space-y-4"
                style={{
                  backgroundColor: content.colors?.pageBgColor || '#FFFFFF',
                  borderColor: content.colors?.borderColor || '#1B4D2E26',
                }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: content.colors?.borderColor || '#1B4D2E26' }}>
                  <div className="flex items-center space-x-2.5">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: content.colors?.secondaryColor || '#E1AD01' }}
                    />
                    <span 
                      className="font-display font-bold text-base"
                      style={{ color: content.colors?.primaryColor || '#1B4D2E' }}
                    >
                      Theme Live Preview Card
                    </span>
                  </div>
                  <span 
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: content.colors?.secondaryColor || '#E1AD01',
                      color: content.colors?.primaryColor || '#1B4D2E',
                    }}
                  >
                    Accent Badge
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div 
                    className="p-4 rounded-2xl border text-center space-y-2 shadow-xs"
                    style={{
                      backgroundColor: content.colors?.cardBgColor || '#FFFFFF',
                      borderColor: content.colors?.borderColor || '#1B4D2E26',
                    }}
                  >
                    <div 
                      className="text-xs font-bold"
                      style={{ color: content.colors?.textColor || '#1B4D2E' }}
                    >
                      Primary Button Preview
                    </div>
                    <button
                      className="py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer w-full"
                      style={{
                        backgroundColor: content.colors?.buttonBgColor || '#1B4D2E',
                        color: content.colors?.buttonTextColor || '#FFF8E7',
                      }}
                    >
                      Order Juice
                    </button>
                  </div>

                  <div 
                    className="p-4 rounded-2xl border text-center space-y-2 shadow-xs"
                    style={{
                      backgroundColor: content.colors?.cardBgColor || '#FFFFFF',
                      borderColor: content.colors?.borderColor || '#1B4D2E26',
                    }}
                  >
                    <div 
                      className="text-xs font-bold"
                      style={{ color: content.colors?.textColor || '#1B4D2E' }}
                    >
                      Secondary Highlight
                    </div>
                    <button
                      className="py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer w-full"
                      style={{
                        backgroundColor: content.colors?.secondaryColor || '#E1AD01',
                        color: content.colors?.primaryColor || '#1B4D2E',
                      }}
                    >
                      View Catering
                    </button>
                  </div>

                  <div 
                    className="p-4 rounded-2xl text-center space-y-1 shadow-xs"
                    style={{
                      backgroundColor: content.colors?.footerBgColor || '#12351F',
                      color: '#FFF8E7',
                    }}
                  >
                    <div className="text-xs font-bold text-[#E1AD01]">Footer Style</div>
                    <div className="text-[11px] opacity-80">Quakertown, PA 18951</div>
                  </div>
                </div>
              </div>

              {/* Palette Form */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
                    Colour Swatches & Values
                  </h3>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...content,
                        colors: { ...DEFAULT_COLORS },
                        typography: { ...DEFAULT_TYPOGRAPHY },
                      };
                      setContent(updated);
                      applyTheme(updated);
                      handlePersistContent(updated, 'Palette restored to default brand colors on live site!');
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-3 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Default Palette</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Page Background */}
                  <div className="p-3.5 bg-[#FFF8E7] rounded-2xl border border-gray-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#1B4D2E]">
                        Default Page Background
                      </label>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Strictly White
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={content.colors?.pageBgColor || '#FFFFFF'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), pageBgColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-10 h-10 rounded-lg border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={content.colors?.pageBgColor || '#FFFFFF'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), pageBgColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1B4D2E]"
                      />
                    </div>
                  </div>

                  {/* Primary Brand Colour */}
                  <div className="p-3.5 bg-[#FFF8E7] rounded-2xl border border-gray-200 space-y-1.5">
                    <label className="block text-xs font-bold text-[#1B4D2E]">
                      Primary Brand Colour (Dark Green)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={content.colors?.primaryColor || '#1B4D2E'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), primaryColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-10 h-10 rounded-lg border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={content.colors?.primaryColor || '#1B4D2E'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), primaryColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1B4D2E]"
                      />
                    </div>
                  </div>

                  {/* Secondary Brand Colour */}
                  <div className="p-3.5 bg-[#FFF8E7] rounded-2xl border border-gray-200 space-y-1.5">
                    <label className="block text-xs font-bold text-[#1B4D2E]">
                      Secondary Brand Colour (Mustard Yellow)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={content.colors?.secondaryColor || '#E1AD01'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), secondaryColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-10 h-10 rounded-lg border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={content.colors?.secondaryColor || '#E1AD01'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), secondaryColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1B4D2E]"
                      />
                    </div>
                  </div>

                  {/* Accent Colour */}
                  <div className="p-3.5 bg-[#FFF8E7] rounded-2xl border border-gray-200 space-y-1.5">
                    <label className="block text-xs font-bold text-[#1B4D2E]">
                      Accent Colour (Highlights & Badges)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={content.colors?.accentColor || '#E1AD01'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), accentColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-10 h-10 rounded-lg border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={content.colors?.accentColor || '#E1AD01'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), accentColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1B4D2E]"
                      />
                    </div>
                  </div>

                  {/* Button Background */}
                  <div className="p-3.5 bg-[#FFF8E7] rounded-2xl border border-gray-200 space-y-1.5">
                    <label className="block text-xs font-bold text-[#1B4D2E]">
                      Button Background Colour
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={content.colors?.buttonBgColor || '#1B4D2E'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), buttonBgColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-10 h-10 rounded-lg border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={content.colors?.buttonBgColor || '#1B4D2E'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), buttonBgColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1B4D2E]"
                      />
                    </div>
                  </div>

                  {/* Button Text Colour */}
                  <div className="p-3.5 bg-[#FFF8E7] rounded-2xl border border-gray-200 space-y-1.5">
                    <label className="block text-xs font-bold text-[#1B4D2E]">
                      Button Text Colour
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={content.colors?.buttonTextColor || '#FFF8E7'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), buttonTextColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-10 h-10 rounded-lg border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={content.colors?.buttonTextColor || '#FFF8E7'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), buttonTextColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1B4D2E]"
                      />
                    </div>
                  </div>

                  {/* Header Background */}
                  <div className="p-3.5 bg-[#FFF8E7] rounded-2xl border border-gray-200 space-y-1.5">
                    <label className="block text-xs font-bold text-[#1B4D2E]">
                      Header Background Colour
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={content.colors?.headerBgColor || '#FFFFFF'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), headerBgColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-10 h-10 rounded-lg border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={content.colors?.headerBgColor || '#FFFFFF'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), headerBgColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1B4D2E]"
                      />
                    </div>
                  </div>

                  {/* Footer Background */}
                  <div className="p-3.5 bg-[#FFF8E7] rounded-2xl border border-gray-200 space-y-1.5">
                    <label className="block text-xs font-bold text-[#1B4D2E]">
                      Footer Background Colour
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={content.colors?.footerBgColor || '#12351F'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), footerBgColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-10 h-10 rounded-lg border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={content.colors?.footerBgColor || '#12351F'}
                        onChange={(e) => {
                          const updated = {
                            ...content,
                            colors: { ...(content.colors || DEFAULT_COLORS), footerBgColor: e.target.value },
                          };
                          setContent(updated);
                          applyTheme(updated);
                        }}
                        className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#1B4D2E]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => {
                      applyTheme(content);
                      handlePersistContent(content, 'Appearance palette applied and published to live site!');
                    }}
                    className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3 px-6 rounded-xl text-xs flex items-center space-x-2 shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#E1AD01]" />
                    <span>Save Brand Colours</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STRIPE PAYMENTS */}
          {activeTab === 'stripe' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                  Live Stripe Payment Integration
                </h2>
                <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                  Manage live card checkout, Apple Pay, and Google Pay powered by server-side Stripe Checkout Sessions &amp; Webhooks
                </p>
              </div>

              {/* Live Server & Checkout Status Banner */}
              <div className="space-y-3">
                <div
                  className={`p-5 rounded-3xl border flex items-start space-x-4 ${
                    content.stripe?.enabled && serverStatus.stripeConfigured
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : content.stripe?.enabled
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-gray-50 border-gray-300 text-gray-800'
                  }`}
                >
                  <CreditCard className="w-6 h-6 shrink-0 mt-0.5 text-[#1B4D2E]" />
                  <div className="space-y-1 text-xs flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm">
                        {content.stripe?.enabled
                          ? 'Stripe Card Checkout is Enabled at Storefront'
                          : 'Stripe Card Checkout is Disabled'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          serverStatus.stripeConfigured
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {serverStatus.stripeConfigured
                          ? 'STRIPE_SECRET_KEY Detected on Server'
                          : 'STRIPE_SECRET_KEY Not Set on Server Yet'}
                      </span>
                      {serverStatus.stripeWebhookConfigured && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                          Webhook Active
                        </span>
                      )}
                    </div>
                    <p>
                      {content.stripe?.enabled
                        ? `Customers see "${content.stripe.customerFacingName || 'Credit / Debit Card (Stripe)'}" in the live checkout modal. All secret keys are read securely from server environment variables.`
                        : 'Card checkout is currently hidden from customers. Enable the toggle below whenever you wish to accept online card payments.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stripe Storefront Presentation Settings */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
                      Storefront Card Checkout Settings
                    </h3>
                    <p className="text-xs text-gray-500">
                      Configure currency and customer-facing labels for live Stripe Checkout
                    </p>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.stripe?.enabled !== false}
                      onChange={(e) => {
                        const updated: StripePaymentSettings = {
                          ...(content.stripe || {
                            mode: 'live',
                            currency: 'USD',
                            customerFacingName: 'Credit / Debit Card (Stripe)',
                            description: 'Instant secure checkout with Visa, Mastercard, Amex, Apple Pay & Google Pay',
                          }),
                          enabled: e.target.checked,
                        };
                        setContent({ ...content, stripe: updated });
                      }}
                      className="w-5 h-5 accent-[#1B4D2E]"
                    />
                    <span className="text-xs font-bold text-[#1B4D2E]">Enable Stripe</span>
                  </label>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Settlement Currency
                  </label>
                  <select
                    value={content.stripe?.currency || 'USD'}
                    onChange={(e) => {
                      const updated: StripePaymentSettings = {
                        ...(content.stripe || {
                          enabled: true,
                          mode: 'live',
                          customerFacingName: 'Credit / Debit Card (Stripe)',
                          description: '',
                        }),
                        currency: e.target.value,
                      };
                      setContent({ ...content, stripe: updated });
                    }}
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E] font-bold"
                  >
                    <option value="USD">USD ($ - United States Dollar)</option>
                    <option value="CAD">CAD ($ - Canadian Dollar)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                  </select>
                </div>

                {/* Customer-Facing Label */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Customer Facing Method Name
                  </label>
                  <input
                    type="text"
                    value={content.stripe?.customerFacingName || 'Credit / Debit Card (Stripe)'}
                    onChange={(e) => {
                      const updated: StripePaymentSettings = {
                        ...(content.stripe || {
                          enabled: true,
                          mode: 'live',
                          currency: 'USD',
                          description: '',
                        }),
                        customerFacingName: e.target.value,
                      };
                      setContent({ ...content, stripe: updated });
                    }}
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E]"
                  />
                </div>

                {/* Customer-Facing Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Customer Facing Description
                  </label>
                  <input
                    type="text"
                    value={content.stripe?.description || 'Instant secure payment via Visa, Mastercard, Amex, Apple Pay & Google Pay'}
                    onChange={(e) => {
                      const updated: StripePaymentSettings = {
                        ...(content.stripe || {
                          enabled: true,
                          mode: 'live',
                          currency: 'USD',
                          customerFacingName: 'Credit / Debit Card (Stripe)',
                        }),
                        description: e.target.value,
                      };
                      setContent({ ...content, stripe: updated });
                    }}
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E]"
                  />
                </div>

                {/* Live Server Environment Variable Reference (No Secrets or Key Inputs in UI) */}
                <div className="p-4 bg-[#FFF8E7] rounded-2xl border border-[#1B4D2E]/15 text-xs space-y-2 text-[#1B4D2E]">
                  <div className="font-bold flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1B4D2E]" />
                    <span>Live Server Environment Variables</span>
                  </div>
                  <p className="text-[11px] text-[#1B4D2E]/80 leading-relaxed">
                    All payment credentials stay strictly on the server (never stored in browser storage or client code). Configure your live keys in your hosting provider&apos;s Environment Variables:
                  </p>
                  <div className="bg-white p-2.5 rounded-xl font-mono text-[11px] border border-[#1B4D2E]/15 space-y-1">
                    <div>
                      <strong>STRIPE_SECRET_KEY</strong> — Server secret key used by <code className="font-mono">/api/create-checkout-session</code>
                    </div>
                    <div className="text-gray-600">
                      <strong>STRIPE_WEBHOOK_SECRET</strong> — Webhook signing secret verified by <code className="font-mono">/api/stripe-webhook</code>
                    </div>
                  </div>
                </div>

                {/* Test Stripe API Endpoint Button */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleTestStripeEndpoint}
                    disabled={isTestingStripe}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingStripe ? 'animate-spin' : ''}`} />
                    <span>{isTestingStripe ? 'Verifying Live Stripe API...' : 'Verify Live Stripe Server Endpoint'}</span>
                  </button>

                  <button
                    onClick={() => {
                      handlePersistContent(content, 'Stripe checkout settings published to live site!');
                    }}
                    className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3 px-6 rounded-xl text-xs flex items-center space-x-2 shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#E1AD01]" />
                    <span>Save Stripe Settings</span>
                  </button>
                </div>

                {stripeTestResult && (
                  <div
                    className={`p-3.5 rounded-xl text-xs flex items-start space-x-2 ${
                      stripeTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {stripeTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    )}
                    <span>{stripeTestResult.message}</span>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                    Juice & Drink Catalog
                  </h2>
                  <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                    Manage drink photography, flavors, bottle sizes &amp; measurement units (oz), prices, and inventory
                  </p>
                </div>

                <button
                  onClick={handleNewProductInit}
                  className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#E1AD01]" />
                  <span>Add New Drink</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-3xl border border-[#1B4D2E]/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF8E7] text-[#1B4D2E] uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-4">Drink Photo</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Bottle Sizes (oz) &amp; Prices</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Featured</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-[#FFF8E7]/40">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-14 h-14 rounded-2xl object-cover bg-gray-100 shadow-xs shrink-0"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-2xl bg-[#12351F] text-[#E1AD01] flex items-center justify-center shrink-0">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-sm text-[#1B4D2E]">{p.name}</div>
                                <div className="text-[11px] text-gray-500 line-clamp-1">{p.tagline}</div>
                                <div className="flex items-center space-x-2 mt-1">
                                  {p.badge && (
                                    <span className="bg-[#E1AD01]/25 text-[#1B4D2E] text-[9px] font-bold px-2 py-0.5 rounded-sm">
                                      {p.badge}
                                    </span>
                                  )}
                                  {p.galleryImages && p.galleryImages.length > 0 && (
                                    <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md font-semibold">
                                      +{p.galleryImages.length} extra photos
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-gray-700">{p.categoryLabel}</span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              {p.sizes.map((s, idx) => (
                                <div key={`${s.size}-${idx}`} className="text-[11px] text-gray-700">
                                  <strong className="text-[#1B4D2E]">{getCustomerSizeDisplay(s)}:</strong> ${s.price.toFixed(2)}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => {
                                dataRepo.updateProduct({ ...p, inStock: !p.inStock });
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer ${
                                p.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {p.inStock ? 'In Stock' : 'Out of Stock'}
                            </button>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => {
                                dataRepo.updateProduct({ ...p, featured: !p.featured });
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer ${
                                p.featured ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {p.featured ? '★ Featured' : 'Standard'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsAddingProduct(false);
                                }}
                                className="p-2 text-[#1B4D2E] hover:bg-[#FFF8E7] rounded-lg transition-colors cursor-pointer"
                                title="Edit Drink & Images"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {confirmDeleteProdId === p.id ? (
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => {
                                      dataRepo.deleteProduct(p.id);
                                      setConfirmDeleteProdId(null);
                                      showToast(`Deleted ${p.name}`);
                                    }}
                                    className="px-2 py-1 bg-red-600 text-white rounded-md text-[10px] font-bold cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteProdId(null)}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteProdId(p.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Drink"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                    Customer Orders Management
                  </h2>
                  <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                    Track preparation, delivery status, and notify customers via WhatsApp
                  </p>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-[#1B4D2E]/10">
                  {['all', 'pending', 'preparing', 'out_for_delivery', 'completed'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                        orderFilter === st
                          ? 'bg-[#1B4D2E] text-white'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {orders
                  .filter((o) => orderFilter === 'all' || o.status === orderFilter)
                  .map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-5 rounded-3xl border border-[#1B4D2E]/10 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-extrabold text-base text-[#1B4D2E]">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ord.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'preparing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status.replace('_', ' ')}
                          </span>
                          {ord.paymentMethod === 'stripe_card' && (
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                              <CreditCard className="w-3 h-3" />
                              <span>Stripe Paid</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-500">
                          {new Date(ord.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="font-bold text-[#1B4D2E]/70 block uppercase text-[10px]">
                            Customer Information
                          </span>
                          <div className="font-bold text-sm text-[#1B4D2E]">{ord.customerName}</div>
                          <div className="text-gray-600">{ord.customerPhone}</div>
                          <div className="text-gray-600">{ord.customerEmail}</div>
                        </div>

                        <div>
                          <span className="font-bold text-[#1B4D2E]/70 block uppercase text-[10px]">
                            Delivery Method & Destination
                          </span>
                          <div className="font-semibold text-gray-800 capitalize">
                            {ord.deliveryMethod.replace('_', ' ')}
                          </div>
                          <div className="text-gray-600">{ord.deliveryAddress}</div>
                          {ord.deliveryTimeSlot && (
                            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                              Window: {ord.deliveryTimeSlot}
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="font-bold text-[#1B4D2E]/70 block uppercase text-[10px]">
                            Payment & Total
                          </span>
                          <div className="font-extrabold text-base text-[#1B4D2E]">
                            ${ord.total.toFixed(2)}
                          </div>
                          <div className="text-gray-600 capitalize">
                            Method: {ord.paymentMethod.replace('_', ' ')}
                          </div>
                          {ord.deliveryFee > 0 && (
                            <div className="text-[10px] text-gray-500">
                              (Includes ${ord.deliveryFee.toFixed(2)} delivery fee)
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#1B4D2E]/10 space-y-1 text-xs">
                        <span className="font-bold text-[#1B4D2E] block text-[11px]">Items Ordered:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-gray-700">
                              <span className="w-5 h-5 rounded-full bg-[#1B4D2E] text-[#FFF8E7] text-[10px] font-bold flex items-center justify-center shrink-0">
                                {it.quantity}
                              </span>
                              <span>{it.productName} ({formatBottleCodeToOz(it.size)})</span>
                              <span className="font-bold text-[#1B4D2E] ml-auto">
                                ${(it.unitPrice * it.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Update & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-gray-700">Set Status:</span>
                          {(['pending', 'preparing', 'out_for_delivery', 'completed', 'cancelled'] as Order['status'][]).map(
                            (st) => (
                              <button
                                key={st}
                                onClick={() => {
                                  dataRepo.updateOrderStatus(ord.id, st);
                                  showToast(`Order ${ord.orderNumber} status set to ${st}`);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                                  ord.status === st
                                    ? 'bg-[#1B4D2E] text-[#FFF8E7]'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                              >
                                {st.replace('_', ' ')}
                              </button>
                            )
                          )}
                        </div>

                        <a
                          href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                            ord.customerName
                          )}%2C%20this%20is%20Delightful%20Juices%20regarding%20your%20order%20${ord.orderNumber}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Customer</span>
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB: INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                  Event & Catering Inquiries
                </h2>
                <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                  Manage requests for weddings, birthdays, corporate symposiums, and bulk orders
                </p>
              </div>

              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-white p-5 rounded-3xl border border-[#1B4D2E]/10 shadow-sm space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                      <div>
                        <div className="font-bold text-sm text-[#1B4D2E]">{inq.fullName}</div>
                        <div className="text-gray-500">{inq.phone} • {inq.email}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold bg-[#E1AD01]/25 text-[#1B4D2E] px-2.5 py-1 rounded-full">
                          {inq.eventType}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            inq.status === 'booked'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inq.status === 'quoted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <strong className="block text-[#1B4D2E]">Event Date & Guest Count:</strong>
                        <span>{inq.eventDate || 'TBD'} • {inq.guestCount} Guests</span>
                      </div>
                      <div>
                        <strong className="block text-[#1B4D2E]">Location:</strong>
                        <span>{inq.eventLocation}</span>
                      </div>
                      <div>
                        <strong className="block text-[#1B4D2E]">Custom Labeling:</strong>
                        <span>{inq.customLabelingNeeded ? 'Yes, custom monograms needed' : 'Standard labels'}</span>
                      </div>
                    </div>

                    <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#1B4D2E]/10 space-y-1">
                      <strong className="block text-[#1B4D2E]">Client Message:</strong>
                      <p className="text-gray-700 leading-relaxed">{inq.message}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-gray-700">Status:</span>
                        {(['new', 'reviewed', 'quoted', 'booked', 'declined'] as EventInquiry['status'][]).map(
                          (st) => (
                            <button
                              key={st}
                              onClick={() => {
                                dataRepo.updateInquiryStatus(inq.id, st);
                                showToast(`Inquiry status updated to ${st}`);
                              }}
                              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                                inq.status === st
                                  ? 'bg-[#1B4D2E] text-white'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              {st}
                            </button>
                          )
                        )}
                      </div>

                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                          inq.fullName
                        )}%2C%20thank%20you%20for%20contacting%20Delightful%20Juices%20regarding%20your%20${encodeURIComponent(
                          inq.eventType
                        )}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl flex items-center space-x-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Send Quote via WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CONTENT CMS */}
          {activeTab === 'content' && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                  Website Copy &amp; Craft Showcase CMS
                </h2>
                <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                  Customize the Homepage Craft Showcase image, badge &amp; founder card, plus headlines, story copy, and store details
                </p>
              </div>

              {/* HOMEPAGE CRAFT SHOWCASE & FOUNDER CARD EDITOR */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1B4D2E]/10 pb-4">
                  <div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-[#1B4D2E]">
                      Homepage Craft Showcase &amp; Founder Card
                    </h3>
                    <p className="text-xs text-[#1B4D2E]/70">
                      Edit the botanical showcase photo, top-left gold badge, bottom-right founder quote card, and story text
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handlePersistContent(content, 'Craft Showcase & Website Content published to live site!');
                    }}
                    className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-2 shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    <Save className="w-4 h-4 text-[#E1AD01]" />
                    <span>Save Changes</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Live Visual Collage Preview */}
                  <div className="lg:col-span-5">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/65 mb-3">
                      Live Showcase Preview
                    </span>
                    <div className="bg-[#FFF8E7] p-6 sm:p-7 rounded-3xl border border-[#1B4D2E]/15">
                      <div className="relative mx-auto max-w-[300px]">
                        <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-[#12351F]">
                          {currentShowcase.imageUrl?.trim() ? (
                            <img
                              src={currentShowcase.imageUrl}
                              alt={currentShowcase.imageAlt || 'Craft showcase preview'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#0E2918] via-[#1B4D2E] to-[#12351F] p-6 flex flex-col justify-center items-center text-center text-[#FFF8E7] space-y-2">
                              <Sparkles className="w-6 h-6 text-[#E1AD01]" />
                              <span className="font-display font-bold text-base">
                                Whole Botanical Craft
                              </span>
                              <span className="text-[11px] text-[#FFF8E7]/75">
                                Upload a showcase photo to replace this botanical panel
                              </span>
                            </div>
                          )}
                        </div>

                        {currentShowcase.showBadge !== false && currentShowcase.badgeText?.trim() && (
                          <div className="absolute -top-3 -left-3 bg-[#E1AD01] text-[#1B4D2E] px-3 py-2 rounded-2xl shadow-md font-black text-[10px] uppercase tracking-wider flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span>{currentShowcase.badgeText}</span>
                          </div>
                        )}

                        {currentShowcase.showCeoCard !== false && (
                          <div className="absolute -bottom-4 -right-3 bg-white rounded-2xl p-3.5 shadow-xl border border-[#1B4D2E]/10 max-w-[230px]">
                            <div className="flex items-center space-x-2.5 mb-1.5">
                              {currentShowcase.ceoAvatarUrl?.trim() ? (
                                <img
                                  src={currentShowcase.ceoAvatarUrl}
                                  alt={content.ceoName}
                                  className="w-9 h-9 rounded-full object-cover border-2 border-[#E1AD01] shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center font-bold text-xs shrink-0">
                                  {currentShowcase.ceoInitials?.trim() || 'OA'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-extrabold text-[11px] text-[#1B4D2E] truncate">
                                  {content.ceoName}
                                </div>
                                {currentShowcase.ceoRole?.trim() && (
                                  <div className="text-[9px] text-[#1B4D2E]/70 uppercase tracking-wider font-semibold truncate">
                                    {currentShowcase.ceoRole}
                                  </div>
                                )}
                              </div>
                            </div>
                            {currentShowcase.ceoQuote?.trim() && (
                              <p className="text-[10px] text-[#1B4D2E]/80 italic leading-relaxed line-clamp-3">
                                &ldquo;{currentShowcase.ceoQuote}&rdquo;
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Editable Fields for Image, Badge & Founder Card */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* 1. Main Showcase Image */}
                    <div className="p-4 rounded-2xl bg-[#FFF8E7]/65 border border-[#1B4D2E]/12 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-[#1B4D2E]">
                          1. Showcase Photo
                        </label>
                        {currentShowcase.imageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              updateAboutShowcase({ imageUrl: '' }, true);
                              showToast('Cleared custom showcase photo.');
                            }}
                            className="text-[11px] font-bold text-[#1B4D2E]/75 hover:text-[#1B4D2E] inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Clear Photo</span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <label className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs py-2 px-3.5 rounded-xl inline-flex items-center space-x-2 shadow-xs cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-[#E1AD01]" />
                          <span>Upload Photo from Device</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp, image/svg+xml"
                            onChange={(e) => handleAboutShowcaseUpload(e, 'imageUrl')}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-[#1B4D2E]/65">
                          Recommended portrait 4:5 ratio (JPG, PNG, WebP up to 5MB)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#1B4D2E]/70 mb-1">
                            Or Paste Image URL
                          </label>
                          <input
                            type="url"
                            value={currentShowcase.imageUrl || ''}
                            onChange={(e) => updateAboutShowcase({ imageUrl: e.target.value })}
                            placeholder="Leave blank for default craft photo"
                            className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#1B4D2E]/70 mb-1">
                            Image Alt Description
                          </label>
                          <input
                            type="text"
                            value={currentShowcase.imageAlt || ''}
                            onChange={(e) => updateAboutShowcase({ imageAlt: e.target.value })}
                            className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Top-Left Gold Corner Badge */}
                    <div className="p-4 rounded-2xl bg-[#FFF8E7]/65 border border-[#1B4D2E]/12 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-[#1B4D2E]">
                          2. Top-Left Gold Badge
                        </label>
                        <label className="inline-flex items-center space-x-2 text-xs font-bold text-[#1B4D2E] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentShowcase.showBadge !== false}
                            onChange={(e) => updateAboutShowcase({ showBadge: e.target.checked })}
                            className="w-4 h-4 accent-[#1B4D2E] rounded"
                          />
                          <span>Show Badge</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={currentShowcase.badgeText}
                        onChange={(e) => updateAboutShowcase({ badgeText: e.target.value })}
                        placeholder="e.g. Quakertown, PA Craft"
                        className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] font-bold"
                      />
                    </div>

                    {/* 3. Bottom-Right Founder / C.E.O. Card */}
                    <div className="p-4 rounded-2xl bg-[#FFF8E7]/65 border border-[#1B4D2E]/12 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-[#1B4D2E]">
                          3. Founder / C.E.O. Card
                        </label>
                        <label className="inline-flex items-center space-x-2 text-xs font-bold text-[#1B4D2E] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentShowcase.showCeoCard !== false}
                            onChange={(e) => updateAboutShowcase({ showCeoCard: e.target.checked })}
                            className="w-4 h-4 accent-[#1B4D2E] rounded"
                          />
                          <span>Show Card</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#1B4D2E]/70 mb-1">
                            Founder Name
                          </label>
                          <input
                            type="text"
                            value={content.ceoName}
                            onChange={(e) => setContent({ ...content, ceoName: e.target.value })}
                            className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#1B4D2E]/70 mb-1">
                            Role / Title
                          </label>
                          <input
                            type="text"
                            value={currentShowcase.ceoRole}
                            onChange={(e) => updateAboutShowcase({ ceoRole: e.target.value })}
                            placeholder="Founder & C.E.O."
                            className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#1B4D2E]/70 mb-1">
                            Badge Initials
                          </label>
                          <input
                            type="text"
                            maxLength={4}
                            value={currentShowcase.ceoInitials}
                            onChange={(e) => updateAboutShowcase({ ceoInitials: e.target.value })}
                            placeholder="OA"
                            className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] font-bold uppercase"
                          />
                        </div>
                      </div>

                      {/* Optional Founder Portrait Upload */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <label className="bg-white hover:bg-gray-50 border border-[#1B4D2E]/25 text-[#1B4D2E] font-bold text-xs py-1.5 px-3 rounded-xl inline-flex items-center space-x-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-[#1B4D2E]" />
                          <span>Upload Founder Portrait (Optional)</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => handleAboutShowcaseUpload(e, 'ceoAvatarUrl')}
                            className="hidden"
                          />
                        </label>
                        {currentShowcase.ceoAvatarUrl && (
                          <button
                            type="button"
                            onClick={() => updateAboutShowcase({ ceoAvatarUrl: '' }, true)}
                            className="text-[11px] font-bold text-red-700 hover:underline cursor-pointer"
                          >
                            Use Initials Circle Instead
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#1B4D2E]/70 mb-1">
                          Founder Quote
                        </label>
                        <textarea
                          rows={2}
                          value={currentShowcase.ceoQuote}
                          onChange={(e) => updateAboutShowcase({ ceoQuote: e.target.value })}
                          className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl p-2.5 text-xs text-[#1B4D2E]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story Section Heading & Paragraphs alongside the Showcase */}
                <div className="pt-4 border-t border-[#1B4D2E]/10 space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#1B4D2E]">
                    Story Section Heading &amp; Paragraphs (Beside Showcase)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#1B4D2E]/70 mb-1">
                        Section Kicker
                      </label>
                      <input
                        type="text"
                        value={currentShowcase.sectionKicker || ''}
                        onChange={(e) => updateAboutShowcase({ sectionKicker: e.target.value })}
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#1B4D2E]/70 mb-1">
                        Section Headline
                      </label>
                      <input
                        type="text"
                        value={currentShowcase.sectionHeading || ''}
                        onChange={(e) => updateAboutShowcase({ sectionHeading: e.target.value })}
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1B4D2E]/70 mb-1">
                      Story Paragraph 1 (Main Brand Story)
                    </label>
                    <textarea
                      rows={3}
                      value={content.aboutStory}
                      onChange={(e) => setContent({ ...content, aboutStory: e.target.value })}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl p-3 text-xs text-[#1B4D2E]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#1B4D2E]/70 mb-1">
                        Story Paragraph 2
                      </label>
                      <textarea
                        rows={3}
                        value={currentShowcase.extraStoryParagraph1 ?? ''}
                        onChange={(e) => updateAboutShowcase({ extraStoryParagraph1: e.target.value })}
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl p-3 text-xs text-[#1B4D2E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#1B4D2E]/70 mb-1">
                        Story Paragraph 3
                      </label>
                      <textarea
                        rows={3}
                        value={currentShowcase.extraStoryParagraph2 ?? ''}
                        onChange={(e) => updateAboutShowcase({ extraStoryParagraph2: e.target.value })}
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl p-3 text-xs text-[#1B4D2E]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GENERAL WEBSITE COPY & STORE DETAILS */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
                  General Store Information &amp; Copy
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={content.businessName}
                      onChange={(e) => setContent({ ...content, businessName: e.target.value })}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      C.E.O. Name (From PDF)
                    </label>
                    <input
                      type="text"
                      value={content.ceoName}
                      onChange={(e) => setContent({ ...content, ceoName: e.target.value })}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Brand Motto
                    </label>
                    <input
                      type="text"
                      value={content.motto}
                      onChange={(e) => setContent({ ...content, motto: e.target.value })}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Brand Tagline
                    </label>
                    <input
                      type="text"
                      value={content.tagline}
                      onChange={(e) => setContent({ ...content, tagline: e.target.value })}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Announcement Ticker (Top Bar)
                  </label>
                  <input
                    type="text"
                    value={content.announcementTicker}
                    onChange={(e) => setContent({ ...content, announcementTicker: e.target.value })}
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Hero Headline
                  </label>
                  <input
                    type="text"
                    value={content.heroHeadline}
                    onChange={(e) => setContent({ ...content, heroHeadline: e.target.value })}
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Hero Subheadline
                  </label>
                  <textarea
                    rows={3}
                    value={content.heroSubheadline}
                    onChange={(e) => setContent({ ...content, heroSubheadline: e.target.value })}
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl p-3 text-xs text-[#1B4D2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Our Signature Promise (From PDF)
                  </label>
                  <textarea
                    rows={2}
                    value={content.signaturePromise}
                    onChange={(e) => setContent({ ...content, signaturePromise: e.target.value })}
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl p-3 text-xs text-[#1B4D2E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Phone Number & WhatsApp
                    </label>
                    <input
                      type="text"
                      value={content.phone}
                      onChange={(e) => setContent({ ...content, phone: e.target.value })}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Business Address (Street, City, State, ZIP)
                    </label>
                    <input
                      type="text"
                      value={content.address}
                      onChange={(e) => setContent({ ...content, address: e.target.value })}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Free Delivery Threshold ($)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={content.freeDeliveryThreshold}
                      onChange={(e) => setContent({ ...content, freeDeliveryThreshold: parseFloat(e.target.value) || 40 })}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Standard Delivery Fee ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={content.standardDeliveryFee}
                      onChange={(e) => setContent({ ...content, standardDeliveryFee: parseFloat(e.target.value) || 4.99 })}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Floating Chat Button Text
                    </label>
                    <input
                      type="text"
                      value={content.chatButtonLabel || 'Chat with Kitchen'}
                      onChange={(e) => setContent({ ...content, chatButtonLabel: e.target.value })}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      handlePersistContent(content, 'Website Content published to live database!');
                    }}
                    className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3 px-6 rounded-xl text-xs flex items-center space-x-2 shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#E1AD01]" />
                    <span>Save Website Content</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB: HERO SLIDER MANAGEMENT */}
          {activeTab === 'hero_slider' && (
            <HeroSliderManager
              slides={heroSlides}
              content={content}
              cmsPages={cmsPages}
              supabaseConnected={supabaseCfg.connected}
              onToast={showToast}
            />
          )}

          {/* TAB: DYNAMIC PAGES BUILDER */}
          {activeTab === 'pages' && (
            <PagesManager
              pages={cmsPages}
              products={products}
              content={content}
              navItems={navItems}
              supabaseConnected={supabaseCfg.connected}
              onToast={showToast}
              onOpenPublicUrl={(url) => {
                onClose();
                if (onNavigate) onNavigate(url);
              }}
            />
          )}

          {/* TAB: NAVIGATION MANAGEMENT */}
          {activeTab === 'nav' && (
            <NavigationManager
              navItems={navItems}
              cmsPages={cmsPages}
              onToast={showToast}
            />
          )}

          {/* TAB: SUPABASE INTEGRATION */}
          {activeTab === 'supabase' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                  Live Supabase Cloud Database &amp; Schema
                </h2>
                <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                  Monitor your live Supabase connection, synchronize CMS tables, and inspect the production SQL migration
                </p>
              </div>

              {/* Live Connection Status Card */}
              <div
                className={`p-5 rounded-3xl border flex items-start space-x-4 ${
                  supabaseCfg.connected
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <Database className="w-6 h-6 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs flex-1">
                  <div className="font-extrabold text-sm">
                    {supabaseCfg.connected
                      ? 'Connected to Live Supabase Instance'
                      : 'Waiting for Live Supabase Environment Variables'}
                  </div>
                  <p>
                    {supabaseCfg.connected
                      ? `Connected directly to ${supabaseCfg.url} via server environment configuration. All products, hero sliders, CMS pages, customer orders, and inquiries read and write directly to your live database.`
                      : 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment variables.'}
                  </p>
                </div>
              </div>

              {/* Live Diagnostics & Table Sync Controls (No Manual API Key Inputs) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
                      Live Cloud Connection &amp; Table Health
                    </h3>
                    <p className="text-xs text-gray-500">
                      Credentials are managed securely via server environment variables
                    </p>
                  </div>
                  {supabaseUserEmail && (
                    <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Authenticated as {supabaseUserEmail}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#FFF8E7] border border-[#1B4D2E]/15">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#1B4D2E]/65">
                      Live Project Endpoint
                    </span>
                    <span className="font-mono font-bold text-[#1B4D2E] break-all mt-0.5 block">
                      {supabaseCfg.url || 'Not configured'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#FFF8E7] border border-[#1B4D2E]/15">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#1B4D2E]/65">
                      Realtime &amp; Auth Session
                    </span>
                    <span className="font-bold text-emerald-800 mt-0.5 block">
                      {supabaseUserEmail
                        ? `Active (${supabaseUserEmail})`
                        : 'Awaiting Supabase Auth Sign-In'}
                    </span>
                  </div>
                </div>

                {syncStatusMsg && (
                  <div
                    className={`p-4 rounded-2xl text-xs flex items-start space-x-2 ${
                      syncStatusMsg.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {syncStatusMsg.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span>{syncStatusMsg.text}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleTestSupabase}
                    disabled={isTestingSupabase}
                    className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs py-3 px-5 rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-[#E1AD01]" />
                    <span>
                      {isTestingSupabase
                        ? 'Verifying Live Tables...'
                        : 'Verify Live Connection & Tables'}
                    </span>
                  </button>

                  <button
                    onClick={handleSeedSupabase}
                    disabled={isSeeding || !supabaseCfg.connected}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isSeeding
                        ? 'Syncing Live Tables...'
                        : '1-Click Sync & Repair Live Tables'}
                    </span>
                  </button>
                </div>

                {seedResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-start space-x-2 border ${
                      seedResult.startsWith('Successfully')
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border-amber-300'
                    }`}
                  >
                    {seedResult.startsWith('Successfully') ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    )}
                    <span>{seedResult}</span>
                  </div>
                )}
              </div>

              {/* SQL Migration Script Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
                      Schema Migration SQL (supabase/migrations/)
                    </h3>
                    <p className="text-xs text-gray-600">
                      Creates idempotent tables &amp; RLS policies for products, orders, event_inquiries, site_content, navigation_items, hero_slides, cms_pages, and storage buckets.
                    </p>
                  </div>

                  <button
                    onClick={handleCopySql}
                    className="bg-[#1B4D2E] text-[#FFF8E7] hover:bg-[#143822] text-xs font-bold py-2 px-3.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#E1AD01]" />}
                    <span>{copiedSql ? 'Copied Migration SQL!' : 'Copy Migration SQL'}</span>
                  </button>
                </div>

                <div className="relative">
                  <pre className="bg-[#12351F] text-[#FFF8E7] p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed border border-[#E1AD01]/30">
                    {SUPABASE_SQL_MIGRATION}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Product Edit / Add Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[92vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-xl text-[#1B4D2E]">
                {isAddingProduct ? 'Add New Drink Recipe' : `Edit ${editingProduct.name}`}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-black p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Drink Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-[#FFF8E7] border rounded-xl p-2.5 font-bold text-[#1B4D2E]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => {
                      const cat = e.target.value as Product['category'];
                      const labels: Record<Product['category'], string> = {
                        zobo: 'Signature Zobo',
                        ginger: 'Ginger Elixirs',
                        other: 'Artisanal Milks',
                        bundles: 'Party & Event Packs',
                      };
                      setEditingProduct({
                        ...editingProduct,
                        category: cat,
                        categoryLabel: labels[cat] || 'Fresh Drinks',
                      });
                    }}
                    className="w-full bg-[#FFF8E7] border rounded-xl p-2.5 font-bold text-[#1B4D2E]"
                  >
                    <option value="zobo">Signature Zobo (Hibiscus)</option>
                    <option value="ginger">Ginger Elixirs</option>
                    <option value="other">Artisanal Milks (Tigernut)</option>
                    <option value="bundles">Party & Event Packs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Tagline / Short Hook</label>
                <input
                  type="text"
                  value={editingProduct.tagline}
                  onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                  className="w-full bg-[#FFF8E7] border rounded-xl p-2.5 text-[#1B4D2E]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-[#FFF8E7] border rounded-xl p-2.5 text-[#1B4D2E]"
                />
              </div>

              {/* Product Images Management Section */}
              <div className="p-4 bg-[#FFF8E7] rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#1B4D2E] text-xs uppercase tracking-wider">
                    Product Photography & Media
                  </label>
                  <span className="text-[10px] text-gray-500">Aspect Ratio: 4:3 or 1:1</span>
                </div>

                {/* Main Product Image */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {editingProduct.imageUrl ? (
                    <img
                      src={editingProduct.imageUrl}
                      alt={editingProduct.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#12351F] text-[#E1AD01] border-2 border-white shadow-xs flex items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1 w-full">
                    <input
                      type="url"
                      value={editingProduct.imageUrl}
                      onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                      placeholder="Upload from device to Supabase Storage or paste live URL"
                      className="w-full bg-white border rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                    />
                    <div className="flex items-center space-x-2">
                      <label className="bg-[#1B4D2E] hover:bg-[#143822] text-white font-bold text-[11px] py-1.5 px-3 rounded-lg flex items-center space-x-1.5 cursor-pointer">
                        <Upload className="w-3 h-3 text-[#E1AD01]" />
                        <span>Upload to Supabase Storage</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleProductImageUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-gray-500">PNG, JPG, WebP supported</span>
                    </div>
                  </div>
                </div>

                {/* Gallery Images (Multiple Photos) */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[11px] text-[#1B4D2E]">
                      Additional Gallery Images ({editingProduct.galleryImages?.length || 0})
                    </span>
                    <label className="text-[10px] bg-[#1B4D2E] text-white font-bold px-2.5 py-1 rounded-md cursor-pointer flex items-center space-x-1">
                      <Plus className="w-3 h-3 text-[#E1AD01]" />
                      <span>Add Extra Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleProductImageUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {editingProduct.galleryImages && editingProduct.galleryImages.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {editingProduct.galleryImages.map((imgUrl, gIdx) => (
                        <div key={gIdx} className="relative group rounded-xl overflow-hidden aspect-square border">
                          <img src={imgUrl} alt="Gallery" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const filtered = (editingProduct.galleryImages || []).filter((_, i) => i !== gIdx);
                              setEditingProduct({ ...editingProduct, galleryImages: filtered });
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-500 italic">
                      No extra gallery images added yet. Click &quot;Add Extra Photo&quot; to show multiple angles.
                    </div>
                  )}
                </div>
              </div>

              {/* Bottle Sizes, Measurement Units & Prices */}
              <div className="p-4 bg-[#FFF8E7] rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-[#1B4D2E] text-xs uppercase tracking-wider">
                      Bottle Sizes, Measurement Units &amp; Pricing ($)
                    </label>
                    <span className="text-[10px] text-gray-600">
                      Customer storefront displays all liquid volumes in US fluid ounces (oz). Entering cl, L, or ml converts accurately automatically.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextSize: SizeOption = {
                        size: '16.9 oz',
                        label: '16.9 oz Bottle',
                        price: 7.50,
                        quantityValue: 16.9,
                        unit: 'oz',
                      };
                      setEditingProduct({
                        ...editingProduct,
                        sizes: [...editingProduct.sizes, nextSize],
                      });
                    }}
                    className="bg-[#1B4D2E] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-[#E1AD01]" />
                    <span>Add Size</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {editingProduct.sizes.map((s, idx) => {
                    const currentUnit: MeasurementUnit = s.unit || 'oz';
                    const currentQty = s.quantityValue ?? (parseFloat(String(s.size)) || 16.9);
                    return (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                            Customer Storefront Display: <strong>{getCustomerSizeDisplay(s)}</strong>
                          </span>
                          {editingProduct.sizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = editingProduct.sizes.filter((_, i) => i !== idx);
                                setEditingProduct({ ...editingProduct, sizes: filtered });
                              }}
                              className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Quantity</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={currentQty}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const updatedSizes = [...editingProduct.sizes];
                                const nextOpt: SizeOption = {
                                  ...s,
                                  quantityValue: val,
                                  unit: currentUnit,
                                  size: currentUnit === 'Pack' ? s.size : `${val} ${currentUnit}`,
                                };
                                updatedSizes[idx] = nextOpt;
                                setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                              }}
                              className="w-full bg-[#FFF8E7] border rounded-lg px-2 py-1.5 font-bold text-[#1B4D2E]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Unit</label>
                            <select
                              value={currentUnit}
                              onChange={(e) => {
                                const u = e.target.value as MeasurementUnit;
                                const updatedSizes = [...editingProduct.sizes];
                                const nextOpt: SizeOption = {
                                  ...s,
                                  quantityValue: currentQty,
                                  unit: u,
                                  size: u === 'Pack' ? `${currentQty}-Pack` : `${currentQty} ${u}`,
                                };
                                updatedSizes[idx] = nextOpt;
                                setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                              }}
                              className="w-full bg-[#FFF8E7] border rounded-lg px-2 py-1.5 font-bold text-[#1B4D2E]"
                            >
                              <option value="oz">oz (US Fluid Ounces)</option>
                              <option value="cl">cl (Auto-converts to oz)</option>
                              <option value="L">L (Auto-converts to oz)</option>
                              <option value="ml">ml (Auto-converts to oz)</option>
                              <option value="Pack">Pack / Bundle</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Bottle Label</label>
                            <input
                              type="text"
                              value={s.label}
                              onChange={(e) => {
                                const updatedSizes = [...editingProduct.sizes];
                                updatedSizes[idx] = { ...s, label: e.target.value };
                                setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                              }}
                              placeholder="e.g. Daily Refresh"
                              className="w-full bg-[#FFF8E7] border rounded-lg px-2 py-1.5 text-[#1B4D2E]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Price ($)</label>
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              value={s.price}
                              onChange={(e) => {
                                const updatedSizes = [...editingProduct.sizes];
                                updatedSizes[idx] = { ...s, price: parseFloat(e.target.value) || 0 };
                                setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                              }}
                              className="w-full bg-[#FFF8E7] border rounded-lg px-2 py-1.5 font-extrabold text-[#1B4D2E]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Taste Profile</label>
                  <input
                    type="text"
                    value={editingProduct.tasteProfile}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tasteProfile: e.target.value })}
                    className="w-full bg-[#FFF8E7] border rounded-xl p-2 text-[#1B4D2E]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Badge Callout (Optional)</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    placeholder="e.g. Customer #1 Favorite"
                    className="w-full bg-[#FFF8E7] border rounded-xl p-2 text-[#1B4D2E]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="w-4 h-4 accent-[#1B4D2E]"
                  />
                  <span>In Stock</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="w-4 h-4 accent-[#1B4D2E]"
                  />
                  <span>Featured Drink</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 text-gray-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1B4D2E] hover:bg-[#143822] text-white font-bold px-6 py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Drink & Photos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
