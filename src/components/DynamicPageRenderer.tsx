import React, { useEffect } from 'react';
import { CmsPage, PageSection, Product, SiteContent } from '../types';
import { sanitizeBrandAndUnitsText } from '../lib/units';
import { ProductCard } from './ProductCard';
import { EventsCateringSection } from './EventsCateringSection';
import { WholesaleSection } from './WholesaleSection';
import { FaqSection } from './FaqSection';
import { ContactSection } from './ContactSection';
import { AboutProductsShowcase } from './AboutProductsShowcase';
import { ProductSliderSection } from './ProductSliderSection';
import { EventProductShowcase } from './EventProductShowcase';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

interface DynamicPageRendererProps {
  page: CmsPage;
  products: Product[];
  content: SiteContent;
  onNavigate: (href: string) => void;
  onOpenProductDetails: (product: Product) => void;
  isPreview?: boolean;
  isProductsLoading?: boolean;
}

export const DynamicPageRenderer: React.FC<DynamicPageRendererProps> = ({
  page,
  products,
  content,
  onNavigate,
  onOpenProductDetails,
  isPreview = false,
  isProductsLoading = false,
}) => {
  // Dynamically sync SEO <title> and <meta name="description"> when viewing a page
  useEffect(() => {
    if (isPreview) return;
    const prevTitle = document.title;
    const desiredTitle =
      page.seoTitle?.trim() || `${page.title} | ${content.businessName || 'Delightful Juices'}`;
    document.title = sanitizeBrandAndUnitsText(desiredTitle);

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') || '';
    if (metaDesc && page.metaDescription?.trim()) {
      metaDesc.setAttribute('content', sanitizeBrandAndUnitsText(page.metaDescription));
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
    };
  }, [page, content.businessName, isPreview]);

  const getThemeClasses = (theme?: PageSection['theme']) => {
    switch (theme) {
      case 'dark':
        return 'bg-[#1B4D2E] text-[#FFF8E7]';
      case 'cream':
        return 'bg-[#FFF8E7] text-[#1B4D2E]';
      case 'gold':
        return 'bg-[#E1AD01] text-[#1B4D2E]';
      default:
        return 'bg-white text-[#1B4D2E]';
    }
  };

  const isAboutPage =
    (page.slug || '').replace(/^\/+/, '').toLowerCase() === 'about-us' ||
    (page.slug || '').replace(/^\/+/, '').toLowerCase() === 'our-story';

  const renderSection = (section: PageSection) => {
    switch (section.type) {
      case 'hero': {
        const bgImg = (section.imageUrl || '').trim();
        return (
          <section
            key={section.id}
            className="relative min-h-[380px] sm:min-h-[450px] bg-gradient-to-br from-[#0e2918] via-[#12351F] to-[#1B4D2E] text-white flex items-center overflow-hidden"
          >
            {bgImg && (
              <img
                src={bgImg}
                alt={section.heading || page.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e2918]/90 via-[#12351F]/75 to-[#12351F]/45" />
            <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-22">
              <div className="max-w-2xl space-y-4">
                {section.kicker && (
                  <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#E1AD01] border-l-2 border-[#E1AD01] pl-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{sanitizeBrandAndUnitsText(section.kicker)}</span>
                  </div>
                )}
                {section.heading && (
                  <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white leading-tight tracking-tight">
                    {sanitizeBrandAndUnitsText(section.heading)}
                  </h1>
                )}
                {section.subheading && (
                  <p className="text-sm sm:text-lg text-[#FFF8E7]/90 leading-relaxed">
                    {sanitizeBrandAndUnitsText(section.subheading)}
                  </p>
                )}
                {(section.buttonLabel || section.secondaryButtonLabel) && (
                  <div className="pt-3 flex flex-wrap gap-3">
                    {section.buttonLabel && (
                      <button
                        type="button"
                        onClick={() => onNavigate(section.buttonUrl || '/shop')}
                        className="inline-flex items-center space-x-2 bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <span>{section.buttonLabel}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                    {section.secondaryButtonLabel && (
                      <button
                        type="button"
                        onClick={() => onNavigate(section.secondaryButtonUrl || '/contact-us')}
                        className="inline-flex items-center space-x-2 bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white border border-white/35 font-bold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer"
                      >
                        <span>{section.secondaryButtonLabel}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      }

      case 'image_text': {
        const isRight = section.imagePosition === 'right';
        const isDark = section.theme === 'dark';
        const splitImg = (section.imageUrl || '').trim();
        const paragraphs = sanitizeBrandAndUnitsText(section.body || '')
          .split('\n\n')
          .filter(Boolean);

        return (
          <section key={section.id} className={`py-16 sm:py-20 ${getThemeClasses(section.theme)}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                {splitImg ? (
                  <div className={`lg:col-span-5 ${isRight ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-[#FFF8E7]">
                      <img
                        src={splitImg}
                        alt={section.heading || page.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : null}

                <div
                  className={`${
                    splitImg
                      ? `lg:col-span-7 ${isRight ? 'lg:order-1' : 'lg:order-2'}`
                      : 'lg:col-span-10 lg:col-start-2'
                  } space-y-5`}
                >
                  {section.kicker && (
                    <div
                      className={`inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.16em] border-l-2 border-[#E1AD01] pl-3 ${
                        isDark ? 'text-[#E1AD01]' : 'text-[#1B4D2E]'
                      }`}
                    >
                      <span>{sanitizeBrandAndUnitsText(section.kicker)}</span>
                    </div>
                  )}
                  {section.heading && (
                    <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight">
                      {sanitizeBrandAndUnitsText(section.heading)}
                    </h2>
                  )}
                  <div className="space-y-3.5 text-sm sm:text-base opacity-90 leading-relaxed">
                    {paragraphs.map((p, idx) => (
                      <p key={idx} className="whitespace-pre-line">
                        {p}
                      </p>
                    ))}
                  </div>
                  {section.buttonLabel && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => onNavigate(section.buttonUrl || '/shop')}
                        className={`inline-flex items-center space-x-2 font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-xs transition-all cursor-pointer ${
                          isDark
                            ? 'bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E]'
                            : 'bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7]'
                        }`}
                      >
                        <span>{section.buttonLabel}</span>
                        <ArrowRight className="w-4 h-4 text-[#E1AD01]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      }

      case 'full_image': {
        const fullImg = (section.imageUrl || '').trim();
        if (!fullImg) return null;
        return (
          <section key={section.id} className={`py-12 sm:py-16 ${getThemeClasses(section.theme)}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
              {section.heading && (
                <h2 className="font-display font-bold text-2xl sm:text-3xl">
                  {sanitizeBrandAndUnitsText(section.heading)}
                </h2>
              )}
              <div className="aspect-16/9 sm:aspect-21/9 rounded-3xl overflow-hidden shadow-lg border border-[#1B4D2E]/15 bg-[#FFF8E7]">
                <img
                  src={fullImg}
                  alt={section.heading || page.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {section.subheading && (
                <p className="text-xs sm:text-sm opacity-80">
                  {sanitizeBrandAndUnitsText(section.subheading)}
                </p>
              )}
            </div>
          </section>
        );
      }

      case 'text_only': {
        const lines = sanitizeBrandAndUnitsText(section.body || '').split('\n');
        return (
          <section key={section.id} className={`py-14 sm:py-18 ${getThemeClasses(section.theme)}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
              {section.kicker && (
                <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#E1AD01]">
                  {sanitizeBrandAndUnitsText(section.kicker)}
                </div>
              )}
              {section.heading && (
                <h2 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight">
                  {sanitizeBrandAndUnitsText(section.heading)}
                </h2>
              )}
              <div className="space-y-2.5 text-sm sm:text-base opacity-90 leading-relaxed">
                {lines.map((line, i) =>
                  line.trim() ? <p key={i}>{line}</p> : <div key={i} className="h-2" />
                )}
              </div>
            </div>
          </section>
        );
      }

      case 'promo_banner':
      case 'cta': {
        const isGold = section.theme === 'gold';
        return (
          <section
            key={section.id}
            className={`py-14 sm:py-18 ${
              isGold ? 'bg-[#E1AD01] text-[#1B4D2E]' : 'bg-[#1B4D2E] text-[#FFF8E7]'
            }`}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                {section.kicker && (
                  <span
                    className={`text-xs font-extrabold uppercase tracking-[0.16em] block ${
                      isGold ? 'text-[#1B4D2E]/80' : 'text-[#E1AD01]'
                    }`}
                  >
                    {sanitizeBrandAndUnitsText(section.kicker)}
                  </span>
                )}
                {section.heading && (
                  <h2 className="font-display font-extrabold text-2xl sm:text-4xl leading-tight">
                    {sanitizeBrandAndUnitsText(section.heading)}
                  </h2>
                )}
                {section.body && (
                  <p className="text-xs sm:text-base opacity-90 leading-relaxed">
                    {sanitizeBrandAndUnitsText(section.body)}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 shrink-0">
                {section.buttonLabel && (
                  <button
                    type="button"
                    onClick={() => onNavigate(section.buttonUrl || '/shop')}
                    className={`inline-flex items-center space-x-2 font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer ${
                      isGold
                        ? 'bg-[#1B4D2E] hover:bg-[#12351F] text-[#FFF8E7]'
                        : 'bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E]'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{section.buttonLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {section.secondaryButtonLabel && (
                  <button
                    type="button"
                    onClick={() => onNavigate(section.secondaryButtonUrl || '/contact-us')}
                    className={`inline-flex items-center space-x-2 font-bold text-sm px-5 py-3.5 rounded-xl border transition-all cursor-pointer ${
                      isGold
                        ? 'border-[#1B4D2E]/40 text-[#1B4D2E] hover:bg-[#1B4D2E]/10'
                        : 'border-white/35 text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{section.secondaryButtonLabel}</span>
                  </button>
                )}
              </div>
            </div>
          </section>
        );
      }

      case 'featured_products': {
        const limit = section.maxProducts || 3;
        const featuredList = products
          .filter((p) => p.featured && p.inStock)
          .slice(0, limit);
        const listToRender =
          featuredList.length > 0 ? featuredList : products.slice(0, limit);

        return (
          <section key={section.id} className={`py-16 sm:py-20 ${getThemeClasses(section.theme)}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  {section.kicker && (
                    <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#E1AD01]">
                      {sanitizeBrandAndUnitsText(section.kicker)}
                    </div>
                  )}
                  <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#1B4D2E]">
                    {sanitizeBrandAndUnitsText(section.heading || 'Featured Delightful Juices')}
                  </h2>
                  {section.subheading && (
                    <p className="text-sm text-[#1B4D2E]/75">
                      {sanitizeBrandAndUnitsText(section.subheading)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/shop')}
                  className="inline-flex items-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl cursor-pointer self-start sm:self-end"
                >
                  <span>Shop All Drinks</span>
                  <ArrowRight className="w-4 h-4 text-[#E1AD01]" />
                </button>
              </div>

              {isProductsLoading && products.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-3xl overflow-hidden border border-[#1B4D2E]/10 shadow-xs animate-pulse"
                    >
                      <div className="aspect-4/3 bg-[#1B4D2E]/10" />
                      <div className="p-5 space-y-3">
                        <div className="h-5 w-2/3 bg-[#1B4D2E]/15 rounded-lg" />
                        <div className="h-10 bg-[#1B4D2E]/15 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {listToRender.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onOpenDetails={onOpenProductDetails}
                      whatsappNumber={content.whatsappNumber}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      }

      case 'image_gallery': {
        const items = (section.galleryImages || []).filter((img) => Boolean(img.url?.trim()));
        if (items.length === 0) return null;
        return (
          <section key={section.id} className={`py-16 sm:py-20 ${getThemeClasses(section.theme)}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="max-w-2xl space-y-2">
                {section.kicker && (
                  <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1B4D2E]">
                    {sanitizeBrandAndUnitsText(section.kicker)}
                  </div>
                )}
                {section.heading && (
                  <h2 className="font-display font-extrabold text-3xl sm:text-4xl">
                    {sanitizeBrandAndUnitsText(section.heading)}
                  </h2>
                )}
                {section.subheading && (
                  <p className="text-sm opacity-80">
                    {sanitizeBrandAndUnitsText(section.subheading)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((img, i) => (
                  <figure
                    key={i}
                    className="bg-white rounded-3xl overflow-hidden border border-[#1B4D2E]/12 shadow-xs"
                  >
                    <div className="aspect-4/3 overflow-hidden bg-[#FFF8E7]">
                      <img
                        src={img.url}
                        alt={img.caption || `Gallery image ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {img.caption && (
                      <figcaption className="p-4 text-xs font-bold text-[#1B4D2E]">
                        {sanitizeBrandAndUnitsText(img.caption)}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case 'product_slider':
        return (
          <ProductSliderSection
            key={section.id}
            products={products}
            content={content}
            onOpenDetails={onOpenProductDetails}
            onNavigate={onNavigate}
            hidePricesAndSizes={isAboutPage}
          />
        );

      case 'product_ingredients':
        return (
          <AboutProductsShowcase
            key={section.id}
            products={products}
            heading={section.heading}
            subheading={section.subheading}
            kicker={section.kicker}
            onOpenDetails={onOpenProductDetails}
            onNavigate={onNavigate}
          />
        );

      case 'event_motion_grid':
        return (
          <EventProductShowcase
            key={section.id}
            items={content.eventShowcase || content.branding?.eventShowcase || []}
            heading={section.heading}
            subheading={section.subheading}
            kicker={section.kicker}
            onPlanEventClick={() => onNavigate('/wholesale')}
          />
        );

      case 'catering_calculator':
        return <EventsCateringSection key={section.id} content={content} />;

      case 'wholesale_tiers':
        return (
          <WholesaleSection
            key={section.id}
            content={content}
            onCateringClick={() => onNavigate('/events-catering')}
          />
        );

      case 'faq_list':
        return <FaqSection key={section.id} content={content} />;

      case 'contact_info':
        return <ContactSection key={section.id} content={content} />;

      default:
        return null;
    }
  };

  const effectiveSections = React.useMemo(() => {
    const rawSections = page.sections || [];
    const isAboutPage = (page.slug || '').replace(/^\/+/, '').toLowerCase() === 'about-us';
    if (isAboutPage && !rawSections.some((s) => s.type === 'product_slider')) {
      const idx = rawSections.findIndex((s) => s.type === 'product_ingredients');
      const sliderSection: PageSection = {
        id: 'sec-about-slider-auto',
        type: 'product_slider',
        kicker: 'INTERACTIVE FLAVOR SHOWCASE',
        heading: 'Discover Our Signature Handcrafted Juices',
        subheading:
          'Slide through our authentic botanical creations, pressed fresh in Quakertown, PA with no preservatives added.',
      };
      if (idx >= 0) {
        const copy = [...rawSections];
        copy.splice(idx, 0, sliderSection);
        return copy;
      }
      return [...rawSections, sliderSection];
    }
    return rawSections;
  }, [page.sections, page.slug]);

  return (
    <div className="min-h-[60vh]">
      {effectiveSections.length > 0 ? (
        effectiveSections.map((section) => renderSection(section))
      ) : (
        <section className="py-24 bg-[#FFF8E7] text-center px-4">
          <div className="max-w-xl mx-auto space-y-4">
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#1B4D2E]">
              {sanitizeBrandAndUnitsText(page.title)}
            </h1>
            <p className="text-sm text-[#1B4D2E]/75">
              This page is ready for content sections in the Delightful Juices CMS.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="inline-flex items-center space-x-2 bg-[#1B4D2E] text-[#FFF8E7] font-bold text-xs px-5 py-3 rounded-xl cursor-pointer"
            >
              <span>Shop Fresh Juices</span>
              <ArrowRight className="w-4 h-4 text-[#E1AD01]" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
