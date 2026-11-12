import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, SiteContent } from '../types';
import { sanitizeBrandAndUnitsText } from '../lib/units';
import { ChevronLeft, ChevronRight, Sparkles, Leaf } from 'lucide-react';

interface CoverflowCarouselProps {
  products: Product[];
  content: SiteContent;
  onSelectProduct?: (product: Product) => void;
  isLoading?: boolean;
}

export const CoverflowCarousel: React.FC<CoverflowCarouselProps> = ({
  products,
  content,
  onSelectProduct,
  isLoading = false,
}) => {
  // Filter active in-stock products
  const activeProducts = React.useMemo(() => {
    const list = products.filter((p) => p.inStock !== false);
    return list.length > 0 ? list : products;
  }, [products]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const total = activeProducts.length;

  const nextSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    if (idx >= 0 && idx < total) {
      setCurrentIndex(idx);
    }
  };

  // Autoplay every 5 seconds (5000ms), paused on hover or when dragging
  useEffect(() => {
    if (isHovered || isDragging || total <= 1) return;
    timerRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, isDragging, total, nextSlide]);

  // Label fallback helper for guaranteed image presence
  const getFallbackLabelImage = (p: Product) => {
    const idLower = (p.id || '').toLowerCase();
    const slugLower = (p.slug || '').toLowerCase();
    const nameLower = (p.name || '').toLowerCase();
    if (
      idLower === 'prod-zobo' ||
      slugLower.includes('zobo') ||
      nameLower.includes('zobo') ||
      nameLower.includes('sorrel') ||
      nameLower.includes('hibiscus')
    ) {
      return '/assets/aistudio/18oz_zobo_label_17754013.png';
    }
    if (
      idLower === 'prod-ginger-pineapple' ||
      slugLower.includes('pineapple') ||
      nameLower.includes('pineapple')
    ) {
      return '/assets/aistudio/12oz_pineapple_28b92d79.png';
    }
    if (
      idLower === 'prod-ginger-lychee' ||
      slugLower.includes('lychee') ||
      nameLower.includes('lychee')
    ) {
      return '/assets/aistudio/12oz_Lychee_771f865d.png';
    }
    if (
      idLower === 'prod-ginger-mango' ||
      slugLower.includes('mango') ||
      nameLower.includes('mango')
    ) {
      return '/assets/aistudio/12oz_mango_dcfd0401.png';
    }
    if (idLower.includes('ginger') || slugLower.includes('ginger') || nameLower.includes('ginger')) {
      return '/assets/aistudio/12oz_ginger_d302545f.png';
    }
    if (
      idLower.includes('tigernut') ||
      slugLower.includes('tigernut') ||
      nameLower.includes('tigernut')
    ) {
      return '/assets/aistudio/12oz_Tigernut_a2076757.png';
    }
    return '';
  };

  // Drag & Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX === null) return;
    const diff = dragStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setDragStartX(null);
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStartX === null) return;
    const diff = dragStartX - e.clientX;
    if (Math.abs(diff) > 70) {
      if (diff > 0) nextSlide();
      else prevSlide();
      setDragStartX(null);
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setDragStartX(null);
    setIsDragging(false);
  };

  // Responsive width tracking for optimal 3D card spacing
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading && activeProducts.length === 0) {
    return (
      <section className="py-16 bg-[#12351F] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-white/10 rounded-full mx-auto" />
          <div className="h-10 w-96 bg-white/15 rounded-xl mx-auto" />
          <div className="h-80 w-full max-w-4xl bg-white/10 rounded-3xl mx-auto mt-8" />
        </div>
      </section>
    );
  }

  if (total === 0) {
    return null;
  }

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  return (
    <section
      aria-label="Interactive 3D Coverflow Showcase"
      className="py-14 sm:py-20 bg-gradient-to-b from-[#0E2918] via-[#12351F] to-[#0E2918] text-[#FFF8E7] relative overflow-hidden border-b border-[#E1AD01]/25 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Ambient background glows for 3D depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#E1AD01]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-[#1B4D2E]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#1B4D2E]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#E1AD01] bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-xs border border-[#E1AD01]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Collection</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
            Explore Our Botanical Juices
          </h2>
          <p className="text-xs sm:text-sm text-[#FFF8E7]/80 leading-relaxed max-w-xl mx-auto">
            Swipe or use the arrows to discover our small-batch recipes, freshly pressed with whole botanicals and no preservatives added.
          </p>
        </div>

        {/* 3D Coverflow Stage */}
        <div
          ref={containerRef}
          className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] flex items-center justify-center my-2 cursor-grab active:cursor-grabbing"
          style={{
            perspective: '1200px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          {activeProducts.map((product, idx) => {
            // Compute cyclic shortest offset relative to currentIndex
            let offset = (idx - currentIndex) % total;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isCenter = offset === 0;
            const isVisible = Math.abs(offset) <= 2;

            if (!isVisible) {
              return null;
            }

            const cleanName = sanitizeBrandAndUnitsText(product.name);
            const rawImg = (product.imageUrl || '').trim();
            const liveImg = rawImg || getFallbackLabelImage(product);
            const hasError = imageErrors[product.id];

            // 3D positioning parameters based on offset
            // d = 0: Center, large, front, prominent
            // d = -1 / 1: Flanking left/right with perspective rotation and scale
            // d = -2 / 2: Outer left/right further back and lower opacity
            let translateX = 0;
            let translateZ = 0;
            let rotateY = 0;
            let scale = 1;
            let opacity = 1;
            let zIndex = 30;

            const baseStep1 = isMobile ? 120 : isTablet ? 175 : 225;
            const baseStep2 = isMobile ? 220 : isTablet ? 320 : 410;

            if (offset === 0) {
              translateX = 0;
              translateZ = isMobile ? 30 : 60;
              rotateY = 0;
              scale = isMobile ? 1.05 : 1.1;
              opacity = 1;
              zIndex = 40;
            } else if (offset === -1) {
              translateX = -baseStep1;
              translateZ = isMobile ? -50 : -85;
              rotateY = isMobile ? 22 : 30;
              scale = isMobile ? 0.85 : 0.88;
              opacity = 0.85;
              zIndex = 25;
            } else if (offset === 1) {
              translateX = baseStep1;
              translateZ = isMobile ? -50 : -85;
              rotateY = isMobile ? -22 : -30;
              scale = isMobile ? 0.85 : 0.88;
              opacity = 0.85;
              zIndex = 25;
            } else if (offset === -2) {
              translateX = -baseStep2;
              translateZ = isMobile ? -110 : -175;
              rotateY = isMobile ? 32 : 42;
              scale = isMobile ? 0.7 : 0.74;
              opacity = isMobile ? 0.25 : 0.5;
              zIndex = 10;
            } else if (offset === 2) {
              translateX = baseStep2;
              translateZ = isMobile ? -110 : -175;
              rotateY = isMobile ? -32 : -42;
              scale = isMobile ? 0.7 : 0.74;
              opacity = isMobile ? 0.25 : 0.5;
              zIndex = 10;
            }

            return (
              <div
                key={product.id}
                role="button"
                tabIndex={0}
                aria-label={`Select ${cleanName}`}
                onClick={() => {
                  if (offset !== 0) {
                    goToSlide(idx);
                  } else if (onSelectProduct) {
                    onSelectProduct(product);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (offset !== 0) goToSlide(idx);
                    else if (onSelectProduct) onSelectProduct(product);
                  }
                }}
                className={`absolute top-1/2 left-1/2 rounded-3xl transition-all duration-500 ease-out flex flex-col items-center justify-between p-5 sm:p-6 cursor-pointer ${
                  isCenter
                    ? 'w-[250px] sm:w-[290px] md:w-[320px] h-[340px] sm:h-[400px] md:h-[430px] bg-gradient-to-b from-[#184529] via-[#143B22] to-[#0D2616] border-2 border-[#E1AD01]/70 shadow-[0_20px_50px_rgba(0,0,0,0.65)] ring-1 ring-[#E1AD01]/30'
                    : 'w-[230px] sm:w-[260px] md:w-[290px] h-[320px] sm:h-[370px] md:h-[400px] bg-gradient-to-b from-[#143B22]/90 to-[#0D2616]/90 border border-white/20 shadow-2xl backdrop-blur-xs hover:border-[#E1AD01]/40'
                }`}
                style={{
                  transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex,
                  opacity,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Center Badge Highlight */}
                {isCenter && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#E1AD01] text-[#1B4D2E] text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md z-10 whitespace-nowrap">
                    Active Flavor
                  </div>
                )}

                {/* Product Image Container (ONLY image displayed in this area) */}
                <div className="flex-1 w-full flex items-center justify-center p-3 relative overflow-hidden">
                  {liveImg && !hasError ? (
                    <img
                      src={liveImg}
                      alt={cleanName}
                      onError={() => setImageErrors((prev) => ({ ...prev, [product.id]: true }))}
                      className="max-h-[190px] sm:max-h-[230px] md:max-h-[250px] w-auto object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:scale-105"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <Leaf className="w-10 h-10 text-[#E1AD01] mb-2 animate-pulse" />
                      <span className="font-display font-bold text-sm text-white">{cleanName}</span>
                    </div>
                  )}
                </div>

                {/* Product Name (ONLY product name displayed here) */}
                <div className="w-full pt-3 border-t border-white/15 text-center mt-auto">
                  <h3
                    className={`font-display font-black leading-tight tracking-tight text-center ${
                      isCenter
                        ? 'text-base sm:text-xl text-[#FFF8E7] group-hover:text-[#E1AD01]'
                        : 'text-sm sm:text-base text-white/90'
                    }`}
                  >
                    {cleanName}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Navigation: Arrows & Pagination Dots */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="flex items-center space-x-4">
            {/* Previous Button */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous product"
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-[#E1AD01] hover:text-[#1B4D2E] text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center space-x-2">
              {activeProducts.map((p, idx) => {
                const isActive = currentIndex === idx;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${p.name}`}
                    className={`transition-all rounded-full cursor-pointer ${
                      isActive
                        ? 'w-8 h-2.5 bg-[#E1AD01] shadow-xs'
                        : 'w-2.5 h-2.5 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                );
              })}
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next product"
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-[#E1AD01] hover:text-[#1B4D2E] text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
