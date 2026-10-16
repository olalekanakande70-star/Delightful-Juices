import React, { useState } from 'react';
import { Product, SizeOption } from '../types';
import { useCart } from '../context/CartContext';
import { 
  X, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  Heart, 
  ShieldCheck, 
  MessageCircle,
  Plus,
  Minus
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  whatsappNumber: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  whatsappNumber,
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<SizeOption>(
    product.sizes[1] || product.sizes[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, selectedSize, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 900);
  };

  const handleWhatsAppOrder = () => {
    const text = encodeURIComponent(
      `Hello Delightful Juice! I would like to order *${quantity}x ${product.name} (${selectedSize.label})* at $${(selectedSize.price * quantity).toFixed(2)}. Please confirm delivery time!`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#1B4D2E]/20 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="relative aspect-16/9 sm:aspect-21/9 bg-[#FFF8E7] overflow-hidden shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 hover:bg-white text-[#1B4D2E] p-2 rounded-full shadow-md transition-transform hover:scale-105 cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="bg-[#E1AD01] text-[#1B4D2E] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-1">
              {product.categoryLabel}
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
              {product.name}
            </h2>
            <p className="text-xs text-[#E1AD01] font-medium mt-0.5">
              {product.tagline}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-[#1B4D2E] flex-1">
          
          {/* Description */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
              About This Recipe
            </h4>
            <p className="text-xs sm:text-sm text-[#1B4D2E]/85 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Taste Profile */}
          <div className="bg-[#FFF8E7] p-3.5 rounded-2xl border border-[#1B4D2E]/15">
            <div className="text-xs font-bold text-[#1B4D2E] mb-1 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E1AD01]" />
              <span>Taste & Aroma Profile</span>
            </div>
            <p className="text-xs text-[#1B4D2E]/80">
              {product.tasteProfile}
            </p>
          </div>

          {/* Ingredients & Health Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Ingredients */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#1B4D2E] mb-2 flex items-center space-x-1">
                <span>Real Ingredients</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-[#1B4D2E]/80">
                {product.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E1AD01] shrink-0" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Health Benefits */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#1B4D2E] mb-2 flex items-center space-x-1">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>Wellness Benefits</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-[#1B4D2E]/80">
                {product.healthBenefits.map((ben, i) => (
                  <li key={i} className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{ben}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottle Size Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-2">
              Choose Bottle Size:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {product.sizes.map((s) => {
                const isSelected = selectedSize.size === s.size;
                return (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B4D2E] text-white border-[#1B4D2E] shadow-sm'
                        : 'bg-[#FFF8E7] text-[#1B4D2E] border-[#1B4D2E]/20 hover:bg-[#1B4D2E]/5'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{s.size}</div>
                    <div className={`text-[11px] ${isSelected ? 'text-[#E1AD01]' : 'text-[#1B4D2E]/70'}`}>
                      {s.label}
                    </div>
                    <div className="text-sm font-black mt-1">
                      ${s.price.toFixed(2)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-[#FFF8E7] border-t border-[#1B4D2E]/15 flex items-center justify-between gap-3 shrink-0">
          
          {/* Quantity */}
          <div className="flex items-center border border-[#1B4D2E]/20 rounded-xl bg-white px-2 py-1.5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-[#1B4D2E] hover:text-[#E1AD01] cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-sm text-[#1B4D2E]">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 text-[#1B4D2E] hover:text-[#E1AD01] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Bag */}
          <div className="flex items-center space-x-2 flex-1">
            <button
              onClick={handleAdd}
              className="flex-1 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#E1AD01]" />
              <span>
                {justAdded
                  ? 'Added to Bag!'
                  : `Add to Bag • $${(selectedSize.price * quantity).toFixed(2)}`}
              </span>
            </button>

            <button
              onClick={handleWhatsAppOrder}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-colors cursor-pointer"
              title="Order on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
