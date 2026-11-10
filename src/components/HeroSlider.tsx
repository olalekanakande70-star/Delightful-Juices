import React, { useState, useEffect, useCallback } from 'react';
import { HeroSlide, SiteContent } from '../types';
import { sanitizeBrandAndUnitsText } from '../lib/units';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

interface HeroSliderProps {
  slides: HeroSlide[];
  content: SiteContent;
  onNavigate: (href: string) => void;
  autoPlayIntervalMs?: number;
  previewMode?: boolean;
  isLoading?: boolean;
}

function getScrimOpacityClass(opacity?: number): string {
  const clamped = Math.min(0.85, Math.max(0.25, opacity ?? 0.52));
  const pct = Math.round(clamped * 20) * 5;
  const map: Record<number, string> = {
    25: 'opacity-25',
    30: 'opacity-30',
    35: 'opacity-35',
    40: 'opacity-40',
    45: 'opacity-45',
    50: 'opacity-50',
    55: 'opacity-55',
    60: 'opacity-60',
    65: 'opacity-65',
    70: 'opacity-70',
    75: 'opacity-75',
    80: 'opacity-80',
    85: 'opacity-85',
  };
  return map[pct] || 'opacity-55';
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  content,
  onNavigate,
  autoPlayIntervalMs = 6500,
  previewMode = false,
  isLoading = false,
}) => {
  const activeSlides = (previewMode ? slides : slides.filter((s) => s.active)).sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  // Fallback single slide from SiteContent ONLY after live fetch has finished and all slides are disabled
  const effectiveSlides: HeroSlide[] =
    activeSlides.length > 0
      ? activeSlides
      : [
          {
            id: 'fallback-hero',
            heading: sanitizeBrandAndUnitsText(content.heroHeadline || 'Savor the Pure Goodness.'),
            subheading: sanitizeBrandAndUnitsText(content.heroSubheadline),
            kicker: 'NATURALLY MADE • HEALTHY SIPS',
            ctaLabel: 'Shop Now',
            ctaUrl: '/shop',
            secondaryCtaLabel: 'Events & Catering',
            secondaryCtaUrl: '/events-catering',
            desktopImageUrl: '',
            mobileImageUrl: '',
            overlayOpacity: 0.55,
            displayOrder: 1,
            active: true,
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [loadedUrls, setLoadedUrls] = useState<Record<string, boolean>>({});
  const [erroredUrls, setErroredUrls] = useState<Record<string, boolean>>({});

  const markImageLoaded = useCallback((url: string) => {
    if (!url) return;
    setLoadedUrls((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  }, []);

  const markImageErrored = useCallback((url: string) => {
    if (!url) return;
    setErroredUrls((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  }, []);

  // Clamp index if slide count changes dynamically in CMS
  useEffect(() => {
    if (currentIndex >= effectiveSlides.length) {
      setCurrentIndex(0);
    }
  }, [effectiveSlides.length, currentIndex]);

  // Listen to OS reduced-motion preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % effectiveSlides.length);
  }, [effectiveSlides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + effectiveSlides.length) % effectiveSlides.length);
  }, [effectiveSlides.length]);

  useEffect(() => {
    if (isLoading || effectiveSlides.length <= 1 || isPaused || prefersReducedMotion) return;
    const timer = window.setInterval(goToNext, autoPlayIntervalMs);
    return () => window.clearInterval(timer);
  }, [isLoading, effectiveSlides.length, isPaused, prefersReducedMotion, autoPlayIntervalMs, goToNext]);

  // While live Supabase slides are resolving (~100ms), render a clean brand backdrop with zero old/fallback image flash
  if (!previewMode && isLoading && activeSlides.length === 0) {
    return (
      <section
        aria-label="Delightful Juices Featured Promotions"
        aria-busy="true"
        className="relative w-full min-h-[560px] sm:min-h-[630px] lg:min-h-[76vh] bg-gradient-to-br from-[#0E2918] via-[#12351F] to-[#1B4D2E] overflow-hidden flex items-center"
      >
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
      </section>
    );
  }

  const currentSlide = effectiveSlides[currentIndex] || effectiveSlides[0];
  const hasMultiple = effectiveSlides.length > 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Delightful Juices Featured Promotions"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      className="relative w-full min-h-[560px] sm:min-h-[630px] lg:min-h-[76vh] bg-[#12351F] overflow-hidden flex items-center"
    >
      {/* Background Slide Layers with Smooth Crossfade & Subtle Ken Burns Zoom */}
      {effectiveSlides.map((slide, idx) => {
        const isCurrent = idx === currentIndex;
        const desktopSrc = (slide.desktopImageUrl || '').trim();
        const rawMobile = (slide.mobileImageUrl || '').trim();
        const customMobileSrc = rawMobile && rawMobile !== desktopSrc ? rawMobile : '';
        const imageLoadKey = `${desktopSrc}::${customMobileSrc}`;
        const isImgLoaded = Boolean(loadedUrls[imageLoadKey]);
        const isImgErrored = Boolean(erroredUrls[imageLoadKey]);
        const scrimClass = getScrimOpacityClass(slide.overlayOpacity);

        return (
          <div
            key={slide.id}
            aria-hidden={!isCurrent}
            className={`absolute inset-0 bg-gradient-to-br from-[#0E2918] via-[#12351F] to-[#1B4D2E] transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Ken Burns Motion Wrapper — Re-keys when active so scale starts smoothly */}
            {desktopSrc && !isImgErrored && (
              <div
                key={`${slide.id}-${isCurrent ? 'active' : 'idle'}`}
                className={`w-full h-full ${
                  isCurrent && !prefersReducedMotion ? 'hero-ken-burns' : ''
                } ${isPaused ? 'hero-ken-burns-paused' : ''}`}
              >
                <picture className="block w-full h-full">
                  {customMobileSrc && <source media="(max-width: 767px)" srcSet={customMobileSrc} />}
                  <img
                    ref={(el) => {
                      if (el && el.complete && el.naturalWidth > 0) {
                        markImageLoaded(imageLoadKey);
                      }
                    }}
                    src={desktopSrc}
                    alt={sanitizeBrandAndUnitsText(slide.heading)}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                    decoding="async"
                    onLoad={() => markImageLoaded(imageLoadKey)}
                    onError={() => markImageErrored(imageLoadKey)}
                    className={`w-full h-full object-cover object-center select-none transition-opacity duration-500 ease-out ${
                      isImgLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </picture>
              </div>
            )}

            {/* Layered Commercial Scrim for Optimal Text Contrast */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-[#0E2918] via-[#12351F] to-[#12351F]/60 ${scrimClass}`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0E2918]/45 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          </div>
        );
      })}

      {/* Foreground Copy & Call to Action Container */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl space-y-6">
          {/* Eyebrow Kicker */}
          {currentSlide.kicker && (
            <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#E1AD01] border-l-2 border-[#E1AD01] pl-3">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{sanitizeBrandAndUnitsText(currentSlide.kicker)}</span>
            </div>
          )}

          {/* Slide Heading */}
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.1] tracking-tight drop-shadow-xs">
            {sanitizeBrandAndUnitsText(currentSlide.heading)}
          </h1>

          {/* Slide Supporting Subheading */}
          {currentSlide.subheading && (
            <p className="text-sm sm:text-lg text-[#FFF8E7]/92 leading-relaxed max-w-xl font-normal">
              {sanitizeBrandAndUnitsText(currentSlide.subheading)}
            </p>
          )}

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => onNavigate(currentSlide.ctaUrl || '/shop')}
              className="inline-flex items-center justify-center space-x-2.5 bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-extrabold text-sm sm:text-base px-7 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              <span>{currentSlide.ctaLabel || 'Shop Now'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {currentSlide.secondaryCtaLabel && (
              <button
                type="button"
                onClick={() => onNavigate(currentSlide.secondaryCtaUrl || '/events-catering')}
                className="inline-flex items-center justify-center space-x-2 bg-white/12 hover:bg-white/22 backdrop-blur-md text-white border border-white/35 font-bold text-sm sm:text-base px-6 py-4 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <span>{currentSlide.secondaryCtaLabel}</span>
              </button>
            )}
          </div>

          {/* Authentic Trust Strip */}
          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#FFF8E7]/90 font-medium">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
              <span>100% Natural Botanicals</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
              <span>Affordable Delivery</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-[#E1AD01] shrink-0" />
              <span>Free Local Delivery Over ${content.freeDeliveryThreshold.toFixed(0)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Arrows (Desktop & Tablet) */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous slide"
            className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 hover:bg-[#E1AD01] text-white hover:text-[#1B4D2E] border border-white/25 backdrop-blur-xs items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/30 hover:bg-[#E1AD01] text-white hover:text-[#1B4D2E] border border-white/25 backdrop-blur-xs items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom Slide Indicators + Mobile Prev/Next Controls */}
      {hasMultiple && (
        <div className="absolute bottom-5 inset-x-0 z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2.5" role="tablist" aria-label="Slide selector">
            {effectiveSlides.map((slide, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={`View slide ${idx + 1}: ${slide.heading}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'w-9 bg-[#E1AD01]'
                      : 'w-2.5 bg-white/45 hover:bg-white/80'
                  }`}
                />
              );
            })}
          </div>

          {/* Mobile compact prev/next buttons */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous slide"
              className="w-8 h-8 rounded-full bg-black/40 text-white border border-white/25 flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next slide"
              className="w-8 h-8 rounded-full bg-black/40 text-white border border-white/25 flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
