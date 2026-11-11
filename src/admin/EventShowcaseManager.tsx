import React, { useState, useEffect } from 'react';
import { EventShowcaseItem } from '../types';
import { dataRepo } from '../lib/storage';
import { supabaseService } from '../lib/supabaseClient';
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Check,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface EventShowcaseManagerProps {
  onToast: (msg: string) => void;
  onPreviewPublic?: () => void;
}

export const EventShowcaseManager: React.FC<EventShowcaseManagerProps> = ({
  onToast,
  onPreviewPublic,
}) => {
  const [items, setItems] = useState<EventShowcaseItem[]>(() => dataRepo.getEventShowcase());
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  useEffect(() => {
    setItems(dataRepo.getEventShowcase());
  }, []);

  const handleAddItem = (url: string = '') => {
    const newItem: EventShowcaseItem = {
      id: `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      url,
      title: 'Bespoke Celebration Setup',
      caption: 'Handcrafted juices and custom monogrammed bottles for special occasions.',
      displayOrder: items.length + 1,
      published: true,
      createdAt: new Date().toISOString(),
    };
    const next = [...items, newItem];
    setItems(next);
  };

  const handleUpdateItem = (id: string, updates: Partial<EventShowcaseItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) =>
      prev
        .filter((item) => item.id !== id)
        .map((item, idx) => ({ ...item, displayOrder: idx + 1 }))
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);

    const reordered = copy.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));
    setItems(reordered);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetId?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(`Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`);

    try {
      if (targetId && files.length === 1) {
        // Replacing single image
        const file = files[0];
        const ext = file.name.split('.').pop() || 'jpg';
        const storagePath = `events/${Date.now()}-replace.${ext}`;
        const res = await supabaseService.uploadAsset('delightful_assets', storagePath, file);
        if (res.url) {
          handleUpdateItem(targetId, { url: res.url });
          onToast('Event showcase image uploaded successfully!');
        } else {
          onToast(`Upload error: ${res.error || 'Failed to upload'}`);
        }
      } else {
        // Adding new images
        const newUploadedItems: EventShowcaseItem[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`);
          const ext = file.name.split('.').pop() || 'jpg';
          const storagePath = `events/${Date.now()}-${i}.${ext}`;
          const res = await supabaseService.uploadAsset('delightful_assets', storagePath, file);
          if (res.url) {
            newUploadedItems.push({
              id: `event-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
              url: res.url,
              title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              caption: 'Prepared fresh for weddings, corporate retreats, and private parties.',
              displayOrder: items.length + i + 1,
              published: true,
              createdAt: new Date().toISOString(),
            });
          }
        }

        if (newUploadedItems.length > 0) {
          const merged = [...items, ...newUploadedItems].map((item, idx) => ({
            ...item,
            displayOrder: idx + 1,
          }));
          setItems(merged);
          onToast(`Added ${newUploadedItems.length} new event showcase images! Remember to click Save.`);
        }
      }
    } catch (err: any) {
      onToast(`Upload failed: ${err?.message || 'Error uploading file'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const res = await dataRepo.saveEventShowcase(items);
    setIsSaving(false);

    if (res.synced) {
      onToast('Event Showcase gallery saved and published to live website!');
    } else {
      onToast(`Unable to save: ${res.error || 'Database sync issue'}`);
    }
  };

  const handleReset = () => {
    setItems(dataRepo.getEventShowcase());
    onToast('Reset to last saved gallery state.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/15 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-widest text-[#1B4D2E]">
            <Sparkles className="w-4 h-4 text-[#E1AD01]" />
            <span>WHOLESALE &amp; EVENTS CMS</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1B4D2E]">
            Event Product Showcase (Motion Grid)
          </h2>
          <p className="text-xs sm:text-sm text-[#1B4D2E]/80 leading-relaxed">
            Manage the animated image grid displayed on the Wholesale &amp; Events sections. Upload photos of custom monogrammed bottles, wedding bars, and event catering displays directly to Supabase Storage.
          </p>
          <div className="text-xs font-semibold text-[#1B4D2E]/70 flex items-center gap-2 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Total items: <strong>{items.length}</strong> ({items.filter((i) => i.published !== false).length} published live)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onPreviewPublic && (
            <button
              type="button"
              onClick={onPreviewPublic}
              className="bg-[#FFF8E7] hover:bg-[#1B4D2E]/10 text-[#1B4D2E] border border-[#1B4D2E]/20 font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
            >
              View on Live Site
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
          >
            <Save className="w-4 h-4 text-[#E1AD01]" />
            <span>{isSaving ? 'Saving to Database...' : 'Save Showcase'}</span>
          </button>
        </div>
      </div>

      {/* Upload & Add Bar */}
      <div className="bg-[#FFF8E7] rounded-3xl p-6 border border-[#1B4D2E]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center font-bold shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#1B4D2E]">Add Event Photos</h3>
            <p className="text-xs text-[#1B4D2E]/70">
              Upload multiple JPG, PNG, or WebP images to your Supabase Storage bucket.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-black text-xs px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? (uploadProgress || 'Uploading...') : 'Upload Images'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              disabled={isUploading}
              onChange={(e) => handleFileUpload(e)}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => handleAddItem()}
            className="inline-flex items-center space-x-1.5 bg-white hover:bg-gray-50 text-[#1B4D2E] border border-[#1B4D2E]/20 font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add via URL</span>
          </button>
        </div>
      </div>

      {/* Showcase Cards List */}
      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#1B4D2E]/12 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF8E7] text-[#1B4D2E] flex items-center justify-center mx-auto border border-[#1B4D2E]/15">
            <ImageIcon className="w-7 h-7 text-[#E1AD01]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl text-[#1B4D2E]">
              Event Showcase is Currently Empty
            </h3>
            <p className="text-xs text-[#1B4D2E]/75 max-w-md mx-auto">
              Per requirements, no random stock photos are populated by default. Upload photos above when you have bespoke event or catering pictures ready to display.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => {
            const hasUrl = Boolean(item.url?.trim());

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
                  {/* Image Preview & Order Controls */}
                  <div className="relative aspect-16/10 bg-[#12351F] overflow-hidden">
                    {hasUrl ? (
                      <img
                        src={item.url}
                        alt={item.title || 'Event image'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#FFF8E7]/70 space-y-2">
                        <ImageIcon className="w-8 h-8 text-[#E1AD01]" />
                        <span className="text-xs font-semibold">No Image Uploaded</span>
                      </div>
                    )}

                    {/* Order & Status Badges */}
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span className="bg-[#1B4D2E] text-[#FFF8E7] text-[10px] font-black px-2.5 py-1 rounded-md shadow-xs">
                        #{item.displayOrder}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateItem(item.id, { published: item.published === false })}
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs cursor-pointer flex items-center space-x-1 ${
                          item.published !== false
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {item.published !== false ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Move Up/Down Controls */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/60 backdrop-blur-xs p-1 rounded-lg">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        className="p-1 text-white hover:text-[#E1AD01] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="p-1 text-white hover:text-[#E1AD01] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Replace Image Button */}
                    <label className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg backdrop-blur-xs cursor-pointer flex items-center space-x-1">
                      <Upload className="w-3 h-3 text-[#E1AD01]" />
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, item.id)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Form Inputs */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70">
                        Image Title / Event Name
                      </label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                        placeholder="e.g. Wedding Welcome Beverage Bar"
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70">
                        Caption / Description
                      </label>
                      <textarea
                        rows={2}
                        value={item.caption || ''}
                        onChange={(e) => handleUpdateItem(item.id, { caption: e.target.value })}
                        placeholder="Brief caption describing the setup, bottles, or occasion..."
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1B4D2E]/70">
                        Image URL (Supabase or Custom)
                      </label>
                      <input
                        type="url"
                        value={item.url || ''}
                        onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                        placeholder="https://abrgqtrobgorsaggooxv.supabase.co/..."
                        className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-1.5 text-[11px] font-mono text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer Delete Button */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">
                      Position {index + 1} of {items.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Reminder Bar */}
      <div className="p-4 sm:p-5 bg-[#1B4D2E] rounded-2xl text-[#FFF8E7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <CheckCircle2 className="w-5 h-5 text-[#E1AD01] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            All event showcase photos are stored persistently in your live Supabase database.
          </span>
        </div>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-black text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          {isSaving ? 'Saving...' : 'Save Gallery Changes'}
        </button>
      </div>
    </div>
  );
};
