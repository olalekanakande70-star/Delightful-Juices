import React, { useState } from 'react';
import { HeroSlide, SiteContent, CmsPage } from '../types';
import { dataRepo } from '../lib/storage';
import { supabaseService } from '../lib/supabaseClient';
import { HeroSlider } from '../components/HeroSlider';
import {
  Plus,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Sparkles,
} from 'lucide-react';

interface HeroSliderManagerProps {
  slides: HeroSlide[];
  content: SiteContent;
  cmsPages: CmsPage[];
  supabaseConnected: boolean;
  onToast: (msg: string) => void;
}

export const HeroSliderManager: React.FC<HeroSliderManagerProps> = ({
  slides,
  content,
  cmsPages,
  supabaseConnected,
  onToast,
}) => {
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isNewSlide, setIsNewSlide] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<'desktop' | 'mobile' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const sortedSlides = [...slides].sort((a, b) => a.displayOrder - b.displayOrder);

  const quickDestinationOptions = [
    { label: 'Shop Now (/shop)', url: '/shop' },
    { label: 'Home (/)', url: '/' },
    { label: 'About Us (/about-us)', url: '/about-us' },
    { label: 'Events & Catering (/events-catering)', url: '/events-catering' },
    { label: 'Wholesale & Retail (/wholesale)', url: '/wholesale' },
    { label: 'Contact Us (/contact-us)', url: '/contact-us' },
    ...cmsPages
      .filter(
        (p) =>
          p.status === 'published' &&
          !['about-us', 'events-catering', 'wholesale', 'contact-us'].includes(p.slug)
      )
      .map((p) => ({ label: `${p.title} (/${p.slug})`, url: `/${p.slug}` })),
  ];

  const handleCreateSlide = () => {
    const nextOrder = sortedSlides.length + 1;
    const blank: HeroSlide = {
      id: `slide-${Date.now()}`,
      heading: 'Fresh Cold-Pressed Botanical Juices',
      subheading:
        'Handcrafted daily in Quakertown, PA using whole hibiscus flowers, fresh organic ginger, and ripe tropical fruits.',
      kicker: 'NATURALLY MADE • HEALTHY SIPS',
      ctaLabel: 'Shop Now',
      ctaUrl: '/shop',
      secondaryCtaLabel: 'Our Story',
      secondaryCtaUrl: '/about-us',
      desktopImageUrl: '',
      mobileImageUrl: '',
      overlayOpacity: 0.52,
      displayOrder: nextOrder,
      active: true,
    };
    setUploadError(null);
    setIsNewSlide(true);
    setEditingSlide(blank);
  };

  const handleMoveSlide = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sortedSlides.length) return;
    const reordered = [...sortedSlides];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    const updated = reordered.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));
    const res = await dataRepo.saveHeroSlides(updated);
    if (!res.synced) {
      onToast(`Unable to update live slide order: ${res.error}`);
    } else {
      onToast('Hero slide display order published live!');
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    const res = await dataRepo.upsertHeroSlide({ ...slide, active: !slide.active });
    if (!res.synced) {
      onToast(`Unable to update live slide status: ${res.error}`);
    } else {
      onToast(`Slide "${slide.heading.slice(0, 28)}..." ${!slide.active ? 'enabled' : 'disabled'} on live site.`);
    }
  };

  const handleDeleteConfirmed = async (id: string) => {
    const res = await dataRepo.deleteHeroSlide(id);
    setConfirmDeleteId(null);
    if (!res.synced) {
      onToast(`Unable to delete slide from live database: ${res.error}`);
    } else {
      onToast('Hero slide deleted from live database.');
    }
  };

  const handleImageFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'desktop' | 'mobile'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingSlide) return;

    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image exceeds 8MB limit. Please choose a smaller high-resolution photo.');
      return;
    }

    setUploadingField(field);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const storagePath = `sliders/${editingSlide.id}-${field}-${Date.now()}.${ext}`;
      const res = await supabaseService.uploadAsset('delightful_assets', storagePath, file);
      setUploadingField(null);

      if (res.url) {
        if (field === 'desktop') {
          const prevMobile = (editingSlide.mobileImageUrl || '').trim();
          const shouldClearLegacyMobile =
            prevMobile === editingSlide.desktopImageUrl ||
            prevMobile.startsWith('/src/assets/') ||
            prevMobile.startsWith('/assets/hero_');
          setEditingSlide({
            ...editingSlide,
            desktopImageUrl: res.url,
            mobileImageUrl: shouldClearLegacyMobile ? '' : editingSlide.mobileImageUrl,
          });
        } else {
          setEditingSlide({
            ...editingSlide,
            mobileImageUrl: res.url,
          });
        }
        onToast(
          `${field === 'desktop' ? 'Desktop' : 'Mobile'} slider image uploaded to live Supabase Storage!`
        );
        return;
      }

      setUploadError(
        `Live Supabase Storage upload failed (${res.error || 'Unknown error'}). Ensure the SQL migration has been run to initialize the public 'delightful_assets' bucket.`
      );
    } catch (err: any) {
      setUploadingField(null);
      setUploadError(err?.message || 'Failed to upload slider image to live storage.');
    }
  };

  const handleSaveSlideForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    if (!editingSlide.heading.trim()) {
      setUploadError('Slide heading is required.');
      return;
    }
    if (!editingSlide.desktopImageUrl.trim()) {
      setUploadError('A desktop slider image is required.');
      return;
    }

    const res = await dataRepo.upsertHeroSlide(editingSlide);
    if (!res.synced) {
      setUploadError(
        `Live Supabase database rejected the update: ${res.error}`
      );
      return;
    }

    setEditingSlide(null);
    setIsNewSlide(false);
    onToast(
      supabaseConnected || res.synced
        ? 'Hero slide published to live Supabase database!'
        : isNewSlide
        ? 'New hero slide published!'
        : 'Hero slide changes published!'
    );
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
            Hero Slider Management
          </h2>
          <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
            Upload promotional imagery, manage Ken Burns motion slides, customize CTAs, and reorder homepage slides dynamically
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="bg-white hover:bg-[#FFF8E7] text-[#1B4D2E] border border-[#1B4D2E]/20 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#E1AD01]" />
            <span>{showLivePreview ? 'Hide Live Slider Preview' : 'Preview Full Slider'}</span>
          </button>

          <button
            type="button"
            onClick={handleCreateSlide}
            className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#E1AD01]" />
            <span>Add New Slide</span>
          </button>
        </div>
      </div>

      {/* Interactive Full-Width Preview */}
      {showLivePreview && (
        <div className="bg-white p-4 rounded-3xl border-2 border-[#E1AD01] shadow-lg space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-[#1B4D2E]">
              <Sparkles className="w-4 h-4 text-[#E1AD01]" />
              <span>LIVE HOMEPAGE HERO SLIDER PREVIEW (ACTIVE SLIDES)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowLivePreview(false)}
              className="text-xs text-gray-500 hover:text-black font-bold cursor-pointer"
            >
              Close Preview
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-[#1B4D2E]/15">
            <HeroSlider
              slides={sortedSlides.filter((s) => s.active)}
              content={content}
              onNavigate={() => {}}
            />
          </div>
        </div>
      )}

      {/* Slides List */}
      <div className="space-y-4">
        {sortedSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
              slide.active ? 'border-[#1B4D2E]/15' : 'border-gray-200 opacity-70'
            }`}
          >
            {/* Thumbnail + Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
              <div className="relative w-full sm:w-44 aspect-16/9 rounded-2xl overflow-hidden bg-[#12351F] border border-[#1B4D2E]/15 shrink-0 flex items-center justify-center">
                {slide.desktopImageUrl ? (
                  <img
                    src={slide.desktopImageUrl}
                    alt={slide.heading}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-[#E1AD01]/70" />
                )}
                <span className="absolute top-2 left-2 bg-black/70 text-[#E1AD01] text-[10px] font-black px-2 py-0.5 rounded-md">
                  Slide #{idx + 1}
                </span>
                {slide.mobileImageUrl && (
                  <span
                    className="absolute bottom-2 right-2 bg-[#1B4D2E]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-1"
                    title="Dedicated mobile image configured"
                  >
                    <Smartphone className="w-2.5 h-2.5 text-[#E1AD01]" />
                    <span>Mobile Crop</span>
                  </span>
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                      slide.active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {slide.active ? 'Published & Active' : 'Disabled / Hidden'}
                  </span>
                  {slide.kicker && (
                    <span className="text-[10px] font-bold text-[#1B4D2E]/70 uppercase tracking-wider truncate">
                      {slide.kicker}
                    </span>
                  )}
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-[#1B4D2E] truncate">
                  {slide.heading}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-2">{slide.subheading}</p>

                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="bg-[#FFF8E7] border border-[#1B4D2E]/15 px-2.5 py-0.5 rounded-md font-bold text-[#1B4D2E]">
                    Primary CTA: {slide.ctaLabel} → <code className="font-mono">{slide.ctaUrl}</code>
                  </span>
                  {slide.secondaryCtaLabel && (
                    <span className="bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-md text-gray-600">
                      Secondary: {slide.secondaryCtaLabel} →{' '}
                      <code className="font-mono">{slide.secondaryCtaUrl}</code>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Ordering & Action Controls */}
            <div className="flex flex-wrap items-center gap-2 self-end lg:self-center shrink-0">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveSlide(idx, -1)}
                  className="p-2 text-[#1B4D2E] hover:bg-[#FFF8E7] disabled:opacity-30 cursor-pointer"
                  title="Move Slide Earlier"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === sortedSlides.length - 1}
                  onClick={() => handleMoveSlide(idx, 1)}
                  className="p-2 text-[#1B4D2E] hover:bg-[#FFF8E7] disabled:opacity-30 cursor-pointer border-l border-gray-200"
                  title="Move Slide Later"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleToggleActive(slide)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 border cursor-pointer ${
                  slide.active
                    ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {slide.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{slide.active ? 'Disable' : 'Enable'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUploadError(null);
                  setIsNewSlide(false);
                  setEditingSlide({ ...slide });
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FFF8E7] hover:bg-[#E1AD01]/30 text-[#1B4D2E] border border-[#1B4D2E]/15 flex items-center space-x-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              {confirmDeleteId === slide.id ? (
                <div className="flex items-center space-x-1 bg-red-50 border border-red-200 px-2 py-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleDeleteConfirmed(slide.id)}
                    className="text-[11px] font-extrabold bg-red-600 text-white px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-[11px] font-bold text-gray-600 px-2 py-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(slide.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete Slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Slide Modal */}
      {editingSlide && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 max-h-[92vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-display font-bold text-xl text-[#1B4D2E]">
                  {isNewSlide ? 'Create New Hero Slide' : 'Edit Hero Slide'}
                </h3>
                <p className="text-xs text-gray-500">
                  Changes sync automatically to Supabase and update the public homepage slider
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="text-gray-400 hover:text-black p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Single-Slide Visual Preview */}
            <div className="rounded-2xl overflow-hidden border border-[#1B4D2E]/20 relative aspect-21/9 bg-gradient-to-br from-[#0E2918] via-[#12351F] to-[#1B4D2E]">
              {editingSlide.desktopImageUrl && (
                <img
                  src={editingSlide.desktopImageUrl}
                  alt="Slide preview"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0E2918]/80 via-[#12351F]/60 to-[#12351F]/25 flex items-center p-6">
                <div className="max-w-lg space-y-2 text-white">
                  {editingSlide.kicker && (
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#E1AD01]">
                      {editingSlide.kicker}
                    </div>
                  )}
                  <div className="font-display font-extrabold text-lg sm:text-2xl leading-tight">
                    {editingSlide.heading || 'Slide Heading Preview'}
                  </div>
                  <p className="text-xs text-white/85 line-clamp-2">{editingSlide.subheading}</p>
                  <div className="pt-1 flex items-center space-x-2">
                    <span className="bg-[#E1AD01] text-[#1B4D2E] text-[11px] font-extrabold px-3 py-1.5 rounded-lg">
                      {editingSlide.ctaLabel || 'Shop Now'}
                    </span>
                    {editingSlide.secondaryCtaLabel && (
                      <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border border-white/30">
                        {editingSlide.secondaryCtaLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="absolute top-2.5 right-2.5 bg-black/65 text-[#E1AD01] text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                Live Slide Preview
              </span>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlideForm} className="space-y-4 text-xs">
              {/* Desktop & Mobile Image Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#FFF8E7] rounded-2xl border border-[#1B4D2E]/15">
                {/* Desktop Image */}
                <div className="space-y-2">
                  <label className="font-bold text-[#1B4D2E] flex items-center space-x-1.5">
                    <Monitor className="w-3.5 h-3.5 text-[#1B4D2E]" />
                    <span>Desktop Banner Image (16:9 Recommended) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.desktopImageUrl}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, desktopImageUrl: e.target.value })
                    }
                    placeholder="https://... or upload from device"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                  />
                  <div className="flex items-center space-x-2">
                    <label className="bg-[#1B4D2E] hover:bg-[#143822] text-white font-bold text-[11px] py-2 px-3.5 rounded-xl flex items-center space-x-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-[#E1AD01]" />
                      <span>
                        {uploadingField === 'desktop'
                          ? 'Uploading Desktop Image...'
                          : 'Upload Desktop Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingField !== null}
                        onChange={(e) => handleImageFileUpload(e, 'desktop')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Mobile Image */}
                <div className="space-y-2">
                  <label className="font-bold text-[#1B4D2E] flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#1B4D2E]" />
                    <span>Mobile Image (Optional Portrait/Square Crop)</span>
                  </label>
                  <input
                    type="text"
                    value={editingSlide.mobileImageUrl || ''}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, mobileImageUrl: e.target.value })
                    }
                    placeholder="Uses Desktop image automatically if left blank"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#1B4D2E]"
                  />
                  <div className="flex items-center space-x-2">
                    <label className="bg-white hover:bg-gray-100 text-[#1B4D2E] border border-[#1B4D2E]/20 font-bold text-[11px] py-2 px-3.5 rounded-xl flex items-center space-x-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-[#1B4D2E]" />
                      <span>
                        {uploadingField === 'mobile'
                          ? 'Uploading Mobile Image...'
                          : 'Upload Mobile Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingField !== null}
                        onChange={(e) => handleImageFileUpload(e, 'mobile')}
                        className="hidden"
                      />
                    </label>
                    {editingSlide.mobileImageUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingSlide({ ...editingSlide, mobileImageUrl: '' })}
                        className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Copy Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Eyebrow Kicker Text</label>
                  <input
                    type="text"
                    value={editingSlide.kicker || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, kicker: e.target.value })}
                    placeholder="e.g. FRESH COLD-PRESSED IN QUAKERTOWN, PA"
                    className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl p-2.5 text-[#1B4D2E]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">
                    Overlay Contrast ({Math.round(editingSlide.overlayOpacity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.25"
                    max="0.80"
                    step="0.05"
                    value={editingSlide.overlayOpacity}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        overlayOpacity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-[#1B4D2E] mt-2 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Main Slide Heading *</label>
                <input
                  type="text"
                  required
                  value={editingSlide.heading}
                  onChange={(e) => setEditingSlide({ ...editingSlide, heading: e.target.value })}
                  className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl p-2.5 font-bold text-sm text-[#1B4D2E]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Supporting Text / Subheading</label>
                <textarea
                  rows={2}
                  value={editingSlide.subheading}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subheading: e.target.value })}
                  className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl p-2.5 text-[#1B4D2E]"
                />
              </div>

              {/* Primary & Secondary Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="font-bold text-[#1B4D2E]">Primary Call-to-Action Button</div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                      Button Label
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSlide.ctaLabel}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, ctaLabel: e.target.value })
                      }
                      placeholder="Shop Now"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold text-[#1B4D2E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                      Destination URL
                    </label>
                    <select
                      value={
                        quickDestinationOptions.some((o) => o.url === editingSlide.ctaUrl)
                          ? editingSlide.ctaUrl
                          : '__custom__'
                      }
                      onChange={(e) => {
                        if (e.target.value !== '__custom__') {
                          setEditingSlide({ ...editingSlide, ctaUrl: e.target.value });
                        }
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs mb-1.5 text-[#1B4D2E]"
                    >
                      {quickDestinationOptions.map((opt) => (
                        <option key={opt.url} value={opt.url}>
                          {opt.label}
                        </option>
                      ))}
                      <option value="__custom__">Custom URL / Path...</option>
                    </select>
                    <input
                      type="text"
                      value={editingSlide.ctaUrl}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, ctaUrl: e.target.value })
                      }
                      placeholder="/shop"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 font-mono text-[11px] text-[#1B4D2E]"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="font-bold text-[#1B4D2E]">
                    Secondary Button (Optional)
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                      Button Label (Leave empty to hide)
                    </label>
                    <input
                      type="text"
                      value={editingSlide.secondaryCtaLabel || ''}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, secondaryCtaLabel: e.target.value })
                      }
                      placeholder="e.g. Events & Catering"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1B4D2E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                      Secondary Destination URL
                    </label>
                    <select
                      value={
                        quickDestinationOptions.some(
                          (o) => o.url === (editingSlide.secondaryCtaUrl || '')
                        )
                          ? editingSlide.secondaryCtaUrl
                          : '__custom__'
                      }
                      onChange={(e) => {
                        if (e.target.value !== '__custom__') {
                          setEditingSlide({ ...editingSlide, secondaryCtaUrl: e.target.value });
                        }
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs mb-1.5 text-[#1B4D2E]"
                    >
                      {quickDestinationOptions.map((opt) => (
                        <option key={opt.url} value={opt.url}>
                          {opt.label}
                        </option>
                      ))}
                      <option value="__custom__">Custom URL / Path...</option>
                    </select>
                    <input
                      type="text"
                      value={editingSlide.secondaryCtaUrl || ''}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, secondaryCtaUrl: e.target.value })
                      }
                      placeholder="/events-catering"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 font-mono text-[11px] text-[#1B4D2E]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <label className="inline-flex items-center space-x-2 cursor-pointer font-bold text-[#1B4D2E]">
                  <input
                    type="checkbox"
                    checked={editingSlide.active}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, active: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#1B4D2E]"
                  />
                  <span>Publish Slide Immediately</span>
                </label>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingSlide(null)}
                    className="px-4 py-2.5 text-gray-600 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingField !== null}
                    className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold px-6 py-2.5 rounded-xl flex items-center space-x-2 shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#E1AD01]" />
                    <span>{isNewSlide ? 'Publish Slide' : 'Save Slide Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
