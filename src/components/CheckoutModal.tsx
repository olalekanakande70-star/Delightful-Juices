import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { dataRepo } from '../lib/storage';
import { SiteContent, Order } from '../types';
import { 
  X, 
  CheckCircle2, 
  Truck, 
  Store, 
  CreditCard, 
  ShieldCheck, 
  MessageCircle,
  Copy,
  Calendar,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  content: SiteContent;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ content }) => {
  const {
    cart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    subtotal,
    deliveryFee,
    total,
    deliveryMethod,
    setDeliveryMethod,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('Afternoon (1:00 PM - 5:00 PM)');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'zelle' | 'cash_on_delivery' | 'card_at_pickup' | 'whatsapp_order'>('zelle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;
    if (deliveryMethod === 'local_delivery' && !deliveryAddress) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        size: item.selectedSize.size,
        sizeLabel: item.selectedSize.label,
        unitPrice: item.selectedSize.price,
        quantity: item.quantity,
        totalPrice: item.selectedSize.price * item.quantity,
        imageUrl: item.product.imageUrl,
      }));

      const newOrder = dataRepo.addOrder({
        customerName,
        customerEmail: customerEmail || 'customer@example.com',
        customerPhone,
        deliveryMethod,
        deliveryAddress:
          deliveryMethod === 'pickup'
            ? 'Pickup at 500 W Broad St, Quakertown, PA 18951'
            : deliveryAddress,
        deliveryDate: 'Today / Next Morning',
        deliveryTimeSlot,
        notes,
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        status: 'pending',
      });

      setIsSubmitting(false);
      setCompletedOrder(newOrder);
      clearCart();

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E1AD01', '#1B4D2E', '#FFF8E7'],
        });
      } catch (err) {
        console.warn(err);
      }
    }, 700);
  };

  const handleNotifyWhatsApp = () => {
    if (!completedOrder) return;
    const text = encodeURIComponent(
      `Hello Delightful Juice! I just placed order *${completedOrder.orderNumber}* for $${completedOrder.total.toFixed(2)}.\n\n` +
      `*Customer:* ${completedOrder.customerName} (${completedOrder.customerPhone})\n` +
      `*Delivery:* ${completedOrder.deliveryMethod === 'pickup' ? 'Kitchen Pickup' : completedOrder.deliveryAddress}\n` +
      `*Items:*\n` +
      completedOrder.items.map((it) => `- ${it.productName} (${it.size}) x${it.quantity}`).join('\n') +
      `\n\nLooking forward to confirmation! Thank you.`
    );
    window.open(`https://wa.me/${content.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#1B4D2E]/20 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 bg-[#1B4D2E] text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-display font-bold text-xl text-[#FFF8E7]">
              {completedOrder ? 'Order Confirmed!' : 'Checkout & Delivery Details'}
            </h3>
            <p className="text-xs text-[#E1AD01]">
              {completedOrder ? 'Thank you for savoring pure goodness' : 'Complete your juice order for Quakertown & Regional Delivery'}
            </p>
          </div>

          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setCompletedOrder(null);
            }}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {completedOrder ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-[#1B4D2E]/60 tracking-wider">Order Reference</span>
                <div className="font-display font-black text-3xl text-[#1B4D2E] mt-0.5">
                  {completedOrder.orderNumber}
                </div>
              </div>

              <div className="bg-[#FFF8E7] p-4 rounded-2xl border border-[#1B4D2E]/15 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#1B4D2E]/70">Customer:</span>
                  <span className="font-bold text-[#1B4D2E]">{completedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1B4D2E]/70">Phone:</span>
                  <span className="font-bold text-[#1B4D2E]">{completedOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1B4D2E]/70">Delivery Option:</span>
                  <span className="font-bold text-[#1B4D2E] capitalize">
                    {completedOrder.deliveryMethod.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1B4D2E]/70">Total Amount:</span>
                  <span className="font-black text-sm text-[#1B4D2E]">${completedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-[#1B4D2E]/80 max-w-sm mx-auto leading-relaxed">
                Your order has been logged into our kitchen system. We will cold-pack your fresh bottles and notify you when ready for dispatch or pickup.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleNotifyWhatsApp}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Order Copy via WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setCompletedOrder(null);
                  }}
                  className="w-full sm:w-auto bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3 px-5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Order Summary Snapshot */}
              <div className="bg-[#FFF8E7] p-3.5 rounded-2xl border border-[#1B4D2E]/15 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#1B4D2E]">Bag Subtotal: </span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-bold text-[#1B4D2E]">Delivery: </span>
                  <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : ''}>
                    {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="font-extrabold text-[#1B4D2E] text-sm">
                  Total: ${total.toFixed(2)}
                </div>
              </div>

              {/* Delivery Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-2">
                  Receiving Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('local_delivery')}
                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center space-x-2 cursor-pointer ${
                      deliveryMethod === 'local_delivery'
                        ? 'bg-[#1B4D2E] text-white border-[#1B4D2E]'
                        : 'bg-[#FFF8E7] text-[#1B4D2E] border-[#1B4D2E]/20 hover:bg-[#1B4D2E]/5'
                    }`}
                  >
                    <Truck className="w-4 h-4 shrink-0 text-[#E1AD01]" />
                    <div>
                      <div>Doorstep Delivery</div>
                      <div className="text-[10px] font-normal opacity-80">Quakertown & Regional</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center space-x-2 cursor-pointer ${
                      deliveryMethod === 'pickup'
                        ? 'bg-[#1B4D2E] text-white border-[#1B4D2E]'
                        : 'bg-[#FFF8E7] text-[#1B4D2E] border-[#1B4D2E]/20 hover:bg-[#1B4D2E]/5'
                    }`}
                  >
                    <Store className="w-4 h-4 shrink-0 text-[#E1AD01]" />
                    <div>
                      <div>Kitchen Pickup</div>
                      <div className="text-[10px] font-normal opacity-80">500 W Broad St (Free)</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Oluyemi Ajibolade"
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] focus:ring-2 focus:ring-[#E1AD01] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Phone Number (for Delivery SMS/Call) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(484) 792-8023"
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] focus:ring-2 focus:ring-[#E1AD01] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="order-receipt@example.com"
                  className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] focus:ring-2 focus:ring-[#E1AD01] focus:outline-hidden"
                />
              </div>

              {/* Delivery Address if delivery */}
              {deliveryMethod === 'local_delivery' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Delivery Address (Street, Apt/Suite, City, ZIP) *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. 142 S 4th St, Quakertown, PA 18951"
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] focus:ring-2 focus:ring-[#E1AD01] focus:outline-hidden"
                  />
                </div>
              )}

              {/* Delivery Time Slot */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                  Preferred Delivery Window
                </label>
                <select
                  value={deliveryTimeSlot}
                  onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                  className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#1B4D2E] focus:ring-2 focus:ring-[#E1AD01] focus:outline-hidden"
                >
                  <option value="Morning (9:30 AM - 12:30 PM)">Morning (9:30 AM - 12:30 PM)</option>
                  <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                  <option value="Evening (5:30 PM - 7:30 PM)">Evening (5:30 PM - 7:30 PM)</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-2">
                  Select Payment Preference
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 bg-[#FFF8E7] border border-[#1B4D2E]/15 rounded-xl cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'zelle'}
                      onChange={() => setPaymentMethod('zelle')}
                      className="w-4 h-4 accent-[#1B4D2E]"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[#1B4D2E] block">Zelle Transfer (Instant & Direct)</span>
                      <span className="text-[#1B4D2E]/70">Send to (484) 792-8023 / Delightful Juice</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-[#FFF8E7] border border-[#1B4D2E]/15 rounded-xl cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="w-4 h-4 accent-[#1B4D2E]"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[#1B4D2E] block">Cash on Delivery / Pickup</span>
                      <span className="text-[#1B4D2E]/70">Pay when receiving your fresh insulated order</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-[#FFF8E7] border border-[#1B4D2E]/15 rounded-xl cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'whatsapp_order'}
                      onChange={() => setPaymentMethod('whatsapp_order')}
                      className="w-4 h-4 accent-[#1B4D2E]"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[#1B4D2E] block">Pay & Confirm via WhatsApp</span>
                      <span className="text-[#1B4D2E]/70">Coordinate custom payment link or card invoice</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                  Delivery Notes or Special Instructions
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Leave in cooler by front porch"
                  className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] focus:ring-2 focus:ring-[#E1AD01] focus:outline-hidden"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3.5 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#E1AD01]" />
                  <span>
                    {isSubmitting
                      ? 'Processing Order...'
                      : `Place Order • $${total.toFixed(2)}`}
                  </span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
