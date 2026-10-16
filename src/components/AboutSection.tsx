import React from 'react';
import { SiteContent } from '../types';
import { Heart, Award, MapPin, Sparkles, Check } from 'lucide-react';

interface AboutSectionProps {
  content: SiteContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ content }) => {
  return (
    <section id="about" className="py-20 bg-[#FFF8E7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Visual Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Primary Image Frame */}
              <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#1B4D2E]/10">
                <img
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80"
                  alt="Fresh natural ingredients for Delightful Juice"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating CEO Badge Card */}
              <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-[#1B4D2E]/10 max-w-[260px]">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center font-bold text-sm">
                    OA
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-[#1B4D2E]">{content.ceoName}</div>
                    <div className="text-[10px] text-[#1B4D2E]/70 uppercase tracking-wider font-semibold">Founder & C.E.O.</div>
                  </div>
                </div>
                <p className="text-[11px] text-[#1B4D2E]/80 italic">
                  "We believe everyday refreshment should nourish your body, not drain it with artificial chemicals."
                </p>
              </div>

              {/* Corner Badge */}
              <div className="absolute -top-4 -left-4 bg-[#E1AD01] text-[#1B4D2E] p-3 rounded-2xl shadow-lg font-black text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Quakertown, PA Craft</span>
              </div>

            </div>
          </div>

          {/* Right: Story and Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center space-x-2 bg-[#1B4D2E]/10 border border-[#1B4D2E]/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1B4D2E]">
              <Heart className="w-3.5 h-3.5 text-red-600" />
              <span>THE DELIGHTFUL JUICE STORY</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1B4D2E] tracking-tight leading-tight">
              Crafted from Passion, Heritage, and Real Whole Botanicals.
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#1B4D2E]/85 leading-relaxed">
              <p>
                Delightful Juice creates refreshing and nourishing drinks made from carefully selected natural ingredients, fruits, vegetables, herbs, and spices.
              </p>

              <p>
                Our goal is simple: to make everyday refreshment more enjoyable while offering you delicious and healthy drinks made with ingredients you can trust. From our signature <strong>Zobo</strong> and <strong>Organic Ginger Juice</strong> to our refreshing ginger and fruit based flavours and velvety <strong>Tigernut Milk</strong>, every bottle is thoughtfully prepared to deliver great taste, freshness, and uncompromised quality.
              </p>

              <p>
                Under the leadership of our CEO, <strong>{content.ceoName}</strong>, we have committed never to use artificial preservatives, synthetic dyes, or high-fructose corn syrups. Each bottle is infused with our signature <strong>DelightOil</strong> formulation, guaranteeing a revitalizing experience with every sip.
              </p>
            </div>

            {/* Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#1B4D2E] block">Authentic African Recipes</span>
                  <span className="text-[#1B4D2E]/70">Traditional Zobo (Hibiscus) & Kunu Aya (Tigernut)</span>
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
                  <span className="text-[#1B4D2E]/70">Monograms & logos for weddings and corporate gatherings</span>
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

          </div>

        </div>

      </div>
    </section>
  );
};
