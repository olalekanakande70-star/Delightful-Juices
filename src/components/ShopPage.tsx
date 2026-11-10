import React, { useState, useMemo } from 'react';
import { Product, SiteContent } from '../types';
import { ProductCard } from './ProductCard';
import { useCart } from '../context/CartContext';
import {
  Search,
  SlidersHorizontal,
  Truck,
  Store,
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ShopPageProps {
  products: Product[];
  content: SiteContent;
  onOpenDetails: (product: Product) => void;
  onNavigate: (href: string) => void;
  isLoading?: boolean;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  content,
  onOpenDetails,
  onNavigate,
  isLoading = false,
}) => {
  const { totalCount, subtotal, setIsCartOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>(
    'featured'
  );
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All Fresh Sips' },
    { id: 'zobo', label: 'Signature Zobo' },
    { id: 'ginger', label: 'Ginger Elixirs' },
    { id: 'other', label: 'Artisanal Milks' },
    { id: 'bundles', label: 'Party & Sampler Packs' },
  ];

  const filteredAndSorted = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesCat = activeCategory === 'all' || p.category === activeCategory;
      const matchesStock = !inStockOnly || p.inStock;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.ingredients.some((ing) => ing.toLowerCase().includes(q));
      return matchesCat && matchesStock && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      const minPriceA = Math.min(...a.sizes.map((s) => s.price));
      const minPriceB = Math.min(...b.sizes.map((s) => s.price));
      if (sortBy === 'price_asc') return minPriceA - minPriceB;
      if (sortBy === 'price_desc') return minPriceB - minPriceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default: featured & displayOrder
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (a.displayOrder || 99) - (b.displayOrder || 99);
    });
  }, [products, activeCategory, inStockOnly, searchQuery, sortBy]);

  return (
    <div className="bg-[#FFF8E7] min-h-screen pb-20">
      {/* Shop Page Header Banner */}
      <section className="bg-[#1B4D2E] text-[#FFF8E7] py-14 sm:py-18 border-b border-[#E1AD01]/30 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[#E1AD01]/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#E1AD01] border-l-2 border-[#E1AD01] pl-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DELIGHTFUL JUICES ONLINE STORE</span>
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
                Shop Fresh Juices
              </h1>
              <p className="text-sm sm:text-base text-[#FFF8E7]/88 leading-relaxed">
                Handcrafted to order in Quakertown, PA using whole hibiscus calyces, organic ginger root, ripe tropical fruit, and soaked tigernuts. Enjoy affordable delivery directly to your door in{' '}
                <strong className="text-[#E1AD01]">11.8 oz</strong>,{' '}
                <strong className="text-[#E1AD01]">16.9 oz</strong>, and{' '}
                <strong className="text-[#E1AD01]">33.8 oz</strong> bottles.
              </p>
            </div>

            {/* Live Bag Summary Card */}
            {totalCount > 0 && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="bg-[#143822] hover:bg-[#0f2b1a] border border-[#E1AD01]/40 rounded-2xl p-4 flex items-center space-x-4 text-left transition-all cursor-pointer self-start lg:self-end shadow-md"
              >
                <div className="w-11 h-11 rounded-xl bg-[#E1AD01] text-[#1B4D2E] flex items-center justify-center font-black shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#E1AD01] font-bold uppercase tracking-wider">
                    Your Active Bag ({totalCount} items)
                  </div>
                  <div className="text-base font-extrabold text-white tabular-nums">
                    ${subtotal.toFixed(2)} • Review & Checkout →
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Delivery & Freshness Strip */}
          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#FFF8E7]/90">
            <div className="flex items-center space-x-2.5">
              <Truck className="w-4 h-4 text-[#E1AD01] shrink-0" />
              <span>
                Affordable Delivery • Free over{' '}
                <strong>${content.freeDeliveryThreshold.toFixed(2)}</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Store className="w-4 h-4 text-[#E1AD01] shrink-0" />
              <span>Free kitchen pickup at 500 W Broad St, Quakertown</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
              <span>100% natural botanicals • Fresh daily</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter, Search & Sort Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#1B4D2E]/12 shadow-xs space-y-4 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                        : 'bg-[#FFF8E7] text-[#1B4D2E]/85 hover:bg-[#1B4D2E]/10 border border-[#1B4D2E]/15'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#1B4D2E]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search flavors or ingredients..."
                  className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm rounded-xl bg-[#FFF8E7] border border-[#1B4D2E]/20 text-[#1B4D2E] placeholder-[#1B4D2E]/45 focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#1B4D2E]/60 hover:text-[#1B4D2E] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-[#1B4D2E]/70 shrink-0 hidden sm:block" />
                <select
                  aria-label="Sort drinks"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01] cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-[#1B4D2E]/75">
            <span>
              Showing <strong className="text-[#1B4D2E]">{filteredAndSorted.length}</strong>{' '}
              handcrafted {filteredAndSorted.length === 1 ? 'selection' : 'selections'}
            </span>

            <label className="inline-flex items-center space-x-2 cursor-pointer font-semibold text-[#1B4D2E]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-[#1B4D2E] rounded"
              />
              <span>In-Stock Only</span>
            </label>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" aria-busy="true">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl overflow-hidden border border-[#1B4D2E]/10 shadow-xs animate-pulse"
              >
                <div className="aspect-4/3 bg-[#1B4D2E]/10" />
                <div className="p-5 space-y-4">
                  <div className="flex justify-between gap-3">
                    <div className="h-5 w-2/3 bg-[#1B4D2E]/15 rounded-lg" />
                    <div className="h-5 w-14 bg-[#1B4D2E]/15 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="h-8 bg-[#FFF8E7] rounded-xl" />
                    <div className="h-8 bg-[#FFF8E7] rounded-xl" />
                    <div className="h-8 bg-[#FFF8E7] rounded-xl" />
                  </div>
                  <div className="h-10 bg-[#1B4D2E]/15 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredAndSorted.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={onOpenDetails}
                whatsappNumber={content.whatsappNumber}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#1B4D2E]/12 shadow-xs space-y-3">
            <p className="text-base font-bold text-[#1B4D2E]">
              No Delightful Juices match your current filter.
            </p>
            <p className="text-xs text-[#1B4D2E]/70">
              Try clearing your search term or selecting &ldquo;All Fresh Sips&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setInStockOnly(false);
              }}
              className="mt-2 text-xs font-bold text-[#1B4D2E] bg-[#E1AD01] px-5 py-2.5 rounded-xl cursor-pointer"
            >
              Show All Drinks
            </button>
          </div>
        )}

        {/* Catering / Bulk Order Callout */}
        <div className="mt-16 bg-[#1B4D2E] text-[#FFF8E7] rounded-3xl p-7 sm:p-10 border border-[#E1AD01]/35 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#E1AD01]">
              ORDERING FOR 20+ GUESTS?
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Custom Branded Bottles & Wholesale Event Packages
            </h2>
            <p className="text-xs sm:text-sm text-[#FFF8E7]/85 leading-relaxed">
              Use our interactive Event Catering Estimator to calculate bottle quantities for weddings, birthdays, and corporate retreats with wholesale tier discounts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/events-catering')}
            className="inline-flex items-center space-x-2 bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <span>Open Catering Estimator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
