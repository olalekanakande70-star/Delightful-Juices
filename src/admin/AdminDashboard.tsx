import React, { useState, useEffect } from 'react';
import { 
  Product, 
  Order, 
  EventInquiry, 
  SiteContent, 
  NavItem, 
  BottleSize, 
  SupabaseConfig 
} from '../types';
import { dataRepo, SUPABASE_SQL_MIGRATION } from '../lib/storage';
import { supabaseService } from '../lib/supabaseClient';
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
  AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => dataRepo.isAdminLoggedIn());
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'inquiries' | 'content' | 'nav' | 'supabase'
  >('overview');

  // Repositories state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<EventInquiry[]>([]);
  const [content, setContent] = useState<SiteContent>(dataRepo.getContent());
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [supabaseCfg, setSupabaseCfg] = useState<SupabaseConfig>(dataRepo.getSupabaseConfig());

  // Modals & form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);

  // Subscribe to storage changes
  useEffect(() => {
    const refreshData = () => {
      setProducts(dataRepo.getProducts());
      setOrders(dataRepo.getOrders());
      setInquiries(dataRepo.getInquiries());
      setContent(dataRepo.getContent());
      setNavItems(dataRepo.getNavItems());
      setSupabaseCfg(dataRepo.getSupabaseConfig());
    };
    refreshData();
    const unsubscribe = dataRepo.subscribe(refreshData);
    return () => unsubscribe();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (dataRepo.adminLogin(loginPass)) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Administrator Key. Please enter "admin123" or "delightful2026"');
    }
  };

  const handleLogout = () => {
    dataRepo.adminLogout();
    setIsAuthenticated(false);
  };

  // Calculations for KPI cards
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;
  const newInquiriesCount = inquiries.filter((i) => i.status === 'new').length;

  // Product save handler
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    dataRepo.updateProduct(editingProduct);
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const handleNewProductInit = () => {
    const newId = 'prod-' + Date.now();
    const newP: Product = {
      id: newId,
      name: 'New Seasonal Juice',
      slug: 'new-seasonal-juice-' + Date.now(),
      category: 'ginger',
      categoryLabel: 'Ginger Elixirs',
      tagline: 'Freshly pressed cold drink with herbs',
      description: 'Crafted with natural ingredients and infused with our signature DelightOil.',
      ingredients: ['Cold-Pressed Ginger', 'Fresh Citrus', 'DelightOil'],
      tasteProfile: 'Zesty, crisp and balanced sweetness',
      healthBenefits: ['Natural immune support', 'Revitalizing enzymes'],
      sizes: [
        { size: '35cl', label: '35cl Pocket Sip', price: 5.50 },
        { size: '50cl', label: '50cl Daily Refresh', price: 7.50 },
        { size: '1L', label: '1 Litre Family Jug', price: 14.00 },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80',
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

  // Test Supabase Connection
  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSyncStatusMsg(null);
    const res = await dataRepo.testSupabaseConnection(supabaseCfg.url, supabaseCfg.anonKey);
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

  const [loginMethod, setLoginMethod] = useState<'supabase' | 'pin'>('supabase');
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
      setLoginError(res.error || 'Failed to authenticate via Supabase Auth.');
    }
  };

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (dataRepo.adminLogin(loginPass)) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Administrator Key. Please enter "admin123" or "delightful2026"');
    }
  };

  // 1-Click Seed Supabase Tables
  const handleSeedSupabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      // 1. Seed products
      for (const p of products) {
        await supabaseService.upsertProduct(p);
      }
      // 2. Seed site content
      await supabaseService.upsertSiteContent(content);
      // 3. Seed navigation
      await supabaseService.saveNavigation(navItems);

      setIsSeeding(false);
      setSeedResult('Successfully seeded all 6 official drinks, site copy, and navigation items into your Supabase project!');
      // Re-test connection to update table counters
      await handleTestSupabase();
    } catch (err: any) {
      setIsSeeding(false);
      setSeedResult(`Seeding notice: ${err.message || 'Check table schema'}`);
    }
  };

  // Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#12351F] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-[#E1AD01] text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div>
            <h2 className="font-display font-black text-2xl text-[#1B4D2E]">
              Delightful Juice Admin
            </h2>
            <p className="text-xs text-[#1B4D2E]/70 mt-1">
              Authorized business portal for Oluyemi B. Ajibolade
            </p>
          </div>

          {/* Login Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-[#FFF8E7] p-1 rounded-xl border border-[#1B4D2E]/15 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('supabase');
                setLoginError('');
              }}
              className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                loginMethod === 'supabase'
                  ? 'bg-[#1B4D2E] text-white shadow-xs'
                  : 'text-[#1B4D2E]/70 hover:text-[#1B4D2E]'
              }`}
            >
              Supabase Auth
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('pin');
                setLoginError('');
              }}
              className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                loginMethod === 'pin'
                  ? 'bg-[#1B4D2E] text-white shadow-xs'
                  : 'text-[#1B4D2E]/70 hover:text-[#1B4D2E]'
              }`}
            >
              Master Key
            </button>
          </div>

          {loginMethod === 'supabase' ? (
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
                  placeholder="olalekanakande70@gmail.com"
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
                  placeholder="Enter Supabase password"
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
                  {isLoggingIn ? 'Verifying with Supabase...' : 'Sign In with Supabase'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Exit
                </button>
              </div>

              <p className="text-[11px] text-gray-500 text-center">
                Need quick access? Click <strong>Master Key</strong> tab above.
              </p>
            </form>
          ) : (
            <form onSubmit={handlePinLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                  Admin Master PIN or Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="Enter admin password (e.g. admin123)"
                  className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-3 text-sm text-[#1B4D2E] focus:ring-2 focus:ring-[#E1AD01] focus:outline-hidden"
                />
                <div className="text-[11px] text-[#1B4D2E]/60 mt-1">
                  Default credentials: <span className="font-mono font-bold text-[#1B4D2E]">admin123</span> or <span className="font-mono font-bold text-[#1B4D2E]">delightful2026</span>
                </div>
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
                  className="flex-1 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3 px-4 rounded-xl text-sm shadow-md transition-all cursor-pointer"
                >
                  Sign In to Dashboard
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
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F4E8CB] flex flex-col overflow-hidden text-[#1B4D2E]">
      
      {/* Top Admin Header Bar */}
      <div className="bg-[#1B4D2E] text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[#E1AD01]/40 shrink-0 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#E1AD01] text-[#1B4D2E] flex items-center justify-center font-black text-sm">
            DJ
          </div>
          <div>
            <div className="font-display font-extrabold text-base text-[#FFF8E7] flex items-center space-x-2">
              <span>Delightful Juice Admin</span>
              <span className="text-[10px] bg-[#E1AD01] text-[#1B4D2E] font-black px-2 py-0.5 rounded-full uppercase">
                CMS v2.0
              </span>
            </div>
            <div className="text-[10px] text-[#FFF8E7]/70">
              Quakertown Kitchen Operations • C.E.O. {content.ceoName}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Supabase status indicator */}
          <div 
            onClick={() => setActiveTab('supabase')} 
            className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border border-white/20 bg-white/10 hover:bg-white/20"
          >
            <span className={`w-2 h-2 rounded-full ${supabaseCfg.connected ? 'bg-emerald-400' : 'bg-[#E1AD01]'}`} />
            <span>{supabaseCfg.connected ? 'Supabase Connected' : 'Local Storage Mode'}</span>
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
        <aside className="w-20 md:w-64 bg-white border-r border-[#1B4D2E]/10 flex flex-col justify-between shrink-0">
          <nav className="p-3 md:p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0 text-[#E1AD01]" />
              <span className="hidden md:inline">Dashboard</span>
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
                <Package className="w-5 h-5 shrink-0 text-[#E1AD01]" />
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
                <ShoppingBag className="w-5 h-5 shrink-0 text-[#E1AD01]" />
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
                <Calendar className="w-5 h-5 shrink-0 text-[#E1AD01]" />
                <span className="hidden md:inline">Event Catering</span>
              </div>
              {newInquiriesCount > 0 && (
                <span className="hidden md:inline text-[11px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                  {newInquiriesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                  : 'text-[#1B4D2E]/75 hover:bg-[#FFF8E7]'
              }`}
            >
              <FileText className="w-5 h-5 shrink-0 text-[#E1AD01]" />
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
              <Navigation className="w-5 h-5 shrink-0 text-[#E1AD01]" />
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
              <Database className="w-5 h-5 shrink-0 text-[#E1AD01]" />
              <span className="hidden md:inline">Supabase Database</span>
            </button>
          </nav>

          <div className="p-3 md:p-4 border-t border-[#1B4D2E]/10 space-y-2">
            <button
              onClick={() => {
                if (confirm('Reset all demo data back to default factory seed?')) {
                  dataRepo.resetToDefaultSeed();
                  alert('Data restored to initial official factory state!');
                }
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-2 text-[11px] font-semibold text-[#1B4D2E]/70 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Factory Seed</span>
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
                    All sizes (35cl, 50cl, 1L)
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
                      className="text-xs font-bold text-[#E1AD01] bg-[#1B4D2E] px-3 py-1.5 rounded-lg"
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
                              {ord.items.map((i) => `${i.quantity}x ${i.productName} (${i.size})`).join(', ')}
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
                      Quick Kitchen Actions
                    </h3>
                    <div className="space-y-2">
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

                      <button
                        onClick={() => setActiveTab('inquiries')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#143822] hover:bg-[#0e2717] border border-[#E1AD01]/20 text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-[#E1AD01]" />
                          <span>Review Event Proposals</span>
                        </div>
                        <span>→</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('supabase')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#143822] hover:bg-[#0e2717] border border-[#E1AD01]/20 text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Database className="w-4 h-4 text-[#E1AD01]" />
                          <span>Supabase Connection & SQL</span>
                        </div>
                        <span>→</span>
                      </button>
                    </div>
                  </div>

                  {/* Supabase Status Tile */}
                  <div className="bg-white p-5 rounded-3xl border border-[#1B4D2E]/10 shadow-xs text-xs space-y-2">
                    <div className="font-bold text-[#1B4D2E]">Storage Engine Status</div>
                    <p className="text-gray-600 text-[11px]">
                      {supabaseCfg.connected
                        ? 'Connected to live Supabase Postgres database. Public writes and orders sync automatically.'
                        : 'Using Local Storage engine with instant persistence. Connect your Supabase project in the Supabase tab.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('supabase')}
                      className="text-xs font-bold text-[#1B4D2E] underline"
                    >
                      Configure Supabase
                    </button>
                  </div>
                </div>

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
                    Manage flavors, bottle sizes (35cl, 50cl, 1L), prices, and inventory
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
                        <th className="p-4">Drink</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Bottle Sizes & Prices</th>
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
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-sm text-[#1B4D2E]">{p.name}</div>
                                <div className="text-[11px] text-gray-500 line-clamp-1">{p.tagline}</div>
                                {p.badge && (
                                  <span className="inline-block mt-1 bg-[#E1AD01]/25 text-[#1B4D2E] text-[9px] font-bold px-2 py-0.5 rounded-sm">
                                    {p.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-gray-700">{p.categoryLabel}</span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              {p.sizes.map((s) => (
                                <div key={s.size} className="text-[11px] text-gray-700">
                                  <strong className="text-[#1B4D2E]">{s.size}:</strong> ${s.price.toFixed(2)}
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
                                title="Edit Drink"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete ${p.name}?`)) {
                                    dataRepo.deleteProduct(p.id);
                                  }
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Drink"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
                  .map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-6 border border-[#1B4D2E]/10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-black text-sm text-[#1B4D2E] bg-[#FFF8E7] px-2.5 py-1 rounded-lg border border-[#1B4D2E]/15">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              order.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'preparing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div>
                          <div className="font-bold text-base text-[#1B4D2E]">{order.customerName}</div>
                          <div className="text-xs text-gray-600 flex items-center space-x-2">
                            <span>Phone: {order.customerPhone}</span>
                            <span>•</span>
                            <span>Email: {order.customerEmail}</span>
                          </div>
                          <div className="text-xs text-gray-700 mt-1">
                            <strong>Delivery:</strong> {order.deliveryAddress} ({order.deliveryMethod})
                          </div>
                          {order.notes && (
                            <div className="text-xs text-amber-800 italic mt-0.5">
                              Note: {order.notes}
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="pt-2 flex flex-wrap gap-2">
                          {order.items.map((it, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold bg-[#FFF8E7] text-[#1B4D2E] px-2.5 py-1 rounded-lg border border-[#1B4D2E]/10"
                            >
                              {it.quantity}x {it.productName} ({it.size}) - ${(it.unitPrice * it.quantity).toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Status Switcher & WhatsApp Notification */}
                      <div className="shrink-0 space-y-3 lg:text-right border-t lg:border-t-0 pt-4 lg:pt-0">
                        <div>
                          <div className="text-xs text-gray-500">Total Order Amount</div>
                          <div className="font-display font-extrabold text-2xl text-[#1B4D2E]">
                            ${order.total.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase">
                            Paid via: {order.paymentMethod}
                          </div>
                        </div>

                        <div className="flex flex-wrap lg:justify-end gap-2">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              dataRepo.updateOrderStatus(order.id, e.target.value as Order['status'])
                            }
                            className="bg-[#FFF8E7] border border-[#1B4D2E]/20 text-xs font-bold rounded-xl px-3 py-1.5 text-[#1B4D2E]"
                          >
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <a
                            href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                              order.customerName
                            )}%2C%20your%20Delightful%20Juice%20order%20(${order.orderNumber})%20status%20is%20now%3A%20${encodeURIComponent(
                              order.status
                            )}.%20Thank%20you%20for%20choosing%20Delightful%20Juice!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Customer</span>
                          </a>

                          <button
                            onClick={() => {
                              if (confirm('Delete this order record?')) {
                                dataRepo.deleteOrder(order.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1.5"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB: EVENT CATERING INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                  Event & Catering Proposals
                </h2>
                <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                  Review custom bottle requests for weddings, birthdays, reunions, and corporate symposiums
                </p>
              </div>

              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-white rounded-3xl p-6 border border-[#1B4D2E]/10 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-base text-[#1B4D2E]">{inq.fullName}</span>
                          <span className="text-xs bg-[#E1AD01]/25 text-[#1B4D2E] font-bold px-2 py-0.5 rounded-md">
                            {inq.eventType}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Phone: {inq.phone} • Email: {inq.email} • Venue: {inq.eventLocation}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <select
                          value={inq.status}
                          onChange={(e) =>
                            dataRepo.updateInquiryStatus(inq.id, e.target.value as EventInquiry['status'])
                          }
                          className="bg-[#FFF8E7] border border-[#1B4D2E]/20 text-xs font-bold rounded-xl px-3 py-1.5 text-[#1B4D2E]"
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="quoted">Quoted</option>
                          <option value="booked">Booked</option>
                          <option value="declined">Declined</option>
                        </select>

                        <a
                          href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                            inq.fullName
                          )}%2C%20this%20is%20Oluyemi%20from%20Delightful%20Juice.%20I%20reviewed%20your%20${encodeURIComponent(
                            inq.eventType
                          )}%20catering%20inquiry%20for%20${inq.guestCount}%20guests.%20Here%20is%20our%20official%20quote...`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Reply on WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FFF8E7] p-3.5 rounded-2xl text-xs">
                      <div>
                        <span className="text-gray-500 block">Event Date:</span>
                        <strong className="text-[#1B4D2E]">{inq.eventDate}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Guests:</span>
                        <strong className="text-[#1B4D2E]">{inq.guestCount} People</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Bottle Sizes:</span>
                        <strong className="text-[#1B4D2E]">{inq.bottleSizesNeeded.join(', ')}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Custom Labeling:</span>
                        <strong className={inq.customLabelingNeeded ? 'text-emerald-700' : 'text-gray-500'}>
                          {inq.customLabelingNeeded ? 'Yes (Requested)' : 'No'}
                        </strong>
                      </div>
                    </div>

                    <div className="text-xs text-gray-700">
                      <strong>Requested Flavors: </strong>
                      {inq.selectedFlavors.join(', ')}
                    </div>

                    {inq.message && (
                      <div className="text-xs bg-gray-50 p-3 rounded-xl border border-gray-200 text-gray-800">
                        <strong>Client Note: </strong>
                        {inq.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CONTENT CMS */}
          {activeTab === 'content' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                  Website Copy & Brand CMS
                </h2>
                <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                  Update headlines, announcements, and contact information without editing code
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={content.businessName}
                      onChange={(e) => setContent({ ...content, businessName: e.target.value })}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#1B4D2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      C.E.O. Name
                    </label>
                    <input
                      type="text"
                      value={content.ceoName}
                      onChange={(e) => setContent({ ...content, ceoName: e.target.value })}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs font-bold text-[#1B4D2E]"
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
                    Top Announcement Ticker
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

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      dataRepo.saveContent(content);
                      alert('Website Content changes saved persistently!');
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

          {/* TAB: NAVIGATION MANAGEMENT */}
          {activeTab === 'nav' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                  Navigation Menu Management
                </h2>
                <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                  Control which links appear in header and mobile drawers
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#1B4D2E]/10 shadow-sm space-y-4">
                {navItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 bg-[#FFF8E7] rounded-2xl border border-[#1B4D2E]/15"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-[#1B4D2E]">{item.label}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{item.href}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const updated = navItems.map((n) =>
                            n.id === item.id ? { ...n, visible: !n.visible } : n
                          );
                          setNavItems(updated);
                          dataRepo.saveNavItems(updated);
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer ${
                          item.visible ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {item.visible ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SUPABASE INTEGRATION */}
          {activeTab === 'supabase' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
                  Supabase Integration & Database Schema
                </h2>
                <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
                  Connect your live Supabase project for persistent cloud tables, orders, and authentication
                </p>
              </div>

              {/* Status Banner */}
              <div
                className={`p-5 rounded-3xl border flex items-start space-x-4 ${
                  supabaseCfg.connected
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <Database className="w-6 h-6 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-sm">
                    {supabaseCfg.connected ? 'Connected to Supabase Project' : 'Ready for Supabase Connection'}
                  </div>
                  <p>
                    {supabaseCfg.connected
                      ? `Active client connected. Orders, inquiries, and drinks sync with your project tables.`
                      : `The website currently uses browser-local persistent storage. Enter your Supabase Project URL and Anon Public Key below to link your database.`}
                  </p>
                </div>
              </div>

              {/* Supabase Credentials Form */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
                  Supabase Project Credentials
                </h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseCfg.url}
                    onChange={(e) => setSupabaseCfg({ ...supabaseCfg, url: e.target.value })}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseCfg.anonKey}
                    onChange={(e) => setSupabaseCfg({ ...supabaseCfg, anonKey: e.target.value })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-2.5 text-xs text-[#1B4D2E] font-mono"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Use the publishable 'anon' key (never paste your service role key in frontend code).
                  </span>
                </div>

                {syncStatusMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      syncStatusMsg.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {syncStatusMsg.text}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleTestSupabase}
                    disabled={isTestingSupabase}
                    className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs py-3 px-5 rounded-xl shadow-md cursor-pointer flex items-center space-x-2"
                  >
                    <Database className="w-4 h-4 text-[#E1AD01]" />
                    <span>{isTestingSupabase ? 'Testing Connection...' : 'Save & Test Connection'}</span>
                  </button>

                  <button
                    onClick={handleSeedSupabase}
                    disabled={isSeeding || !supabaseCfg.connected}
                    className={`font-bold text-xs py-3 px-5 rounded-xl shadow-xs cursor-pointer flex items-center space-x-2 transition-all ${
                      supabaseCfg.connected
                        ? 'bg-[#E1AD01] hover:bg-[#c99a00] text-[#1B4D2E]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    title={supabaseCfg.connected ? 'Seed all 6 official drinks and site copy to Supabase' : 'Connect to Supabase first'}
                  >
                    <Sparkles className="w-4 h-4 text-[#1B4D2E]" />
                    <span>{isSeeding ? 'Seeding Database...' : 'Seed Supabase Tables (1-Click)'}</span>
                  </button>

                  <a
                    href="https://supabase.com/dashboard/project/abrgqtrobgorsaggooxv/sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 hover:bg-gray-200 text-[#1B4D2E] font-bold text-xs py-3 px-4 rounded-xl flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {seedResult && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{seedResult}</span>
                  </div>
                )}
              </div>

              {/* SQL Migration Script Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
                      1. Schema Migration SQL (supabase/migrations/)
                    </h3>
                    <p className="text-xs text-gray-600">
                      Creates the 6 tables: products, orders, event_inquiries, site_content, navigation_items, and admin_profiles with RLS security policies.
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

              {/* Seed SQL Script Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/10 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
                      2. Idempotent Seed SQL (supabase/seed.sql)
                    </h3>
                    <p className="text-xs text-gray-600">
                      Seeds the official Zobo, Organic Ginger, Ginger Mango, Pineapple, Lychee, Tigernut Milk, Celebration Sampler, and Quakertown business info.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_MIGRATION); // or seed script
                      alert('You can also find the full seed script in supabase/seed.sql!');
                    }}
                    className="bg-[#1B4D2E] text-[#FFF8E7] hover:bg-[#143822] text-xs font-bold py-2 px-3.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <FileText className="w-4 h-4 text-[#E1AD01]" />
                    <span>Viewed in supabase/seed.sql</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Product Edit / Add Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-xl text-[#1B4D2E]">
                {isAddingProduct ? 'Add New Drink Recipe' : `Edit ${editingProduct.name}`}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
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
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-[#FFF8E7] border rounded-xl p-2.5 text-[#1B4D2E]"
                />
              </div>

              {/* Bottle Sizes Prices */}
              <div>
                <label className="block font-bold mb-1">Pricing per Bottle Size ($)</label>
                <div className="grid grid-cols-3 gap-2">
                  {editingProduct.sizes.map((s, idx) => (
                    <div key={s.size} className="bg-[#FFF8E7] p-2.5 rounded-xl border border-gray-200">
                      <span className="font-bold block text-[11px] mb-1">{s.size}</span>
                      <input
                        type="number"
                        step="0.25"
                        value={s.price}
                        onChange={(e) => {
                          const updatedSizes = [...editingProduct.sizes];
                          updatedSizes[idx] = { ...s, price: parseFloat(e.target.value) || 0 };
                          setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                        }}
                        className="w-full bg-white border rounded-lg p-1.5 font-extrabold text-[#1B4D2E]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Image URL</label>
                <input
                  type="url"
                  value={editingProduct.imageUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  className="w-full bg-[#FFF8E7] border rounded-xl p-2.5 text-gray-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Badge Callout (Optional)</label>
                <input
                  type="text"
                  value={editingProduct.badge || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                  placeholder="e.g. Customer #1 Favorite"
                  className="w-full bg-[#FFF8E7] border rounded-xl p-2.5 text-[#1B4D2E]"
                />
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
                  className="px-4 py-2.5 text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1B4D2E] hover:bg-[#143822] text-white font-bold px-6 py-2.5 rounded-xl shadow-xs"
                >
                  Save Drink
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
