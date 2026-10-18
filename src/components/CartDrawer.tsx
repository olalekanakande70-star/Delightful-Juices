import React from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Truck, 
  Store, 
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { SiteContent } from '../types';

interface CartDrawerProps {
  content: SiteContent;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ content }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    freeDeliveryThreshold,
    deliveryFee,
    deliveryMethod,
    setDeliveryMethod,
    total,
    totalCount,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const itemsList = cart
      .map(
        (item, i) =>
          `${i + 1}. *${item.product.name}* (${item.selectedSize.size}) x${item.quantity} = $${(
            item.selectedSize.price * item.quantity
          ).toFixed(2)}`
      )
      .join('\n');

    const text = encodeURIComponent(
      `Hello Delightful Juice! I would like to place an order:\n\n` +
      `${itemsList}\n\n` +
      `*Subtotal:* $${subtotal.toFixed(2)}\n` +
      `*Delivery Method:* ${deliveryMethod === 'pickup' ? 'Free Pickup (500 W Broad St, Quakertown)' : 'Local Delivery'}\n` +
      `*Delivery Fee:* $${deliveryFee.toFixed(2)}\n` +
      `*Total:* $${total.toFixed(2)}\n\n` +
      `Please let me know how soon this can be prepared and delivered!`
    );
    window.open(`https://wa.me/${content.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#FFF8E7] h-full shadow-2xl flex flex-col justify-between border-l border-[#1B4D2E]/20 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="p-5 bg-white border-b border-[#1B4D2E]/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#1B4D2E]">Your Refreshment Cart</h3>
              <p className="text-xs text-[#1B4D2E]/70">{totalCount} item{totalCount === 1 ? '' : 's'} selected</p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-[#1B4D2E]/70 hover:text-[#1B4D2E] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close Shopping Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-[#1B4D2E] text-[#FFF8E7] px-5 py-3 text-xs">
          {deliveryMethod === 'pickup' ? (
            <div className="flex items-center space-x-2">
              <Store className="w-4 h-4 text-[#E1AD01]" />
              <span>Free Pickup at 500 W Broad St, Quakertown PA</span>
            </div>
          ) : amountNeededForFreeDelivery > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-1.5 font-semibold">
                <span>Add <strong className="text-[#E1AD01]">${amountNeededForFreeDelivery.toFixed(2)}</strong> more for FREE delivery</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#143822] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E1AD01] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 font-bold text-[#E1AD01]">
              <Sparkles className="w-4 h-4" />
              <span>You've unlocked FREE local delivery!</span>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#1B4D2E]/10 text-[#1B4D2E] flex items-center justify-center mx-auto">
                <ShoppingCart className="w-8 h-8 opacity-60" />
              </div>
              <div className="font-display font-bold text-lg text-[#1B4D2E]">Your Cart is Empty</div>
              <p className="text-xs text-[#1B4D2E]/70 max-w-xs mx-auto">
                Explore our signature Zobo, Organic Ginger, and Tigernut Milk to start refreshing.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 text-xs font-bold text-white bg-[#1B4D2E] px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Browse Flavors
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3.5 rounded-2xl border border-[#1B4D2E]/10 shadow-xs flex items-center space-x-3"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#FFF8E7]"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-[#1B4D2E] truncate">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-[10px] font-bold bg-[#E1AD01]/25 text-[#1B4D2E] px-2 py-0.5 rounded-md">
                      {item.selectedSize.size}
                    </span>
                    <span className="text-xs text-[#1B4D2E]/70">
                      ${item.selectedSize.price.toFixed(2)} each
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[#1B4D2E]/20 rounded-lg bg-[#FFF8E7] px-1.5 py-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-0.5 text-[#1B4D2E] hover:text-[#E1AD01] cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold text-xs text-[#1B4D2E]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-0.5 text-[#1B4D2E] hover:text-[#E1AD01] cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="font-extrabold text-sm text-[#1B4D2E]">
                      ${(item.selectedSize.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Method Toggle & Checkout Buttons */}
        {cart.length > 0 && (
          <div className="p-5 bg-white border-t border-[#1B4D2E]/10 space-y-4">
            
            {/* Delivery Method Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#FFF8E7] rounded-xl border border-[#1B4D2E]/15">
              <button
                type="button"
                onClick={() => setDeliveryMethod('local_delivery')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  deliveryMethod === 'local_delivery'
                    ? 'bg-[#1B4D2E] text-white shadow-xs'
                    : 'text-[#1B4D2E]/80 hover:bg-[#1B4D2E]/10'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Doorstep Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  deliveryMethod === 'pickup'
                    ? 'bg-[#1B4D2E] text-white shadow-xs'
                    : 'text-[#1B4D2E]/80 hover:bg-[#1B4D2E]/10'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Free Kitchen Pickup</span>
              </button>
            </div>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-[#1B4D2E]/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#1B4D2E]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {deliveryMethod === 'pickup'
                    ? 'Kitchen Pickup Fee'
                    : subtotal >= freeDeliveryThreshold
                    ? 'Local Delivery (Promo)'
                    : 'Local Delivery Fee'}
                </span>
                <span className="font-bold text-[#1B4D2E]">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-[11px]">Free</span>
                  ) : (
                    `$${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#1B4D2E] pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-[#1B4D2E]">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#E1AD01]" />
              </button>

              <button
                onClick={handleWhatsAppCheckout}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Quick Checkout via WhatsApp</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
