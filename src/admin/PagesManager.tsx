import React, { useState } from 'react';
import {
  CmsPage,
  PageSection,
  PageSectionType,
  Product,
  SiteContent,
  NavItem,
} from '../types';
import { dataRepo, FALLBACK_BEVERAGE_IMAGE } from '../lib/storage';
import { supabaseService } from '../lib/supabaseClient';
import { DynamicPageRenderer } from '../components/DynamicPageRenderer';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Upload,
  Globe,
  FileEdit,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';

interface PagesManagerProps {
  pages: CmsPage[];
  products: Product[];
  content: SiteContent;
  navItems: NavItem[];
  supabaseConnected: boolean;
  onToast: (msg: string) => void;
  onOpenPublicUrl: (url: string) => void;
}

const SECTION_TEMPLATES: { type: PageSectionType; label: string; desc: string }[] = [
  { type: 'hero', label: 'Hero Banner', desc: 'Full-width header image with headline & CTAs' },
  { type: 'image_text', label: 'Image + Text Split', desc: 'Two-column photo and rich story copy' },
  { type: 'text_only', label: 'Editorial Text Block', desc: 'Clean centered heading and paragraphs' },
  { type: 'full_image', label: 'Full-Width Image', desc: 'Large showcase photograph with caption' },
  { type: 'promo_banner', label: 'Promo / Announcement Strip', desc: 'Bold gold or forest green offer bar' },
  { type: 'featured_products', label: 'Featured Juices Grid', desc: 'Interactive shoppable product cards' },
  { type: 'image_gallery', label: 'Photo Gallery Grid', desc: 'Multi-image showcase with captions' },
  { type: 'cta', label: 'Call-to-Action Section', desc: 'Conversion block with primary & secondary buttons' },
  { type: 'catering_calculator', label: 'Live Catering Estimator', desc: 'Interactive event bottle calculator & inquiry form' },
  { type: 'wholesale_tiers', label: 'Wholesale Partner Tiers', desc: 'Restaurant, Retail & Corporate wholesale cards' },
  { type: 'contact_info', label: 'Contact Info & Message Form', desc: 'Quakertown kitchen address, hours & form' },
  { type: 'faq_list', label: 'FAQ Accordion', desc: 'Delivery, shelf-life & freshness answers' },
];

