import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, SiteContent } from '../types';
import { sanitizeBrandAndUnitsText, getCustomerSizeDisplay } from '../lib/units';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Leaf,
  ShieldCheck,
  Pause,
  Play,
  Heart,
} from 'lucide-react';

interface ProductSliderSectionProps {
  products: Product[];
  content: SiteContent;
  onOpenDetails: (product: Product) => void;
  onNavigate: (href: string) => void;
}

export const ProductSliderSection: React.FC<ProductSliderSectionProps> = ({
  products,
  content,
  onOpenDetails,
  onNavigate,
}) => {
  const sliderConfig = content.productSlider || content.branding?.productSlider;
  const isEnabled = sliderConfig?.enabled !== false;

  // Filter and order active/published products
  const activeProducts = React.useMemo(() => {
    const published = products.filter((p) => p.inStock !== false);
    if (!sliderConfig?.productIds || sliderConfig.productIds.length === 0) {
      return published;
    }
    // Custom selection/order from admin
    const selected = sliderConfig.productIds
      .map((id) => published.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
    return selected.length > 0 ? selected : published;
  }, [products, sliderConfig]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const autoplayIntervalMs = sliderConfig?.autoplayInterval || 5500;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = activeProducts.length;

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Autoplay setup
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    timerRef.current = setInterval(nextSlide, autoplayIntervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides, autoplayIntervalMs, nextSlide]);

  if (!isEnabled || totalSlides === 0) {
    return null;
  }

  const currentProduct = activeProducts[currentIndex] || activeProducts[0];
  const cleanName = sanitizeBrandAndUnitsText(currentProduct.name);

  // Label fallback if live photo is empty
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

  const rawLiveImg = (currentProduct.imageUrl || '').trim();
  const liveImg = rawLiveImg || getFallbackLabelImage(currentProduct);
  const hasImgError = imageErrors[currentProduct.id];

  // Pricing & Sizes string
  const minPrice = Math.min(...currentProduct.sizes.map((s) => s.price));
  const maxPrice = Math.max(...currentProduct.sizes.map((s) => s.price));
  const priceDisplay =
    minPrice === maxPrice
      ? `$${minPrice.toFixed(2)}`
      : `$${minPrice.toFixed(2)} – $${maxPrice.toFixed(2)}`;

  const sizesText =
    currentProduct.sizes.length === 1
      ? getCustomerSizeDisplay(currentProduct.sizes[0])
      : currentProduct.sizes.map((s) => getCustomerSizeDisplay(s)).join(' • ');

  const heading = sliderConfig?.heading || 'Discover Our Signature Handcrafted Juices';
  const subheading =
    sliderConfig?.subheading ||
    'Explore each small-batch recipe brewed with whole natural botanicals, freshly pressed roots, and tropical fruit with no preservatives added.';
  const kicker = sliderConfig?.kicker || 'INTERACTIVE FLAVOR SHOWCASE';

  // Touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    setTouchStartX(null);
  };

  return (
    <section
      aria-label="Product Showcase Slider"
      className="py-14 sm:py-20 bg-gradient-to-b from-[#12351F] via-[#1B4D2E] to-[#12351F] text-[#FFF8E7] relative overflow-hidden border-b border-[#E1AD01]/25"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#E1AD01]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#E1AD01]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#E1AD01] bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-xs border border-[#E1AD01]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{sanitizeBrandAndUnitsText(kicker)}</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              {sanitizeBrandAndUnitsText(heading)}
            </h2>
            <p className="text-xs sm:text-sm text-[#FFF8E7]/80 leading-relaxed max-w-xl">
              {sanitizeBrandAndUnitsText(subheading)}
            </p>
          </div>

          {/* Controls: Prev, Play/Pause, Next */}
          <div className="flex items-center space-x-2 self-start sm:self-end shrink-0">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous juice slide"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#E1AD01] hover:text-[#1B4D2E] border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Resume auto-sliding' : 'Pause auto-sliding'}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm"
              title={isPaused ? 'Resume auto-sliding' : 'Pause auto-sliding'}
            >
              {isPaused ? <Play className="w-4 h-4 text-[#E1AD01]" /> : <Pause className="w-4 h-4 text-[#FFF8E7]" />}
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next juice slide"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#E1AD01] hover:text-[#1B4D2E] border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Showcase Slide Card with Smooth Transition */}
        <div className="bg-[#143822] border border-[#E1AD01]/30 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Product Image Container (strictly maintains proportion) */}
            <div
              onClick={() => onOpenDetails(currentProduct)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenDetails(currentProduct);
                }
              }}
              aria-label={`View details for ${cleanName}`}
              className="lg:col-span-5 relative aspect-4/3 sm:aspect-1/1 max-w-md mx-auto w-full bg-[#0d2616] rounded-2xl overflow-hidden border border-[#E1AD01]/25 flex items-center justify-center p-4 cursor-pointer group shadow-inner"
            >
              {liveImg && !hasImgError ? (
                <img
                  key={currentProduct.id}
                  src={liveImg}
                  alt={cleanName}
                  onError={() => setImageErrors((prev) => ({ ...prev, [currentProduct.id]: true }))}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 text-[#FFF8E7]">
                  <Leaf className="w-10 h-10 text-[#E1AD01] mb-3 animate-pulse" />
                  <span className="font-display font-bold text-lg text-white">{cleanName}</span>
                  <span className="text-xs text-[#E1AD01] mt-1 font-semibold">100% Real Botanicals</span>
                </div>
              )}

              {/* Floating badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <span className="bg-[#1B4D2E]/90 backdrop-blur-xs text-[#E1AD01] border border-[#E1AD01]/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-[#E1AD01]" />
                  <span>No Preservative Added</span>
                </span>
                {currentProduct.badge && (
                  <span className="bg-[#E1AD01] text-[#1B4D2E] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs">
                    {currentProduct.badge}
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-[#FFF8E7] text-[10px] font-bold px-3 py-1 rounded-full border border-white/10">
                Click to explore recipe
              </div>
            </div>

            {/* Right: Detailed Product Info */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#E1AD01]">
                  <span>{currentProduct.categoryLabel || 'Signature Elixir'}</span>
                  <span className="text-white/40">•</span>
                  <span>Small-Batch Craft</span>
                </div>

                <h3
                  onClick={() => onOpenDetails(currentProduct)}
                  className="font-display font-black text-2xl sm:text-4xl text-white hover:text-[#E1AD01] transition-colors cursor-pointer leading-tight"
                >
                  {cleanName}
                </h3>

                {currentProduct.tagline && (
                  <p className="text-xs sm:text-sm text-[#E1AD01] font-semibold italic">
                    {sanitizeBrandAndUnitsText(currentProduct.tagline)}
                  </p>
                )}
              </div>

              {/* Price & Sizes Strip */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="bg-[#E1AD01] text-[#1B4D2E] font-black text-base sm:text-xl px-3.5 py-1.5 rounded-xl shadow-xs tabular-nums">
                  {priceDisplay}
                </div>
                <div className="bg-white/10 border border-white/15 text-xs font-bold px-3 py-1.5 rounded-xl text-white">
                  Sizes: <strong className="text-[#E1AD01] ml-1">{sizesText}</strong>
                </div>
              </div>

              {/* Short Supporting Description */}
              <p className="text-xs sm:text-sm text-[#FFF8E7]/90 leading-relaxed line-clamp-3">
                {sanitizeBrandAndUnitsText(currentProduct.description)}
              </p>

              {/* Ingredients Preview */}
              {currentProduct.ingredients && currentProduct.ingredients.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#E1AD01] flex items-center space-x-1">
                    <Leaf className="w-3 h-3 text-[#E1AD01]" />
                    <span>Real Ingredients:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentProduct.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-white/10 text-[#FFF8E7] border border-white/15 px-2 py-0.5 rounded-md"
                      >
                        {sanitizeBrandAndUnitsText(ing)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => onOpenDetails(currentProduct)}
                  className="bg-[#E1AD01] hover:bg-[#f5c122] text-[#1B4D2E] font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
                >
                  <span>View Product</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate(`/shop/${currentProduct.slug}`)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#E1AD01]" />
                  <span>Shop Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/shop')}
                  className="text-xs font-semibold text-[#FFF8E7]/70 hover:text-[#E1AD01] underline underline-offset-4 ml-auto cursor-pointer"
                >
                  Browse all flavors →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation Strip & Indicator Dots */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Indicator Dots */}
          <div className="flex items-center space-x-2">
            {activeProducts.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}: ${p.name}`}
                className={`transition-all rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-8 h-2.5 bg-[#E1AD01]'
                    : 'w-2.5 h-2.5 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Quick Juice Selector Thumbnails (visible on sm+) */}
          <div className="hidden sm:flex items-center space-x-2 overflow-x-auto py-1 max-w-full">
            {activeProducts.map((p, idx) => {
              const isSelected = currentIndex === idx;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`text-left px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#E1AD01] text-[#1B4D2E] border-[#E1AD01] shadow-xs'
                      : 'bg-white/5 text-[#FFF8E7]/80 hover:bg-white/15 border-white/10'
                  }`}
                >
                  {p.name.replace(/^Home\s*Made\s*/i, '').replace(/\s*\(.*?\)/g, '')}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
