import React, { useState, useEffect } from 'react';
import { Product, SiteContent, SizeOption } from '../types';
import { useCart } from '../context/CartContext';
import { FALLBACK_BEVERAGE_IMAGE } from '../lib/storage';
import {
  getCustomerSizeDisplay,
  getCustomerSizeFullLabel,
  sanitizeBrandAndUnitsText,
} from '../lib/units';
import {
  ArrowLeft,
  ShoppingCart,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Heart,
  Plus,
  Minus,
  Check,
  Truck,
  Store,
} from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  content: SiteContent;
  onNavigate: (href: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  content,
  onNavigate,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedSize, setSelectedSize] = useState<SizeOption>(
    product.sizes[1] || product.sizes[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [activeImage, setActiveImage] = useState<string>(product.imageUrl);

  useEffect(() => {
    setActiveImage(product.imageUrl);
    setSelectedSize(product.sizes[1] || product.sizes[0]);
    setQuantity(1);
    setJustAdded(false);
  }, [product]);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${sanitizeBrandAndUnitsText(product.name)} | ${sanitizeBrandAndUnitsText(
      content.businessName || 'Delightful Juices'
    )}`;
    return () => {
      document.title = prevTitle;
    };
  }, [product.name, content.businessName]);

  const allImages = Array.from(
    new Set([product.imageUrl, ...(product.galleryImages || [])].filter(Boolean))
  );

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const whatsappText = encodeURIComponent(
    `Hello Delightful Juices! I would like to order *${quantity}x ${sanitizeBrandAndUnitsText(
      product.name
    )} (${getCustomerSizeFullLabel(selectedSize)})* at $${(
      selectedSize.price * quantity
    ).toFixed(2)}. Please confirm availability and delivery!`
  );

  return (
    <div className="bg-[#FFF8E7] min-h-screen pb-20">
      {/* Breadcrumb & Back Navigation */}
      <div className="bg-white border-b border-[#1B4D2E]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-[#1B4D2E] hover:text-[#12351F] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#E1AD01]" />
            <span>Back to Shop</span>
          </button>

          <nav aria-label="Breadcrumb" className="text-xs text-[#1B4D2E]/65 flex items-center space-x-2 truncate">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hover:text-[#1B4D2E] transition-colors cursor-pointer"
            >
              Home
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="hover:text-[#1B4D2E] transition-colors cursor-pointer"
            >
              Shop
            </button>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-[#1B4D2E] truncate">
              {sanitizeBrandAndUnitsText(product.name)}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Product Detail Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="bg-white rounded-3xl border border-[#1B4D2E]/15 shadow-sm p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Product Images & Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden bg-[#FFF8E7] border border-[#1B4D2E]/10 shadow-xs">
                <img
                  src={activeImage || FALLBACK_BEVERAGE_IMAGE}
                  alt={sanitizeBrandAndUnitsText(product.name)}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== FALLBACK_BEVERAGE_IMAGE) {
                      target.src = FALLBACK_BEVERAGE_IMAGE;
                    }
                  }}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {(!product.inStock || product.badge) && (
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                    {!product.inStock ? (
                      <span className="bg-red-600 text-white text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-md shadow-xs">
                        Out of Stock
                      </span>
                    ) : product.badge ? (
                      <span className="bg-[#E1AD01] text-[#1B4D2E] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-xs">
                        {product.badge}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => {
                    const isActive = activeImage === img;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImage(img)}
                        className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-[#FFF8E7] ${
                          isActive
                            ? 'border-[#1B4D2E] ring-2 ring-[#E1AD01]/60 scale-[1.02]'
                            : 'border-[#1B4D2E]/15 opacity-75 hover:opacity-100'
                        }`}
                        aria-label={`View image ${idx + 1} of ${sanitizeBrandAndUnitsText(product.name)}`}
                      >
                        <img
                          src={img}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_BEVERAGE_IMAGE;
                          }}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Product Write-up, Tasting Notes, Sizes & Ordering */}
            <div className="lg:col-span-6 space-y-6">
              {/* Metadata & Title */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#1B4D2E]/75">
                  <span className="font-bold uppercase tracking-wider text-[#1B4D2E]">
                    {product.categoryLabel}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-[#E1AD01] tabular-nums">
                    ★ {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-bold ${
                      product.inStock ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {product.inStock ? 'Fresh in Stock' : 'Out of Stock'}
                  </span>
                </div>

                <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#1B4D2E] leading-tight tracking-tight">
                  {sanitizeBrandAndUnitsText(product.name)}
                </h1>

                {product.tagline && (
                  <p className="text-sm sm:text-base font-medium text-[#1B4D2E]/80">
                    {sanitizeBrandAndUnitsText(product.tagline)}
                  </p>
                )}
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3 pb-5 border-b border-[#1B4D2E]/10">
                <span className="font-display font-black text-3xl sm:text-4xl text-[#1B4D2E] tabular-nums">
                  ${(selectedSize.price * quantity).toFixed(2)}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#1B4D2E]/70">
                  {quantity > 1
                    ? `$${selectedSize.price.toFixed(2)} each · ${getCustomerSizeFullLabel(selectedSize)}`
                    : getCustomerSizeFullLabel(selectedSize)}
                </span>
              </div>

              {/* Full Product Description */}
              <div className="space-y-2">
                <h2 className="font-bold text-xs uppercase tracking-wider text-[#1B4D2E]/70">
                  About This Recipe
                </h2>
                <p className="text-sm sm:text-base text-[#1B4D2E]/85 leading-relaxed">
                  {sanitizeBrandAndUnitsText(product.description)}
                </p>
              </div>

              {/* Tasting Notes */}
              {product.tasteProfile && (
                <div className="bg-[#FFF8E7] p-4 rounded-2xl border border-[#1B4D2E]/15">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#1B4D2E] mb-1.5 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E1AD01]" />
                    <span>Tasting Notes</span>
                  </div>
                  <p className="text-sm text-[#1B4D2E]/85 leading-relaxed">
                    {sanitizeBrandAndUnitsText(product.tasteProfile)}
                  </p>
                </div>
              )}

              {/* Available Bottle Sizes */}
              {product.sizes.length > 0 && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70">
                    Choose Available Size (US Fluid Ounces):
                  </label>
                  <div
                    className={`grid gap-2.5 ${
                      product.sizes.length === 1
                        ? 'grid-cols-1'
                        : product.sizes.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-3'
                    }`}
                  >
                    {product.sizes.map((s) => {
                      const isSelected = selectedSize.size === s.size;
                      return (
                        <button
                          key={s.size}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1B4D2E] text-[#FFF8E7] border-[#1B4D2E] shadow-xs'
                              : 'bg-[#FFF8E7] text-[#1B4D2E] border-[#1B4D2E]/20 hover:bg-[#1B4D2E]/5'
                          }`}
                        >
                          <div className="text-sm font-extrabold">
                            {getCustomerSizeDisplay(s)}
                          </div>
                          <div
                            className={`text-[11px] mt-0.5 ${
                              isSelected ? 'text-[#E1AD01]' : 'text-[#1B4D2E]/70'
                            }`}
                          >
                            {getCustomerSizeFullLabel(s)}
                          </div>
                          <div className="text-sm font-black mt-1.5 tabular-nums">
                            ${s.price.toFixed(2)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ordering Controls: Quantity, Add to Cart & WhatsApp Contact */}
              <div className="pt-2 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between sm:justify-start border border-[#1B4D2E]/20 rounded-xl bg-[#FFF8E7] px-3 py-2">
                    <span className="text-xs font-bold text-[#1B4D2E]/70 sm:hidden mr-3">
                      Quantity
                    </span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1.5 text-[#1B4D2E] hover:text-[#E1AD01] transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-bold text-sm text-[#1B4D2E] tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-1.5 text-[#1B4D2E] hover:text-[#E1AD01] transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                      justAdded
                        ? 'bg-emerald-600 text-white'
                        : product.inStock
                        ? 'bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7]'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 text-[#E1AD01]" />
                        <span className="tabular-nums">
                          {product.inStock
                            ? `Add to Cart • $${(selectedSize.price * quantity).toFixed(2)}`
                            : 'Sold Out'}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {justAdded && (
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold text-[#1B4D2E] bg-[#E1AD01] hover:bg-[#f0bc0e] transition-colors cursor-pointer"
                  >
                    View Bag &amp; Proceed to Checkout →
                  </button>
                )}

                {/* Direct WhatsApp Contact / Order Option */}
                {content.whatsappNumber && (
                  <a
                    href={`https://wa.me/${content.whatsappNumber}?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-[#1B4D2E] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/70 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Order or Ask About This Drink on WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Delivery & Pickup Info */}
              <div className="pt-4 border-t border-[#1B4D2E]/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#1B4D2E]/80">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>
                    Free local delivery over{' '}
                    <strong className="text-[#1B4D2E]">
                      ${content.freeDeliveryThreshold.toFixed(2)}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Store className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>Free pickup in Quakertown, PA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients & Wellness Benefits Section */}
          {(product.ingredients.length > 0 || product.healthBenefits.length > 0) && (
            <div className="mt-10 pt-8 border-t border-[#1B4D2E]/10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.ingredients.length > 0 && (
                <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200/80">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#1B4D2E] mb-3">
                    Real Whole Ingredients
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#1B4D2E]/85">
                    {product.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E1AD01] shrink-0" />
                        <span>{sanitizeBrandAndUnitsText(ing)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.healthBenefits.length > 0 && (
                <div className="bg-emerald-50/60 p-5 sm:p-6 rounded-2xl border border-emerald-200/60">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#1B4D2E] mb-3 flex items-center space-x-1.5">
                    <Heart className="w-3.5 h-3.5 text-red-500" />
                    <span>Wellness Benefits</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#1B4D2E]/85">
                    {product.healthBenefits.map((ben, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{sanitizeBrandAndUnitsText(ben)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
