import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Search, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';

interface MenuSectionProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  whatsappNumber: string;
  featuredOnly?: boolean;
  onNavigate?: (href: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  products,
  onOpenDetails,
  whatsappNumber,
  featuredOnly = false,
  onNavigate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Sips (6 Flavors + Packs)' },
    { id: 'zobo', label: 'Signature Zobo' },
    { id: 'ginger', label: 'Ginger Elixirs' },
    { id: 'other', label: 'Artisanal Milks' },
    { id: 'bundles', label: 'Party & Sampler Packs' },
  ];

  const baseList = featuredOnly
    ? products.filter((p) => p.featured).slice(0, 6)
    : products;

  const filteredProducts = baseList.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu" className="py-16 sm:py-22 bg-[#FFF8E7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#1B4D2E] border-l-2 border-[#E1AD01] pl-3">
              <Sparkles className="w-3.5 h-3.5 text-[#E1AD01]" />
              <span>AUTHENTIC HANDCRAFTED FLAVORS</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1B4D2E] tracking-tight">
              {featuredOnly ? 'Featured Cold-Pressed Sips' : 'Our Fresh Juice Collection'}
            </h2>

            <p className="text-sm sm:text-base text-[#1B4D2E]/80 leading-relaxed">
              Every bottle of <strong className="text-[#1B4D2E]">Delightful Juices</strong> is made to order using whole raw fruits, organic roots, and fragrant botanicals. Choose your ideal bottle size: convenient{' '}
              <span className="font-semibold text-[#1B4D2E]">11.8 oz</span>, daily{' '}
              <span className="font-semibold text-[#1B4D2E]">16.9 oz</span>, or family-size{' '}
              <span className="font-semibold text-[#1B4D2E]">33.8 oz</span>.
            </p>
          </div>

          {featuredOnly && onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="inline-flex items-center justify-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer shrink-0 self-start lg:self-end group"
            >
              <ShoppingBag className="w-4 h-4 text-[#E1AD01]" />
              <span>Shop Full Menu</span>
              <ArrowRight className="w-4 h-4 text-[#E1AD01] group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Filters and Search Bar (when showing full collection) */}
        {!featuredOnly && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                      : 'bg-white/80 text-[#1B4D2E]/80 hover:bg-white border border-[#1B4D2E]/15'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#1B4D2E]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by flavor or ingredient..."
                className="w-full pl-10 pr-12 py-2 text-xs sm:text-sm rounded-xl bg-white border border-[#1B4D2E]/20 text-[#1B4D2E] placeholder-[#1B4D2E]/40 focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#1B4D2E]/60 hover:text-[#1B4D2E] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Free Delivery Callout Banner */}
        <div className="bg-[#1B4D2E] text-[#FFF8E7] rounded-2xl p-4 sm:p-5 mb-10 flex flex-col sm:flex-row items-center justify-between shadow-md border border-[#E1AD01]/30 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#E1AD01] flex items-center justify-center text-[#1B4D2E] shrink-0 font-extrabold text-sm">
              OZ
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base">
                Free Local Delivery in Quakertown & Surrounding Areas
              </div>
              <div className="text-xs text-[#FFF8E7]/80">
                Complimentary cold-insulated doorstep delivery on all orders over $40.00!
              </div>
            </div>
          </div>
          {onNavigate ? (
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="text-xs font-extrabold bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] px-4 py-2 rounded-lg shrink-0 transition-colors cursor-pointer"
            >
              Shop All Sizes →
            </button>
          ) : (
            <div className="text-xs font-semibold bg-[#FFF8E7] text-[#1B4D2E] px-3.5 py-1.5 rounded-lg shrink-0">
              Same-Day / Next-Day Delivery
            </div>
          )}
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
            <p className="text-base font-semibold text-[#1B4D2E]">
              No drinks found matching your search.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-bold text-[#E1AD01] bg-[#1B4D2E] px-4 py-2 rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Bottom CTA when on Home featured preview */}
        {featuredOnly && onNavigate && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="inline-flex items-center space-x-2.5 bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-extrabold text-sm sm:text-base px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              <span>View Complete Juice & Bundle Shop</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
