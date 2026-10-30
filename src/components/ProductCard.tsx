import React, { useState } from 'react';
import { Product, SizeOption } from '../types';
import { useCart } from '../context/CartContext';
import { FALLBACK_BEVERAGE_IMAGE } from '../lib/storage';
import {
  getCustomerSizeDisplay,
  sanitizeBrandAndUnitsText,
} from '../lib/units';
import {
  ShoppingCart,
  Check,
  Plus,
  Minus,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  whatsappNumber?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
}) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<SizeOption>(
    product.sizes[1] || product.sizes[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnim, setAddedAnim] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize, quantity);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  return (
    <article className="bg-white rounded-3xl overflow-hidden border border-[#1B4D2E]/15 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      {/* Product Image */}
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
        aria-label={`View ${sanitizeBrandAndUnitsText(product.name)}`}
        className="relative aspect-4/3 overflow-hidden bg-[#FFF8E7] cursor-pointer"
      >
        <img
          src={product.imageUrl || FALLBACK_BEVERAGE_IMAGE}
          alt={sanitizeBrandAndUnitsText(product.name)}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== FALLBACK_BEVERAGE_IMAGE) {
              target.src = FALLBACK_BEVERAGE_IMAGE;
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

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
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        {/* Product Name & Price */}
        <div
          onClick={() => onOpenDetails(product)}
          className="flex items-start justify-between gap-3 cursor-pointer"
        >
          <h3 className="font-display font-bold text-lg sm:text-xl text-[#1B4D2E] group-hover:text-[#12351F] transition-colors leading-snug">
            {sanitizeBrandAndUnitsText(product.name)}
          </h3>
          <span className="font-extrabold text-lg sm:text-xl text-[#1B4D2E] tabular-nums shrink-0">
            ${(selectedSize.price * quantity).toFixed(2)}
          </span>
        </div>

        <div className="space-y-3">
          {/* Available Size Selector */}
          {product.sizes.length > 1 ? (
            <div
              className={`grid gap-1.5 ${
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
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center truncate cursor-pointer ${
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
            <div className="text-xs font-semibold text-[#1B4D2E]/75">
              Size: <span className="text-[#1B4D2E] font-bold">{getCustomerSizeDisplay(product.sizes[0])}</span>
            </div>
          ) : null}

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center border border-[#1B4D2E]/20 rounded-xl bg-[#FFF8E7] px-1.5 py-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 text-[#1B4D2E] hover:text-[#E1AD01] transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-bold text-xs text-[#1B4D2E] tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 text-[#1B4D2E] hover:text-[#E1AD01] transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                addedAnim
                  ? 'bg-emerald-600 text-white'
                  : product.inStock
                  ? 'bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] shadow-xs'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {addedAnim ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 text-[#E1AD01]" />
                  <span>{product.inStock ? 'Add to Cart' : 'Sold Out'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
