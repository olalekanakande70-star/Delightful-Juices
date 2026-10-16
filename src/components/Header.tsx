import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { SiteContent, NavItem } from '../types';
import { 
  ShoppingBag, 
  Menu as MenuIcon, 
  X, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

interface HeaderProps {
  content: SiteContent;
  navItems: NavItem[];
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  content,
  navItems,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const { totalCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleNav = navItems.filter((i) => i.visible);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#1B4D2E] text-[#FFF8E7] text-xs sm:text-sm font-medium py-2 px-4 shadow-sm border-b border-[#143822]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E1AD01] animate-pulse"></span>
            <span className="truncate">{content.announcementTicker}</span>
          </div>

          <div className="hidden md:flex items-center space-x-5 text-xs text-[#FFF8E7]/90 shrink-0">
            <a 
              href={`https://wa.me/${content.whatsappNumber}?text=Hello%20Delightful%20Juice%2C%20I%20would%20like%20to%20inquire%20about%20ordering%20fresh%20drinks!`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-[#E1AD01] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#E1AD01]" />
              <span>WhatsApp: {content.phone}</span>
            </a>
            <span className="text-[#E1AD01]/40">•</span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#E1AD01]" />
              <span>Quakertown, PA</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FFF8E7]/95 backdrop-blur-md border-b border-[#1B4D2E]/10 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Brand */}
            <a href="#" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-full bg-[#1B4D2E] border-2 border-[#E1AD01] flex items-center justify-center text-[#E1AD01] shadow-md group-hover:scale-105 transition-transform">
                <span className="font-display font-black text-xl italic tracking-tight">DJ</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl sm:text-2xl text-[#1B4D2E] leading-tight tracking-tight">
                  Delightful<span className="text-[#E1AD01]">Juice</span>
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#1B4D2E]/70">
                  {content.motto}
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7">
              {visibleNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href)}
                  className="text-sm font-semibold text-[#1B4D2E]/80 hover:text-[#1B4D2E] relative py-1 transition-colors hover:after:w-full after:w-0 after:h-0.5 after:bg-[#E1AD01] after:absolute after:bottom-0 after:left-0 after:transition-all cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Action Buttons & Cart */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              
              {/* Admin Portal Shortcut */}
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center space-x-1 text-xs font-medium px-2.5 py-1.5 rounded-md text-[#1B4D2E]/70 hover:text-[#1B4D2E] hover:bg-[#1B4D2E]/5 border border-[#1B4D2E]/20 transition-all cursor-pointer"
                title="Open Admin Portal"
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${isAdminLoggedIn ? 'text-green-600' : 'text-[#E1AD01]'}`} />
                <span>{isAdminLoggedIn ? 'Admin Active' : 'Admin'}</span>
              </button>

              {/* Shopping Bag Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:shadow transition-all group cursor-pointer"
                aria-label="View Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4 text-[#E1AD01] group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Bag</span>
                {totalCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold bg-[#E1AD01] text-[#1B4D2E] rounded-full shadow-xs animate-bounce">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[#1B4D2E] hover:bg-[#1B4D2E]/10 transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FFF8E7] border-b border-[#1B4D2E]/15 px-6 pt-3 pb-6 shadow-xl animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-3">
              {visibleNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href)}
                  className="text-left text-base font-semibold py-2.5 px-3 rounded-lg text-[#1B4D2E] hover:bg-[#1B4D2E]/10 transition-colors flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-[#E1AD01] text-xs">→</span>
                </button>
              ))}

              <div className="pt-3 border-t border-[#1B4D2E]/10 flex flex-col space-y-2">
                <a
                  href={`tel:${content.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center space-x-2 py-2 px-3 text-sm font-semibold text-[#1B4D2E] rounded-lg bg-[#E1AD01]/20 hover:bg-[#E1AD01]/30"
                >
                  <Phone className="w-4 h-4 text-[#1B4D2E]" />
                  <span>Call Us: {content.phone}</span>
                </a>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="flex items-center space-x-2 py-2 px-3 text-sm font-medium text-[#1B4D2E]/80 rounded-lg hover:bg-[#1B4D2E]/10"
                >
                  <ShieldCheck className="w-4 h-4 text-[#E1AD01]" />
                  <span>Admin CMS Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
