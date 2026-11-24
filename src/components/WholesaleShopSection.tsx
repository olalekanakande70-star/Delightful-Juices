import React, { useEffect, useMemo, useState } from 'react';
import {
  Order,
  Product,
  SiteContent,
  WholesaleDeliveryConfig,
  WholesaleSizeTierConfig,
} from '../types';
import { dataRepo, DEFAULT_WHOLESALE_SHOP } from '../lib/storage';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type WholesaleBottleSize = '12oz' | '16oz' | '18oz';
export type WholesaleDeliveryZone = 'radius_1hr' | 'radius_2hr_plus' | 'pickup';

interface WholesaleCartLine {
  id: string; // `${productId}-${size}`
  productId: string;
  productName: string;
  size: WholesaleBottleSize;
  cases: number;
  imageUrl: string;
}

export function getWholesaleCasePrice(
  size: WholesaleBottleSize,
  totalCasesForSize: number,
  sizeTiers?: WholesaleSizeTierConfig[]
): { unitCasePrice: number; tierLabel: string; baseCasePrice: number } {
  const tiers = sizeTiers && sizeTiers.length > 0 ? sizeTiers : DEFAULT_WHOLESALE_SHOP.sizeTiers;
  const schedule =
    tiers.find((t) => t.size === size) ||
    DEFAULT_WHOLESALE_SHOP.sizeTiers.find((t) => t.size === size)!;

  if (totalCasesForSize >= 20) {
    return {
      unitCasePrice: schedule.tier3CasePrice,
      tierLabel: '20–30 cases rate',
      baseCasePrice: schedule.baseCasePrice,
    };
  }
  if (totalCasesForSize >= 10) {
    return {
      unitCasePrice: schedule.tier2CasePrice,
      tierLabel: '10–20 cases rate',
      baseCasePrice: schedule.baseCasePrice,
    };
  }
  return {
    unitCasePrice: schedule.baseCasePrice,
    tierLabel: '1–10 cases rate',
    baseCasePrice: schedule.baseCasePrice,
  };
}

const WHOLESALE_CART_STORAGE_KEY = 'delightful_wholesale_cart_v1';

interface WholesaleShopSectionProps {
  products?: Product[];
  content: SiteContent;
}

