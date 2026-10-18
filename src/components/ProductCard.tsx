import React, { useState } from 'react';
import { Product, SizeOption } from '../types';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCart, 
  MessageCircle, 
  Info, 
  Check, 
  Plus, 
  Minus, 
  Sparkles,
  Flame,
  Leaf
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  whatsappNumber: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  whatsappNumber,
}) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<SizeOption>(
    product.sizes[1] || product.sizes[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnim, setAddedAnim] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hello Delightful Juice! I would like to order ${quantity}x of *${product.name}* in size *${selectedSize.label}* ($${(selectedSize.price * quantity).toFixed(2)}). Please confirm availability and delivery to my address!`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-[#1B4D2E]/15 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      
      {/* Top Image Frame */}
      <div className="relative aspect-4/3 overflow-hidden bg-[#FFF8E7]">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.badge && (
            <span className="bg-[#E1AD01] text-[#1B4D2E] text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
              {product.badge}
            </span>
          )}
          {product.category === 'zobo' && (
            <span className="bg-[#1B4D2E] text-[#FFF8E7] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
              <Sparkles className="w-2.5 h-2.5 text-[#E1AD01]" />
              <span>Signature Sorrel</span>
            </span>
          )}
          {product.category === 'ginger' && (
            <span className="bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
              <Flame className="w-2.5 h-2.5 text-yellow-300" />
              <span>Cold-Pressed Ginger</span>
            </span>
          )}
          {product.category === 'other' && (
            <span className="bg-emerald-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
              <Leaf className="w-2.5 h-2.5 text-lime-300" />
              <span>Heritage Tigernut</span>
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button
          onClick={() => onOpenDetails(product)}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#1B4D2E] p-2 rounded-full shadow-md backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer"
          title="View Ingredients & Nutrition"
          aria-label="View Details"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Current Size Price Overlay */}
        <div className="absolute bottom-3 right-3 bg-[#1B4D2E]/90 text-[#FFF8E7] backdrop-blur-xs px-3 py-1.5 rounded-xl text-right shadow-sm">
          <div className="text-[10px] uppercase font-semibold text-[#E1AD01]">Price</div>
          <div className="text-base font-extrabold text-[#FFF8E7]">
            ${(selectedSize.price * quantity).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Product Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Category & Title */}
          <div className="flex items-center justify-between text-xs text-[#1B4D2E]/70 mb-1">
            <span className="font-semibold uppercase tracking-wider">{product.categoryLabel}</span>
            <span className="font-bold text-[#E1AD01]">★ {product.rating.toFixed(2)} ({product.reviewCount})</span>
          </div>

          <h3 className="font-display font-bold text-xl text-[#1B4D2E] group-hover:text-[#12351F] transition-colors leading-snug">
            {product.name}
          </h3>

          <p className="text-xs text-[#1B4D2E]/80 mt-1 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>

          {/* Taste Profile Tag */}
          <div className="mt-2.5 text-[11px] bg-[#FFF8E7] border border-[#1B4D2E]/10 rounded-lg p-2 text-[#1B4D2E]/80">
            <span className="font-semibold text-[#1B4D2E]">Taste: </span>
            {product.tasteProfile}
          </div>
        </div>

        {/* Bottle Size Selector (35cl, 50cl, 1L) */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1.5">
            Select Bottle Size:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {product.sizes.map((s) => {
              const isSelected = selectedSize.size === s.size;
              return (
                <button
                  key={s.size}
                  onClick={() => setSelectedSize(s)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                      : 'bg-[#FFF8E7] text-[#1B4D2E]/80 hover:bg-[#1B4D2E]/10 border border-[#1B4D2E]/15'
                  }`}
                >
                  <span className="truncate">{s.size}</span>
                  <span className={`text-[10px] font-normal ${isSelected ? 'text-[#E1AD01]' : 'text-[#1B4D2E]/70'}`}>
                    ${s.price.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity and Actions */}
        <div className="pt-2 border-t border-[#1B4D2E]/10 space-y-2.5">
          <div className="flex items-center space-x-2">
            
            {/* Quantity Stepper */}
            <div className="flex items-center border border-[#1B4D2E]/20 rounded-xl bg-[#FFF8E7] px-2 py-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 text-[#1B4D2E] hover:text-[#E1AD01] transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-bold text-xs text-[#1B4D2E]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 text-[#1B4D2E] hover:text-[#E1AD01] transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                addedAnim
                  ? 'bg-emerald-600 text-white'
                  : product.inStock
                  ? 'bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] shadow-xs'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
                  <span>{product.inStock ? `Add to Cart • $${(selectedSize.price * quantity).toFixed(2)}` : 'Sold Out'}</span>
                </>
              )}
            </button>

          </div>

          {/* Quick WhatsApp Order Button */}
          <button
            onClick={handleWhatsAppDirect}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-[11px] font-semibold text-[#1B4D2E] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/60 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct WhatsApp Order</span>
          </button>
        </div>

      </div>

    </div>
  );
};
