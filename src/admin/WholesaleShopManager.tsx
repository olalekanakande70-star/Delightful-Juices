import React, { useEffect, useRef, useState } from 'react';
import {
  WholesaleDeliveryConfig,
  WholesaleShopProductItem,
  WholesaleShopSettings,
  WholesaleSizeTierConfig,
} from '../types';
import { dataRepo, DEFAULT_WHOLESALE_SHOP } from '../lib/storage';
import { supabaseService } from '../lib/supabaseClient';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Save,
  ShoppingBag,
  Trash2,
  Truck,
  Upload,
  X,
} from 'lucide-react';

interface WholesaleShopManagerProps {
  onToast: (msg: string) => void;
  onPreviewPublic?: () => void;
}

const WHOLESALE_CATEGORY_OPTIONS: Array<{
  value: WholesaleShopProductItem['category'];
  label: string;
}> = [
  { value: 'zobo', label: 'Signature Zobo' },
  { value: 'ginger', label: 'Ginger Elixirs' },
  { value: 'milks', label: 'Artisanal Milks' },
];

export const WholesaleShopManager: React.FC<WholesaleShopManagerProps> = ({
  onToast,
  onPreviewPublic,
}) => {
  const [settings, setSettings] = useState<WholesaleShopSettings>(() => dataRepo.getWholesaleShop());
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIds, setUploadingIds] = useState<Record<string, boolean>>({});
  const latestSettingsRef = useRef<WholesaleShopSettings>(settings);
  const hasLocalEditsRef = useRef(false);

  const commitDraftSettings = (
    updater: WholesaleShopSettings | ((prev: WholesaleShopSettings) => WholesaleShopSettings),
    markDirty = true
  ) => {
    setSettings((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      latestSettingsRef.current = next;
      if (markDirty) {
        hasLocalEditsRef.current = true;
      }
      return next;
    });
  };

  useEffect(() => {
    const syncFromRepo = () => {
      if (hasLocalEditsRef.current) return;
      const live = dataRepo.getWholesaleShop();
      latestSettingsRef.current = live;
      setSettings(live);
    };
    syncFromRepo();
    const unsubscribe = dataRepo.subscribe(syncFromRepo);
    return unsubscribe;
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const current = latestSettingsRef.current;
    const ordered: WholesaleShopSettings = {
      ...current,
      products: current.products.map((p, idx) => ({
        ...p,
        displayOrder: idx + 1,
      })),
    };
    const res = await dataRepo.saveWholesaleShop(ordered);
    setIsSaving(false);

    if (res.synced) {
      hasLocalEditsRef.current = false;
      const saved = dataRepo.getWholesaleShop();
      latestSettingsRef.current = saved;
      setSettings(saved);
      onToast('Wholesale Shop products, tiers & delivery rates published live!');
    } else {
      onToast(`Unable to save Wholesale Shop: ${res.error || 'Database sync issue'}`);
    }
  };

  const handleResetDefaults = () => {
    const freshDefaults: WholesaleShopSettings = {
      ...DEFAULT_WHOLESALE_SHOP,
      products: DEFAULT_WHOLESALE_SHOP.products.map((p) => ({ ...p })),
      sizeTiers: DEFAULT_WHOLESALE_SHOP.sizeTiers.map((t) => ({ ...t })),
      deliveryOptions: DEFAULT_WHOLESALE_SHOP.deliveryOptions.map((d) => ({ ...d })),
    };
    commitDraftSettings(freshDefaults, true);
    onToast('Loaded default Wholesale Shop pricing & 6 flavors. Click Save & Publish to apply.');
  };

  const handleUpdateTier = (
    size: WholesaleSizeTierConfig['size'],
    patch: Partial<WholesaleSizeTierConfig>
  ) => {
    commitDraftSettings((prev) => ({
      ...prev,
      sizeTiers: prev.sizeTiers.map((tier) =>
        tier.size === size ? { ...tier, ...patch } : tier
      ),
    }));
  };

  const handleUpdateDelivery = (
    id: WholesaleDeliveryConfig['id'],
    patch: Partial<WholesaleDeliveryConfig>
  ) => {
    commitDraftSettings((prev) => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.map((opt) =>
        opt.id === id ? { ...opt, ...patch } : opt
      ),
    }));
  };

  const handleAddProduct = () => {
    commitDraftSettings((prev) => {
      const newItem: WholesaleShopProductItem = {
        id: `ws-prod-${Date.now()}`,
        name: 'New Wholesale Juice Flavor',
        shortName: 'New Flavor',
        category: 'ginger',
        categoryLabel: 'Ginger Elixirs',
        tagline: 'Cold-pressed 12-pack commercial wholesale case for stores and cafes',
        imageUrl: '',
        inStock: true,
        published: true,
        displayOrder: prev.products.length + 1,
      };
      return {
        ...prev,
        products: [...prev.products, newItem],
      };
    });
  };

  const handleUpdateProduct = (id: string, patch: Partial<WholesaleShopProductItem>) => {
    commitDraftSettings((prev) => ({
      ...prev,
      products: prev.products.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        if (patch.category) {
          const catMatch = WHOLESALE_CATEGORY_OPTIONS.find((c) => c.value === patch.category);
          if (catMatch) next.categoryLabel = catMatch.label;
        }
        return next;
      }),
    }));
  };

  const handleDeleteProduct = (id: string) => {
    commitDraftSettings((prev) => ({
      ...prev,
      products: prev.products
        .filter((p) => p.id !== id)
        .map((p, idx) => ({ ...p, displayOrder: idx + 1 })),
    }));
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    commitDraftSettings((prev) => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.products.length) return prev;
      const copy = [...prev.products];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIdx, 0, moved);
      return {
        ...prev,
        products: copy.map((p, idx) => ({ ...p, displayOrder: idx + 1 })),
      };
    });
  };

  const handleRemoveProductImage = async (productId: string) => {
    const current = latestSettingsRef.current;
    const nextSettings: WholesaleShopSettings = {
      ...current,
      products: current.products.map((p) =>
        p.id === productId ? { ...p, imageUrl: '' } : p
      ),
    };
    latestSettingsRef.current = nextSettings;
    setSettings(nextSettings);

    const saveRes = await dataRepo.saveWholesaleShop(nextSettings);
    if (saveRes.synced) {
      hasLocalEditsRef.current = false;
      const saved = dataRepo.getWholesaleShop();
      latestSettingsRef.current = saved;
      setSettings(saved);
      onToast('Wholesale product photo removed & synced.');
    } else {
      hasLocalEditsRef.current = true;
      onToast(`Photo cleared locally; click Save & Publish to sync (${saveRes.error || 'pending'}).`);
    }
  };

  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    productId: string
  ) => {
    const inputEl = e.target;
    const file = inputEl.files?.[0];
    if (!file) {
      inputEl.value = '';
      return;
    }

    setUploadingIds((prev) => ({ ...prev, [productId]: true }));
    try {
      const ext = file.name.split('.').pop() || 'png';
      const storagePath = `wholesale-shop/${Date.now()}-${productId}.${ext}`;
      const res = await supabaseService.uploadAsset('delightful_assets', storagePath, file);
      if (res.url) {
        const current = latestSettingsRef.current;
        const nextSettings: WholesaleShopSettings = {
          ...current,
          showProductImages: true,
          products: current.products.map((p) =>
            p.id === productId ? { ...p, imageUrl: res.url! } : p
          ),
        };
        latestSettingsRef.current = nextSettings;
        setSettings(nextSettings);
        const saveRes = await dataRepo.saveWholesaleShop(nextSettings);
        if (saveRes.synced) {
          hasLocalEditsRef.current = false;
          const saved = dataRepo.getWholesaleShop();
          latestSettingsRef.current = saved;
          setSettings(saved);
          onToast('Wholesale product image uploaded & displayed live on /wholesale!');
        } else {
          hasLocalEditsRef.current = true;
          onToast(
            `Image uploaded, click Save & Publish to sync (${saveRes.error || 'Database sync pending'}).`
          );
        }
      } else {
        onToast(`Upload error: ${res.error || 'Unable to upload product photo'}`);
      }
    } catch (err: any) {
      onToast(`Upload failed: ${err?.message || 'Error uploading file'}`);
    } finally {
      setUploadingIds((prev) => ({ ...prev, [productId]: false }));
      inputEl.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-6xl">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/15 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-widest text-[#1B4D2E]">
            <ShoppingBag className="w-4 h-4 text-[#E1AD01]" />
            <span>Wholesale Storefront CMS</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1B4D2E]">
            Shop Wholesale Products Manager
          </h2>
          <p className="text-xs sm:text-sm text-[#1B4D2E]/80 leading-relaxed">
            Edit your 6 wholesale juice flavors, 12-pack bottle size pricing tiers (1–10, 10–20, 20–30 cases), and travel radius delivery rates shown live on <strong>/wholesale</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onPreviewPublic && (
            <button
              type="button"
              onClick={onPreviewPublic}
              className="bg-[#FFF8E7] hover:bg-[#1B4D2E]/10 text-[#1B4D2E] border border-[#1B4D2E]/20 font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
            >
              View Wholesale Page
            </button>
          )}

          <button
            type="button"
            onClick={handleResetDefaults}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
          >
            <Save className="w-4 h-4 text-[#E1AD01]" />
            <span>{isSaving ? 'Publishing Live...' : 'Save & Publish Wholesale Shop'}</span>
          </button>
        </div>
      </div>

      {/* Section Copy & Visibility */}
      <div className="bg-white rounded-3xl p-6 border border-[#1B4D2E]/15 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
              Section Copy &amp; Visibility
            </h3>
            <p className="text-xs text-[#1B4D2E]/70">
              Control the heading, description, and whether the Shop Wholesale Products section renders on /wholesale.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="inline-flex items-center space-x-2.5 bg-[#FFF8E7] px-4 py-2 rounded-xl border border-[#1B4D2E]/15 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showProductImages === true}
                onChange={(e) =>
                  commitDraftSettings((prev) => ({
                    ...prev,
                    showProductImages: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-[#1B4D2E]"
              />
              <span className="text-xs font-bold text-[#1B4D2E]">
                Show Product Images on /wholesale
              </span>
            </label>

            <label className="inline-flex items-center space-x-2.5 bg-[#FFF8E7] px-4 py-2 rounded-xl border border-[#1B4D2E]/15 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled !== false}
                onChange={(e) =>
                  commitDraftSettings((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="w-4 h-4 accent-[#1B4D2E]"
              />
              <span className="text-xs font-bold text-[#1B4D2E]">
                Show Section on /wholesale
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
              Kicker Label
            </label>
            <input
              type="text"
              value={settings.kicker}
              onChange={(e) =>
                commitDraftSettings((prev) => ({ ...prev, kicker: e.target.value }))
              }
              className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2.5 font-semibold text-[#1B4D2E]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
              Section Heading
            </label>
            <input
              type="text"
              value={settings.heading}
              onChange={(e) =>
                commitDraftSettings((prev) => ({ ...prev, heading: e.target.value }))
              }
              className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2.5 font-bold text-[#1B4D2E]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
              Section Description
            </label>
            <textarea
              rows={2}
              value={settings.subheading}
              onChange={(e) =>
                commitDraftSettings((prev) => ({ ...prev, subheading: e.target.value }))
              }
              className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-[#1B4D2E]"
            />
          </div>
        </div>
      </div>

      {/* 12-Pack Volume Tier Pricing Schedule */}
      <div className="bg-white rounded-3xl p-6 border border-[#1B4D2E]/15 shadow-xs space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
            12-Pack Wholesale Case Pricing &amp; Volume Tiers
          </h3>
          <p className="text-xs text-[#1B4D2E]/70">
            Configure case prices per bottle size (12 bottles per case) across 1–10, 10–20, and 20–30 case tiers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {settings.sizeTiers.map((tier) => (
            <div
              key={tier.size}
              className="bg-[#FFF8E7] rounded-2xl p-4 border border-[#1B4D2E]/15 space-y-3 text-xs tabular-nums"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#1B4D2E]/10">
                <span className="font-display font-black text-base text-[#1B4D2E]">
                  {tier.size} Case
                </span>
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tier.enabled !== false}
                    onChange={(e) => handleUpdateTier(tier.size, { enabled: e.target.checked })}
                    className="w-3.5 h-3.5 accent-[#1B4D2E]"
                  />
                  <span className="text-[11px] font-bold text-[#1B4D2E]">Active</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1B4D2E]/70 uppercase mb-1">
                  Display Label
                </label>
                <input
                  type="text"
                  value={tier.label}
                  onChange={(e) => handleUpdateTier(tier.size, { label: e.target.value })}
                  className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-2.5 py-1.5 font-semibold text-[#1B4D2E]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#1B4D2E]/70 mb-1">
                    1–10 cs ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={tier.baseCasePrice}
                    onChange={(e) =>
                      handleUpdateTier(tier.size, {
                        baseCasePrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-2 py-1.5 font-extrabold text-[#1B4D2E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#1B4D2E]/70 mb-1">
                    10–20 cs ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={tier.tier2CasePrice}
                    onChange={(e) =>
                      handleUpdateTier(tier.size, {
                        tier2CasePrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-2 py-1.5 font-extrabold text-[#1B4D2E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#1B4D2E]/70 mb-1">
                    20–30 cs ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={tier.tier3CasePrice}
                    onChange={(e) =>
                      handleUpdateTier(tier.size, {
                        tier3CasePrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-2 py-1.5 font-extrabold text-emerald-800"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wholesale Delivery Zones & Fees */}
      <div className="bg-white rounded-3xl p-6 border border-[#1B4D2E]/15 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-[#1B4D2E]" />
          <div>
            <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
              Wholesale Delivery Radius &amp; Fees
            </h3>
            <p className="text-xs text-[#1B4D2E]/70">
              Adjust travel radius delivery rates ($0 under 1 hr travel radius, $100 for 2 hrs+, or Kitchen Pickup).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {settings.deliveryOptions.map((opt) => (
            <div
              key={opt.id}
              className="bg-[#FFF8E7] rounded-2xl p-4 border border-[#1B4D2E]/15 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1B4D2E]/10">
                <span className="font-bold text-[#1B4D2E]">{opt.shortLabel}</span>
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opt.enabled !== false}
                    onChange={(e) => handleUpdateDelivery(opt.id, { enabled: e.target.checked })}
                    className="w-3.5 h-3.5 accent-[#1B4D2E]"
                  />
                  <span className="text-[11px] font-bold text-[#1B4D2E]">Enabled</span>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-[#1B4D2E]/70 uppercase mb-1">
                    Short Label
                  </label>
                  <input
                    type="text"
                    value={opt.shortLabel}
                    onChange={(e) => handleUpdateDelivery(opt.id, { shortLabel: e.target.value })}
                    className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-2.5 py-1.5 font-semibold text-[#1B4D2E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#1B4D2E]/70 uppercase mb-1">
                    Fee ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={opt.fee}
                    onChange={(e) =>
                      handleUpdateDelivery(opt.id, { fee: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-2 py-1.5 font-extrabold text-[#1B4D2E] tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1B4D2E]/70 uppercase mb-1">
                  Full Option Label
                </label>
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handleUpdateDelivery(opt.id, { label: e.target.value })}
                  className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-2.5 py-1.5 text-[#1B4D2E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1B4D2E]/70 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={opt.description}
                  onChange={(e) => handleUpdateDelivery(opt.id, { description: e.target.value })}
                  className="w-full bg-white border border-[#1B4D2E]/20 rounded-xl px-2.5 py-1.5 text-[#1B4D2E]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wholesale Products List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-xl text-[#1B4D2E]">
              Wholesale Flavors &amp; Case Catalog ({settings.products.length})
            </h3>
            <p className="text-xs text-[#1B4D2E]/70">
              Edit names, descriptions, pricing categories, availability, and optional product photos for each wholesale case item.{' '}
              <span className="font-semibold text-[#1B4D2E]">
                {settings.showProductImages === true
                  ? '(Product images are currently visible on /wholesale.)'
                  : '(Product images are currently hidden on /wholesale — enable "Show Product Images on /wholesale" above to display them.)'}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddProduct}
            className="inline-flex items-center space-x-1.5 bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-black text-xs px-4 py-2.5 rounded-xl shadow-xs cursor-pointer self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add Wholesale Product</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settings.products.map((item, index) => {
            const hasUrl = Boolean(item.imageUrl?.trim());
            const isUploadingThis = Boolean(uploadingIds[item.id]);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border overflow-hidden shadow-xs flex flex-col justify-between transition-all ${
                  item.published !== false
                    ? 'border-[#1B4D2E]/15 hover:border-[#1B4D2E]/35'
                    : 'border-gray-200 opacity-65 bg-gray-50'
                }`}
              >
                <div>
                  {/* Image Preview */}
                  <div className="relative aspect-16/10 bg-[#FFF8E7] border-b border-[#1B4D2E]/10 overflow-hidden">
                    {hasUrl ? (
                      <img
                        key={item.imageUrl}
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-3"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#1B4D2E]/60 space-y-1.5">
                        <ImageIcon className="w-8 h-8 text-[#E1AD01]" />
                        <span className="text-xs font-semibold">No Photo Set</span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span className="bg-[#1B4D2E] text-[#FFF8E7] text-[10px] font-black px-2 py-1 rounded-md tabular-nums">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateProduct(item.id, { published: item.published === false })
                        }
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md cursor-pointer flex items-center space-x-1 ${
                          item.published !== false
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {item.published !== false ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/60 backdrop-blur-xs p-1 rounded-lg">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveProduct(index, 'up')}
                        className="p-1 text-white hover:text-[#E1AD01] disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === settings.products.length - 1}
                        onClick={() => handleMoveProduct(index, 'down')}
                        className="p-1 text-white hover:text-[#E1AD01] disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center space-x-1.5">
                      {hasUrl && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProductImage(item.id)}
                          className="bg-red-600/90 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center space-x-1 shadow-xs"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                      <label className="bg-[#1B4D2E] hover:bg-[#143822] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center space-x-1 shadow-xs">
                        <Upload className="w-3 h-3 text-[#E1AD01]" />
                        <span>{isUploadingThis ? 'Uploading...' : hasUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingThis}
                          onChange={(e) => handleProductImageUpload(e, item.id)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Product Edit Fields */}
                  <div className="p-5 space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateProduct(item.id, { name: e.target.value })}
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 font-bold text-[#1B4D2E]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                          Short Label
                        </label>
                        <input
                          type="text"
                          value={item.shortName}
                          onChange={(e) =>
                            handleUpdateProduct(item.id, { shortName: e.target.value })
                          }
                          className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-2.5 py-2 text-[#1B4D2E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                          Category
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) =>
                            handleUpdateProduct(item.id, {
                              category: e.target.value as WholesaleShopProductItem['category'],
                            })
                          }
                          className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-2.5 py-2 font-semibold text-[#1B4D2E]"
                        >
                          {WHOLESALE_CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                        Tagline / Description
                      </label>
                      <textarea
                        rows={2}
                        value={item.tagline}
                        onChange={(e) => handleUpdateProduct(item.id, { tagline: e.target.value })}
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-[#1B4D2E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={item.imageUrl}
                        onChange={(e) =>
                          handleUpdateProduct(item.id, { imageUrl: e.target.value })
                        }
                        placeholder="/assets/aistudio/... or https://..."
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-1.5 text-[11px] font-mono text-[#1B4D2E]"
                      />
                      {hasUrl && settings.showProductImages !== true && (
                        <button
                          type="button"
                          onClick={() =>
                            commitDraftSettings((prev) => ({
                              ...prev,
                              showProductImages: true,
                            }))
                          }
                          className="mt-1.5 text-[10px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                        >
                          Images are currently hidden on /wholesale — click to enable display
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-5 pb-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <label className="inline-flex items-center space-x-1.5 cursor-pointer font-bold text-[#1B4D2E]">
                    <input
                      type="checkbox"
                      checked={item.inStock !== false}
                      onChange={(e) =>
                        handleUpdateProduct(item.id, { inStock: e.target.checked })
                      }
                      className="w-3.5 h-3.5 accent-[#1B4D2E]"
                    />
                    <span>{item.inStock !== false ? 'In Stock' : 'Out of Stock'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(item.id)}
                    className="text-red-600 hover:text-red-700 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Save Strip */}
      <div className="p-4 sm:p-5 bg-[#1B4D2E] rounded-2xl text-[#FFF8E7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <CheckCircle2 className="w-5 h-5 text-[#E1AD01] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            Changes sync immediately to your /wholesale Storefront &amp; live Supabase database once saved.
          </span>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-black text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          {isSaving ? 'Publishing...' : 'Save & Publish Wholesale Shop'}
        </button>
      </div>
    </div>
  );
};
