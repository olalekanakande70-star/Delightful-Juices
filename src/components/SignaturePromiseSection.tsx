import React from 'react';
import { SiteContent } from '../types';
import { Sparkles, Shield, Heart, Droplets, CheckCircle, Award } from 'lucide-react';

interface SignaturePromiseSectionProps {
  content: SiteContent;
}

export const SignaturePromiseSection: React.FC<SignaturePromiseSectionProps> = ({ content }) => {
  return (
    <section id="signature-promise" className="py-20 bg-[#1B4D2E] text-[#FFF8E7] relative overflow-hidden">
      
      {/* Decorative ambient patterns */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#E1AD01]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#12351F] rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Tag */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#E1AD01]/20 border border-[#E1AD01]/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#E1AD01]">
            <Award className="w-3.5 h-3.5 text-[#E1AD01]" />
            <span className="uppercase tracking-wider">OUR CORE COMMITMENT</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#FFF8E7] tracking-tight">
            Our Signature Promise
          </h2>

          <p className="text-base sm:text-lg text-[#FFF8E7]/90 leading-relaxed font-serif italic max-w-2xl mx-auto">
            "{content.signaturePromise}"
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Card 1 */}
          <div className="bg-[#143822] border border-[#E1AD01]/25 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#E1AD01] transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E1AD01] text-[#1B4D2E] flex items-center justify-center font-bold mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#FFF8E7] mb-2">
                Our Signature DelightOil
              </h3>
              <p className="text-xs sm:text-sm text-[#FFF8E7]/80 leading-relaxed">
                A proprietary infusion of pure food-grade botanical essences integrated into every single batch to preserve antioxidant stability, heighten aroma, and create our unmistakably smooth finish.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#FFF8E7]/10 flex items-center text-xs font-semibold text-[#E1AD01]">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> In Every Bottle
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#143822] border border-[#E1AD01]/25 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#E1AD01] transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E1AD01] text-[#1B4D2E] flex items-center justify-center font-bold mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#FFF8E7] mb-2">
                100% Real Whole Botanicals
              </h3>
              <p className="text-xs sm:text-sm text-[#FFF8E7]/80 leading-relaxed">
                We reject artificial concentrates, synthetic flavor powders, and high-fructose corn syrups. Real hibiscus calyces, freshly grated ginger, whole tigernuts, and ripe tropical fruits only.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#FFF8E7]/10 flex items-center text-xs font-semibold text-[#E1AD01]">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> No High-Fructose Syrups
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#143822] border border-[#E1AD01]/25 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#E1AD01] transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E1AD01] text-[#1B4D2E] flex items-center justify-center font-bold mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#FFF8E7] mb-2">
                Nourishing Health Benefits
              </h3>
              <p className="text-xs sm:text-sm text-[#FFF8E7]/80 leading-relaxed">
                From natural gingerol anti-inflammatories to anthocyanins in Zobo and prebiotic resistant starch in Tigernut milk, every drink supports digestion, immunity, and overall body vitality.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#FFF8E7]/10 flex items-center text-xs font-semibold text-[#E1AD01]">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Functional Wellness
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#143822] border border-[#E1AD01]/25 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#E1AD01] transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E1AD01] text-[#1B4D2E] flex items-center justify-center font-bold mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#FFF8E7] mb-2">
                Handcrafted in Quakertown
              </h3>
              <p className="text-xs sm:text-sm text-[#FFF8E7]/80 leading-relaxed">
                Prepared with strict food-safety protocols under the culinary leadership of Oluyemi B. Ajibolade right here at 500 W Broad St, Quakertown, Pennsylvania.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#FFF8E7]/10 flex items-center text-xs font-semibold text-[#E1AD01]">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Local Artisanal Pride
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
