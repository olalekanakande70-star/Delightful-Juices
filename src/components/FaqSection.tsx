import React, { useState } from 'react';
import { SiteContent } from '../types';
import { ChevronDown, HelpCircle, Truck, ShieldCheck, Clock, Snowflake } from 'lucide-react';

interface FaqSectionProps {
  content: SiteContent;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ content }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Where do you deliver, and what are the delivery fees?',
      a: `Delightful Juices provides direct cold-insulated delivery throughout Quakertown, Bucks County, Montgomery County, and the Lehigh Valley in Pennsylvania. Free delivery is provided on all orders over $${content.freeDeliveryThreshold.toFixed(
        2
      )}. For orders under $${content.freeDeliveryThreshold.toFixed(
        0
      )}, a standard local courier fee of $${content.standardDeliveryFee.toFixed(
        2
      )} applies. You can also choose free local pickup at 500 W Broad St, Quakertown, PA.`,
    },
    {
      q: 'What bottle sizes do you offer?',
      a: 'All of our signature juices and plant milks are bottled in convenient US fluid ounce sizes: 12oz Pocket Sip bottles, 16oz Daily Refresh bottles, and 18oz Sharing Bottles, plus our popular 6 × 16oz Party Sampler Pack.',
    },
    {
      q: 'What is your delivery timeframe?',
      a: 'Orders placed before 1:00 PM are typically delivered the same afternoon or following morning. For event catering and large bulk orders (over 24 bottles), we request at least 48 to 72 hours advance notice so our kitchen can cold-press your batch fresh.',
    },
    {
      q: 'How long do Delightful Juices stay fresh?',
      a: 'Because our juices are 100% natural and free from chemical preservatives, they must be refrigerated immediately upon receipt (at 36°F - 40°F). They maintain peak freshness and flavor for 7 to 10 days refrigerated, or up to 60 days if frozen immediately.',
    },
    {
      q: 'What makes your Zobo drink so special?',
      a: 'Zobo is a traditional West African botanical elixir made from deep-red organic hibiscus calyces (also known as Sorrel or Flor de Jamaica). Delightful Juices steeps whole hibiscus with fresh ginger root, aromatic cloves, and sweet pineapple peels—delivering a tart, antioxidant-rich, caffeine-free refreshment.',
    },
    {
      q: 'Is Tigernut Milk really dairy-free and nut-free?',
      a: 'Yes, 100%! Despite the name, tigernuts (chufa) are nutrient-dense root tubers rather than tree nuts. Our Tigernut Milk (Kunu Aya) is completely dairy-free, lactose-free, gluten-free, and nut-free, sweetened naturally with Medjool dates and organic coconut.',
    },
    {
      q: 'Can we get custom branded labels for our wedding or corporate party?',
      a: 'Yes! We design and apply custom waterproof labels with wedding monograms, birthday photos, or corporate logos on our 12oz and 16oz bottles. Simply select "Custom Event Branded Labels" on our Events & Catering page or message us on WhatsApp.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept Credit/Debit Cards via Stripe Checkout, Zelle transfers, Cash on Delivery / Pickup, and direct WhatsApp order coordination.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white border-t border-[#1B4D2E]/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#1B4D2E]">
            <HelpCircle className="w-4 h-4 text-[#E1AD01]" />
            <span>ANSWERS & DELIVERY INFORMATION</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#1B4D2E] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#1B4D2E]/70 max-w-xl mx-auto">
            Everything you need to know about our natural botanical process, ounce bottle sizes, shelf life, and affordable delivery policies.
          </p>
        </div>

        {/* 4 Feature highlight badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#1B4D2E]/15 text-center">
            <Snowflake className="w-5 h-5 text-[#1B4D2E] mx-auto mb-1" />
            <div className="text-xs font-bold text-[#1B4D2E]">Keep Chilled</div>
            <div className="text-[10px] text-[#1B4D2E]/70">Refrigerate at 36°-40°F</div>
          </div>
          <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#1B4D2E]/15 text-center">
            <Clock className="w-5 h-5 text-[#1B4D2E] mx-auto mb-1" />
            <div className="text-xs font-bold text-[#1B4D2E]">7-10 Days Fresh</div>
            <div className="text-[10px] text-[#1B4D2E]/70">Zero chemical preservatives</div>
          </div>
          <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#1B4D2E]/15 text-center">
            <Truck className="w-5 h-5 text-[#1B4D2E] mx-auto mb-1" />
            <div className="text-xs font-bold text-[#1B4D2E]">Local Delivery</div>
            <div className="text-[10px] text-[#1B4D2E]/70">Free on orders $40+</div>
          </div>
          <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#1B4D2E]/15 text-center">
            <ShieldCheck className="w-5 h-5 text-[#1B4D2E] mx-auto mb-1" />
            <div className="text-xs font-bold text-[#1B4D2E]">100% Pure Craft</div>
            <div className="text-[10px] text-[#1B4D2E]/70">Delightful Juices Quality</div>
          </div>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#FFF8E7] rounded-2xl border border-[#1B4D2E]/15 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between font-bold text-sm sm:text-base text-[#1B4D2E] hover:text-[#12351F] cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#E1AD01] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-[#1B4D2E]/80 leading-relaxed border-t border-[#1B4D2E]/10 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
