import React from 'react';
import { SiteContent } from '../types';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Droplets, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { dataRepo } from '../lib/storage';

interface HeroProps {
  content: SiteContent;
  onExploreClick: () => void;
  onEventClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ content, onExploreClick, onEventClick }) => {
  const { addToCart } = useCart();
  const zoboProduct = dataRepo.getProducts().find((p) => p.id === 'prod-zobo') || dataRepo.getProducts()[0];

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-48 -mt-48 w-96 h-96 rounded-full bg-[#E1AD01]/15 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-[#1B4D2E]/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Brand Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 bg-[#1B4D2E]/10 border border-[#1B4D2E]/20 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold text-[#1B4D2E]">
              <Sparkles className="w-4 h-4 text-[#E1AD01] animate-spin" style={{ animationDuration: '6s' }} />
              <span className="uppercase tracking-wider font-semibold text-[11px] sm:text-xs text-[#1B4D2E]">
                {content.tagline}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-[#1B4D2E] tracking-tight leading-[1.12]">
              Savor the <span className="relative inline-block text-[#E1AD01]">
                Pure Goodness
                <span className="absolute left-0 bottom-1 w-full h-3 bg-[#E1AD01]/25 -z-10 transform -rotate-1 rounded-sm"></span>
              </span> of Real Botanical Juice.
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-[#1B4D2E]/80 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Thoughtfully crafted in Quakertown, PA from vibrant dried hibiscus calyces, fiery cold-pressed ginger, and heritage tigernuts. Every single bottle is enriched with our signature <span className="font-semibold text-[#1B4D2E]">DelightOil</span> for unmatched vitality, crisp taste, and refreshing goodness.
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left">
              <div className="bg-[#FFF8E7] border border-[#1B4D2E]/15 rounded-xl p-3 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#1B4D2E] mb-1" />
                <div className="text-xs font-bold text-[#1B4D2E]">100% Natural</div>
                <div className="text-[11px] text-[#1B4D2E]/70">Zero fake syrups</div>
              </div>
              <div className="bg-[#FFF8E7] border border-[#1B4D2E]/15 rounded-xl p-3 shadow-xs">
                <Droplets className="w-4 h-4 text-[#E1AD01] mb-1" />
                <div className="text-xs font-bold text-[#1B4D2E]">Cold-Pressed</div>
                <div className="text-[11px] text-[#1B4D2E]/70">Small-batch fresh</div>
              </div>
              <div className="bg-[#FFF8E7] border border-[#1B4D2E]/15 rounded-xl p-3 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#1B4D2E] mb-1" />
                <div className="text-xs font-bold text-[#1B4D2E]">Our DelightOil</div>
                <div className="text-[11px] text-[#1B4D2E]/70">In every bottle</div>
              </div>
              <div className="bg-[#FFF8E7] border border-[#1B4D2E]/15 rounded-xl p-3 shadow-xs">
                <Heart className="w-4 h-4 text-red-600 mb-1" />
                <div className="text-xs font-bold text-[#1B4D2E]">Health First</div>
                <div className="text-[11px] text-[#1B4D2E]/70">Antioxidant rich</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-base px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all group cursor-pointer"
              >
                <span>Order Fresh Drinks</span>
                <ArrowRight className="w-4 h-4 text-[#E1AD01] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onEventClick}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-transparent hover:bg-[#E1AD01]/15 text-[#1B4D2E] font-bold text-base px-7 py-4 rounded-xl border-2 border-[#1B4D2E]/30 hover:border-[#1B4D2E] transition-all cursor-pointer"
              >
                <span>Events & Catering Quote</span>
              </button>
            </div>

            {/* CEO Credential */}
            <div className="pt-2 text-xs text-[#1B4D2E]/75 flex items-center justify-center lg:justify-start space-x-2">
              <span className="font-semibold text-[#1B4D2E]">Founded & Formulated by {content.ceoName}</span>
              <span>•</span>
              <span>Quakertown, PA 18951</span>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Main Visual Card */}
            <div className="relative w-full max-w-md bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-[#1B4D2E]/15 transform lg:rotate-1 hover:rotate-0 transition-transform duration-300">
              
              {/* Image Frame with Badge */}
              <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-[#FFF8E7] group">
                <img
                  src={zoboProduct.imageUrl}
                  alt={zoboProduct.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#E1AD01] text-[#1B4D2E] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  {zoboProduct.badge || 'Signature Favorite'}
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md rounded-xl p-3 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">{zoboProduct.name}</div>
                      <div className="text-xs text-[#E1AD01]">Hibiscus, Ginger & DelightOil</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/70">From</div>
                      <div className="font-black text-base text-[#E1AD01]">${zoboProduct.sizes[0].price.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#1B4D2E]/80">
                  <span className="font-semibold">Available Sizes: 35cl, 50cl, 1 Litre</span>
                  <span className="text-[#E1AD01] font-bold">★ 4.95 (140+ reviews)</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => addToCart(zoboProduct, zoboProduct.sizes[1])}
                    className="flex-1 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-center shadow-xs transition-colors cursor-pointer"
                  >
                    Add 50cl to Bag ($7.50)
                  </button>
                  <button
                    onClick={onExploreClick}
                    className="bg-[#E1AD01] hover:bg-[#c99a00] text-[#1B4D2E] p-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    title="View All 6 Flavors"
                  >
                    View All
                  </button>
                </div>
              </div>

              {/* Floating Testimonial Capsule */}
              <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-[#1B4D2E] text-[#FFF8E7] p-3 rounded-2xl shadow-xl border border-[#E1AD01]/40 flex items-center space-x-3 max-w-[260px]">
                <div className="w-10 h-10 rounded-full bg-[#E1AD01] flex items-center justify-center text-[#1B4D2E] font-extrabold text-sm shrink-0">
                  5★
                </div>
                <div className="text-[11px] leading-tight">
                  <p className="font-semibold text-[#E1AD01]">"Best Zobo in PA!"</p>
                  <p className="text-white/80">"Clean, refreshing, and authentic taste."</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
