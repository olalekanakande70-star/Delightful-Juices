import React, { useState } from 'react';
import { Product } from '../types';
import { sanitizeBrandAndUnitsText } from '../lib/units';
import { Sparkles, Leaf, ArrowRight, ShoppingBag, ShieldCheck, Clock, Snowflake } from 'lucide-react';

interface AboutProductsShowcaseProps {
  products: Product[];
  heading?: string;
  subheading?: string;
  kicker?: string;
  onOpenDetails?: (product: Product) => void;
  onNavigate?: (href: string) => void;
}

export const AboutProductsShowcase: React.FC<AboutProductsShowcaseProps> = ({
  products,
  heading = 'Our Juice Products & Wholesome Ingredients',
  subheading = 'Each juice is crafted daily from 100% natural whole botanicals, freshly pressed roots, and tropical fruits with no preservatives added.',
  kicker = 'HANDCRAFTED JUICE CREATIONS',
  onOpenDetails,
  onNavigate,
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const getFallbackLabelImage = (p: Product) => {
    const idLower = (p.id || '').toLowerCase();
    const slugLower = (p.slug || '').toLowerCase();
    const nameLower = (p.name || '').toLowerCase();
    if (idLower === 'prod-zobo' || slugLower.includes('zobo') || nameLower.includes('zobo') || nameLower.includes('sorrel') || nameLower.includes('hibiscus')) {
      return '/assets/aistudio/18oz_zobo_label_17754013.png';
    }
    if (idLower === 'prod-ginger-pineapple' || slugLower.includes('pineapple') || nameLower.includes('pineapple')) {
      return '/assets/aistudio/12oz_pineapple_28b92d79.png';
    }
    if (idLower === 'prod-ginger-lychee' || slugLower.includes('lychee') || nameLower.includes('lychee')) {
      return '/assets/aistudio/12oz_Lychee_771f865d.png';
    }
    if (idLower === 'prod-ginger-mango' || slugLower.includes('mango') || nameLower.includes('mango')) {
      return '/assets/aistudio/12oz_mango_dcfd0401.png';
    }
    if (idLower.includes('ginger') || slugLower.includes('ginger') || nameLower.includes('ginger')) {
      return '/assets/aistudio/12oz_ginger_d302545f.png';
    }
    if (idLower.includes('tigernut') || slugLower.includes('tigernut') || nameLower.includes('tigernut')) {
      return '/assets/aistudio/12oz_Tigernut_a2076757.png';
    }
    return '';
  };

  const displayProducts = products.length > 0 ? products : [];

  return (
    <section className="py-16 sm:py-24 bg-[#FFF8E7] border-y border-[#1B4D2E]/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14 sm:mb-18">
          {kicker && (
            <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#E1AD01] bg-[#1B4D2E] px-4 py-1.5 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{sanitizeBrandAndUnitsText(kicker)}</span>
            </div>
          )}
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1B4D2E] tracking-tight leading-tight">
            {sanitizeBrandAndUnitsText(heading)}
          </h2>
          {subheading && (
            <p className="text-sm sm:text-base text-[#1B4D2E]/80 leading-relaxed max-w-2xl mx-auto">
              {sanitizeBrandAndUnitsText(subheading)}
            </p>
          )}
        </div>

        {/* Product Cards Grid with Image, Authentic Label Details & Ingredients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {displayProducts.map((product) => {
            const cleanName = sanitizeBrandAndUnitsText(product.name);
            const fallbackImg = getFallbackLabelImage(product);
            const rawLiveImg = (product.imageUrl || '').trim();
            const liveImg = rawLiveImg || fallbackImg;
            const hasImgError = imageErrors[product.id];
            const isTigernut = (product.id || '').includes('tigernut') || (product.name || '').toLowerCase().includes('tigernut');

            return (
              <article
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#1B4D2E]/12 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Image Banner */}
                  <div className="relative aspect-16/10 sm:aspect-16/9 bg-[#12351F] overflow-hidden flex items-center justify-center">
                    {liveImg && !hasImgError ? (
                      <img
                        src={liveImg}
                        alt={cleanName}
                        onError={() => handleImageError(product.id)}
                        className="w-full h-full object-cover sm:object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0e2918] via-[#1B4D2E] to-[#12351F] flex flex-col items-center justify-center p-6 text-center text-[#FFF8E7]">
                        <div className="w-12 h-12 rounded-2xl bg-[#E1AD01]/20 border border-[#E1AD01]/40 flex items-center justify-center text-[#E1AD01] mb-2">
                          <Leaf className="w-6 h-6" />
                        </div>
                        <span className="font-display font-bold text-lg text-white">
                          {cleanName}
                        </span>
                        <span className="text-[11px] text-[#E1AD01] uppercase tracking-wider font-extrabold mt-1">
                          100% Real Botanical Elixir
                        </span>
                      </div>
                    )}

                    {/* Preservative-Free Badge */}
                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
                      <span className="bg-[#1B4D2E] text-[#E1AD01] border border-[#E1AD01]/40 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg shadow-md flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-[#E1AD01]" />
                        <span>No Preservative Added</span>
                      </span>
                      {product.badge && (
                        <span className="bg-[#E1AD01] text-[#1B4D2E] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-[#FFF8E7] text-[11px] font-bold px-3 py-1 rounded-full">
                      {product.categoryLabel || 'Signature Recipe'}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-display font-black text-2xl text-[#1B4D2E] group-hover:text-[#12351F] transition-colors leading-snug">
                        {cleanName}
                      </h3>
                      {product.tagline && (
                        <p className="text-xs font-semibold text-[#1B4D2E]/70 italic">
                          {sanitizeBrandAndUnitsText(product.tagline)}
                        </p>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#1B4D2E]/85 leading-relaxed">
                      {sanitizeBrandAndUnitsText(product.description)}
                    </p>

                    {/* Dedicated Ingredients List from Verified Product Label */}
                    <div className="pt-2 border-t border-[#1B4D2E]/10 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1B4D2E]">
                        <Leaf className="w-3.5 h-3.5 text-[#1B4D2E]" />
                        <span>Real Ingredients:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.ingredients && product.ingredients.length > 0 ? (
                          product.ingredients.map((ing, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center text-[11px] font-bold bg-[#FFF8E7] text-[#1B4D2E] border border-[#1B4D2E]/15 px-2.5 py-1 rounded-lg"
                            >
                              {sanitizeBrandAndUnitsText(ing)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#1B4D2E]/60 italic">
                            Natural botanicals and spring water.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Label Care & Handling Instructions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-[#1B4D2E]/80 border-t border-[#1B4D2E]/10">
                      <div className="flex items-center space-x-1.5 bg-[#FFF8E7] px-2.5 py-1.5 rounded-lg border border-[#1B4D2E]/10">
                        <Snowflake className="w-3.5 h-3.5 text-[#1B4D2E] shrink-0" />
                        <span>Keep Refrigerated • Shake Well</span>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-[#FFF8E7] px-2.5 py-1.5 rounded-lg border border-[#1B4D2E]/10">
                        <Clock className="w-3.5 h-3.5 text-[#1B4D2E] shrink-0" />
                        <span>
                          {isTigernut ? 'Consume immediately after opening' : 'Consume within 10 days'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 sm:p-7 sm:pt-0">
                  <div className="pt-4 border-t border-[#1B4D2E]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs font-bold text-[#1B4D2E]/80 flex items-center space-x-1.5">
                      <Leaf className="w-3.5 h-3.5 text-[#1B4D2E]" />
                      <span>100% Natural Botanicals</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenDetails && (
                        <button
                          type="button"
                          onClick={() => onOpenDetails(product)}
                          className="text-xs font-bold text-[#1B4D2E] hover:text-[#E1AD01] px-3 py-2 rounded-xl transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenDetails) {
                            onOpenDetails(product);
                          } else if (onNavigate) {
                            onNavigate(`/shop/${product.slug}`);
                          }
                        }}
                        className="inline-flex items-center space-x-1.5 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer group/btn"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#E1AD01]" />
                        <span>Order in Shop</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#E1AD01] group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA Strip */}
        <div className="mt-14 p-6 sm:p-8 bg-[#1B4D2E] rounded-3xl text-[#FFF8E7] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-display font-bold text-lg sm:text-xl text-white">
              Looking to order for your family, event, or business?
            </h4>
            <p className="text-xs sm:text-sm text-[#FFF8E7]/85">
              All juices are pressed fresh to order with affordable local delivery across Pennsylvania.
            </p>
          </div>
          {onNavigate && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('/shop')}
                className="bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Shop Fresh Juices
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/wholesale')}
                className="bg-white/10 hover:bg-white/20 text-[#FFF8E7] border border-white/25 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all cursor-pointer"
              >
                Wholesale Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
