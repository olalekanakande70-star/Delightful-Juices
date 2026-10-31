import React, { useState, useEffect } from 'react';
import { SiteContent } from '../types';
import { DEFAULT_ABOUT_SHOWCASE } from '../lib/storage';
import { sanitizeBrandAndUnitsText } from '../lib/units';
import { Heart, Sparkles, Check, ShoppingBag, ArrowRight } from 'lucide-react';

interface AboutSectionProps {
  content: SiteContent;
  onNavigate?: (href: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ content, onNavigate }) => {
  const showcase = {
    ...DEFAULT_ABOUT_SHOWCASE,
    ...(content.branding?.aboutShowcase || {}),
  };

  const mainImageSrc = (showcase.imageUrl || '').trim();
  const ceoAvatarSrc = (showcase.ceoAvatarUrl || '').trim();
  const [mainImgError, setMainImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setMainImgError(false);
  }, [mainImageSrc]);

  useEffect(() => {
    setAvatarError(false);
  }, [ceoAvatarSrc]);

  const mainImageAlt =
    showcase.imageAlt?.trim() ||
    'Fresh whole hibiscus, ginger root, and tropical botanicals for Delightful Juices';

  return (
    <section id="about" className="py-20 bg-[#FFF8E7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Editable Visual Collage (strictly from live Supabase) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#12351F]">
                {mainImageSrc && !mainImgError ? (
                  <img
                    src={mainImageSrc}
                    alt={sanitizeBrandAndUnitsText(mainImageAlt)}
                    onError={() => setMainImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0E2918] via-[#1B4D2E] to-[#12351F] p-8 sm:p-10 flex flex-col justify-between text-[#FFF8E7] relative overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-[#E1AD01]/20 border border-[#E1AD01]/40 flex items-center justify-center text-[#E1AD01]">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="space-y-3 my-auto py-6">
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#E1AD01] block">
                        Small-Batch Botanical Kitchen
                      </span>
                      <div className="font-display font-extrabold text-2xl sm:text-3xl leading-snug text-white">
                        Whole Hibiscus, Fresh Ginger Root &amp; Creamy Tigernut
                      </div>
                      <p className="text-xs sm:text-sm text-[#FFF8E7]/80 leading-relaxed">
                        Pressed fresh daily in Quakertown, Pennsylvania with zero artificial preservatives or synthetic syrups.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/15 flex items-center justify-between text-[11px] font-bold text-[#E1AD01]">
                      <span>11.8 oz • 16.9 oz • 33.8 oz</span>
                      <span>100% Natural</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Editable Founder / C.E.O. Card */}
              {showcase.showCeoCard !== false && (
                <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-[#1B4D2E]/10 max-w-[265px]">
                  <div className="flex items-center space-x-3 mb-2">
                    {ceoAvatarSrc && !avatarError ? (
                      <img
                        src={ceoAvatarSrc}
                        alt={content.ceoName}
                        onError={() => setAvatarError(true)}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#E1AD01] shrink-0 bg-[#1B4D2E]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center font-bold text-sm shrink-0">
                        {showcase.ceoInitials?.trim() || 'OA'}
                      </div>
                    )}
                    <div>
                      <div className="font-extrabold text-xs text-[#1B4D2E]">
                        {sanitizeBrandAndUnitsText(content.ceoName)}
                      </div>
                      {showcase.ceoRole?.trim() && (
                        <div className="text-[10px] text-[#1B4D2E]/70 uppercase tracking-wider font-semibold">
                          {sanitizeBrandAndUnitsText(showcase.ceoRole)}
                        </div>
                      )}
                    </div>
                  </div>
                  {showcase.ceoQuote?.trim() && (
                    <p className="text-[11px] text-[#1B4D2E]/80 italic leading-relaxed">
                      &ldquo;{sanitizeBrandAndUnitsText(showcase.ceoQuote)}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Editable Corner Badge */}
              {showcase.showBadge !== false && showcase.badgeText?.trim() && (
                <div className="absolute -top-4 -left-4 bg-[#E1AD01] text-[#1B4D2E] p-3 rounded-2xl shadow-lg font-black text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{sanitizeBrandAndUnitsText(showcase.badgeText)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Story and Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            {showcase.sectionKicker?.trim() && (
              <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#1B4D2E] border-l-2 border-[#E1AD01] pl-3">
                <Heart className="w-3.5 h-3.5 text-red-600" />
                <span>{sanitizeBrandAndUnitsText(showcase.sectionKicker)}</span>
              </div>
            )}

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1B4D2E] tracking-tight leading-tight">
              {sanitizeBrandAndUnitsText(
                showcase.sectionHeading ||
                  'Crafted from Passion, Heritage, and Real Whole Botanicals.'
              )}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#1B4D2E]/85 leading-relaxed">
              {content.aboutStory?.trim() && (
                <p>{sanitizeBrandAndUnitsText(content.aboutStory)}</p>
              )}

              {showcase.extraStoryParagraph1?.trim() && (
                <p>{sanitizeBrandAndUnitsText(showcase.extraStoryParagraph1)}</p>
              )}

              {showcase.extraStoryParagraph2?.trim() && (
                <p>{sanitizeBrandAndUnitsText(showcase.extraStoryParagraph2)}</p>
              )}
            </div>

            {/* Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#1B4D2E] block">Authentic West African Recipes</span>
                  <span className="text-[#1B4D2E]/70">Traditional Zobo (Hibiscus) &amp; Kunu Aya (Tigernut)</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#1B4D2E] block">Pure Cold-Pressing</span>
                  <span className="text-[#1B4D2E]/70">Active enzymes and vital micronutrients preserved</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#1B4D2E] block">Custom Event Packaging</span>
                  <span className="text-[#1B4D2E]/70">Monograms &amp; logos for weddings and corporate gatherings</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#1B4D2E] block">Local Quakertown Kitchen</span>
                  <span className="text-[#1B4D2E]/70">500 W Broad St, Quakertown, PA 18951</span>
                </div>
              </div>
            </div>

            {onNavigate && (
              <div className="pt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/shop')}
                  className="inline-flex items-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#E1AD01]" />
                  <span>Shop Fresh Juices</span>
                  <ArrowRight className="w-4 h-4 text-[#E1AD01]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
