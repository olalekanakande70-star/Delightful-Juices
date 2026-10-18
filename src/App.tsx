/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { dataRepo } from './lib/storage';
import { Product, SiteContent, NavItem } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { SignaturePromiseSection } from './components/SignaturePromiseSection';
import { EventsCateringSection } from './components/EventsCateringSection';
import { WholesaleSection } from './components/WholesaleSection';
import { AboutSection } from './components/AboutSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminDashboard } from './admin/AdminDashboard';
import { MessageCircle, ShoppingCart, ArrowUp } from 'lucide-react';

function MainApp() {
  const { isCartOpen, setIsCartOpen, totalCount, toastMessage } = useCart();
  const [content, setContent] = useState<SiteContent>(dataRepo.getContent());
  const [navItems, setNavItems] = useState<NavItem[]>(dataRepo.getNavItems());
  const [products, setProducts] = useState<Product[]>(dataRepo.getProducts());
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const checkIsAdminRoute = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path === '/admin' || path.startsWith('/admin') || hash === '#admin';
  };

  const openAdmin = () => {
    if (!checkIsAdminRoute()) {
      window.history.pushState(null, '', '/admin');
    }
    setIsAdminOpen(true);
  };

  const closeAdmin = () => {
    if (checkIsAdminRoute()) {
      window.history.pushState(null, '', '/');
    }
    setIsAdminOpen(false);
  };

  // Sync state with storage updates & browser navigation
  useEffect(() => {
    const handleUpdate = () => {
      setContent(dataRepo.getContent());
      setNavItems(dataRepo.getNavItems());
      setProducts(dataRepo.getProducts());
    };
    const unsubscribe = dataRepo.subscribe(handleUpdate);

    // Initial route check for /admin
    if (checkIsAdminRoute()) {
      setIsAdminOpen(true);
    }

    // Handle browser back and forward navigation
    const handlePopState = () => {
      setIsAdminOpen(checkIsAdminRoute());
    };
    window.addEventListener('popstate', handlePopState);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);

    // Handle Stripe redirect params
    const params = new URLSearchParams(window.location.search);
    if (params.get('order_success') === 'true') {
      const orderNum = params.get('order_number') || 'DJ-Order';
      const orders = dataRepo.getOrders();
      const target = orders.find((o) => o.orderNumber === orderNum);
      if (target) {
        dataRepo.updateOrderStatus(target.id, 'preparing');
      }
      // Clean query string from browser bar without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      unsubscribe();
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-[var(--text-color)] flex flex-col selection:bg-[#E1AD01] selection:text-[#1B4D2E]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1B4D2E] text-[#FFF8E7] px-5 py-3 rounded-2xl shadow-2xl border border-[#E1AD01]/40 text-xs sm:text-sm font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-[#E1AD01] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        content={content}
        navItems={navItems}
        onOpenAdmin={openAdmin}
        isAdminLoggedIn={dataRepo.isAdminLoggedIn()}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero
          content={content}
          onExploreClick={() => scrollToSection('menu')}
          onEventClick={() => scrollToSection('events-catering')}
        />

        <MenuSection
          products={products}
          onOpenDetails={(p) => setSelectedProductForModal(p)}
          whatsappNumber={content.whatsappNumber}
        />

        <SignaturePromiseSection content={content} />

        <EventsCateringSection content={content} />

        <WholesaleSection
          content={content}
          onCateringClick={() => scrollToSection('events-catering')}
        />

        <AboutSection content={content} />

        <FaqSection content={content} />

        <ContactSection content={content} />
      </main>

      {/* Footer */}
      <Footer
        content={content}
        navItems={navItems}
        onOpenAdmin={openAdmin}
        isAdminLoggedIn={dataRepo.isAdminLoggedIn()}
      />

      {/* Floating Action Buttons (Sticky Quick Contacts & Bag) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end space-y-3">
        {/* Scroll To Top */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1B4D2E] shadow-md border border-[#1B4D2E]/20 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        {/* Floating WhatsApp Action */}
        <a
          href={`https://wa.me/${content.whatsappNumber}?text=Hello%20Delightful%20Juice%2C%20I%20would%20like%20to%20order%20or%20ask%20a%20question.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
          title="Chat with Kitchen on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="hidden sm:inline text-xs font-bold">{content.chatButtonLabel || 'Chat with Kitchen'}</span>
        </a>

        {/* Floating Cart Pill on Mobile */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden flex items-center space-x-2 bg-[#1B4D2E] text-[#FFF8E7] px-4 py-2.5 rounded-full shadow-xl border border-[#E1AD01]/40 font-bold text-xs cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4 text-[#E1AD01]" />
          <span>Cart ({totalCount})</span>
        </button>
      </div>

      {/* Overlays & Modals */}
      <CartDrawer content={content} />
      <CheckoutModal content={content} />
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        whatsappNumber={content.whatsappNumber}
      />

      {/* Admin Dashboard Overlay */}
      {isAdminOpen && (
        <AdminDashboard onClose={closeAdmin} />
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