export const WholesaleShopSection: React.FC<WholesaleShopSectionProps> = ({
  products = [],
  content,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'zobo' | 'ginger' | 'milks'>('all');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, WholesaleBottleSize>>({
    'prod-zobo': '16oz',
    'prod-tigernut-milk': '16oz',
    'prod-organic-ginger': '16oz',
    'prod-ginger-mango': '16oz',
    'prod-ginger-pineapple': '16oz',
    'prod-ginger-lychee': '16oz',
  });
  const [cardCases, setCardCases] = useState<Record<string, number>>({
    'prod-zobo': 1,
    'prod-tigernut-milk': 1,
    'prod-organic-ginger': 1,
    'prod-ginger-mango': 1,
    'prod-ginger-pineapple': 1,
    'prod-ginger-lychee': 1,
  });

  const [wholesaleCart, setWholesaleCart] = useState<WholesaleCartLine[]>(() => {
    try {
      const saved = localStorage.getItem(WHOLESALE_CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  });

  const [deliveryZone, setDeliveryZone] = useState<WholesaleDeliveryZone>('radius_1hr');
  const [erroredImages, setErroredImages] = useState<Record<string, boolean>>({});
  const [addedFeedbackId, setAddedFeedbackId] = useState<string | null>(null);

  // Wholesale checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'stripe_card' | 'zelle' | 'whatsapp_order' | 'cash_on_delivery'
  >(content.stripe?.enabled !== false ? 'stripe_card' : 'zelle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [stripeNotice, setStripeNotice] = useState<string | null>(null);

  const wholesaleConfig =
    content.wholesaleShop || content.branding?.wholesaleShop || DEFAULT_WHOLESALE_SHOP;

  const activeSizeTiers: WholesaleSizeTierConfig[] = useMemo(() => {
    const raw =
      wholesaleConfig.sizeTiers && wholesaleConfig.sizeTiers.length > 0
        ? wholesaleConfig.sizeTiers
        : DEFAULT_WHOLESALE_SHOP.sizeTiers;
    const enabledOnly = raw.filter((t) => t.enabled !== false);
    return enabledOnly.length > 0 ? enabledOnly : raw;
  }, [wholesaleConfig.sizeTiers]);

  const activeDeliveryOptions: WholesaleDeliveryConfig[] = useMemo(() => {
    const raw =
      wholesaleConfig.deliveryOptions && wholesaleConfig.deliveryOptions.length > 0
        ? wholesaleConfig.deliveryOptions
        : DEFAULT_WHOLESALE_SHOP.deliveryOptions;
    const enabledOnly = raw.filter((d) => d.enabled !== false);
    return enabledOnly.length > 0 ? enabledOnly : raw;
  }, [wholesaleConfig.deliveryOptions]);

  const defaultSelectedSize: WholesaleBottleSize = useMemo(() => {
    const has16 = activeSizeTiers.some((t) => t.size === '16oz');
    if (has16) return '16oz';
    return activeSizeTiers[0]?.size || '16oz';
  }, [activeSizeTiers]);

  useEffect(() => {
    try {
      localStorage.setItem(WHOLESALE_CART_STORAGE_KEY, JSON.stringify(wholesaleCart));
    } catch {
      // Ignore storage write errors
    }
  }, [wholesaleCart]);

  // Resolve live CMS Wholesale Shop items (falling back to live Product image only when item imageUrl is empty)
  const resolvedProducts = useMemo(() => {
    const cmsItems =
      wholesaleConfig.products && wholesaleConfig.products.length > 0
        ? wholesaleConfig.products
        : DEFAULT_WHOLESALE_SHOP.products;

    return [...cmsItems]
      .filter((item) => item.published !== false)
      .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
      .map((spec) => {
        const matched = products.find(
          (p) =>
            p.id === spec.id ||
            (spec.matchSlug && p.slug?.toLowerCase() === spec.matchSlug.toLowerCase()) ||
            p.name?.toLowerCase().includes(spec.shortName.toLowerCase())
        );
        const imageUrl = (spec.imageUrl || '').trim() || (matched?.imageUrl || '').trim();
        return {
          ...spec,
          imageUrl,
          inStock: spec.inStock !== false,
        };
      });
  }, [wholesaleConfig.products, products]);

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return resolvedProducts;
    return resolvedProducts.filter((p) => p.category === categoryFilter);
  }, [resolvedProducts, categoryFilter]);

  // Count total cases per bottle size currently in the wholesale order
  const cartCasesBySize = useMemo(() => {
    const counts: Record<WholesaleBottleSize, number> = {
      '12oz': 0,
      '16oz': 0,
      '18oz': 0,
    };
    for (const line of wholesaleCart) {
      counts[line.size] = (counts[line.size] || 0) + line.cases;
    }
    return counts;
  }, [wholesaleCart]);

  const enrichedCart = useMemo(() => {
    return wholesaleCart.map((line) => {
      const sizeCount = cartCasesBySize[line.size] || line.cases;
      const pricing = getWholesaleCasePrice(line.size, sizeCount, wholesaleConfig.sizeTiers);
      const lineTotal = pricing.unitCasePrice * line.cases;
      const savings = (pricing.baseCasePrice - pricing.unitCasePrice) * line.cases;
      return {
        ...line,
        unitCasePrice: pricing.unitCasePrice,
        baseCasePrice: pricing.baseCasePrice,
        tierLabel: pricing.tierLabel,
        bottlesCount: line.cases * 12,
        lineTotal,
        savings,
      };
    });
  }, [wholesaleCart, cartCasesBySize, wholesaleConfig.sizeTiers]);

  const totalCases = wholesaleCart.reduce((sum, l) => sum + l.cases, 0);
  const totalBottles = totalCases * 12;
  const subtotal = enrichedCart.reduce((sum, l) => sum + l.lineTotal, 0);
  const totalVolumeSavings = enrichedCart.reduce((sum, l) => sum + l.savings, 0);
  const selectedDeliveryOption =
    activeDeliveryOptions.find((opt) => opt.id === deliveryZone) || activeDeliveryOptions[0];
  const deliveryFee = wholesaleCart.length > 0 ? selectedDeliveryOption.fee : 0;
  const grandTotal = subtotal + deliveryFee;

  if (wholesaleConfig.enabled === false) {
    return null;
  }

  const handleSizeSelect = (productId: string, size: WholesaleBottleSize) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleCardCasesChange = (productId: string, nextValue: number) => {
    const clamped = Math.max(1, Math.min(200, Math.floor(nextValue || 1)));
    setCardCases((prev) => ({ ...prev, [productId]: clamped }));
  };

  const handleAddCases = (product: (typeof resolvedProducts)[number]) => {
    if (!product.inStock) return;
    const rawSize = selectedSizes[product.id] || defaultSelectedSize;
    const size = activeSizeTiers.some((t) => t.size === rawSize) ? rawSize : defaultSelectedSize;
    const qty = Math.max(1, cardCases[product.id] || 1);
    const lineId = `${product.id}-${size}`;

    setWholesaleCart((prev) => {
      const existing = prev.find((l) => l.id === lineId);
      if (existing) {
        return prev.map((l) =>
          l.id === lineId ? { ...l, cases: l.cases + qty, imageUrl: product.imageUrl } : l
        );
      }
      return [
        ...prev,
        {
          id: lineId,
          productId: product.id,
          productName: product.name,
          size,
          cases: qty,
          imageUrl: product.imageUrl,
        },
      ];
    });

    setAddedFeedbackId(product.id);
    setTimeout(() => {
      setAddedFeedbackId((curr) => (curr === product.id ? null : curr));
    }, 1500);
  };

  const handleUpdateLineCases = (lineId: string, delta: number) => {
    setWholesaleCart((prev) =>
      prev
        .map((l) => {
          if (l.id !== lineId) return l;
          const next = l.cases + delta;
          return next > 0 ? { ...l, cases: next } : null;
        })
        .filter(Boolean) as WholesaleCartLine[]
    );
  };

  const handleRemoveLine = (lineId: string) => {
    setWholesaleCart((prev) => prev.filter((l) => l.id !== lineId));
  };

  const wholesaleWhatsAppUrl = (() => {
    if (enrichedCart.length === 0) {
      return `https://wa.me/${content.whatsappNumber}?text=${encodeURIComponent(
        'Hello Delightful Juices! I would like to place a wholesale case order.'
      )}`;
    }
    const linesText = enrichedCart
      .map(
        (l, idx) =>
          `${idx + 1}. *${l.productName}* — 12-pack (${l.size}) x ${l.cases} case${
            l.cases === 1 ? '' : 's'
          } (${l.bottlesCount} bottles) @ $${l.unitCasePrice}/case = $${l.lineTotal.toFixed(2)}`
      )
      .join('\n');

    return `https://wa.me/${content.whatsappNumber}?text=${encodeURIComponent(
      `Hello Delightful Juices Wholesale Team! I would like to place a wholesale order:\n\n` +
        `${linesText}\n\n` +
        `*Total Cases:* ${totalCases} cases (${totalBottles} bottles)\n` +
        `*Subtotal:* $${subtotal.toFixed(2)}\n` +
        `*Delivery Option:* ${selectedDeliveryOption.label} ($${deliveryFee.toFixed(2)})\n` +
        `*Order Total:* $${grandTotal.toFixed(2)}\n\n` +
        `Please confirm availability and schedule.`
    )}`;
  })();

  const handleWholesaleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (enrichedCart.length === 0) {
      setCheckoutError('Please add at least 1 wholesale case to your order first.');
      return;
    }
    if (!contactName.trim() || !customerPhone.trim()) {
      setCheckoutError('Please enter your contact name and phone number.');
      return;
    }
    if (deliveryZone !== 'pickup' && !deliveryAddress.trim()) {
      setCheckoutError('Please provide your business delivery address.');
      return;
    }

    setIsSubmitting(true);
    setStripeNotice(null);

    const orderItems = enrichedCart.map((line) => ({
      productId: `wholesale-${line.productId}-${line.size}`,
      productName: `${line.productName} — Wholesale 12-Pack (${line.size})`,
      size: `12-pack-${line.size}`,
      sizeLabel: `12-pack (${line.size}) • ${line.tierLabel}`,
      unitPrice: line.unitCasePrice,
      quantity: line.cases,
      totalPrice: line.lineTotal,
      imageUrl: line.imageUrl,
    }));

    const orderNotes = [
      businessName.trim() ? `Business: ${businessName.trim()}` : '',
      `Wholesale Delivery Zone: ${selectedDeliveryOption.label}`,
      notes.trim() ? `Notes: ${notes.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const newOrder = await dataRepo.createOrder({
      customerName: businessName.trim()
        ? `${contactName.trim()} (${businessName.trim()})`
        : contactName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      deliveryMethod: deliveryZone === 'pickup' ? 'pickup' : 'local_delivery',
      deliveryAddress:
        deliveryZone === 'pickup'
          ? 'Pickup at 500 W Broad St, Quakertown, PA 18951'
          : deliveryAddress.trim(),
      deliveryDate: deliveryDate || 'Scheduled Wholesale Dispatch',
      deliveryTimeSlot: selectedDeliveryOption.shortLabel,
      notes: orderNotes,
      items: orderItems,
      subtotal,
      deliveryFee,
      total: grandTotal,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
    });

    if (paymentMethod === 'stripe_card') {
      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: newOrder.id,
            orderNumber: newOrder.orderNumber,
            items: orderItems,
            customerName: newOrder.customerName,
            customerEmail: customerEmail.trim() || undefined,
            deliveryFee,
            deliveryLabel: selectedDeliveryOption.label,
            deliveryDescription: selectedDeliveryOption.description,
            currency: content.stripe?.currency || 'usd',
            successUrl: `${window.location.origin}/?order_success=true&order_number=${encodeURIComponent(newOrder.orderNumber)}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/wholesale?order_cancelled=true&order_number=${encodeURIComponent(newOrder.orderNumber)}`,
          }),
        });

        const data = await response.json();
        if (response.ok && data.url) {
          setWholesaleCart([]);
          window.location.href = data.url;
          return;
        } else {
          setStripeNotice(
            data.message ||
              'Card payment could not initialize right now. Your wholesale order has been saved to our queue—you can complete payment via Zelle or WhatsApp.'
          );
          setIsSubmitting(false);
          setCompletedOrder(newOrder);
          setWholesaleCart([]);
        }
      } catch {
        setStripeNotice(
          'Unable to connect to the card checkout right now. Your wholesale order has been logged in our queue—please message us on WhatsApp to finalize payment.'
        );
        setIsSubmitting(false);
        setCompletedOrder(newOrder);
        setWholesaleCart([]);
      }
      return;
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setCompletedOrder(newOrder);
      setWholesaleCart([]);
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E1AD01', '#1B4D2E', '#FFF8E7'],
        });
      } catch {
        // Ignore confetti failures
      }
    }, 400);
  };

  return (
    <section
      id="wholesale-shop"
      className="py-16 sm:py-24 bg-white border-b border-[#1B4D2E]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Intro + Segmented Flavor Filter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1B4D2E]/70">
              {wholesaleConfig.kicker || DEFAULT_WHOLESALE_SHOP.kicker}
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1B4D2E] tracking-tight text-balance">
              {wholesaleConfig.heading || DEFAULT_WHOLESALE_SHOP.heading}
            </h2>
            <p className="text-sm sm:text-base text-[#1B4D2E]/80 leading-relaxed">
              {wholesaleConfig.subheading || DEFAULT_WHOLESALE_SHOP.subheading}
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-[#FFF8E7] rounded-2xl border border-[#1B4D2E]/15 self-start lg:self-end">
            {[
              { id: 'all', label: `All ${resolvedProducts.length} Flavors` },
              { id: 'zobo', label: 'Zobo' },
              { id: 'ginger', label: 'Ginger Blends' },
              { id: 'milks', label: 'Tigernut Milk' },
            ].map((tab) => {
              const active = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id as typeof categoryFilter)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                      : 'text-[#1B4D2E]/75 hover:text-[#1B4D2E] hover:bg-white/70'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Wholesale Volume Pricing & Delivery Schedule Bar */}
        <div className="bg-[#FFF8E7] rounded-3xl p-5 sm:p-7 border border-[#1B4D2E]/15 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
                12-Pack Wholesale Case Pricing &amp; Volume Tiers
              </h3>
              <span className="text-xs font-semibold text-[#1B4D2E]/75">
                All flavors · 12 bottles per case
              </span>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl border border-[#1B4D2E]/12">
              <table className="w-full text-left text-xs sm:text-sm tabular-nums">
                <thead className="bg-[#1B4D2E] text-[#FFF8E7] text-xs">
                  <tr>
                    <th className="py-3 px-4 font-bold">Case Size (12-Pack)</th>
                    <th className="py-3 px-4 font-bold">1–10 cases</th>
                    <th className="py-3 px-4 font-bold">10–20 cases</th>
                    <th className="py-3 px-4 font-bold text-[#E1AD01]">20–30 cases</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B4D2E]/10 text-[#1B4D2E]">
                  {activeSizeTiers.map((tier) => (
                    <tr key={tier.size} className="hover:bg-[#FFF8E7]/50">
                      <td className="py-3 px-4 font-bold">{tier.label}</td>
                      <td className="py-3 px-4 font-extrabold">${tier.baseCasePrice} / case</td>
                      <td className="py-3 px-4 font-extrabold">${tier.tier2CasePrice} / case</td>
                      <td className="py-3 px-4 font-black text-emerald-800">
                        ${tier.tier3CasePrice} / case
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#1B4D2E]/70">
              Volume discounts apply automatically at <strong>10+ cases</strong> and{' '}
              <strong>20+ cases</strong> per bottle size across your wholesale cart.
            </p>
          </div>

          <div className="lg:col-span-4 bg-[#1B4D2E] text-[#FFF8E7] rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#E1AD01]">
                Wholesale Logistics
              </div>
              <h4 className="font-display font-bold text-lg text-white">
                Cold-Chain Delivery Rates
              </h4>
            </div>

            <div className="space-y-3 text-xs tabular-nums">
              {activeDeliveryOptions.map((opt, idx) => (
                <div
                  key={opt.id}
                  className={`flex items-center justify-between ${
                    idx < activeDeliveryOptions.length - 1 ? 'pb-2.5 border-b border-white/15' : ''
                  }`}
                >
                  <div>
                    <div className="font-bold text-white">{opt.shortLabel}</div>
                    <div className="text-[11px] text-[#FFF8E7]/70">{opt.description}</div>
                  </div>
                  {opt.fee === 0 ? (
                    <span className="font-black text-sm text-emerald-300 uppercase shrink-0 ml-2">
                      Free
                    </span>
                  ) : (
                    <span className="font-black text-lg text-[#E1AD01] shrink-0 ml-2">
                      ${opt.fee}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Workspace Split: Wholesale Products Grid + Live Wholesale Order Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Main: Wholesale Products */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredProducts.map((product) => {
              const rawSelected = selectedSizes[product.id] || defaultSelectedSize;
              const selectedSize = activeSizeTiers.some((t) => t.size === rawSelected)
                ? rawSelected
                : defaultSelectedSize;
              const qtyCases = cardCases[product.id] || 1;
              const existingSameSizeCases = cartCasesBySize[selectedSize] || 0;
              const previewCaseCount = Math.max(qtyCases, existingSameSizeCases + qtyCases);
              const { unitCasePrice, baseCasePrice, tierLabel } = getWholesaleCasePrice(
                selectedSize,
                previewCaseCount,
                wholesaleConfig.sizeTiers
              );
              const schedule =
                activeSizeTiers.find((t) => t.size === selectedSize) || activeSizeTiers[0];
              const isDiscounted = unitCasePrice < baseCasePrice;
              const hasImgError = Boolean(erroredImages[product.imageUrl]);
              const justAdded = addedFeedbackId === product.id;

              return (
                <article
                  key={product.id}
                  className="bg-white rounded-3xl border border-[#1B4D2E]/15 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Product Photography */}
                    <div className="aspect-4/3 bg-[#FFF8E7] overflow-hidden flex items-center justify-center p-5 border-b border-[#1B4D2E]/10">
                      {product.imageUrl && !hasImgError ? (
                        <img
                          src={product.imageUrl}
                          alt={`${product.name} wholesale 12-pack bottle`}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setErroredImages((prev) => ({ ...prev, [product.imageUrl]: true }))
                          }
                          className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center text-[#1B4D2E]/70 space-y-2">
                          <Package className="w-9 h-9 text-[#1B4D2E]/50" />
                          <span className="text-xs font-bold">{product.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5 space-y-4">
                      <div className="space-y-1">
                        <div className="text-xs text-[#1B4D2E]/65 font-semibold flex items-center gap-1.5">
                          <span>{product.categoryLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span>12 Bottles / Case</span>
                        </div>
                        <h3 className="font-display font-bold text-lg sm:text-xl text-[#1B4D2E] leading-snug">
                          {product.name}
                        </h3>
                        <p className="text-xs text-[#1B4D2E]/75 leading-relaxed line-clamp-2">
                          {product.tagline}
                        </p>
                      </div>

                      {/* 12-Pack Size Selector (12oz / 16oz / 18oz) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#1B4D2E]/80">Select 12-Pack Size</span>
                          <span className="text-[11px] font-semibold text-[#1B4D2E]/65 tabular-nums">
                            {tierLabel}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FFF8E7] rounded-xl border border-[#1B4D2E]/12">
                          {activeSizeTiers.map((tier) => {
                            const active = selectedSize === tier.size;
                            return (
                              <button
                                key={tier.size}
                                type="button"
                                onClick={() => handleSizeSelect(product.id, tier.size)}
                                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap tabular-nums ${
                                  active
                                    ? 'bg-[#1B4D2E] text-[#FFF8E7] shadow-xs'
                                    : 'text-[#1B4D2E]/80 hover:bg-white'
                                }`}
                              >
                                {tier.size} · ${tier.baseCasePrice}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tier Rate Breakdown for Active Size */}
                      <div className="grid grid-cols-3 gap-1.5 text-[11px] tabular-nums text-center pt-1">
                        <div
                          className={`py-1.5 px-1 rounded-lg border ${
                            previewCaseCount < 10
                              ? 'bg-[#FFF8E7] border-[#1B4D2E]/30 font-bold text-[#1B4D2E]'
                              : 'bg-gray-50 border-gray-200 text-[#1B4D2E]/65'
                          }`}
                        >
                          <div>1–10 cases</div>
                          <div className="font-extrabold">${schedule.baseCasePrice}/cs</div>
                        </div>
                        <div
                          className={`py-1.5 px-1 rounded-lg border ${
                            previewCaseCount >= 10 && previewCaseCount < 20
                              ? 'bg-[#FFF8E7] border-[#1B4D2E]/40 font-bold text-[#1B4D2E]'
                              : 'bg-gray-50 border-gray-200 text-[#1B4D2E]/65'
                          }`}
                        >
                          <div>10–20 cases</div>
                          <div className="font-extrabold">${schedule.tier2CasePrice}/cs</div>
                        </div>
                        <div
                          className={`py-1.5 px-1 rounded-lg border ${
                            previewCaseCount >= 20
                              ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-900'
                              : 'bg-gray-50 border-gray-200 text-[#1B4D2E]/65'
                          }`}
                        >
                          <div>20–30 cases</div>
                          <div className="font-extrabold">${schedule.tier3CasePrice}/cs</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Price + Case Quantity Stepper + Add to Order */}
                  <div className="px-5 pb-5 pt-4 border-t border-[#1B4D2E]/10 space-y-3 bg-[#FFF8E7]/35">
                    <div className="flex items-baseline justify-between tabular-nums">
                      <div>
                        <span className="text-2xl font-black text-[#1B4D2E]">
                          ${unitCasePrice}
                        </span>
                        <span className="text-xs font-semibold text-[#1B4D2E]/70"> / case</span>
                        {isDiscounted && (
                          <span className="ml-2 text-xs line-through text-[#1B4D2E]/45">
                            ${baseCasePrice}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-[#1B4D2E]/75">
                        Total: ${(unitCasePrice * qtyCases).toFixed(2)} ({qtyCases * 12} bottles)
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center bg-white border border-[#1B4D2E]/20 rounded-xl px-1.5 py-1.5">
                        <button
                          type="button"
                          onClick={() => handleCardCasesChange(product.id, qtyCases - 1)}
                          aria-label={`Decrease cases for ${product.name}`}
                          className="w-7 h-7 rounded-lg hover:bg-[#FFF8E7] text-[#1B4D2E] flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={200}
                          aria-label={`Cases of ${product.name}`}
                          value={qtyCases}
                          onChange={(e) =>
                            handleCardCasesChange(product.id, parseInt(e.target.value, 10) || 1)
                          }
                          className="w-11 text-center text-xs font-extrabold text-[#1B4D2E] bg-transparent focus:outline-hidden tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => handleCardCasesChange(product.id, qtyCases + 1)}
                          aria-label={`Increase cases for ${product.name}`}
                          className="w-7 h-7 rounded-lg hover:bg-[#FFF8E7] text-[#1B4D2E] flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={!product.inStock}
                        onClick={() => handleAddCases(product)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap shadow-xs ${
                          !product.inStock
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : justAdded
                            ? 'bg-emerald-700 text-white cursor-pointer'
                            : 'bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] cursor-pointer'
                        }`}
                      >
                        {!product.inStock ? (
                          <span>Currently Sold Out</span>
                        ) : justAdded ? (
                          <>
                            <Check className="w-4 h-4 text-[#E1AD01]" />
                            <span>Added {qtyCases} Case{qtyCases === 1 ? '' : 's'}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-[#E1AD01]" />
                            <span>Add {qtyCases} Case{qtyCases === 1 ? '' : 's'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Sticky Column: Wholesale Order Summary & Delivery Radius Selector */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-[#FFF8E7] rounded-3xl p-6 border border-[#1B4D2E]/15 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B4D2E]/15">
              <div>
                <h3 className="font-display font-bold text-xl text-[#1B4D2E]">
                  Wholesale Order Cart
                </h3>
                <p className="text-xs text-[#1B4D2E]/70 tabular-nums">
                  {totalCases} case{totalCases === 1 ? '' : 's'} · {totalBottles} bottles
                </p>
              </div>
              {wholesaleCart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setWholesaleCart([])}
                  className="text-[11px] font-bold text-[#1B4D2E]/65 hover:text-red-700 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {enrichedCart.length === 0 ? (
              <div className="py-8 text-center space-y-2.5 text-xs text-[#1B4D2E]/75">
                <Package className="w-9 h-9 text-[#1B4D2E]/40 mx-auto" />
                <p className="font-bold text-sm text-[#1B4D2E]">
                  Your Wholesale Order Is Empty
                </p>
                <p className="leading-relaxed">
                  Select a 12-pack bottle size (12oz, 16oz, or 18oz) on any wholesale flavor and add cases to calculate your tiered case pricing and delivery.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {enrichedCart.map((line) => (
                  <div
                    key={line.id}
                    className="bg-white rounded-2xl p-3.5 border border-[#1B4D2E]/12 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-[#1B4D2E]">
                          {line.productName}
                        </div>
                        <div className="text-[11px] text-[#1B4D2E]/70 tabular-nums">
                          12-pack ({line.size}) · ${line.unitCasePrice}/case · {line.bottlesCount} bottles
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.id)}
                        aria-label={`Remove ${line.productName}`}
                        className="text-gray-400 hover:text-red-600 p-1 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center bg-[#FFF8E7] border border-[#1B4D2E]/15 rounded-lg px-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateLineCases(line.id, -1)}
                          aria-label="Decrease case count"
                          className="p-1 text-[#1B4D2E] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#1B4D2E] tabular-nums">
                          {line.cases} {line.cases === 1 ? 'case' : 'cases'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateLineCases(line.id, 1)}
                          aria-label="Increase case count"
                          className="p-1 text-[#1B4D2E] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right tabular-nums">
                        <div className="font-extrabold text-sm text-[#1B4D2E]">
                          ${line.lineTotal.toFixed(2)}
                        </div>
                        {line.savings > 0 && (
                          <div className="text-[10px] font-bold text-emerald-700">
                            Saved ${line.savings.toFixed(0)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Wholesale Delivery Zone Selector */}
            <div className="space-y-2 pt-2 border-t border-[#1B4D2E]/15">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1B4D2E]/75">
                Wholesale Delivery Radius
              </label>
              <div className="space-y-2">
                {activeDeliveryOptions.map((opt) => {
                  const selected = selectedDeliveryOption.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDeliveryZone(opt.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        selected
                          ? 'bg-[#1B4D2E] text-[#FFF8E7] border-[#1B4D2E] shadow-xs'
                          : 'bg-white text-[#1B4D2E] border-[#1B4D2E]/15 hover:border-[#1B4D2E]/40'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        {opt.id === 'pickup' ? (
                          <Store
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              selected ? 'text-[#E1AD01]' : 'text-[#1B4D2E]/70'
                            }`}
                          />
                        ) : (
                          <Truck
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              selected ? 'text-[#E1AD01]' : 'text-[#1B4D2E]/70'
                            }`}
                          />
                        )}
                        <div>
                          <div className="text-xs font-bold">{opt.shortLabel}</div>
                          <div
                            className={`text-[10px] ${
                              selected ? 'text-[#FFF8E7]/75' : 'text-[#1B4D2E]/65'
                            }`}
                          >
                            {opt.description}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-black tabular-nums shrink-0 ${
                          selected ? 'text-[#E1AD01]' : 'text-[#1B4D2E]'
                        }`}
                      >
                        {opt.fee === 0 ? 'Free' : `$${opt.fee}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-[#1B4D2E]/15 text-xs tabular-nums">
              <div className="flex justify-between text-[#1B4D2E]/80">
                <span>Cases Subtotal ({totalCases} cases)</span>
                <span className="font-bold text-[#1B4D2E]">${subtotal.toFixed(2)}</span>
              </div>
              {totalVolumeSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Volume Tier Savings</span>
                  <span>-${totalVolumeSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#1B4D2E]/80">
                <span>{selectedDeliveryOption.shortLabel}</span>
                <span className="font-bold text-[#1B4D2E]">
                  {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#1B4D2E]/15 text-base font-black text-[#1B4D2E]">
                <span>Wholesale Total</span>
                <span className="text-xl">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Primary Order CTA */}
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={enrichedCart.length === 0}
                onClick={() => {
                  setCompletedOrder(null);
                  setCheckoutError(null);
                  setIsCheckoutOpen(true);
                }}
                className="w-full bg-[#1B4D2E] hover:bg-[#143822] disabled:opacity-45 disabled:cursor-not-allowed text-[#FFF8E7] font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Checkout Wholesale Order</span>
                <ArrowRight className="w-4 h-4 text-[#E1AD01]" />
              </button>

              <a
                href={wholesaleWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order Wholesale via WhatsApp</span>
              </a>
            </div>
          </aside>
        </div>
      </div>

      {/* Wholesale Checkout Modal */}
      {isCheckoutOpen && (
        <div
          onClick={() => {
            setIsCheckoutOpen(false);
            setCompletedOrder(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#1B4D2E]/20 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-[#1B4D2E] text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-display font-bold text-xl text-[#FFF8E7]">
                  {completedOrder ? 'Wholesale Order Logged!' : 'Complete Wholesale Order'}
                </h3>
                <p className="text-xs text-[#E1AD01]">
                  {completedOrder
                    ? 'Thank you for partnering with Delightful Juices'
                    : `${totalCases} cases (${totalBottles} bottles) · ${selectedDeliveryOption.shortLabel}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCompletedOrder(null);
                }}
                aria-label="Close wholesale checkout modal"
                className="p-1.5 text-white/75 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {completedOrder ? (
                <div className="text-center py-4 space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="text-xs uppercase font-bold text-[#1B4D2E]/60 tracking-wider">
                      Wholesale Order Reference
                    </span>
                    <div className="font-display font-black text-3xl text-[#1B4D2E] mt-0.5">
                      {completedOrder.orderNumber}
                    </div>
                  </div>

                  <div className="bg-[#FFF8E7] p-4 rounded-2xl border border-[#1B4D2E]/15 text-left text-xs space-y-2 tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-[#1B4D2E]/70">Business / Buyer:</span>
                      <span className="font-bold text-[#1B4D2E]">
                        {completedOrder.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#1B4D2E]/70">Delivery Option:</span>
                      <span className="font-bold text-[#1B4D2E]">
                        {completedOrder.deliveryTimeSlot || completedOrder.deliveryMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#1B4D2E]/70">Delivery Fee:</span>
                      <span className="font-bold text-[#1B4D2E]">
                        ${completedOrder.deliveryFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#1B4D2E]/70">Order Total:</span>
                      <span className="font-black text-sm text-[#1B4D2E]">
                        ${completedOrder.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {stripeNotice && (
                    <div className="p-3.5 bg-amber-50 text-amber-950 border border-amber-300 rounded-2xl text-xs text-left leading-relaxed">
                      <strong className="block font-bold mb-0.5">Payment Note:</strong>
                      {stripeNotice}
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={`https://wa.me/${content.whatsappNumber}?text=${encodeURIComponent(
                        `Hello Delightful Juices Wholesale! Order *${completedOrder.orderNumber}* ($${completedOrder.total.toFixed(
                          2
                        )}) has been submitted for *${completedOrder.customerName}*.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl text-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Wholesale Copy on WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setCompletedOrder(null);
                      }}
                      className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3 px-5 rounded-xl text-xs cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleWholesaleCheckoutSubmit} className="space-y-4">
                  {checkoutError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      {checkoutError}
                    </div>
                  )}

                  <div className="bg-[#FFF8E7] p-3.5 rounded-2xl border border-[#1B4D2E]/15 flex items-center justify-between text-xs tabular-nums">
                    <div>
                      <span className="font-bold text-[#1B4D2E]">Cases: </span>
                      <span>
                        {totalCases} (${subtotal.toFixed(2)})
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-[#1B4D2E]">Delivery: </span>
                      <span>
                        {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="font-black text-sm text-[#1B4D2E]">
                      Total: ${grandTotal.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                        Business / Store Name
                      </label>
                      <div className="relative">
                        <Building2 className="w-3.5 h-3.5 text-[#1B4D2E]/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Valley Market / Cafe"
                          className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl pl-8 pr-3 py-2 text-xs text-[#1B4D2E]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Buyer Full Name"
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="(484) 792-8023"
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="purchasing@store.com"
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                      />
                    </div>
                  </div>

                  {/* Delivery Zone Verification Inside Modal */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1.5">
                      Delivery Travel Radius
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {activeDeliveryOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDeliveryZone(opt.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs cursor-pointer transition-all ${
                            selectedDeliveryOption.id === opt.id
                              ? 'bg-[#1B4D2E] text-[#FFF8E7] border-[#1B4D2E]'
                              : 'bg-[#FFF8E7] text-[#1B4D2E] border-[#1B4D2E]/20'
                          }`}
                        >
                          <div className="font-bold">{opt.shortLabel}</div>
                          <div className="text-[11px] font-extrabold tabular-nums">
                            {opt.fee === 0 ? 'Free' : `$${opt.fee.toFixed(2)}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {deliveryZone !== 'pickup' && (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                        Business Delivery Address *
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-[#1B4D2E]/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Street, Storefront / Loading Dock, City, State ZIP"
                          className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl pl-8 pr-3 py-2 text-xs text-[#1B4D2E]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                        Preferred Delivery Date
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                        Receiving / Dock Notes
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Receiving hours or instructions"
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                      />
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1.5">
                      Payment Method
                    </label>
                    <div className="space-y-2">
                      {content.stripe?.enabled !== false && (
                        <label
                          className={`flex items-center space-x-3 p-3 rounded-2xl border-2 cursor-pointer ${
                            paymentMethod === 'stripe_card'
                              ? 'bg-emerald-50/70 border-emerald-600'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="wholesale_payment"
                            checked={paymentMethod === 'stripe_card'}
                            onChange={() => setPaymentMethod('stripe_card')}
                            className="w-4 h-4 accent-emerald-700"
                          />
                          <div className="text-xs">
                            <div className="font-bold text-[#1B4D2E]">
                              Credit / Business Card (Stripe Checkout)
                            </div>
                            <div className="text-[#1B4D2E]/70">
                              Instant card payment with automated receipt
                            </div>
                          </div>
                        </label>
                      )}

                      <label
                        className={`flex items-center space-x-3 p-3 rounded-2xl border cursor-pointer ${
                          paymentMethod === 'zelle'
                            ? 'bg-[#FFF8E7] border-[#1B4D2E]'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="wholesale_payment"
                          checked={paymentMethod === 'zelle'}
                          onChange={() => setPaymentMethod('zelle')}
                          className="w-4 h-4 accent-[#1B4D2E]"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-[#1B4D2E]">
                            Zelle Business Transfer
                          </div>
                          <div className="text-[#1B4D2E]/70">
                            Send directly to (484) 792-8023 / Delightful Juices
                          </div>
                        </div>
                      </label>

                      <label
                        className={`flex items-center space-x-3 p-3 rounded-2xl border cursor-pointer ${
                          paymentMethod === 'cash_on_delivery'
                            ? 'bg-[#FFF8E7] border-[#1B4D2E]'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="wholesale_payment"
                          checked={paymentMethod === 'cash_on_delivery'}
                          onChange={() => setPaymentMethod('cash_on_delivery')}
                          className="w-4 h-4 accent-[#1B4D2E]"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-[#1B4D2E]">
                            Commercial Invoice / Pay on Delivery
                          </div>
                          <div className="text-[#1B4D2E]/70">
                            Settle upon chilled wholesale case arrival
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3.5 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer tabular-nums"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#E1AD01]" />
                    <span>
                      {isSubmitting
                        ? 'Submitting Wholesale Order...'
                        : `Submit Wholesale Order · $${grandTotal.toFixed(2)}`}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