function slugifyTitle(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const PagesManager: React.FC<PagesManagerProps> = ({
  pages,
  products,
  content,
  navItems,
  supabaseConnected,
  onToast,
  onOpenPublicUrl,
}) => {
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [isNewPage, setIsNewPage] = useState(false);
  const [autoSlug, setAutoSlug] = useState(false);
  const [previewingPage, setPreviewingPage] = useState<CmsPage | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);

  const dropdownParents = navItems.filter((n) => !n.parentId && n.isDropdown);

  const handleInitNewPage = () => {
    const newPage: CmsPage = {
      id: `page-${Date.now()}`,
      title: '',
      slug: '',
      seoTitle: '',
      metaDescription: '',
      status: 'draft',
      showInNav: true,
      parentNavId: dropdownParents[0]?.id || null,
      sections: [
        {
          id: `sec-${Date.now()}-1`,
          type: 'hero',
          kicker: 'DELIGHTFUL JUICES',
          heading: 'New Page Headline',
          subheading: 'Introduce your story, seasonal promotion, or customer guide here.',
          imageUrl: FALLBACK_BEVERAGE_IMAGE,
          buttonLabel: 'Shop Now',
          buttonUrl: '/shop',
          theme: 'dark',
        },
        {
          id: `sec-${Date.now()}-2`,
          type: 'image_text',
          kicker: 'HANDCRAFTED QUALITY',
          heading: 'Naturally Made with Whole Botanicals',
          body: 'Write your page content here. You can add, reorder, or customize sections freely.',
          imageUrl: FALLBACK_BEVERAGE_IMAGE,
          imagePosition: 'left',
          buttonLabel: 'Explore Flavors',
          buttonUrl: '/shop',
          theme: 'cream',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFormError(null);
    setIsNewPage(true);
    setAutoSlug(true);
    setEditingPage(newPage);
  };

  const handleAddSection = (type: PageSectionType) => {
    if (!editingPage) return;
    const newSec: PageSection = {
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      kicker:
        type === 'hero' || type === 'image_text' || type === 'promo_banner' || type === 'cta'
          ? 'DELIGHTFUL JUICES'
          : '',
      heading:
        type === 'catering_calculator' ||
        type === 'wholesale_tiers' ||
        type === 'contact_info' ||
        type === 'faq_list'
          ? ''
          : 'Section Heading',
      subheading: type === 'hero' ? 'Supporting subtitle text' : '',
      body:
        type === 'image_text' || type === 'text_only' || type === 'promo_banner' || type === 'cta'
          ? 'Enter your rich customer-facing copy here.'
          : '',
      imageUrl:
        type === 'hero' || type === 'image_text' || type === 'full_image'
          ? FALLBACK_BEVERAGE_IMAGE
          : '',
      imagePosition: 'left',
      buttonLabel:
        type === 'hero' || type === 'image_text' || type === 'promo_banner' || type === 'cta'
          ? 'Shop Now'
          : '',
      buttonUrl: '/shop',
      galleryImages:
        type === 'image_gallery'
          ? [{ url: FALLBACK_BEVERAGE_IMAGE, caption: 'Handcrafted in Quakertown, PA' }]
          : [],
      maxProducts: type === 'featured_products' ? 3 : undefined,
      theme: type === 'hero' || type === 'cta' ? 'dark' : type === 'promo_banner' ? 'gold' : 'cream',
    };
    setEditingPage({
      ...editingPage,
      sections: [...editingPage.sections, newSec],
    });
  };

  const handleUpdateSection = (secId: string, patch: Partial<PageSection>) => {
    if (!editingPage) return;
    setEditingPage({
      ...editingPage,
      sections: editingPage.sections.map((s) => (s.id === secId ? { ...s, ...patch } : s)),
    });
  };

  const handleMoveSection = (idx: number, dir: -1 | 1) => {
    if (!editingPage) return;
    const target = idx + dir;
    if (target < 0 || target >= editingPage.sections.length) return;
    const next = [...editingPage.sections];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setEditingPage({ ...editingPage, sections: next });
  };

  const handleRemoveSection = (secId: string) => {
    if (!editingPage) return;
    setEditingPage({
      ...editingPage,
      sections: editingPage.sections.filter((s) => s.id !== secId),
    });
  };

  const handleSectionImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    secId: string,
    isGallery = false
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingPage) return;
    if (file.size > 8 * 1024 * 1024) {
      setFormError('Image exceeds 8MB limit.');
      return;
    }

    setUploadingSectionId(secId);
    setFormError(null);

    const applyUrl = (url: string) => {
      const targetSec = editingPage.sections.find((s) => s.id === secId);
      if (!targetSec) return;
      if (isGallery) {
        const nextGallery = [
          ...(targetSec.galleryImages || []),
          { url, caption: file.name.replace(/\.[^.]+$/, '') },
        ];
        handleUpdateSection(secId, { galleryImages: nextGallery });
      } else {
        handleUpdateSection(secId, { imageUrl: url });
      }
    };

    try {
      if (supabaseConnected) {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `pages/${editingPage.slug || 'page'}-${Date.now()}.${ext}`;
        const res = await supabaseService.uploadAsset('delightful_assets', path, file);
        if (res.url) {
          applyUrl(res.url);
          setUploadingSectionId(null);
          onToast('Section image uploaded to Supabase Storage!');
          return;
        }
      }

      const reader = new FileReader();
      reader.onload = () => {
        applyUrl(reader.result as string);
        setUploadingSectionId(null);
        onToast('Section image loaded!');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadingSectionId(null);
      setFormError(err?.message || 'Image upload failed.');
    }
  };

  const handleSavePageWithStatus = (desiredStatus: 'draft' | 'published') => {
    if (!editingPage) return;
    setFormError(null);

    const cleanTitle = editingPage.title.trim();
    const cleanSlug = slugifyTitle(editingPage.slug || cleanTitle);

    if (!cleanTitle) {
      setFormError('Please enter a Page Title.');
      return;
    }
    if (!cleanSlug) {
      setFormError('Please provide a valid URL slug (e.g. our-story or delivery-info).');
      return;
    }
    if (['admin', 'shop', 'api'].includes(cleanSlug)) {
      setFormError(`The slug "/${cleanSlug}" is reserved by a core system route. Choose another slug.`);
      return;
    }
    const duplicate = pages.find(
      (p) => p.id !== editingPage.id && p.slug.toLowerCase() === cleanSlug.toLowerCase()
    );
    if (duplicate) {
      setFormError(`Another page already uses "/${cleanSlug}". Please choose a unique URL slug.`);
      return;
    }

    const finalPage: CmsPage = {
      ...editingPage,
      title: cleanTitle,
      slug: cleanSlug,
      status: desiredStatus,
    };

    dataRepo.saveCmsPage(finalPage);
    setEditingPage(null);
    setIsNewPage(false);
    onToast(
      desiredStatus === 'published'
        ? `Page "${cleanTitle}" published live at /${cleanSlug}!`
        : `Page "${cleanTitle}" saved as draft.`
    );
  };

  // --- EDITOR VIEW ---
  if (editingPage) {
    return (
      <div className="space-y-6 max-w-5xl">
        {/* Top Bar */}
        <div className="bg-white p-5 rounded-3xl border border-[#1B4D2E]/15 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E1AD01] bg-[#1B4D2E] px-2.5 py-0.5 rounded-md">
              {isNewPage ? 'New Dynamic Page' : `Editing /${editingPage.slug}`}
            </span>
            <h2 className="font-display font-extrabold text-2xl text-[#1B4D2E] mt-1">
              {editingPage.title || 'Untitled Page'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewingPage(editingPage)}
              className="bg-[#FFF8E7] hover:bg-[#E1AD01]/25 text-[#1B4D2E] border border-[#1B4D2E]/20 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#1B4D2E]" />
              <span>Preview Page</span>
            </button>

            <button
              type="button"
              onClick={() => handleSavePageWithStatus('draft')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer"
            >
              <FileEdit className="w-4 h-4" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSavePageWithStatus('published')}
              className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer"
            >
              <Globe className="w-4 h-4 text-[#E1AD01]" />
              <span>Publish Page</span>
            </button>

            <button
              type="button"
              onClick={() => setEditingPage(null)}
              className="p-2 text-gray-500 hover:text-black cursor-pointer"
              title="Close Editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {formError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Page Metadata, URL Slug, Navigation & SEO */}
        <div className="bg-white p-6 rounded-3xl border border-[#1B4D2E]/10 shadow-xs space-y-4 text-xs">
          <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
            Page Settings, URL Slug & SEO
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                Page Title *
              </label>
              <input
                type="text"
                value={editingPage.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setEditingPage({
                    ...editingPage,
                    title,
                    slug: autoSlug ? slugifyTitle(title) : editingPage.slug,
                  });
                }}
                placeholder="e.g. Seasonal Cleanse Packages"
                className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3.5 py-2.5 font-bold text-sm text-[#1B4D2E]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                URL Slug * (Accessible at /{editingPage.slug || 'your-slug'})
              </label>
              <div className="flex items-center bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl overflow-hidden">
                <span className="px-3 text-gray-500 font-mono select-none">/</span>
                <input
                  type="text"
                  value={editingPage.slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setEditingPage({ ...editingPage, slug: slugifyTitle(e.target.value) });
                  }}
                  placeholder="seasonal-cleanse-packages"
                  className="flex-1 bg-transparent py-2.5 pr-3 font-mono font-bold text-[#1B4D2E] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Navigation Menu Placement */}
          <div className="p-4 bg-[#FFF8E7] rounded-2xl border border-[#1B4D2E]/15 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={editingPage.showInNav}
                onChange={(e) =>
                  setEditingPage({ ...editingPage, showInNav: e.target.checked })
                }
                className="w-4 h-4 accent-[#1B4D2E]"
              />
              <div>
                <span className="font-bold text-[#1B4D2E] block">
                  Automatically Display in Header Navigation
                </span>
                <span className="text-[11px] text-gray-600">
                  Adds this page to the public menu as soon as it is Published
                </span>
              </div>
            </label>

            {editingPage.showInNav && (
              <div>
                <label className="block text-[11px] font-bold text-[#1B4D2E]/75 mb-1">
                  Menu Placement
                </label>
                <select
                  value={editingPage.parentNavId || ''}
                  onChange={(e) =>
                    setEditingPage({
                      ...editingPage,
                      parentNavId: e.target.value || null,
                    })
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold text-[#1B4D2E]"
                >
                  <option value="">Top-Level Header Link</option>
                  {dropdownParents.map((dp) => (
                    <option key={dp.id} value={dp.id}>
                      Inside Dropdown: &ldquo;{dp.label}&rdquo;
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* SEO Title & Meta Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                SEO Title (Browser Tab & Google Search)
              </label>
              <input
                type="text"
                value={editingPage.seoTitle || ''}
                onChange={(e) => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                placeholder={`${editingPage.title || 'Page Title'} | Delightful Juices`}
                className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-[#1B4D2E]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                SEO Meta Description
              </label>
              <input
                type="text"
                value={editingPage.metaDescription || ''}
                onChange={(e) =>
                  setEditingPage({ ...editingPage, metaDescription: e.target.value })
                }
                placeholder="Brief summary for search engines and social link shares..."
                className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-[#1B4D2E]"
              />
            </div>
          </div>
        </div>

        {/* Modular Content Blocks Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-[#1B4D2E] flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#E1AD01]" />
              <span>Page Content Sections ({editingPage.sections.length})</span>
            </h3>
          </div>

          {editingPage.sections.map((sec, idx) => {
            const templateMeta = SECTION_TEMPLATES.find((t) => t.type === sec.type);
            const isWidgetOnly =
              sec.type === 'catering_calculator' ||
              sec.type === 'wholesale_tiers' ||
              sec.type === 'contact_info' ||
              sec.type === 'faq_list';

            return (
              <div
                key={sec.id}
                className="bg-white rounded-3xl p-5 border border-[#1B4D2E]/15 shadow-xs space-y-4 text-xs"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1B4D2E] text-[#E1AD01] font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-[#1B4D2E]">
                        {templateMeta?.label || sec.type}
                      </span>
                      <span className="text-[11px] text-gray-500 ml-2 hidden sm:inline">
                        {templateMeta?.desc}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSection(idx, -1)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-[#FFF8E7] disabled:opacity-30 cursor-pointer"
                      title="Move Section Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === editingPage.sections.length - 1}
                      onClick={() => handleMoveSection(idx, 1)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-[#FFF8E7] disabled:opacity-30 cursor-pointer"
                      title="Move Section Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sec.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                      title="Remove Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isWidgetOnly ? (
                  <div className="p-3.5 bg-[#FFF8E7] rounded-2xl text-xs text-[#1B4D2E]/85">
                    Renders the live interactive <strong>{templateMeta?.label}</strong> module synchronized with your store settings and inquiries database.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-gray-600 mb-1">Eyebrow Kicker</label>
                        <input
                          type="text"
                          value={sec.kicker || ''}
                          onChange={(e) => handleUpdateSection(sec.id, { kicker: e.target.value })}
                          className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl px-3 py-2 text-[#1B4D2E]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-600 mb-1">Section Theme</label>
                        <select
                          value={sec.theme || 'light'}
                          onChange={(e) =>
                            handleUpdateSection(sec.id, {
                              theme: e.target.value as PageSection['theme'],
                            })
                          }
                          className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl px-3 py-2 font-bold text-[#1B4D2E]"
                        >
                          <option value="light">Crisp White</option>
                          <option value="cream">Warm Cream (#FFF8E7)</option>
                          <option value="dark">Forest Green (#1B4D2E)</option>
                          <option value="gold">Mustard Gold (#E1AD01)</option>
                        </select>
                      </div>

                      {sec.type === 'image_text' && (
                        <div>
                          <label className="block font-bold text-gray-600 mb-1">Image Side</label>
                          <select
                            value={sec.imagePosition || 'left'}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, {
                                imagePosition: e.target.value as 'left' | 'right',
                              })
                            }
                            className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl px-3 py-2 font-bold text-[#1B4D2E]"
                          >
                            <option value="left">Image on Left</option>
                            <option value="right">Image on Right</option>
                          </select>
                        </div>
                      )}

                      {sec.type === 'featured_products' && (
                        <div>
                          <label className="block font-bold text-gray-600 mb-1">
                            Number of Drinks Shown
                          </label>
                          <select
                            value={sec.maxProducts || 3}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, { maxProducts: Number(e.target.value) })
                            }
                            className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl px-3 py-2 font-bold text-[#1B4D2E]"
                          >
                            <option value={3}>3 Featured Drinks</option>
                            <option value={6}>6 Drinks</option>
                            <option value={9}>All Drinks</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-gray-600 mb-1">Section Heading</label>
                      <input
                        type="text"
                        value={sec.heading || ''}
                        onChange={(e) => handleUpdateSection(sec.id, { heading: e.target.value })}
                        className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl px-3 py-2 font-bold text-[#1B4D2E]"
                      />
                    </div>

                    {(sec.type === 'hero' ||
                      sec.type === 'full_image' ||
                      sec.type === 'featured_products' ||
                      sec.type === 'image_gallery') && (
                      <div>
                        <label className="block font-bold text-gray-600 mb-1">
                          Subheading / Caption
                        </label>
                        <input
                          type="text"
                          value={sec.subheading || ''}
                          onChange={(e) =>
                            handleUpdateSection(sec.id, { subheading: e.target.value })
                          }
                          className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl px-3 py-2 text-[#1B4D2E]"
                        />
                      </div>
                    )}

                    {(sec.type === 'image_text' ||
                      sec.type === 'text_only' ||
                      sec.type === 'promo_banner' ||
                      sec.type === 'cta') && (
                      <div>
                        <label className="block font-bold text-gray-600 mb-1">
                          Body Copy (Use blank lines for paragraphs)
                        </label>
                        <textarea
                          rows={4}
                          value={sec.body || ''}
                          onChange={(e) => handleUpdateSection(sec.id, { body: e.target.value })}
                          className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl p-3 text-[#1B4D2E]"
                        />
                      </div>
                    )}

                    {/* Single Image Upload for Hero, Image+Text, Full Image */}
                    {(sec.type === 'hero' ||
                      sec.type === 'image_text' ||
                      sec.type === 'full_image') && (
                      <div className="p-3 bg-[#FFF8E7] rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <img
                          src={sec.imageUrl || FALLBACK_BEVERAGE_IMAGE}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_BEVERAGE_IMAGE;
                          }}
                          className="w-20 h-14 rounded-xl object-cover border bg-white shrink-0"
                        />
                        <div className="flex-1 w-full space-y-1.5">
                          <input
                            type="text"
                            value={sec.imageUrl || ''}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, { imageUrl: e.target.value })
                            }
                            placeholder="Image URL or upload file..."
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-[#1B4D2E]"
                          />
                          <label className="inline-flex items-center space-x-1.5 bg-[#1B4D2E] text-white font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer">
                            <Upload className="w-3 h-3 text-[#E1AD01]" />
                            <span>
                              {uploadingSectionId === sec.id
                                ? 'Uploading...'
                                : 'Upload Image from Device'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSectionImageUpload(e, sec.id, false)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Multi-Image Gallery Editor */}
                    {sec.type === 'image_gallery' && (
                      <div className="p-3.5 bg-[#FFF8E7] rounded-2xl border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1B4D2E]">
                            Gallery Photos ({sec.galleryImages?.length || 0})
                          </span>
                          <label className="inline-flex items-center space-x-1 bg-[#1B4D2E] text-white font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer">
                            <Plus className="w-3 h-3 text-[#E1AD01]" />
                            <span>
                              {uploadingSectionId === sec.id ? 'Uploading...' : 'Upload Gallery Photo'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSectionImageUpload(e, sec.id, true)}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {(sec.galleryImages || []).map((gItem, gIdx) => (
                            <div
                              key={gIdx}
                              className="bg-white p-2 rounded-xl border border-gray-200 space-y-1.5"
                            >
                              <div className="relative aspect-4/3 rounded-lg overflow-hidden">
                                <img
                                  src={gItem.url || FALLBACK_BEVERAGE_IMAGE}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = (sec.galleryImages || []).filter(
                                      (_, i) => i !== gIdx
                                    );
                                    handleUpdateSection(sec.id, { galleryImages: filtered });
                                  }}
                                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={gItem.caption || ''}
                                onChange={(e) => {
                                  const nextG = [...(sec.galleryImages || [])];
                                  nextG[gIdx] = { ...gItem, caption: e.target.value };
                                  handleUpdateSection(sec.id, { galleryImages: nextG });
                                }}
                                placeholder="Photo caption..."
                                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[11px]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Buttons */}
                    {(sec.type === 'hero' ||
                      sec.type === 'image_text' ||
                      sec.type === 'promo_banner' ||
                      sec.type === 'cta') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block font-bold text-gray-600 mb-1">
                            Button Label (Optional)
                          </label>
                          <input
                            type="text"
                            value={sec.buttonLabel || ''}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, { buttonLabel: e.target.value })
                            }
                            placeholder="e.g. Shop Now"
                            className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl px-3 py-2 text-[#1B4D2E]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-600 mb-1">
                            Button Destination URL
                          </label>
                          <input
                            type="text"
                            value={sec.buttonUrl || ''}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, { buttonUrl: e.target.value })
                            }
                            placeholder="/shop"
                            className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl px-3 py-2 font-mono text-[#1B4D2E]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Content Block Picker */}
          <div className="bg-white rounded-3xl p-5 border-2 border-dashed border-[#1B4D2E]/25 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-[#1B4D2E]">
              + Add Reusable Content Section Block
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {SECTION_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.type}
                  type="button"
                  onClick={() => handleAddSection(tpl.type)}
                  className="p-3 rounded-2xl bg-[#FFF8E7] hover:bg-[#E1AD01]/25 border border-[#1B4D2E]/15 text-left transition-all cursor-pointer"
                >
                  <div className="font-bold text-xs text-[#1B4D2E]">{tpl.label}</div>
                  <div className="text-[10px] text-gray-600 line-clamp-2 mt-0.5">{tpl.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Page Preview Modal */}
        {previewingPage && (
          <div className="fixed inset-0 z-70 bg-black/80 flex flex-col">
            <div className="bg-[#1B4D2E] text-white px-6 py-3 flex items-center justify-between border-b border-[#E1AD01]/40 shrink-0">
              <div className="flex items-center space-x-3">
                <span className="bg-[#E1AD01] text-[#1B4D2E] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                  CMS Preview Mode
                </span>
                <span className="font-bold text-sm">
                  {previewingPage.title || 'Untitled'} (/{previewingPage.slug || 'draft'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingPage(null)}
                className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer"
              >
                Close Preview
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
              <DynamicPageRenderer
                page={previewingPage}
                products={products}
                content={content}
                onNavigate={() => {}}
                onOpenProductDetails={() => {}}
                isPreview={true}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- PAGES DIRECTORY LIST VIEW ---
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
            Website Pages & Content Builder
          </h2>
          <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
            Create new pages, customize URL slugs, manage SEO metadata, and assemble visual content sections without code
          </p>
        </div>

        <button
          type="button"
          onClick={handleInitNewPage}
          className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#E1AD01]" />
          <span>Create New Page</span>
        </button>
      </div>

      {/* Built-in Core Storefront Routes Info */}
      <div className="bg-white p-4 rounded-2xl border border-[#1B4D2E]/12 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-[#1B4D2E]">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Core Storefront Routes Active:</strong>{' '}
            <code className="bg-[#FFF8E7] px-1.5 py-0.5 rounded font-mono">/</code> (Home Slider & Featured) and{' '}
            <code className="bg-[#FFF8E7] px-1.5 py-0.5 rounded font-mono">/shop</code> (Full Online Juice Store)
          </span>
        </div>
        <button
          type="button"
          onClick={() => onOpenPublicUrl('/shop')}
          className="text-xs font-bold text-[#1B4D2E] hover:underline flex items-center space-x-1 cursor-pointer"
        >
          <span>View /shop</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CMS Pages Table */}
      <div className="bg-white rounded-3xl border border-[#1B4D2E]/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8E7] text-[#1B4D2E] uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Page Title & SEO</th>
                <th className="p-4">Clean URL Slug</th>
                <th className="p-4">Sections</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-[#FFF8E7]/40">
                  <td className="p-4">
                    <div className="font-bold text-sm text-[#1B4D2E]">{page.title}</div>
                    <div className="text-[11px] text-gray-500 line-clamp-1">
                      {page.metaDescription || page.seoTitle || 'Custom CMS Page'}
                    </div>
                  </td>
                  <td className="p-4">
                    <code className="bg-[#FFF8E7] border border-[#1B4D2E]/15 px-2.5 py-1 rounded-lg font-mono font-bold text-[#1B4D2E]">
                      /{page.slug}
                    </code>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-gray-700">
                      {page.sections?.length || 0} blocks
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => {
                        const nextStatus = page.status === 'published' ? 'draft' : 'published';
                        dataRepo.saveCmsPage({ ...page, status: nextStatus });
                        onToast(
                          `Page "${page.title}" set to ${
                            nextStatus === 'published' ? 'Published' : 'Draft'
                          }.`
                        );
                      }}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase cursor-pointer ${
                        page.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {page.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {page.status === 'published' && (
                        <button
                          type="button"
                          onClick={() => onOpenPublicUrl(`/${page.slug}`)}
                          className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          title="Open Live Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setPreviewingPage(page)}
                        className="p-2 text-[#1B4D2E] hover:bg-[#FFF8E7] rounded-lg cursor-pointer"
                        title="Preview Page"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormError(null);
                          setIsNewPage(false);
                          setAutoSlug(false);
                          setEditingPage(JSON.parse(JSON.stringify(page)));
                        }}
                        className="px-3 py-1.5 bg-[#FFF8E7] hover:bg-[#E1AD01]/30 border border-[#1B4D2E]/15 rounded-lg font-bold text-[#1B4D2E] flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {confirmDeleteId === page.id ? (
                        <div className="flex items-center space-x-1 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => {
                              dataRepo.deleteCmsPage(page.id);
                              setConfirmDeleteId(null);
                              onToast(`Deleted page "${page.title}".`);
                            }}
                            className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[10px] font-bold text-gray-600 px-1.5 cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(page.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete Page"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal from Directory List */}
      {previewingPage && (
        <div className="fixed inset-0 z-70 bg-black/80 flex flex-col">
          <div className="bg-[#1B4D2E] text-white px-6 py-3 flex items-center justify-between border-b border-[#E1AD01]/40 shrink-0">
            <div className="flex items-center space-x-3">
              <span className="bg-[#E1AD01] text-[#1B4D2E] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                {previewingPage.status === 'published' ? 'Published Preview' : 'Draft Preview'}
              </span>
              <span className="font-bold text-sm">
                {previewingPage.title} (/{previewingPage.slug})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewingPage(null)}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer"
            >
              Close Preview
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            <DynamicPageRenderer
              page={previewingPage}
              products={products}
              content={content}
              onNavigate={() => {}}
              onOpenProductDetails={() => {}}
              isPreview={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
