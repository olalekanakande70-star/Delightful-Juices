import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { SiteContent, NavItem } from '../types';
import { sanitizeBrandText } from '../lib/units';
import {
  ShoppingCart,
  Menu as MenuIcon,
  X,
  Phone,
  MapPin,
  MessageCircle,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';

interface HeaderProps {
  content: SiteContent;
  navItems: NavItem[];
  currentPath: string;
  onNavigate: (href: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  content,
  navItems,
  currentPath,
  onNavigate,
}) => {
  const { totalCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [expandedMobileGroupIds, setExpandedMobileGroupIds] = useState<Record<string, boolean>>({});
  const [logoImgError, setLogoImgError] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setLogoImgError(false);
  }, [content.branding?.logoUrl]);

  // Build hierarchical navigation tree from flat navItems
  const visibleItems = navItems
    .filter((i) => i.visible)
    .sort((a, b) => a.order - b.order);

  const topLevelItems = visibleItems.filter((item) => !item.parentId);
  const getChildren = (parentId: string) =>
    visibleItems.filter((child) => child.parentId === parentId);

  // Close desktop dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLinkSelect = (href: string) => {
    setOpenDropdownId(null);
    setMobileMenuOpen(false);
    onNavigate(href);
  };

  const isRouteActive = (href: string) => {
    if (!href || href.startsWith('#')) return false;
    const cleanCurrent = currentPath === '' ? '/' : currentPath;
    if (href === '/') return cleanCurrent === '/';
    return cleanCurrent === href || cleanCurrent.startsWith(`${href}/`);
  };

  const brandTitle = sanitizeBrandText(
    content.branding?.logoText || content.businessName || 'Delightful Juices'
  );

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#1B4D2E] text-[#FFF8E7] text-xs sm:text-sm font-medium py-2 px-4 shadow-xs border-b border-[#143822]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E1AD01] animate-pulse shrink-0" />
            <span className="truncate">{sanitizeBrandText(content.announcementTicker)}</span>
          </div>

          <div className="hidden md:flex items-center space-x-5 text-xs text-[#FFF8E7]/90 shrink-0">
            <a
              href={`https://wa.me/${content.whatsappNumber}?text=Hello%20Delightful%20Juices%2C%20I%20would%20like%20to%20inquire%20about%20ordering%20fresh%20drinks!`}
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

      {/* Main Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#1B4D2E]/10 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-3">
            {/* Brand Logo */}
            <button
              type="button"
              onClick={() => handleLinkSelect('/')}
              className="flex items-center space-x-3 group text-left cursor-pointer shrink-0"
            >
              {content.branding?.showLogoIcon !== false &&
                (content.branding?.logoUrl && !logoImgError ? (
                  <img
                    src={content.branding.logoUrl}
                    alt={brandTitle}
                    onError={() => setLogoImgError(true)}
                    className="h-11 sm:h-12 w-auto max-w-[160px] sm:max-w-[200px] object-contain group-hover:scale-105 transition-transform shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1B4D2E] border-2 border-[#E1AD01] flex items-center justify-center text-[#E1AD01] shadow-md group-hover:scale-105 transition-transform shrink-0">
                    <span className="font-display font-black text-lg sm:text-xl italic tracking-tight">
                      DJ
                    </span>
                  </div>
                ))}
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-lg sm:text-2xl text-[#1B4D2E] leading-tight tracking-tight whitespace-nowrap">
                  {brandTitle === 'Delightful Juices' ? (
                    <>
                      Delightful <span className="text-[#E1AD01]">Juices</span>
                    </>
                  ) : (
                    brandTitle
                  )}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#1B4D2E]/70 whitespace-nowrap">
                  {content.motto}
                </span>
              </div>
            </button>

            {/* Desktop Navigation with Dropdown Support */}
            <nav
              ref={navRef}
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center space-x-1.5 xl:space-x-2.5 bg-[#FFF8E7]/75 border border-[#1B4D2E]/12 px-2.5 py-1.5 rounded-2xl shadow-2xs min-w-0"
            >
              {topLevelItems.map((item) => {
                const children = getChildren(item.id);
                const hasDropdown = item.isDropdown || children.length > 0;
                const isOpen = openDropdownId === item.id;
                const isActive =
                  isRouteActive(item.href) || children.some((c) => isRouteActive(c.href));

                if (!hasDropdown) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleLinkSelect(item.href)}
                      className={`text-xs xl:text-sm font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                          : 'text-[#1B4D2E]/85 hover:text-[#1B4D2E] hover:bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setOpenDropdownId(item.id)}
                    onMouseLeave={() => setOpenDropdownId((prev) => (prev === item.id ? null : prev))}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      onClick={() => setOpenDropdownId(isOpen ? null : item.id)}
                      className={`inline-flex items-center space-x-1 text-xs xl:text-sm font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                          : isOpen
                          ? 'bg-white text-[#1B4D2E] shadow-2xs'
                          : 'text-[#1B4D2E]/85 hover:text-[#1B4D2E] hover:bg-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isActive
                            ? 'text-[#E1AD01]'
                            : isOpen
                            ? 'rotate-180 text-[#E1AD01]'
                            : 'text-[#1B4D2E]/70'
                        }`}
                      />
                    </button>

                    {/* Dropdown Panel */}
                    {isOpen && children.length > 0 && (
                      <div className="absolute left-0 top-full pt-2 w-60 z-50 animate-in fade-in duration-150">
                        <div className="bg-white rounded-2xl shadow-xl border border-[#1B4D2E]/15 py-2 overflow-hidden">
                          {children.map((child) => {
                            const childActive = isRouteActive(child.href);
                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => handleLinkSelect(child.href)}
                                className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                  childActive
                                    ? 'bg-[#FFF8E7] text-[#1B4D2E] border-l-3 border-[#E1AD01]'
                                    : 'text-[#1B4D2E]/85 hover:bg-[#FFF8E7] hover:text-[#1B4D2E]'
                                }`}
                              >
                                <span>{child.label}</span>
                                <span className="text-[#E1AD01] text-xs">→</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Action Buttons: Prominent Shop Now + Cart (Admin button removed per client request) */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
              {/* Prominent Shop Now CTA */}
              <button
                type="button"
                onClick={() => handleLinkSelect('/shop')}
                className={`hidden sm:inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
                  isRouteActive('/shop')
                    ? 'bg-[#E1AD01] text-[#1B4D2E]'
                    : 'bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Now</span>
              </button>

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] px-3.5 sm:px-4 py-2.5 rounded-xl font-semibold text-sm shadow-xs hover:shadow transition-all group cursor-pointer"
                aria-label="View Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4 text-[#E1AD01] group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Cart</span>
                {totalCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold bg-[#E1AD01] text-[#1B4D2E] rounded-full shadow-xs">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[#1B4D2E] hover:bg-[#1B4D2E]/10 transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FFF8E7] border-b border-[#1B4D2E]/15 px-5 pt-3 pb-6 shadow-xl animate-in slide-in-from-top duration-200 max-h-[82vh] overflow-y-auto">
            <div className="flex flex-col space-y-1.5">
              {topLevelItems.map((item) => {
                const children = getChildren(item.id);
                const hasDropdown = item.isDropdown || children.length > 0;
                const isExpanded = Boolean(expandedMobileGroupIds[item.id]);
                const active = isRouteActive(item.href);

                if (!hasDropdown) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleLinkSelect(item.href)}
                      className={`text-left text-base font-bold py-2.5 px-3.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                        active
                          ? 'bg-[#1B4D2E] text-[#FFF8E7]'
                          : 'text-[#1B4D2E] hover:bg-[#1B4D2E]/10'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[#E1AD01] text-xs">→</span>
                    </button>
                  );
                }

                return (
                  <div key={item.id} className="rounded-xl border border-[#1B4D2E]/10 bg-white/60 overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMobileGroupIds((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                      aria-expanded={isExpanded}
                      className="w-full text-left text-base font-bold py-2.5 px-3.5 text-[#1B4D2E] hover:bg-[#1B4D2E]/5 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-4.5 h-4.5 text-[#1B4D2E] transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-[#E1AD01]' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && children.length > 0 && (
                      <div className="bg-white border-t border-[#1B4D2E]/10 py-1.5 px-2 space-y-1">
                        {children.map((child) => {
                          const childActive = isRouteActive(child.href);
                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => handleLinkSelect(child.href)}
                              className={`w-full text-left text-sm font-semibold py-2 px-3 rounded-lg flex items-center justify-between cursor-pointer ${
                                childActive
                                  ? 'bg-[#1B4D2E] text-[#FFF8E7]'
                                  : 'text-[#1B4D2E]/85 hover:bg-[#FFF8E7]'
                              }`}
                            >
                              <span>{child.label}</span>
                              <span className="text-[#E1AD01] text-xs">→</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Prominent Mobile Shop Now & Call Actions */}
              <div className="pt-3 mt-2 border-t border-[#1B4D2E]/10 flex flex-col space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleLinkSelect('/shop')}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-sm font-extrabold text-[#1B4D2E] rounded-xl bg-[#E1AD01] hover:bg-[#f0bc0e] shadow-xs cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Fresh Juices Now</span>
                </button>

                <a
                  href={`tel:${content.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 text-sm font-semibold text-[#1B4D2E] rounded-xl bg-white border border-[#1B4D2E]/15 hover:bg-[#1B4D2E]/5"
                >
                  <Phone className="w-4 h-4 text-[#1B4D2E]" />
                  <span>Call Kitchen: {content.phone}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
