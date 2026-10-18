import React from 'react';
import { SiteContent, NavItem } from '../types';
import { MapPin, Phone, Mail, Instagram, MessageCircle, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  content: SiteContent;
  navItems: NavItem[];
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  content,
  navItems,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#12351F] text-[#FFF8E7] border-t-4 border-[#E1AD01] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#FFF8E7]/10">
          
          {/* Brand Info (Cols 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              {content.branding?.showLogoIcon !== false && (
                content.branding?.logoUrl ? (
                  <img
                    src={content.branding.logoUrl}
                    alt={content.branding.logoText || content.businessName}
                    className="h-11 sm:h-12 w-auto max-w-[160px] sm:max-w-[200px] object-contain shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#1B4D2E] border-2 border-[#E1AD01] flex items-center justify-center text-[#E1AD01] shadow-md shrink-0">
                    <span className="font-display font-black text-xl italic">DJ</span>
                  </div>
                )
              )}
              <div>
                <span className="font-display font-extrabold text-2xl text-white">
                  {content.branding?.logoText ? (
                    content.branding.logoText
                  ) : (
                    <>Delightful<span className="text-[#E1AD01]">Juice</span></>
                  )}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#E1AD01] block">
                  {content.motto}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#FFF8E7]/80 leading-relaxed max-w-sm">
              Naturally made, cold-pressed healthy sips. Featuring authentic Nigerian Zobo, organic ginger blends, and nutrient-dense tigernut milk. Handcrafted in Quakertown, PA with our signature DelightOil.
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <a
                href={`https://wa.me/${content.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center hover:bg-[#E1AD01] hover:text-[#1B4D2E] transition-all"
                title="WhatsApp Us"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/delightful_juicecreation"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center hover:bg-[#E1AD01] hover:text-[#1B4D2E] transition-all"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links (Cols 6-8) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#E1AD01]">
              Quick Exploration
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="text-[#FFF8E7]/80 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours (Cols 9-12) */}
          <div className="lg:col-span-4 space-y-3 text-xs sm:text-sm">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#E1AD01]">
              Kitchen & Contact
            </h4>
            <div className="space-y-2.5 text-[#FFF8E7]/80">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#E1AD01] shrink-0 mt-0.5" />
                <span>{content.address}, {content.cityStateZip}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#E1AD01] shrink-0" />
                <a href={`tel:${content.phone.replace(/[^0-9]/g, '')}`} className="hover:text-white">
                  {content.phone}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#E1AD01] shrink-0" />
                <a href={`mailto:${content.email}`} className="hover:text-white">
                  {content.email}
                </a>
              </div>
              <div className="pt-2 text-xs text-[#FFF8E7]/70 border-t border-[#FFF8E7]/10">
                <span className="font-semibold text-white block">Operating Hours:</span>
                {content.operatingHours}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FFF8E7]/60 space-y-3 sm:space-y-0">
          <div>
            © {currentYear} {content.businessName}. All rights reserved. Directed by C.E.O. {content.ceoName}.
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[11px] text-[#E1AD01]/80">
              Naturally Made. Healthy Sips.
            </span>
            <span>•</span>
            <button
              onClick={onOpenAdmin}
              className="hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isAdminLoggedIn ? 'text-green-400' : 'text-[#E1AD01]'}`} />
              <span>{isAdminLoggedIn ? 'Admin Panel (Logged In)' : 'Admin Login'}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
