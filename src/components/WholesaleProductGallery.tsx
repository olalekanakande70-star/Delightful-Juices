import React, { useState } from 'react';
import { sanitizeBrandAndUnitsText } from '../lib/units';
import {
  Sparkles,
  ShieldCheck,
  Eye,
  X,
  Maximize2,
  Box,
  Truck,
  CheckCircle2,
  Barcode,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface WholesaleGalleryItem {
  id: string;
  title: string;
  category: 'all' | 'zobo' | 'ginger' | 'milks' | 'craft';
  categoryLabel: string;
  imageUrl: string;
  badge?: string;
  sizes: string;
  barcode: string;
  description: string;
  packOptions: string;
}

const DEFAULT_GALLERY_ITEMS: WholesaleGalleryItem[] = [
  {
    id: 'wg-zobo',
    title: 'Home Made Hibiscus Juice - Sorrel (Zobo)',
    category: 'zobo',
    categoryLabel: 'Signature Zobo',
    imageUrl: '/assets/aistudio/18oz_zobo_label_17754013.png',
    badge: 'Top Wholesale Mover',
    sizes: '12oz • 16oz • 18oz',
    barcode: 'UPC: 036000291452',
    description:
      'Preservative-free West African Sorrel brewed from dried hibiscus calyces, fresh ginger root, ripe pineapple, and sweet dates. Sealed with tamper-evident safety band.',
    packOptions: '12-Pack & 24-Pack Cases (Refrigerated)',
  },
  {
    id: 'wg-ginger',
    title: 'Home Made Ginger Juice (Pure Organic Ginger)',
    category: 'ginger',
    categoryLabel: 'Ginger Elixirs',
    imageUrl: '/assets/aistudio/12oz_ginger_d302545f.png',
    badge: 'Immunity Powerhouse',
    sizes: '12oz • 16oz • 18oz',
    barcode: 'UPC: 036000291452',
    description:
      'Fiery whole ginger root with fresh lemon juice, whole cloves, and sweet dates. A high-turnover grab-and-go immunity bottle for grocery coolers and cafés.',
    packOptions: '12-Pack & 24-Pack Cases (Refrigerated)',
  },
  {
    id: 'wg-tigernut',
    title: 'Home Made Tigernut Juice (Tigernut Milk / Kunu Aya)',
    category: 'milks',
    categoryLabel: 'Artisanal Milks',
    imageUrl: '/assets/aistudio/12oz_Tigernut_a2076757.png',
    badge: '100% Dairy-Free',
    sizes: '12oz • 16oz • 18oz',
    barcode: 'UPC: 036000291452',
    description:
      'Creamy, velvety heritage plant milk crafted from whole soaked tigernuts, sweet dates, cloves, and ginger. 100% nut-free, vegan, and prebiotic-rich.',
    packOptions: '12-Pack Cases (Refrigerated)',
  },
  {
    id: 'wg-pineapple',
    title: 'Home Made Ginger Juice - Pineapple',
    category: 'ginger',
    categoryLabel: 'Ginger Elixirs',
    imageUrl: '/assets/aistudio/12oz_pineapple_28b92d79.png',
    badge: 'Tropical Best Seller',
    sizes: '12oz Single Serve',
    barcode: 'UPC: 036000291452',
    description:
      'Pure golden pineapple puree blended with spicy ginger root, lemon juice, and sweet dates. High demand in gourmet bodegas and natural grocers.',
    packOptions: '12-Pack & 24-Pack Cases (Refrigerated)',
  },
  {
    id: 'wg-mango',
    title: 'Home Made Ginger Juice - Mango',
    category: 'ginger',
    categoryLabel: 'Ginger Elixirs',
    imageUrl: '/assets/aistudio/12oz_mango_dcfd0401.png',
    badge: 'Alfonso Puree Blend',
    sizes: '12oz Single Serve',
    barcode: 'UPC: 036000291452',
    description:
      'Sun-ripened tropical mango puree harmonized with freshly pressed ginger root, lemon juice, sweet dates, and whole cloves.',
    packOptions: '12-Pack & 24-Pack Cases (Refrigerated)',
  },
  {
    id: 'wg-lychee',
    title: 'Home Made Ginger Juice - Lychee',
    category: 'ginger',
    categoryLabel: 'Ginger Elixirs',
    imageUrl: '/assets/aistudio/12oz_Lychee_771f865d.png',
    badge: 'Artisanal Floral',
    sizes: '12oz Single Serve',
    barcode: 'UPC: 036000291452',
    description:
      'Exotic floral lychee fruit puree infused into our signature homemade ginger base with fresh lemon juice, sweet dates, and whole cloves.',
    packOptions: '12-Pack & 24-Pack Cases (Refrigerated)',
  },
  {
    id: 'wg-craft',
    title: 'Small-Batch Botanical Kitchen Staging',
    category: 'craft',
    categoryLabel: 'Kitchen & Raw Craft',
    imageUrl: '/assets/aistudio/image_119a2987.png',
    badge: 'Quakertown, PA Craft',
    sizes: 'Whole Ingredients Batch',
    barcode: 'Commercial Kitchen Certified',
    description:
      'Whole dried hibiscus calyces, freshly harvested ginger root, whole lemons, and soaked tigernuts prepared daily at our commercial kitchen in Quakertown, PA.',
    packOptions: 'Bulk Food-Service Jugs & Bar Staging',
  },
];

interface WholesaleProductGalleryProps {
  onSelectForInquiry?: (productName: string) => void;
}

export const WholesaleProductGallery: React.FC<WholesaleProductGalleryProps> = ({
  onSelectForInquiry,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<WholesaleGalleryItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Wholesale Products' },
    { id: 'zobo', label: 'Signature Zobo' },
    { id: 'ginger', label: 'Ginger Elixirs' },
    { id: 'milks', label: 'Artisanal Milks' },
    { id: 'craft', label: 'Kitchen Staging' },
  ];

  const filteredItems = DEFAULT_GALLERY_ITEMS.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleInquiryClick = (item: WholesaleGalleryItem) => {
    setActiveModalItem(null);
    if (onSelectForInquiry) {
      onSelectForInquiry(item.title);
    }
  };

  return (
    <section className="py-20 bg-white border-b border-[#1B4D2E]/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#E1AD01] bg-[#1B4D2E] px-4 py-1.5 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMMERCIAL PRODUCT GALLERY</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1B4D2E] tracking-tight leading-tight">
            Wholesale &amp; Retail Product Gallery
          </h2>
          <p className="text-sm sm:text-base text-[#1B4D2E]/80 leading-relaxed max-w-2xl mx-auto">
            Browse our bottled lineup with commercial UPC barcodes, tamper-evident safety seals, and master case packaging available for distribution across Pennsylvania and nationwide.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-sm'
                      : 'bg-[#FFF8E7] text-[#1B4D2E]/80 hover:bg-[#1B4D2E]/10 border border-[#1B4D2E]/15'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="bg-[#FFF8E7]/50 rounded-3xl overflow-hidden border border-[#1B4D2E]/15 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image Container with Label View */}
                <div
                  onClick={() => setActiveModalItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveModalItem(item);
                    }
                  }}
                  className="relative aspect-4/3 sm:aspect-1/1 bg-[#12351F] overflow-hidden flex items-center justify-center p-4 cursor-pointer"
                  aria-label={`Inspect ${item.title}`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span className="bg-[#1B4D2E] text-[#E1AD01] border border-[#E1AD01]/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-[#E1AD01]" />
                      <span>{item.badge || 'US-Approved'}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-[#FFF8E7] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>Inspect Label</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#E1AD01] bg-[#1B4D2E] inline-block px-2.5 py-0.5 rounded-md">
                      {item.categoryLabel}
                    </div>
                    <h3
                      onClick={() => setActiveModalItem(item)}
                      className="font-display font-bold text-lg sm:text-xl text-[#1B4D2E] group-hover:text-[#12351F] transition-colors leading-snug cursor-pointer line-clamp-2"
                    >
                      {sanitizeBrandAndUnitsText(item.title)}
                    </h3>
                  </div>

                  <p className="text-xs text-[#1B4D2E]/80 leading-relaxed line-clamp-2">
                    {sanitizeBrandAndUnitsText(item.description)}
                  </p>

                  <div className="pt-2 border-t border-[#1B4D2E]/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#1B4D2E]">
                      <span className="font-semibold text-[#1B4D2E]/70">Available Sizes:</span>
                      <strong className="font-extrabold text-[#1B4D2E]">{item.sizes}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#1B4D2E]">
                      <span className="font-semibold text-[#1B4D2E]/70 flex items-center space-x-1">
                        <Barcode className="w-3.5 h-3.5 text-[#1B4D2E]/60" />
                        <span>Barcode:</span>
                      </span>
                      <span className="font-mono text-[11px] font-bold">{item.barcode}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#1B4D2E]">
                      <span className="font-semibold text-[#1B4D2E]/70 flex items-center space-x-1">
                        <Box className="w-3.5 h-3.5 text-[#1B4D2E]/60" />
                        <span>Packaging:</span>
                      </span>
                      <span className="text-[11px] font-semibold">{item.packOptions}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 sm:p-6 sm:pt-0">
                <div className="pt-3 border-t border-[#1B4D2E]/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalItem(item)}
                    className="flex-1 bg-white hover:bg-gray-50 text-[#1B4D2E] border border-[#1B4D2E]/20 font-bold text-xs py-2 px-3 rounded-xl transition-all text-center cursor-pointer shadow-xs"
                  >
                    Inspect Packaging
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInquiryClick(item)}
                    className="flex-1 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Request Quote</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#E1AD01]" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Wholesale Bottom Information Banner */}
        <div className="mt-12 p-6 sm:p-8 bg-[#1B4D2E] text-[#FFF8E7] rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-[#E1AD01]/25">
          <div className="space-y-1 text-center md:text-left max-w-xl">
            <h4 className="font-display font-bold text-lg sm:text-xl text-white">
              Need Custom Case Quantities, Cold-Chain Delivery, or Samples?
            </h4>
            <p className="text-xs sm:text-sm text-[#FFF8E7]/80">
              We provide sample tasting kits for qualifying retail buyers, cafés, and restaurant beverage directors across Pennsylvania and neighboring regions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onSelectForInquiry) onSelectForInquiry('Sample Tasting Kit / Wholesale');
            }}
            className="bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            Request Wholesale Tasting Kit
          </button>
        </div>
      </div>

      {/* Lightbox / High-Resolution Packaging Inspection Modal */}
      {activeModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#1B4D2E]/20 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Product Label Zoom Area */}
              <div className="bg-[#12351F] p-6 flex items-center justify-center min-h-[300px]">
                <img
                  src={activeModalItem.imageUrl}
                  alt={activeModalItem.title}
                  className="max-h-[360px] w-auto object-contain drop-shadow-2xl"
                />
              </div>

              {/* Specifications */}
              <div className="p-6 sm:p-7 flex flex-col justify-between space-y-4 text-[#1B4D2E]">
                <div className="space-y-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#E1AD01] bg-[#1B4D2E] inline-block px-2.5 py-0.5 rounded-md">
                    {activeModalItem.categoryLabel}
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#1B4D2E] leading-snug">
                    {sanitizeBrandAndUnitsText(activeModalItem.title)}
                  </h3>
                  <p className="text-xs text-[#1B4D2E]/80 leading-relaxed">
                    {sanitizeBrandAndUnitsText(activeModalItem.description)}
                  </p>

                  <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B4D2E]/70">Available Sizes:</span>
                      <strong className="text-[#1B4D2E]">{activeModalItem.sizes}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B4D2E]/70">UPC Barcode:</span>
                      <span className="font-mono text-xs">{activeModalItem.barcode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B4D2E]/70">Case Staging:</span>
                      <span className="font-semibold">{activeModalItem.packOptions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B4D2E]/70">Cold Shelf-Life:</span>
                      <span className="font-semibold">7–10 Days Refrigerated (36°F - 40°F)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleInquiryClick(activeModalItem)}
                    className="w-full bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                  >
                    <span>Inquire for Wholesale Supply</span>
                    <ArrowRight className="w-4 h-4 text-[#E1AD01]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
