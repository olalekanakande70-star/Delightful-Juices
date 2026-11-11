import React, { useState, useEffect } from 'react';
import { Product, SizeOption } from '../types';
import { useCart } from '../context/CartContext';
import {
  getCustomerSizeDisplay,
  sanitizeBrandAndUnitsText,
} from '../lib/units';
import {
  ShoppingCart,
  Check,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  whatsappNumber?: string;
  showSizes?: boolean;
  showPrice?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  showSizes = true,
  showPrice = true,
}) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<SizeOption>(
    product.sizes[1] || product.sizes[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnim, setAddedAnim] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const liveImageSrc = (product.imageUrl || '').trim();

  useEffect(() => {
    setImgError(false);
    setImgLoaded(liveImageSrc.startsWith('data:image/'));
  }, [liveImageSrc]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize, quantity);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const cleanName = sanitizeBrandAndUnitsText(product.name);

  return (
    <article className="bg-white rounded-3xl overflow-hidden border border-[#1B4D2E]/15 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      {/* Product Image (strictly from live Supabase) */}
      <div
        onClick={() => onOpenDetails(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenDetails(product);
          }
        }}
        aria-label={`View ${cleanName}`}
        className="relative aspect-4/3 overflow-hidden bg-[#FFF8E7] cursor-pointer"
      >
        {liveImageSrc && !imgError ? (
          <img
            ref={(el) => {
              if (el && el.complete && el.naturalWidth > 0 && !imgLoaded) {
                setImgLoaded(true);
              }
            }}
            src={liveImageSrc}
            alt={cleanName}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#12351F] to-[#1B4D2E] flex flex-col items-center justify-center p-6 text-center">
            <Sparkles className="w-6 h-6 text-[#E1AD01] mb-2" />
            <span className="font-display font-bold text-sm text-[#FFF8E7] line-clamp-2">
              {cleanName}
            </span>
          </div>
        )}

        {(!product.inStock || product.badge) && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {!product.inStock ? (
              <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                Out of Stock
              </span>
            ) : product.badge ? (
              <span className="bg-[#E1AD01] text-[#1B4D2E] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                {product.badge}
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Essential Product Info & Controls */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between gap-3 sm:gap-4">
        {/* Product Name & Price */}
        <div
          onClick={() => onOpenDetails(product)}
          className="flex items-start justify-between gap-2 cursor-pointer"
        >
          <h3 className="font-display font-bold text-sm sm:text-lg lg:text-xl text-[#1B4D2E] group-hover:text-[#12351F] transition-colors leading-snug line-clamp-2">
            {sanitizeBrandAndUnitsText(product.name)}
          </h3>
          {showPrice && (
            <span className="font-extrabold text-sm sm:text-lg lg:text-xl text-[#1B4D2E] tabular-nums shrink-0">
              ${(selectedSize.price * quantity).toFixed(2)}
            </span>
          )}
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {/* Available Size Selector */}
          {showSizes && (
            <>
              {product.sizes.length > 1 ? (
                <div
                  className={`grid gap-1 sm:gap-1.5 ${
                    product.sizes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                  }`}
                >
                  {product.sizes.map((s) => {
                    const isSelected = selectedSize.size === s.size;
                    return (
                      <button
                        type="button"
                        key={s.size}
                        onClick={() => setSelectedSize(s)}
                        className={`py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all text-center truncate cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                            : 'bg-[#FFF8E7] text-[#1B4D2E]/85 hover:bg-[#1B4D2E]/10 border border-[#1B4D2E]/15'
                        }`}
                      >
                        {getCustomerSizeDisplay(s)}
                      </button>
                    );
                  })}
                </div>
              ) : product.sizes.length === 1 ? (
                <div className="text-[11px] sm:text-xs font-semibold text-[#1B4D2E]/75">
                  Size: <span className="text-[#1B4D2E] font-bold">{getCustomerSizeDisplay(product.sizes[0])}</span>
                </div>
              ) : null}
            </>
          )}

          {/* Quantity & Add to Cart */}
          {showPrice ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 pt-1">
              <div className="flex items-center justify-between sm:justify-start border border-[#1B4D2E]/20 rounded-xl bg-[#FFF8E7] px-1 sm:px-1.5 py-0.5 sm:py-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 sm:p-1.5 text-[#1B4D2E] hover:text-[#E1AD01] transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
                <span className="px-1.5 sm:px-2 font-bold text-[11px] sm:text-xs text-[#1B4D2E] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 sm:p-1.5 text-[#1B4D2E] hover:text-[#E1AD01] transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs transition-all cursor-pointer ${
                  addedAnim
                    ? 'bg-emerald-600 text-white'
                    : product.inStock
                    ? 'bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] shadow-xs'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {addedAnim ? (
                  <>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E1AD01]" />
                    <span>{product.inStock ? 'Add to Cart' : 'Sold Out'}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onOpenDetails(product)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-extrabold text-xs bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] transition-all cursor-pointer shadow-xs group/btn"
              >
                <span>View Flavor Details</span>
                <span className="text-[#E1AD01] group-hover/btn:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
