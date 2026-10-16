import React, { useState } from 'react';
import { SiteContent } from '../types';
import { Building2, Store, UtensilsCrossed, CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';

interface WholesaleSectionProps {
  content: SiteContent;
  onCateringClick: () => void;
}

export const WholesaleSection: React.FC<WholesaleSectionProps> = ({ content, onCateringClick }) => {
  return (
    <section id="wholesale" className="py-20 bg-white border-y border-[#1B4D2E]/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#E1AD01]/20 border border-[#E1AD01]/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1B4D2E]">
            <Building2 className="w-3.5 h-3.5 text-[#1B4D2E]" />
            <span>COMMERCIAL PARTNERSHIPS & BULK RESELLERS</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1B4D2E] tracking-tight">
            Wholesale, Retail & Hospitality
          </h2>

          <p className="text-sm sm:text-base text-[#1B4D2E]/80 leading-relaxed">
            Delight your patrons with genuine, handcrafted African botanical juices and cold-pressed ginger drinks. We partner with restaurants, cafes, specialty markets, grocery stores, and corporate offices across Pennsylvania.
          </p>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Tier 1 */}
          <div className="bg-[#FFF8E7] rounded-3xl p-7 border border-[#1B4D2E]/15 flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center font-bold mb-5 shadow-xs">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#1B4D2E] mb-2">
                Restaurants & Cafés
              </h3>
              <p className="text-xs text-[#1B4D2E]/75 mb-6">
                Upgrade your beverage menu with ready-to-pour Zobo and ginger elixirs that pair brilliantly with brunch, dinner, and artisan cuisine.
              </p>

              <div className="space-y-2.5 text-xs text-[#1B4D2E]/80">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>Low 24-bottle minimum order</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>Weekly scheduled fresh delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>35cl single-serve or 1L bar-pour jugs</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#1B4D2E]/10">
              <a
                href={`https://wa.me/${content.whatsappNumber}?text=Hello%20Delightful%20Juice%2C%20I%20run%20a%20restaurant%2Fcafe%20and%20would%20like%20wholesale%20details.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors"
              >
                <span>Inquire for Restaurant</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E1AD01]" />
              </a>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="bg-[#1B4D2E] text-[#FFF8E7] rounded-3xl p-7 border-2 border-[#E1AD01] flex flex-col justify-between shadow-xl relative transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E1AD01] text-[#1B4D2E] text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full shadow-xs">
              Most Popular Partner
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E1AD01] text-[#1B4D2E] flex items-center justify-center font-bold mb-5 shadow-xs">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#FFF8E7] mb-2">
                Retail Stores & Resellers
              </h3>
              <p className="text-xs text-[#FFF8E7]/80 mb-6">
                Fast-selling health beverage grab-and-go SKU for grocery stores, ethnic supermarkets, juice bars, and fitness gyms.
              </p>

              <div className="space-y-2.5 text-xs text-[#FFF8E7]/90">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>35% - 40% margin wholesale tier</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>Free POS flyer displays & merchandising</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>UPC barcodes & sealed tamper bands</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#FFF8E7]/15">
              <a
                href={`https://wa.me/${content.whatsappNumber}?text=Hello%20Delightful%20Juice%2C%20I%20am%20a%20retail%20store%20owner%20interested%20in%20carrying%20your%20drinks.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 bg-[#E1AD01] hover:bg-[#c99a00] text-[#1B4D2E] py-2.5 px-4 rounded-xl text-xs font-black transition-colors"
              >
                <span>Stock in Your Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="bg-[#FFF8E7] rounded-3xl p-7 border border-[#1B4D2E]/15 flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center font-bold mb-5 shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#1B4D2E] mb-2">
                Corporate & Campus Fridges
              </h3>
              <p className="text-xs text-[#1B4D2E]/75 mb-6">
                Replace sugary sodas with cold-pressed natural energy. Ideal for tech offices, co-working lounges, universities, and health clinics.
              </p>

              <div className="space-y-2.5 text-xs text-[#1B4D2E]/80">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>Bi-weekly employee wellness stocking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>Custom invoice & corporate billing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>Immune booster seasonal kits</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#1B4D2E]/10">
              <button
                onClick={onCateringClick}
                className="w-full inline-flex items-center justify-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Request Corporate Plan</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E1AD01]" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
