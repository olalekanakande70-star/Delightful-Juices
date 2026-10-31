import React, { useState } from 'react';
import { NavItem, CmsPage } from '../types';
import { dataRepo } from '../lib/storage';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  FolderTree,
  Edit3,
  Check,
  X,
} from 'lucide-react';

interface NavigationManagerProps {
  navItems: NavItem[];
  cmsPages: CmsPage[];
  onToast: (msg: string) => void;
}

export const NavigationManager: React.FC<NavigationManagerProps> = ({
  navItems,
  cmsPages,
  onToast,
}) => {
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const topLevel = navItems
    .filter((i) => !i.parentId)
    .sort((a, b) => a.order - b.order);

  const getChildren = (parentId: string) =>
    navItems
      .filter((i) => i.parentId === parentId)
      .sort((a, b) => a.order - b.order);

  const availableDestinations = [
    { label: 'Home (/)', href: '/' },
    { label: 'Shop Now (/shop)', href: '/shop' },
    { label: 'About Us (/about-us)', href: '/about-us' },
    { label: 'Our Story & Promise (/our-story)', href: '/our-story' },
    { label: 'Delivery & Freshness FAQ (/delivery-information)', href: '/delivery-information' },
    { label: 'Events & Catering (/events-catering)', href: '/events-catering' },
    { label: 'Wholesale & Retail (/wholesale)', href: '/wholesale' },
    { label: 'Contact Us (/contact-us)', href: '/contact-us' },
    ...cmsPages
      .filter(
        (p) =>
          p.status === 'published' &&
          ![
            'about-us',
            'our-story',
            'delivery-information',
            'events-catering',
            'wholesale',
            'contact-us',
          ].includes(p.slug)
      )
      .map((p) => ({ label: `CMS Page: ${p.title} (/${p.slug})`, href: `/${p.slug}` })),
  ];

  const handleAddTopLevel = (asDropdown: boolean) => {
    setIsNew(true);
    setEditingItem({
      id: `nav-${Date.now()}`,
      label: asDropdown ? 'Explore More' : 'New Page Link',
      href: asDropdown ? '/about-us' : '/shop',
      visible: true,
      order: topLevel.length + 1,
      parentId: null,
      isDropdown: asDropdown,
    });
  };

  const handleAddChild = (parent: NavItem) => {
    const siblings = getChildren(parent.id);
    setIsNew(true);
    setEditingItem({
      id: `nav-sub-${Date.now()}`,
      label: 'Submenu Link',
      href: '/shop',
      visible: true,
      order: siblings.length + 1,
      parentId: parent.id,
      isDropdown: false,
    });
  };

  const handleToggleVisible = async (item: NavItem) => {
    const updated = navItems.map((n) =>
      n.id === item.id ? { ...n, visible: !n.visible } : n
    );
    const res = await dataRepo.saveNavItems(updated);
    if (!res.synced) {
      onToast(`Unable to update live navigation: ${res.error}`);
    } else {
      onToast(`"${item.label}" ${!item.visible ? 'shown' : 'hidden'} in live navigation.`);
    }
  };

  const handleMoveSibling = async (item: NavItem, dir: -1 | 1) => {
    const siblings = navItems
      .filter((n) => (n.parentId || null) === (item.parentId || null))
      .sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((s) => s.id === item.id);
    const targetIdx = idx + dir;
    if (idx < 0 || targetIdx < 0 || targetIdx >= siblings.length) return;

    const reorderedSiblings = [...siblings];
    const [moved] = reorderedSiblings.splice(idx, 1);
    reorderedSiblings.splice(targetIdx, 0, moved);

    const orderMap = new Map<string, number>();
    reorderedSiblings.forEach((s, i) => orderMap.set(s.id, i + 1));

    const nextAll = navItems.map((n) =>
      orderMap.has(n.id) ? { ...n, order: orderMap.get(n.id)! } : n
    );
    const res = await dataRepo.saveNavItems(nextAll);
    if (!res.synced) {
      onToast(`Unable to reorder live navigation: ${res.error}`);
    } else {
      onToast('Live navigation order updated!');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.label.trim()) return;

    const exists = navItems.some((n) => n.id === editingItem.id);
    let nextList = exists
      ? navItems.map((n) => (n.id === editingItem.id ? editingItem : n))
      : [...navItems, editingItem];

    // If an item has a parent, ensure that parent is marked isDropdown = true
    if (editingItem.parentId) {
      nextList = nextList.map((n) =>
        n.id === editingItem.parentId ? { ...n, isDropdown: true } : n
      );
    }

    const res = await dataRepo.saveNavItems(nextList);
    if (!res.synced) {
      onToast(`Unable to save live navigation: ${res.error}`);
      return;
    }
    setEditingItem(null);
    setIsNew(false);
    onToast(isNew ? 'New navigation item published live!' : 'Navigation menu published live!');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4D2E]">
            Navigation & Dropdown Menu Manager
          </h2>
          <p className="text-xs sm:text-sm text-[#1B4D2E]/70">
            Organize top-level links, create dropdown menu groups, and nest pages cleanly for desktop and mobile visitors
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddTopLevel(false)}
            className="bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#E1AD01]" />
            <span>Add Top-Level Link</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddTopLevel(true)}
            className="bg-white hover:bg-[#FFF8E7] text-[#1B4D2E] border border-[#1B4D2E]/20 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-1.5 cursor-pointer"
          >
            <FolderTree className="w-4 h-4 text-[#E1AD01]" />
            <span>Add Dropdown Group</span>
          </button>
        </div>
      </div>

      {/* Hierarchical Menu Tree */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#1B4D2E]/10 shadow-xs space-y-4">
        {topLevel.map((item, idx) => {
          const children = getChildren(item.id);
          const isGroup = item.isDropdown || children.length > 0;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[#1B4D2E]/15 bg-[#FFF8E7]/60 overflow-hidden"
            >
              {/* Top-Level Row */}
              <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#1B4D2E]">{item.label}</span>
                      {isGroup && (
                        <span className="text-[10px] font-extrabold uppercase bg-[#E1AD01]/30 text-[#1B4D2E] px-2 py-0.5 rounded-md">
                          Dropdown Menu ({children.length})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">{item.href}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                  {isGroup && (
                    <button
                      type="button"
                      onClick={() => handleAddChild(item)}
                      className="text-[11px] font-bold bg-[#1B4D2E] text-[#FFF8E7] px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#E1AD01]" />
                      <span>Add Sub-Link</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSibling(item, -1)}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === topLevel.length - 1}
                    onClick={() => handleMoveSibling(item, 1)}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleVisible(item)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer ${
                      item.visible
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {item.visible ? 'Visible' : 'Hidden'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsNew(false);
                      setEditingItem({ ...item });
                    }}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-[#1B4D2E] hover:bg-gray-50 cursor-pointer"
                    title="Edit Link"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center space-x-1 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await dataRepo.deleteNavItem(item.id);
                          setConfirmDeleteId(null);
                          if (!res.synced) {
                            onToast(`Unable to delete from live navigation: ${res.error}`);
                          } else {
                            onToast(`Removed "${item.label}" from live navigation.`);
                          }
                        }}
                        className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-gray-600 px-1 cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Nested Dropdown Children */}
              {children.length > 0 && (
                <div className="bg-white border-t border-[#1B4D2E]/10 px-4 py-2.5 space-y-2">
                  {children.map((child, cIdx) => (
                    <div
                      key={child.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-4 sm:pl-6 py-2 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="w-3.5 h-3.5 text-[#E1AD01] shrink-0" />
                        <span className="font-semibold text-xs text-[#1B4D2E]">{child.label}</span>
                        <span className="text-[11px] font-mono text-gray-500">({child.href})</span>
                      </div>

                      <div className="flex items-center space-x-1.5 pr-2 self-end sm:self-center">
                        <button
                          type="button"
                          disabled={cIdx === 0}
                          onClick={() => handleMoveSibling(child, -1)}
                          className="p-1 rounded border border-gray-200 bg-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={cIdx === children.length - 1}
                          onClick={() => handleMoveSibling(child, 1)}
                          className="p-1 rounded border border-gray-200 bg-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleVisible(child)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                            child.visible
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {child.visible ? 'Visible' : 'Hidden'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsNew(false);
                            setEditingItem({ ...child });
                          }}
                          className="p-1 rounded border border-gray-200 bg-white text-[#1B4D2E] cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await dataRepo.deleteNavItem(child.id);
                            if (!res.synced) {
                              onToast(`Unable to delete submenu link: ${res.error}`);
                            } else {
                              onToast(`Removed submenu link "${child.label}" from live navigation.`);
                            }
                          }}
                          className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Navigation Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display font-bold text-lg text-[#1B4D2E]">
                {isNew ? 'Add Navigation Item' : 'Edit Navigation Item'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block font-bold mb-1 text-[#1B4D2E]">Menu Label *</label>
                <input
                  type="text"
                  required
                  value={editingItem.label}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  placeholder="e.g. Shop Now or Seasonal Cleanse"
                  className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl px-3.5 py-2.5 font-bold text-[#1B4D2E]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#1B4D2E]">Placement Level</label>
                <select
                  value={editingItem.parentId || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      parentId: e.target.value || null,
                      isDropdown: e.target.value ? false : editingItem.isDropdown,
                    })
                  }
                  className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-[#1B4D2E]"
                >
                  <option value="">Top-Level Header Item</option>
                  {topLevel
                    .filter((t) => t.id !== editingItem.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        Nested inside &ldquo;{t.label}&rdquo; Dropdown
                      </option>
                    ))}
                </select>
              </div>

              {!editingItem.parentId && (
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-[#1B4D2E]">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.isDropdown)}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isDropdown: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#1B4D2E]"
                  />
                  <span>Act as Dropdown Menu Group (shows submenu items)</span>
                </label>
              )}

              <div>
                <label className="block font-bold mb-1 text-[#1B4D2E]">
                  Quick-Select Destination Page
                </label>
                <select
                  value={
                    availableDestinations.some((d) => d.href === editingItem.href)
                      ? editingItem.href
                      : '__custom__'
                  }
                  onChange={(e) => {
                    if (e.target.value !== '__custom__') {
                      setEditingItem({ ...editingItem, href: e.target.value });
                    }
                  }}
                  className="w-full bg-[#FFF8E7] border border-gray-200 rounded-xl px-3 py-2 text-[#1B4D2E] mb-2"
                >
                  {availableDestinations.map((d) => (
                    <option key={d.href} value={d.href}>
                      {d.label}
                    </option>
                  ))}
                  <option value="__custom__">Custom Path / URL...</option>
                </select>

                <input
                  type="text"
                  required
                  value={editingItem.href}
                  onChange={(e) => setEditingItem({ ...editingItem, href: e.target.value })}
                  placeholder="/shop"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-mono text-[#1B4D2E]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-gray-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1B4D2E] hover:bg-[#143822] text-white font-bold px-5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#E1AD01]" />
                  <span>Save Menu Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
