/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { dataRepo } from './lib/storage';
import { Product, SiteContent, NavItem, HeroSlide, CmsPage } from './types';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { MenuSection } from './components/MenuSection';
import { SignaturePromiseSection } from './components/SignaturePromiseSection';
import { AboutSection } from './components/AboutSection';
import { FaqSection } from './components/FaqSection';
import { ShopPage } from './components/ShopPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { DynamicPageRenderer } from './components/DynamicPageRenderer';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminDashboard } from './admin/AdminDashboard';
import { MessageCircle, ShoppingCart, ArrowUp, ShoppingBag, ArrowRight, Calendar } from 'lucide-react';

function normalizePathname(raw: string): string {
  if (!raw) return '/';
  const clean = raw.split('?')[0].split('#')[0].trim();
  if (!clean || clean === '/') return '/';
  return clean.endsWith('/') ? clean.slice(0, -1) : clean;
}

function MainApp() {
  const { setIsCartOpen, totalCount, toastMessage, showToast } = useCart();
  const [content, setContent] = useState<SiteContent>(() => dataRepo.getContent());
  const [navItems, setNavItems] = useState<NavItem[]>(() => dataRepo.getNavItems());
  const [products, setProducts] = useState<Product[]>(() => dataRepo.getProducts());
  const [productsLoaded, setProductsLoaded] = useState<boolean>(() =>
    dataRepo.isProductsLoaded()
  );
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => dataRepo.getHeroSlides());
  const [heroSlidesLoaded, setHeroSlidesLoaded] = useState<boolean>(() =>
    dataRepo.isHeroSlidesLoaded()
  );
  const [cmsPages, setCmsPages] = useState<CmsPage[]>(() => dataRepo.getPages());
  const [cmsPagesLoaded, setCmsPagesLoaded] = useState<boolean>(() =>
    dataRepo.isCmsPagesLoaded()
  );
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePathname(window.location.pathname)
  );
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => {
    const p = normalizePathname(window.location.pathname).toLowerCase();
    const h = window.location.hash.toLowerCase();
    return p === '/admin' || p.startsWith('/admin/') || h === '#admin';
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  const closeAdmin = useCallback(() => {
    const p = normalizePathname(window.location.pathname).toLowerCase();
    if (p === '/admin' || p.startsWith('/admin/') || window.location.hash.toLowerCase() === '#admin') {
      window.history.pushState(null, '', '/');
      setCurrentPath('/');
    }
    setIsAdminOpen(false);
  }, []);

  const navigate = useCallback((href: string) => {
    if (!href) return;

    // External URLs, mailto, tel
    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      window.location.href = href;
      return;
    }

    // Admin route
    const lower = href.toLowerCase();
    if (lower === '/admin' || lower.startsWith('/admin/') || lower === '#admin') {
      window.history.pushState(null, '', '/admin');
      setCurrentPath('/admin');
      setIsAdminOpen(true);
      return;
    }

    // Hash anchor on homepage
    if (href.startsWith('#')) {
      const targetId = href.slice(1);
      if (normalizePathname(window.location.pathname) !== '/') {
        window.history.pushState(null, '', '/');
        setCurrentPath('/');
      }
      setIsAdminOpen(false);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
      return;
    }

    // Clean internal SPA path (e.g. '/', '/shop', '/about-us', '/contact-us', '/custom-slug')
    const normalized = normalizePathname(href.startsWith('/') ? href : `/${href}`);
    window.history.pushState(null, '', normalized);
    setCurrentPath(normalized);
    setIsAdminOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Sync state with storage updates & browser navigation
  useEffect(() => {
    const handleUpdate = () => {
      setContent(dataRepo.getContent());
      setNavItems(dataRepo.getNavItems());
      setProducts(dataRepo.getProducts());
      setProductsLoaded(dataRepo.isProductsLoaded());
      setHeroSlides(dataRepo.getHeroSlides());
      setHeroSlidesLoaded(dataRepo.isHeroSlidesLoaded());
      setCmsPages(dataRepo.getPages());
      setCmsPagesLoaded(dataRepo.isCmsPagesLoaded());
    };
    const unsubscribe = dataRepo.subscribe(handleUpdate);

    const handlePopState = () => {
      const nextPath = normalizePathname(window.location.pathname);
      const isAdm =
        nextPath.toLowerCase() === '/admin' ||
        nextPath.toLowerCase().startsWith('/admin/') ||
        window.location.hash.toLowerCase() === '#admin';
      setCurrentPath(nextPath);
      setIsAdminOpen(isAdm);
    };
    window.addEventListener('popstate', handlePopState);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);

    // Handle live Stripe Checkout redirect params
    const params = new URLSearchParams(window.location.search);
    if (params.get('order_success') === 'true') {
      const orderNum = params.get('order_number') || 'DJ-Order';
      showToast(`Thank you! Payment received for Order ${orderNum}.`);
      dataRepo.syncFromSupabase();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('order_cancelled') === 'true') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      unsubscribe();
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Update document title for Home and Shop routes (DynamicPageRenderer handles CMS pages)
  useEffect(() => {
    if (currentPath === '/' || currentPath === '/admin') {
      document.title = `${content.businessName} | ${content.motto}`;
    } else if (currentPath === '/shop') {
      document.title = `Shop Fresh Juices | ${content.businessName}`;
    }
  }, [currentPath, content.businessName, content.motto]);

  // Resolve individual product detail route (/shop/:slug or /product/:slug)
  const productRouteSlug = (() => {
    const lower = currentPath.toLowerCase();
    if (lower.startsWith('/shop/') && lower.length > '/shop/'.length) {
      return decodeURIComponent(currentPath.slice('/shop/'.length)).replace(/\/+$/, '').toLowerCase();
    }
    if (lower.startsWith('/product/') && lower.length > '/product/'.length) {
      return decodeURIComponent(currentPath.slice('/product/'.length)).replace(/\/+$/, '').toLowerCase();
    }
    return null;
  })();

  const matchedProduct = productRouteSlug
    ? products.find(
        (p) =>
          p.slug.toLowerCase() === productRouteSlug ||
          p.id.toLowerCase() === productRouteSlug
      )
    : undefined;

  // Resolve active CMS page when currentPath is not '/', '/shop', or a product route
  const activeSlug = currentPath.replace(/^\/+/, '').toLowerCase();
  const matchedPublishedPage =
    currentPath !== '/' &&
    currentPath !== '/shop' &&
    currentPath !== '/admin' &&
    !productRouteSlug
      ? cmsPages.find(
          (p) => p.slug.replace(/^\/+/, '').toLowerCase() === activeSlug && p.status === 'published'
        )
      : undefined;

  const openProductPage = useCallback(
    (product: Product) => {
      navigate(`/shop/${product.slug}`);
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-white text-[var(--text-color)] flex flex-col selection:bg-[#E1AD01] selection:text-[#1B4D2E]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1B4D2E] text-[#FFF8E7] px-5 py-3 rounded-2xl shadow-2xl border border-[#E1AD01]/40 text-xs sm:text-sm font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-[#E1AD01] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header (Multi-page navigation + dropdowns, no public Admin button) */}
      <Header
        content={content}
        navItems={navItems}
        currentPath={currentPath}
        onNavigate={navigate}
      />

      {/* Multi-Page Route View */}
      <main className="flex-1">
        {currentPath === '/' || currentPath === '/admin' ? (
          <>
            {/* 1. Dynamic Full-Width Hero Image Slider with Subtle Ken Burns Zoom */}
            <HeroSlider
              slides={heroSlides}
              content={content}
              onNavigate={navigate}
              isLoading={!heroSlidesLoaded && heroSlides.length === 0}
            />

            {/* 2. Featured Artisanal Drinks with Prominent Shop Now CTA */}
            <MenuSection
              products={products}
              onOpenDetails={openProductPage}
              whatsappNumber={content.whatsappNumber}
              featuredOnly={true}
              onNavigate={navigate}
              isLoading={!productsLoaded && products.length === 0}
            />

            {/* 3. Our Signature Promise */}
            <SignaturePromiseSection content={content} />

            {/* 4. Authentic Quakertown Craft & Story Preview */}
            <AboutSection content={content} onNavigate={navigate} />

            {/* 5. Commercial Promotional Banner: Shop Full Menu & Event Catering */}
            <section className="py-16 bg-[#12351F] text-white border-t border-[#E1AD01]/25">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-[#1B4D2E] to-[#0f2c1a] rounded-3xl p-8 sm:p-12 border border-[#E1AD01]/35 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="max-w-2xl space-y-3">
                    <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-[#E1AD01]">
                      Small-Batch Botanical Goodness • Affordable Delivery
                    </span>
                    <h2 className="font-display font-black text-3xl sm:text-4xl text-[#FFF8E7] leading-tight">
                      Ready to Stock Your Fridge or Host an Unforgettable Event?
                    </h2>
                    <p className="text-sm sm:text-base text-[#FFF8E7]/85 leading-relaxed">
                      Order fresh bottles of Zobo, Ginger Elixirs, and Creamy Tigernut Milk online with affordable local delivery—or request custom-labeled bottles for weddings, birthdays, and corporate gatherings.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3.5 shrink-0">
                    <button
                      onClick={() => navigate('/shop')}
                      className="bg-[#E1AD01] hover:bg-[#f0bc19] text-[#1B4D2E] font-extrabold px-7 py-4 rounded-xl text-sm shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Shop Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => navigate('/events-catering')}
                      className="bg-white/10 hover:bg-white/20 text-[#FFF8E7] border border-[#FFF8E7]/30 font-bold px-6 py-4 rounded-xl text-sm transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-[#E1AD01]" />
                      <span>Events &amp; Catering</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Frequently Asked Questions */}
            <FaqSection content={content} />
          </>
        ) : currentPath === '/shop' ? (
          <ShopPage
            products={products}
            content={content}
            onOpenDetails={openProductPage}
            onNavigate={navigate}
            isLoading={!productsLoaded && products.length === 0}
          />
        ) : productRouteSlug && !productsLoaded && !matchedProduct ? (
          <section className="py-16 px-4 bg-[#FFF8E7] min-h-[65vh]">
            <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-[#1B4D2E]/15 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
              <div className="lg:col-span-6 aspect-square rounded-3xl bg-[#1B4D2E]/10" />
              <div className="lg:col-span-6 space-y-5 py-4">
                <div className="h-4 w-36 bg-[#1B4D2E]/10 rounded-md" />
                <div className="h-10 w-3/4 bg-[#1B4D2E]/15 rounded-xl" />
                <div className="h-24 w-full bg-[#1B4D2E]/10 rounded-2xl" />
                <div className="h-14 w-full bg-[#1B4D2E]/15 rounded-xl" />
              </div>
            </div>
          </section>
        ) : matchedProduct ? (
          <ProductDetailPage
            product={matchedProduct}
            content={content}
            onNavigate={navigate}
          />
        ) : !productRouteSlug && !cmsPagesLoaded && !matchedPublishedPage ? (
          <section className="min-h-[60vh] bg-[#FFF8E7]/60">
            <div className="h-72 bg-gradient-to-br from-[#0E2918] via-[#12351F] to-[#1B4D2E] animate-pulse" />
          </section>
        ) : matchedPublishedPage ? (
          <DynamicPageRenderer
            page={matchedPublishedPage}
            products={products}
            content={content}
            onNavigate={navigate}
            onOpenProductDetails={openProductPage}
            isProductsLoading={!productsLoaded && products.length === 0}
          />
        ) : (
          /* Clean Branded 404 / Unpublished Draft Guard */
          <section className="py-24 px-4 bg-[#FFF8E7]/50 min-h-[60vh] flex items-center justify-center">
            <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#1B4D2E]/15 shadow-lg text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#1B4D2E] text-[#E1AD01] font-display font-black text-xl flex items-center justify-center mx-auto">
                DJ
              </div>
              <div className="space-y-2">
                <h1 className="font-display font-black text-2xl sm:text-3xl text-[#1B4D2E]">
                  Page Not Found
                </h1>
                <p className="text-sm text-[#1B4D2E]/75 leading-relaxed">
                  The page you requested may have moved, or it is currently saved as an unpublished draft. Explore our fresh handcrafted juices below.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/shop')}
                  className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center space-x-2 shadow-sm cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#E1AD01]" />
                  <span>Shop Fresh Juices</span>
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-[#FFF8E7] hover:bg-[#f3e5c0] text-[#1B4D2E] border border-[#1B4D2E]/20 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm cursor-pointer"
                >
                  Return Home
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer
        content={content}
        navItems={navItems}
        onNavigate={navigate}
      />

      {/* Floating Action Buttons (Sticky Quick Contacts & Mobile Bag) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end space-y-3">
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[#1B4D2E] shadow-md border border-[#1B4D2E]/20 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        <a
          href={`https://wa.me/${content.whatsappNumber}?text=Hello%20Delightful%20Juices%2C%20I%20would%20like%20to%20order%20or%20ask%20a%20question.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
          title="Chat with Delightful Juices on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="hidden sm:inline text-xs font-bold">
            {content.chatButtonLabel || 'Chat with Kitchen'}
          </span>
        </a>

        <button
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden flex items-center space-x-2 bg-[#1B4D2E] text-[#FFF8E7] px-4 py-2.5 rounded-full shadow-xl border border-[#E1AD01]/40 font-bold text-xs cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4 text-[#E1AD01]" />
          <span>Cart ({totalCount})</span>
        </button>
      </div>

      {/* Overlays & Modals */}
      <CartDrawer content={content} onNavigate={navigate} />
      <CheckoutModal content={content} />
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        whatsappNumber={content.whatsappNumber}
      />

      {/* Admin Dashboard Overlay (Accessible via /admin URL) */}
      {isAdminOpen && (
        <AdminDashboard onClose={closeAdmin} onNavigate={navigate} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainApp />
    </CartProvider>
  );
}
