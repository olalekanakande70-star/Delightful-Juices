import React, { useState } from 'react';
import { EventShowcaseItem } from '../types';
import { sanitizeBrandAndUnitsText } from '../lib/units';
import { Sparkles, Calendar, ArrowRight, Eye, X } from 'lucide-react';

interface EventProductShowcaseProps {
  items: EventShowcaseItem[];
  heading?: string;
  subheading?: string;
  kicker?: string;
  onPlanEventClick?: () => void;
}

export const EventProductShowcase: React.FC<EventProductShowcaseProps> = ({
  items,
  heading = 'Event Product Showcase & Celebrations',
  subheading = 'Browse products, custom monogrammed bottles, and catering setups prepared fresh for weddings, corporate retreats, and private parties.',
  kicker = 'CUSTOM EVENTS & SPECIAL OCCASIONS',
  onPlanEventClick,
}) => {
  const publishedItems = (items || [])
    .filter((item) => item.published !== false && Boolean(item.url?.trim()))
    .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

  const [activeModalItem, setActiveModalItem] = useState<EventShowcaseItem | null>(null);

  return (
    <section id="event-showcase" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 sm:mb-16">
          {kicker && (
            <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#1B4D2E] border-l-2 border-[#E1AD01] pl-3">
              <Sparkles className="w-3.5 h-3.5 text-[#E1AD01]" />
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

        {/* Content: Published Motion Grid OR Clean Empty State */}
        {publishedItems.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {publishedItems.map((item, idx) => {
              const cleanTitle = sanitizeBrandAndUnitsText(item.title);
              const cleanCaption = item.caption ? sanitizeBrandAndUnitsText(item.caption) : '';

              return (
                <div
                  key={item.id || idx}
                  onClick={() => setActiveModalItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveModalItem(item);
                    }
                  }}
                  className="break-inside-avoid relative rounded-3xl overflow-hidden bg-[#FFF8E7] border border-[#1B4D2E]/12 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group"
                >
                  <img
                    src={item.url}
                    alt={cleanTitle || 'Event product showcase'}
                    loading="lazy"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12351F]/90 via-[#1B4D2E]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-[#FFF8E7]">
                    <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 space-y-1.5">
                      <div className="inline-flex items-center space-x-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#E1AD01]">
                        <Eye className="w-3 h-3" />
                        <span>Event Showcase</span>
                      </div>
                      {cleanTitle && (
                        <h4 className="font-display font-extrabold text-lg text-white leading-snug">
                          {cleanTitle}
                        </h4>
                      )}
                      {cleanCaption && (
                        <p className="text-xs text-[#FFF8E7]/90 line-clamp-2">
                          {cleanCaption}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subtle always-visible caption bar on touch screens */}
                  {cleanTitle && (
                    <div className="p-4 bg-white/95 border-t border-[#1B4D2E]/8 sm:hidden">
                      <p className="font-bold text-xs text-[#1B4D2E] truncate">{cleanTitle}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Clean Empty State (No broken placeholders, no random stock photos) */
          <div className="bg-[#FFF8E7] rounded-3xl border border-[#1B4D2E]/15 p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-5 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center mx-auto shadow-sm">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-2xl text-[#1B4D2E]">
                Customized Event Packages &amp; Catering Setups
              </h3>
              <p className="text-xs sm:text-sm text-[#1B4D2E]/80 max-w-xl mx-auto leading-relaxed">
                We prepare bespoke, chilled juice bars and monogrammed bottles for weddings, birthday celebrations, corporate events, private parties, and special gatherings.
              </p>
            </div>
            {onPlanEventClick && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onPlanEventClick}
                  className="inline-flex items-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>Plan Your Event With Delightful Juices</span>
                  <ArrowRight className="w-4 h-4 text-[#E1AD01]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Lightbox Modal */}
      {activeModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="bg-[#12351F] text-white rounded-3xl max-w-2xl w-full overflow-hidden border border-[#E1AD01]/30 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activeModalItem.url}
                alt={activeModalItem.title || 'Event image'}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            {(activeModalItem.title || activeModalItem.caption) && (
              <div className="p-6 space-y-2 bg-[#12351F]">
                {activeModalItem.title && (
                  <h3 className="font-display font-extrabold text-xl text-white">
                    {sanitizeBrandAndUnitsText(activeModalItem.title)}
                  </h3>
                )}
                {activeModalItem.caption && (
                  <p className="text-sm text-[#FFF8E7]/85 leading-relaxed">
                    {sanitizeBrandAndUnitsText(activeModalItem.caption)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
