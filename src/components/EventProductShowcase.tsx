import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EventShowcaseItem } from '../types';
import { sanitizeBrandAndUnitsText } from '../lib/units';
import {
  Sparkles,
  Calendar,
  ArrowRight,
  Eye,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Tag,
  Palette,
  PackageCheck,
} from 'lucide-react';

interface EventProductShowcaseProps {
  items: EventShowcaseItem[];
  heading?: string;
  subheading?: string;
  kicker?: string;
  onPlanEventClick?: (selectedItem?: EventShowcaseItem) => void;
}

export const EventProductShowcase: React.FC<EventProductShowcaseProps> = ({
  items,
  heading = 'Custom Event Pouches & Catering Gallery',
  subheading = 'Explore our custom-themed juice pouches, monogrammed bottles, and chilled cooler displays prepared fresh for weddings, milestone birthdays, concerts, and celebrations.',
  kicker = 'EVENT PRODUCT GALLERY',
  onPlanEventClick,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<EventShowcaseItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [erroredUrls, setErroredUrls] = useState<Record<string, boolean>>({});

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const publishedItems = (items || [])
    .filter((item) => item.published !== false && Boolean(item.url?.trim()))
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));

  const categories = [
    { id: 'all', label: 'All Event Gallery' },
    { id: 'pouches', label: 'Custom Pouches' },
    { id: 'weddings', label: 'Weddings & Couples' },
    { id: 'birthdays', label: 'Birthdays & Milestones' },
    { id: 'coolers', label: 'Coolers & Bulk Setups' },
  ];

  const filteredItems = publishedItems.filter((item) => {
    if (activeCategory === 'all') return true;
    const itemCat = item.category || 'pouches';
    return itemCat === activeCategory;
  });

  const total = filteredItems.length;

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory, total]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    if (idx >= 0 && idx < total) {
      setCurrentIndex(idx);
    }
  };

  useEffect(() => {
    if (isHovered || isDragging || activeModalItem || total <= 1) return;
    timerRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, isDragging, activeModalItem, total, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX === null) return;
    const diff = dragStartX - e.changedTouches[0].clientX;
    if (diff > 45) nextSlide();
    else if (diff < -45) prevSlide();
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

  const handleInquiryClick = (item?: EventShowcaseItem) => {
    setActiveModalItem(null);
    if (onPlanEventClick) {
      onPlanEventClick(item);
      return;
    }
    const formEl = document.getElementById('catering-proposal-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  return (
    <section
      id="event-showcase"
      aria-label="Event Product Gallery Carousel"
      className="py-18 sm:py-20 bg-white border-b border-[#1B4D2E]/10 relative overflow-hidden select-none"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10 sm:mb-12">
          {kicker && (
            <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#E1AD01] bg-[#1B4D2E] px-4 py-1.5 rounded-full shadow-xs">
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

          {/* Custom Event Pouches Pricing Callout Banner */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-[#FFF8E7] border border-[#E1AD01]/50 rounded-2xl px-5 py-3 shadow-xs text-left">
              <div className="flex items-center gap-2 text-[#1B4D2E] font-extrabold text-xs sm:text-sm whitespace-nowrap">
                <Tag className="w-4 h-4 text-[#E1AD01] shrink-0" />
                <span>Pouches Base Order:</span>
                <span className="bg-[#1B4D2E] text-[#E1AD01] px-2.5 py-0.5 rounded-lg font-black tabular-nums">
                  100 Pieces — $300
                </span>
              </div>
              <span className="hidden sm:inline text-[#1B4D2E]/30">|</span>
              <span className="text-[11px] sm:text-xs font-semibold text-[#1B4D2E]/80 text-center sm:text-left">
                Well customized with your photos, names &amp; event theme
              </span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          {publishedItems.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-sm'
                        : 'bg-[#FFF8E7] text-[#1B4D2E]/80 hover:bg-[#1B4D2E]/10 border border-[#1B4D2E]/15'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Horizontal 3D Coverflow Carousel OR Empty State */}
        {total > 0 ? (
          <div>
            <div
              className="relative w-full h-[460px] sm:h-[510px] md:h-[530px] flex items-center justify-center my-2 cursor-grab active:cursor-grabbing"
              style={{
                perspective: '1200px',
                perspectiveOrigin: '50% 50%',
              }}
            >
              {filteredItems.map((item, idx) => {
                let offset = (idx - currentIndex) % total;
                if (offset > total / 2) offset -= total;
                if (offset < -total / 2) offset += total;

                const isCenter = offset === 0;
                const isVisible = Math.abs(offset) <= 2;

                if (!isVisible) return null;

                let translateX = 0;
                let translateZ = 0;
                let rotateY = 0;
                let scale = 1;
                let opacity = 1;
                let zIndex = 30;

                const baseStep1 = isMobile ? 125 : isTablet ? 190 : 245;
                const baseStep2 = isMobile ? 225 : isTablet ? 340 : 440;

                if (offset === 0) {
                  translateX = 0;
                  translateZ = isMobile ? 30 : 60;
                  rotateY = 0;
                  scale = isMobile ? 1.02 : 1.06;
                  opacity = 1;
                  zIndex = 40;
                } else if (offset === -1) {
                  translateX = -baseStep1;
                  translateZ = isMobile ? -50 : -85;
                  rotateY = isMobile ? 22 : 28;
                  scale = isMobile ? 0.85 : 0.88;
                  opacity = 0.88;
                  zIndex = 25;
                } else if (offset === 1) {
                  translateX = baseStep1;
                  translateZ = isMobile ? -50 : -85;
                  rotateY = isMobile ? -22 : -28;
                  scale = isMobile ? 0.85 : 0.88;
                  opacity = 0.88;
                  zIndex = 25;
                } else if (offset === -2) {
                  translateX = -baseStep2;
                  translateZ = isMobile ? -110 : -175;
                  rotateY = isMobile ? 32 : 40;
                  scale = isMobile ? 0.72 : 0.75;
                  opacity = isMobile ? 0.35 : 0.58;
                  zIndex = 10;
                } else if (offset === 2) {
                  translateX = baseStep2;
                  translateZ = isMobile ? -110 : -175;
                  rotateY = isMobile ? -32 : -40;
                  scale = isMobile ? 0.72 : 0.75;
                  opacity = isMobile ? 0.35 : 0.58;
                  zIndex = 10;
                }

                const cleanTitle = sanitizeBrandAndUnitsText(item.title || 'Event Showcase');
                const cleanCaption = item.caption ? sanitizeBrandAndUnitsText(item.caption) : '';
                const badgeText = item.badge || '100 Pieces — $300';
                const categoryLabelText = item.categoryLabel || 'Custom Event Theme';
                const priceLabelText = item.priceLabel || 'Base Order: 100 pcs — $300';
                const customNoteText = item.customizationNote || 'Custom Event Theme & Labels';

                return (
                  <article
                    key={item.id || idx}
                    role="button"
                    tabIndex={0}
                    aria-label={isCenter ? `Inspect ${cleanTitle}` : `Focus ${cleanTitle}`}
                    onClick={() => {
                      if (!isCenter) {
                        goToSlide(idx);
                      } else {
                        setActiveModalItem(item);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!isCenter) goToSlide(idx);
                        else setActiveModalItem(item);
                      }
                    }}
                    className={`absolute top-1/2 left-1/2 rounded-3xl overflow-hidden transition-all duration-500 ease-out flex flex-col justify-between cursor-pointer ${
                      isCenter
                        ? 'w-[270px] sm:w-[320px] md:w-[350px] h-[425px] sm:h-[465px] md:h-[485px] bg-[#FFF8E7] border-2 border-[#E1AD01] shadow-[0_24px_50px_rgba(27,77,46,0.18)] ring-1 ring-[#E1AD01]/35'
                        : 'w-[245px] sm:w-[290px] md:w-[315px] h-[395px] sm:h-[430px] md:h-[450px] bg-white border border-[#1B4D2E]/15 shadow-lg hover:border-[#E1AD01]/60'
                    }`}
                    style={{
                      transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      zIndex,
                      opacity,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Top Image Container */}
                    <div className="relative h-[220px] sm:h-[245px] bg-[#12351F] overflow-hidden flex items-center justify-center p-3 shrink-0">
                      {!erroredUrls[item.url] ? (
                        <img
                          key={item.url}
                          src={item.url}
                          alt={cleanTitle}
                          draggable={false}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setErroredUrls((prev) => ({ ...prev, [item.url]: true }))
                          }
                          className="w-full h-full object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4 text-[#FFF8E7]">
                          <ImageIcon className="w-8 h-8 text-[#E1AD01] mb-2" />
                          <span className="text-xs font-bold">{cleanTitle}</span>
                        </div>
                      )}

                      <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                        <span className="bg-[#1B4D2E]/95 text-[#E1AD01] border border-[#E1AD01]/50 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs flex items-center space-x-1 backdrop-blur-xs">
                          <Tag className="w-3 h-3 text-[#E1AD01]" />
                          <span>{badgeText}</span>
                        </span>
                      </div>

                      {isCenter && (
                        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-xs text-[#FFF8E7] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>Inspect Photo</span>
                        </div>
                      )}
                    </div>

                    {/* Card Metadata & Actions */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#E1AD01] bg-[#1B4D2E] inline-block px-2.5 py-0.5 rounded-md">
                          {categoryLabelText}
                        </div>
                        <h3 className="font-display font-bold text-base sm:text-lg text-[#1B4D2E] leading-snug line-clamp-1">
                          {cleanTitle}
                        </h3>
                        {cleanCaption && (
                          <p className="text-[11px] text-[#1B4D2E]/80 leading-relaxed line-clamp-2">
                            {cleanCaption}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#1B4D2E]/10 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-[#1B4D2E]">
                          <span className="font-semibold text-[#1B4D2E]/70 flex items-center space-x-1">
                            <PackageCheck className="w-3 h-3 text-[#1B4D2E]/60" />
                            <span>Order:</span>
                          </span>
                          <strong className="font-extrabold text-[#1B4D2E] tabular-nums">
                            {priceLabelText}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-[#1B4D2E]">
                          <span className="font-semibold text-[#1B4D2E]/70 flex items-center space-x-1">
                            <Palette className="w-3 h-3 text-[#1B4D2E]/60" />
                            <span>Theme:</span>
                          </span>
                          <span className="text-[10px] font-semibold truncate max-w-[155px]">
                            {customNoteText}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div
                        className="pt-2.5 border-t border-[#1B4D2E]/10 flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveModalItem(item)}
                          className="flex-1 bg-white hover:bg-gray-50 text-[#1B4D2E] border border-[#1B4D2E]/20 font-bold text-[11px] py-2 px-2.5 rounded-xl transition-all text-center cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          Inspect
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInquiryClick(item)}
                          className="flex-1 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-[11px] py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          <span>Request Quote</span>
                          <ArrowRight className="w-3 h-3 text-[#E1AD01]" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Carousel Navigation: Arrows & Pagination Dots */}
            <div className="mt-6 flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous event showcase item"
                className="w-11 h-11 rounded-2xl bg-[#FFF8E7] hover:bg-[#E1AD01] text-[#1B4D2E] border border-[#1B4D2E]/20 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2">
                {filteredItems.map((item, idx) => {
                  const isActive = currentIndex === idx;
                  return (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}: ${item.title}`}
                      className={`transition-all rounded-full cursor-pointer ${
                        isActive
                          ? 'w-8 h-2.5 bg-[#E1AD01] shadow-xs'
                          : 'w-2.5 h-2.5 bg-[#1B4D2E]/25 hover:bg-[#1B4D2E]/50'
                      }`}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next event showcase item"
                className="w-11 h-11 rounded-2xl bg-[#FFF8E7] hover:bg-[#E1AD01] text-[#1B4D2E] border border-[#1B4D2E]/20 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFF8E7] rounded-3xl border border-[#1B4D2E]/15 p-10 sm:p-14 text-center max-w-3xl mx-auto space-y-5 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center mx-auto shadow-sm">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-2xl text-[#1B4D2E]">
                Custom Event Pouches &amp; Catering Setups
              </h3>
              <p className="text-xs sm:text-sm text-[#1B4D2E]/80 max-w-xl mx-auto leading-relaxed">
                Custom Event Pouches start at a base order of <strong>100 pieces for $300</strong>, thoughtfully customized for weddings, birthdays, concerts, memorials, and corporate events.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleInquiryClick()}
                className="inline-flex items-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Plan Your Event With Delightful Juices</span>
                <ArrowRight className="w-4 h-4 text-[#E1AD01]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* High-Resolution Event Showcase Lightbox Modal */}
      {activeModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#1B4D2E]/20 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="bg-[#12351F] p-5 flex items-center justify-center min-h-[300px]">
                {!erroredUrls[activeModalItem.url] ? (
                  <img
                    key={activeModalItem.url}
                    src={activeModalItem.url}
                    alt={activeModalItem.title || 'Event setup'}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setErroredUrls((prev) => ({ ...prev, [activeModalItem.url]: true }))
                    }
                    className="max-h-[360px] w-auto object-contain rounded-xl drop-shadow-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-[#FFF8E7]">
                    <ImageIcon className="w-10 h-10 text-[#E1AD01] mb-2" />
                    <span className="text-sm font-bold">{activeModalItem.title}</span>
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-7 flex flex-col justify-between space-y-4 text-[#1B4D2E]">
                <div className="space-y-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#E1AD01] bg-[#1B4D2E] inline-block px-2.5 py-0.5 rounded-md">
                    {activeModalItem.categoryLabel || 'Custom Event Packaging'}
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#1B4D2E] leading-snug">
                    {sanitizeBrandAndUnitsText(activeModalItem.title)}
                  </h3>
                  {activeModalItem.caption && (
                    <p className="text-xs text-[#1B4D2E]/80 leading-relaxed">
                      {sanitizeBrandAndUnitsText(activeModalItem.caption)}
                    </p>
                  )}

                  <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B4D2E]/70">Pouches Base Order:</span>
                      <strong className="text-[#1B4D2E] tabular-nums">
                        {activeModalItem.priceLabel || '100 Pieces — $300'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B4D2E]/70">Customization:</span>
                      <span className="font-semibold text-right">
                        {activeModalItem.customizationNote || 'Custom Event Theme Labels'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B4D2E]/70">Bottle Options:</span>
                      <span className="font-semibold">12oz • 16oz • 18oz</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleInquiryClick(activeModalItem)}
                    className="w-full bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                  >
                    <span>Book Custom Event Order</span>
                    <ArrowRight className="w-4 h-4 text-[#E1AD01]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
