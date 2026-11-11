import React from 'react';
import { Star, Quote, Sparkles, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SiteContent } from '../types';

interface TestimonialsSectionProps {
  content: SiteContent;
  onNavigate?: (href: string) => void;
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  quote: string;
  productHighlight: string;
  tag: 'Store & Café Wholesale' | 'Wedding & Event' | 'Home Delivery' | 'Corporate Wellness';
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't-1',
    name: 'Chef Marcus L.',
    role: 'Executive Chef & Beverage Director',
    location: 'Allentown, PA',
    rating: 5,
    quote:
      'We introduced Delightful Juices Zobo and Ginger Mango to our brunch and dinner menus. The vibrant botanical color and balanced natural sweetness have made them top sellers. The wholesale cases arrive fresh every Tuesday without fail.',
    productHighlight: 'Zobo & Ginger Mango (33.8 oz & 11.8 oz)',
    tag: 'Store & Café Wholesale',
  },
  {
    id: 't-2',
    name: 'Amina & Tunde K.',
    role: 'Wedding Clients',
    location: 'Bucks County, PA',
    rating: 5,
    quote:
      'Delightful Juices crafted custom monogrammed 11.8 oz bottles of Zobo and dairy-free Tigernut Milk for our wedding reception. Our 180 guests were blown away by the authentic West African heritage flavors. Unbelievably fresh!',
    productHighlight: 'Custom Wedding Favor Bottles (Zobo & Kunu Aya)',
    tag: 'Wedding & Event',
  },
  {
    id: 't-3',
    name: 'Elena R.',
    role: 'Weekly Home Delivery Subscriber',
    location: 'Quakertown, PA',
    rating: 5,
    quote:
      'The Pure Organic Ginger has completely replaced my afternoon coffee. You can feel the real ginger warmth instantly, and knowing it has zero artificial syrups makes it a staple in my fridge. Fast, affordable doorstep delivery every week!',
    productHighlight: 'Pure Organic Ginger & Variety 6-Pack',
    tag: 'Home Delivery',
  },
  {
    id: 't-4',
    name: 'David W.',
    role: 'Office Operations Manager',
    location: 'Bethlehem, PA',
    rating: 5,
    quote:
      'We replaced sugary soda cans with Delightful Juices in our tech hub kitchen. The team raves about the Tigernut Milk and Ginger Pineapple elixirs. Healthy, revitalizing, and our employee wellness satisfaction went up noticeably.',
    productHighlight: 'Corporate Fridge Stocking (Bi-Weekly)',
    tag: 'Corporate Wellness',
  },
];

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  content,
  onNavigate,
}) => {
  const handleFaqNavigation = () => {
    if (onNavigate) {
      onNavigate('/delivery-information');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/delivery-information';
    }
  };

  return (
    <section id="testimonials" className="py-20 bg-white border-t border-[#1B4D2E]/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#1B4D2E] border-l-2 border-[#E1AD01] pl-3">
              <Sparkles className="w-3.5 h-3.5 text-[#E1AD01]" />
              <span>WHAT OUR PARTNERS &amp; CUSTOMERS SAY</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1B4D2E] tracking-tight">
              Loved by Restaurants, Hosts &amp; Families
            </h2>

            <p className="text-sm sm:text-base text-[#1B4D2E]/80 leading-relaxed">
              Read how stores, restaurants, celebration hosts, and everyday wellness enthusiasts across Pennsylvania experience <strong className="text-[#1B4D2E]">Delightful Juices</strong>.
            </p>
          </div>

          {/* Small 'Ask a Question' Button Linking to Dedicated FAQ Page */}
          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={handleFaqNavigation}
              className="inline-flex items-center space-x-2 bg-[#FFF8E7] hover:bg-[#1B4D2E] text-[#1B4D2E] hover:text-[#FFF8E7] border border-[#1B4D2E]/25 hover:border-[#1B4D2E] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
            >
              <HelpCircle className="w-4 h-4 text-[#E1AD01]" />
              <span>Ask a Question</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E1AD01] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 4 Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-[#FFF8E7] rounded-3xl p-6 sm:p-7 border border-[#1B4D2E]/15 flex flex-col justify-between hover:border-[#E1AD01] hover:shadow-lg transition-all duration-200 group"
            >
              <div className="space-y-4">
                {/* Tag & Rating */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E] bg-white border border-[#1B4D2E]/15 px-2.5 py-1 rounded-md">
                    {t.tag}
                  </span>
                  <div className="flex items-center space-x-0.5 text-[#E1AD01]">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <div className="relative">
                  <Quote className="w-6 h-6 text-[#1B4D2E]/15 absolute -top-1 -left-1 pointer-events-none" />
                  <p className="text-xs sm:text-sm text-[#1B4D2E]/85 leading-relaxed relative z-10 italic pt-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Author & Product Highlight */}
              <div className="mt-6 pt-4 border-t border-[#1B4D2E]/10 space-y-1">
                <div className="font-extrabold text-sm text-[#1B4D2E]">
                  {t.name}
                </div>
                <div className="text-[11px] text-[#1B4D2E]/70 font-medium">
                  {t.role} • {t.location}
                </div>
                <div className="text-[10px] text-[#1B4D2E]/85 font-semibold pt-1 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-[#E1AD01] shrink-0" />
                  <span className="truncate">{t.productHighlight}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner with Quick Help Link */}
        <div className="mt-12 p-6 rounded-2xl bg-[#1B4D2E] text-[#FFF8E7] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#E1AD01] text-[#1B4D2E] flex items-center justify-center font-bold shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base text-[#FFF8E7]">
                Have questions about wholesale, ordering, shelf life, or deliveries?
              </div>
              <div className="text-xs text-[#FFF8E7]/80">
                Browse our comprehensive answers or message our Quakertown kitchen directly on WhatsApp.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleFaqNavigation}
              className="bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ask a Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
