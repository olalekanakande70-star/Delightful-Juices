import React, { useState } from 'react';
import { PageSection, SiteContent } from '../types';
import { dataRepo } from '../lib/storage';
import { WholesaleProductGallery } from './WholesaleProductGallery';
import {
  Building2,
  Store,
  UtensilsCrossed,
  CheckCircle2,
  ArrowRight,
  Truck,
  Send,
  MessageCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface WholesaleSectionProps {
  content: SiteContent;
  heroSection?: PageSection;
  onCateringClick?: () => void;
}

export const WholesaleSection: React.FC<WholesaleSectionProps> = ({
  content,
  heroSection,
  onCateringClick,
}) => {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    location: '',
    businessType: 'Retail Store',
    estimatedQuantity: '24 bottles (2 cases)',
    message: '',
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [heroImgErrorUrl, setHeroImgErrorUrl] = useState<string | null>(null);

  const heroBgImg = (heroSection?.imageUrl || '').trim();
  const showHeroBgImg = Boolean(heroBgImg && heroImgErrorUrl !== heroBgImg);

  const wholesaleGalleryItems =
    content.wholesaleGallery || content.branding?.wholesaleGallery || dataRepo.getWholesaleGallery();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const scrollToInquiryForm = () => {
    const el = document.getElementById('wholesale-inquiry-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectGalleryItem = (productName: string) => {
    setFormData((prev) => ({
      ...prev,
      message: `${prev.message ? prev.message + '\n' : ''}Interested in wholesale supply for: ${productName}`,
    }));
    scrollToInquiryForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.contactName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setFormError('Please provide your name, email, and phone number so our team can reach you.');
      return;
    }

    try {
      dataRepo.addInquiry({
        fullName: formData.contactName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        eventType: `Wholesale: ${formData.businessType} (${formData.businessName || 'Business'})`,
        eventDate: new Date().toISOString().split('T')[0],
        guestCount: parseInt(formData.estimatedQuantity) || 24,
        eventLocation: formData.location.trim() || 'PA / US',
        bottleSizesNeeded: ['12oz', '16oz', '18oz'],
        selectedFlavors: ['Zobo', 'Pure Ginger', 'Ginger Mango', 'Tigernut Milk'],
        customLabelingNeeded: false,
        budgetRange: formData.estimatedQuantity,
        message: `${formData.businessName ? `Business Name: ${formData.businessName}\n` : ''}${
          formData.location ? `Location: ${formData.location}\n` : ''
        }${formData.message || 'Wholesale / Distribution Inquiry'}`,
      });

      setFormSubmitted(true);
    } catch {
      setFormError('There was an issue saving your inquiry. Please try again or WhatsApp us directly.');
    }
  };

  return (
    <div className="bg-white">
      {/* 1. Commercial Wholesale & Distribution Opportunities Hero */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-[#0e2918] via-[#12351F] to-[#1B4D2E] text-[#FFF8E7] relative overflow-hidden">
        {showHeroBgImg && (
          <>
            <img
              key={heroBgImg}
              src={heroBgImg}
              alt={heroSection?.heading || 'Wholesale & Distribution Opportunities'}
              onError={() => setHeroImgErrorUrl(heroBgImg)}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e2918]/92 via-[#12351F]/78 to-[#1B4D2E]/55" />
          </>
        )}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#E1AD01]/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#E1AD01] bg-white/10 px-4 py-1.5 rounded-full border border-white/15">
              <Building2 className="w-4 h-4" />
              <span>USDA-APPROVED WHOLESALE DISTRIBUTION</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white leading-tight">
              Wholesale &amp; Distribution Opportunities
            </h1>

            <p className="text-sm sm:text-lg text-[#FFF8E7]/90 leading-relaxed">
              Delightful Juices offers premium, small-batch botanical juices manufactured to strict USDA food safety standards. We supply retail stores, supermarkets, restaurants, food service businesses, distributors, and bulk buyers across Pennsylvania (PA) and select locations throughout the United States.
            </p>

            <p className="text-xs sm:text-sm text-[#E1AD01] font-semibold italic">
              * Delivery terms, logistics, and minimum order requirements vary based on delivery location and order volume.
            </p>

            {/* Quick Action CTAs */}
            <div className="pt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToInquiryForm}
                className="inline-flex items-center space-x-2 bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <span>Enquire About Wholesale</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={scrollToInquiryForm}
                className="inline-flex items-center space-x-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition-all cursor-pointer"
              >
                <span>Request Bulk Orders</span>
              </button>

              <a
                href={`https://wa.me/${content.whatsappNumber}?text=Hello%20Delightful%20Juices%2C%20I%20am%20interested%20in%20partnering%20with%20you%20for%20wholesale%20distribution.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Partner With Us</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Wholesale Partner Segments (Retail, Supermarkets, Restaurants, Food Service, Distributors) */}
      <section className="py-20 bg-[#FFF8E7] border-b border-[#1B4D2E]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1B4D2E]">
              TAILORED COMMERCIAL SUPPLY
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#1B4D2E]">
              Crafted for Your Shelves, Menus &amp; Patrons
            </h2>
            <p className="text-xs sm:text-sm text-[#1B4D2E]/80 leading-relaxed">
              Whether you run a high-volume supermarket in Philadelphia or a farm-to-table bistro in Bucks County, our uncompromised drinks offer attractive margins and strong customer retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Supermarkets & Retail Stores */}
            <div className="bg-white rounded-3xl p-7 border border-[#1B4D2E]/12 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center font-bold mb-5 shadow-xs">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-[#1B4D2E] mb-2">
                  Retail Stores &amp; Supermarkets
                </h3>
                <p className="text-xs text-[#1B4D2E]/75 mb-6 leading-relaxed">
                  Fast-moving grab-and-go 12oz and 16oz bottles with sealed safety bands, tamper seals, and barcode labels for natural grocery stores and boutique bodegas.
                </p>
                <div className="space-y-2.5 text-xs text-[#1B4D2E]/85">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                    <span>Competitive wholesale case discounts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                    <span>Eye-catching botanical packaging</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                    <span>Regular scheduled replenishment</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={scrollToInquiryForm}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Inquire for Retail</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E1AD01]" />
                </button>
              </div>
            </div>

            {/* Restaurants & Food Service */}
            <div className="bg-[#1B4D2E] text-[#FFF8E7] rounded-3xl p-7 border-2 border-[#E1AD01] shadow-xl flex flex-col justify-between relative transform md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E1AD01] text-[#1B4D2E] text-[10px] uppercase font-black tracking-wider px-3.5 py-1 rounded-md shadow-xs">
                Popular Restaurant Program
              </div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#E1AD01] text-[#1B4D2E] flex items-center justify-center font-bold mb-5 shadow-xs">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-[#FFF8E7] mb-2">
                  Restaurants &amp; Food Service
                </h3>
                <p className="text-xs text-[#FFF8E7]/80 mb-6 leading-relaxed">
                  Upgrade your drink menu with ready-to-pour Zobo, Pure Ginger, and Ginger Mango. Perfect for non-alcoholic pairings, cocktail mixers, and brunch menus.
                </p>
                <div className="space-y-2.5 text-xs text-[#FFF8E7]/90">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                    <span>Available in 18oz bar jugs &amp; single sips</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                    <span>Low minimum batch requirements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                    <span>High gross margin beverage pairing</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/15">
                <button
                  type="button"
                  onClick={scrollToInquiryForm}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-[#E1AD01] hover:bg-[#c99a00] text-[#1B4D2E] py-2.5 px-4 rounded-xl text-xs font-black transition-colors cursor-pointer"
                >
                  <span>Restaurant Supply Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Distributors & Bulk Buyers */}
            <div className="bg-white rounded-3xl p-7 border border-[#1B4D2E]/12 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1B4D2E] text-[#E1AD01] flex items-center justify-center font-bold mb-5 shadow-xs">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-[#1B4D2E] mb-2">
                  Distributors &amp; Bulk Buyers
                </h3>
                <p className="text-xs text-[#1B4D2E]/75 mb-6 leading-relaxed">
                  Pallet, multi-case, and regional distribution across Pennsylvania and neighboring states. Consistent small-batch production capacity and reliable turnaround.
                </p>
                <div className="space-y-2.5 text-xs text-[#1B4D2E]/85">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                    <span>Tiered volume pricing schedules</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                    <span>Cold-chain refrigerated staging</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                    <span>Commercial invoicing &amp; net terms</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={scrollToInquiryForm}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Distribution Partnership</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E1AD01]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Commercial Wholesale Product Gallery (Editable from Admin) */}
      <WholesaleProductGallery
        items={wholesaleGalleryItems}
        onSelectForInquiry={handleSelectGalleryItem}
      />

      {/* 4. Need Custom Case Quantities Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-[#1B4D2E]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 bg-[#1B4D2E] text-[#FFF8E7] rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-[#E1AD01]/25">
            <div className="space-y-1 text-center md:text-left max-w-xl">
              <h4 className="font-display font-bold text-lg sm:text-xl text-white">
                Need Custom Case Quantities, Cold-Chain Delivery, or Samples?
              </h4>
              <p className="text-xs sm:text-sm text-[#FFF8E7]/80">
                We provide sample tasting kits for qualifying retail buyers, cafés, and restaurant beverage directors across Pennsylvania and neighboring regions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectGalleryItem('Sample Tasting Kit / Wholesale')}
              className="bg-[#E1AD01] hover:bg-[#f0bc0e] text-[#1B4D2E] font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              Request Wholesale Tasting Kit
            </button>
          </div>
        </div>
      </section>

      {/* 5. Dedicated Wholesale & Bulk Ordering Enquiry Form */}
      <section id="wholesale-inquiry-form" className="py-20 bg-[#FFF8E7] border-t border-[#1B4D2E]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#1B4D2E]/15 shadow-xl space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E1AD01] bg-[#1B4D2E] px-4 py-1.5 rounded-full">
                DIRECT WHOLESALE &amp; BULK INQUIRY
              </span>
              <h3 className="font-display font-black text-3xl text-[#1B4D2E]">
                Enquire About Wholesale &amp; Bulk Orders
              </h3>
              <p className="text-xs sm:text-sm text-[#1B4D2E]/75">
                Tell us about your business or upcoming event. Our team will prepare a tailored pricing quote and delivery plan.
              </p>
            </div>

            {formSubmitted ? (
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-8 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-2xl text-emerald-950">
                  Thank You! Inquiry Received
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
                  We have received your wholesale / event details. Our kitchen management will reach out via email or phone within 24 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({
                      businessName: '',
                      contactName: '',
                      email: '',
                      phone: '',
                      location: '',
                      businessType: 'Retail Store',
                      estimatedQuantity: '24 bottles (2 cases)',
                      message: '',
                    });
                  }}
                  className="mt-4 text-xs font-bold text-emerald-900 underline cursor-pointer"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl font-medium">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#1B4D2E] uppercase tracking-wider">
                      Business or Organisation Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="e.g. Green Grocer Market / Smith Wedding"
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#1B4D2E] uppercase tracking-wider">
                      Contact Person&apos;s Name *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      required
                      value={formData.contactName}
                      onChange={handleInputChange}
                      placeholder="Your Full Name"
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#1B4D2E] uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="orders@yourbusiness.com"
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#1B4D2E] uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 000-0000"
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#1B4D2E] uppercase tracking-wider">
                      Business Location (City, State)
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Philadelphia, PA / Allentown, PA"
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#1B4D2E] uppercase tracking-wider">
                      Type of Business / Event
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01] cursor-pointer"
                    >
                      <option value="Retail Store">Retail Store / Market</option>
                      <option value="Supermarket">Supermarket / Grocery Chain</option>
                      <option value="Restaurant / Cafe">Restaurant / Café</option>
                      <option value="Food Service">Food Service / Catering</option>
                      <option value="Distributor">Distributor / Wholesaler</option>
                      <option value="Wedding Host">Wedding Celebration</option>
                      <option value="Corporate Event">Corporate Event / Office Fridge</option>
                      <option value="Private Gathering">Private Party / Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-[#1B4D2E] uppercase tracking-wider">
                    Estimated Order Quantity (Multiples of 12)
                  </label>
                  <select
                    name="estimatedQuantity"
                    value={formData.estimatedQuantity}
                    onChange={handleInputChange}
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01] cursor-pointer"
                  >
                    <option value="12 bottles (1 case)">12 bottles (1 case)</option>
                    <option value="24 bottles (2 cases)">24 bottles (2 cases)</option>
                    <option value="36 bottles (3 cases)">36 bottles (3 cases)</option>
                    <option value="48 bottles (4 cases)">48 bottles (4 cases)</option>
                    <option value="60 bottles (5 cases)">60 bottles (5 cases)</option>
                    <option value="72 bottles (6 cases)">72 bottles (6 cases)</option>
                    <option value="96 bottles (8 cases)">96 bottles (8 cases)</option>
                    <option value="120 bottles (10 cases)">120 bottles (10 cases)</option>
                    <option value="240 bottles (20 cases - Quarter Pallet)">240 bottles (20 cases – Quarter Pallet)</option>
                    <option value="480 bottles (40 cases - Half Pallet)">480 bottles (40 cases – Half Pallet)</option>
                    <option value="960+ bottles (80+ cases - Full Pallet / Recurring)">960+ bottles (80+ cases – Full Pallet / Recurring)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-[#1B4D2E] uppercase tracking-wider">
                    Additional Enquiry or Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your schedule, flavor preferences, or custom labeling needs..."
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 text-xs text-[#1B4D2E]/75">
                    <ShieldCheck className="w-4 h-4 text-[#E1AD01] shrink-0" />
                    <span>Your information is handled securely and never shared.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-black text-sm px-8 py-4 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#E1AD01]" />
                    <span>Submit Wholesale Enquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
