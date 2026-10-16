import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Search, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

interface MenuSectionProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  whatsappNumber: string;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  products,
  onOpenDetails,
  whatsappNumber,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Sips (6 Flavors + Bundles)' },
    { id: 'zobo', label: 'Signature Zobo' },
    { id: 'ginger', label: 'Ginger Elixirs' },
    { id: 'other', label: 'Artisanal Milks' },
    { id: 'bundles', label: 'Party & Sampler Packs' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu" className="py-16 sm:py-20 bg-[#FFF8E7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-[#E1AD01]/20 border border-[#E1AD01]/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1B4D2E]">
            <Sparkles className="w-3.5 h-3.5 text-[#1B4D2E]" />
            <span>AUTHENTIC HANDCRAFTED FLAVORS</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1B4D2E] tracking-tight">
            Our Fresh Juice Collection
          </h2>

          <p className="text-sm sm:text-base text-[#1B4D2E]/80 leading-relaxed">
            Every bottle is made to order using whole raw fruits, organic herbs, and our signature <strong className="text-[#1B4D2E]">DelightOil</strong>. Choose your favorite bottle size: convenient <span className="font-semibold text-[#1B4D2E]">35cl</span>, standard <span className="font-semibold text-[#1B4D2E]">50cl</span>, or family-size <span className="font-semibold text-[#1B4D2E]">1 Litre</span>.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-sm'
                    : 'bg-white/80 text-[#1B4D2E]/80 hover:bg-white border border-[#1B4D2E]/15'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#1B4D2E]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by flavor or ingredient..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white border border-[#1B4D2E]/20 text-[#1B4D2E] placeholder-[#1B4D2E]/40 focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#1B4D2E]/60 hover:text-[#1B4D2E]"
              >
                Clear
              </button>
            )}
          </div>

        </div>

        {/* Free Delivery Callout Banner */}
        <div className="bg-[#1B4D2E] text-[#FFF8E7] rounded-2xl p-4 sm:p-5 mb-10 flex flex-col sm:flex-row items-center justify-between shadow-md border border-[#E1AD01]/30">
          <div className="flex items-center space-x-3 mb-3 sm:mb-0">
            <div className="w-10 h-10 rounded-full bg-[#E1AD01] flex items-center justify-center text-[#1B4D2E] shrink-0 font-bold">
              🚚
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base">Free Delivery in Quakertown & Surrounding Areas</div>
              <div className="text-xs text-[#FFF8E7]/80">Enjoy complimentary cold-insulated doorstep delivery on all orders over $40.00!</div>
            </div>
          </div>
          <div className="text-xs font-semibold bg-[#FFF8E7] text-[#1B4D2E] px-3.5 py-1.5 rounded-lg shrink-0">
            Same-Day / Next-Day Delivery
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={onOpenDetails}
                whatsappNumber={whatsappNumber}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/60 rounded-3xl border border-[#1B4D2E]/10">
            <p className="text-base font-semibold text-[#1B4D2E]">No drinks found matching your search.</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-bold text-[#E1AD01] bg-[#1B4D2E] px-4 py-2 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
