import React, { useState } from 'react';
import { SiteContent, BottleSize } from '../types';
import { dataRepo } from '../lib/storage';
import { 
  Calendar, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  MessageCircle, 
  GlassWater, 
  Tag,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EventsCateringSectionProps {
  content: SiteContent;
}

export const EventsCateringSection: React.FC<EventsCateringSectionProps> = ({ content }) => {
  const [eventType, setEventType] = useState('Wedding Reception');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState<number>(75);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [customLabeling, setCustomLabeling] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([
    'Zobo (Hibiscus / Sorrel)',
    'Ginger Mango',
    'Tigernut Milk (Kunu Aya)',
  ]);
  const [selectedSizes, setSelectedSizes] = useState<BottleSize[]>(['35cl', '50cl']);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypesList = [
    'Wedding Reception',
    'Birthday Celebration',
    'Family Reunion',
    'Corporate Gathering',
    'Anniversary',
    'Engagement Party',
    'Holiday Party',
    'Pop-up Event / Festival',
  ];

  const allFlavorsList = [
    'Zobo (Hibiscus / Sorrel)',
    'Pure Organic Ginger',
    'Ginger Mango',
    'Ginger Pineapple',
    'Ginger Lychee',
    'Tigernut Milk (Kunu Aya)',
  ];

  // Estimated bottles calculation (typical recommendation: 1.5 - 2 bottles per guest for a 3-4 hr event)
  const recommendedBottles = Math.ceil(guestCount * 1.5);
  const estimatedMinBudget = Math.round(recommendedBottles * 4.25);
  const estimatedMaxBudget = Math.round(recommendedBottles * 5.75);

  const toggleFlavor = (flavor: string) => {
    if (selectedFlavors.includes(flavor)) {
      if (selectedFlavors.length > 1) {
        setSelectedFlavors(selectedFlavors.filter((f) => f !== flavor));
      }
    } else {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const toggleSize = (size: BottleSize) => {
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter((s) => s !== size));
      }
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    setIsSubmitting(true);
    setTimeout(() => {
      dataRepo.addInquiry({
        fullName,
        email: email || 'Not provided',
        phone,
        eventType,
        eventDate: eventDate || 'TBD',
        guestCount,
        eventLocation: location || 'Quakertown & Surrounding Area',
        bottleSizesNeeded: selectedSizes,
        selectedFlavors,
        customLabelingNeeded: customLabeling,
        budgetRange: `$${estimatedMinBudget} - $${estimatedMaxBudget}`,
        message: message || `Estimated ${recommendedBottles} bottles requested for ${guestCount} guests.`,
      });

      setIsSubmitting(false);
      setSubmitted(true);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#E1AD01', '#1B4D2E', '#FFF8E7'],
        });
      } catch (err) {
        console.warn(err);
      }
    }, 600);
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello Delightful Juice! I would like to request an Event Catering Quote.\n\n` +
      `*Event Type:* ${eventType}\n` +
      `*Date:* ${eventDate || 'TBD'}\n` +
      `*Guest Count:* ${guestCount} (~${recommendedBottles} bottles recommended)\n` +
      `*Selected Flavors:* ${selectedFlavors.join(', ')}\n` +
      `*Bottle Sizes:* ${selectedSizes.join(', ')}\n` +
      `*Custom Branded Labels:* ${customLabeling ? 'Yes' : 'No'}\n` +
      `*Location:* ${location || 'PA / Regional'}\n` +
      `*Contact:* ${fullName} (${phone})\n\n` +
      `Looking forward to hearing back with official packages!`
    );
    window.open(`https://wa.me/${content.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <section id="events-catering" className="py-20 bg-[#FFF8E7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center space-x-2 bg-[#1B4D2E]/10 border border-[#1B4D2E]/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1B4D2E]">
            <Sparkles className="w-3.5 h-3.5 text-[#E1AD01]" />
            <span>CELEBRATIONS & CORPORATE GATHERINGS</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1B4D2E] tracking-tight">
            Events & Catering Service
          </h2>

          <p className="text-sm sm:text-base text-[#1B4D2E]/80 leading-relaxed">
            Elevate your wedding, birthday, family reunion, or corporate gathering with refreshing, chilled bottles of Delightful Juice. We provide custom bottle labeling, signature cold ice coolers, and bulk discounts.
          </p>
        </div>

        {/* 2-Column Layout: Interactive Calculator & Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Drink Estimator & Highlights */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Recommendation Card */}
            <div className="bg-[#1B4D2E] text-[#FFF8E7] rounded-3xl p-6 sm:p-7 shadow-lg border-2 border-[#E1AD01]/30">
              <h3 className="font-display font-bold text-2xl text-[#E1AD01] mb-2">
                Live Catering Estimator
              </h3>
              <p className="text-xs text-[#FFF8E7]/80 mb-6">
                Adjust your guest count on the right to view custom bottle recommendations and package tiers.
              </p>

              <div className="space-y-4">
                <div className="bg-[#143822] p-4 rounded-2xl flex items-center justify-between border border-[#E1AD01]/20">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-[#E1AD01]" />
                    <div>
                      <div className="text-xs text-[#FFF8E7]/70">Expected Guests</div>
                      <div className="font-bold text-lg text-white">{guestCount} Guests</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#FFF8E7]/70">Recommended Sips</div>
                    <div className="font-black text-xl text-[#E1AD01]">~{recommendedBottles} Bottles</div>
                  </div>
                </div>

                <div className="bg-[#143822] p-4 rounded-2xl flex items-center justify-between border border-[#E1AD01]/20">
                  <div>
                    <div className="text-xs text-[#FFF8E7]/70">Estimated Package Tier</div>
                    <div className="font-extrabold text-base text-white">
                      ${estimatedMinBudget} - ${estimatedMaxBudget}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold bg-[#E1AD01] text-[#1B4D2E] px-2.5 py-1 rounded-md">
                    Wholesale Tier Rate
                  </span>
                </div>
              </div>

              {/* Service Inclusions */}
              <div className="mt-6 pt-5 border-t border-[#FFF8E7]/15 space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>Chilled delivery on your event day</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>Optional customized bottle labels with couple/company logo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>Choice of any 6 signature flavors (Zobo, Ginger, Tigernut)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E1AD01] shrink-0" />
                  <span>Direct delivery across Quakertown, Bucks, Lehigh & Montgomery Counties</span>
                </div>
              </div>
            </div>

            {/* Quick Call / WhatsApp Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#1B4D2E]/15 shadow-sm">
              <h4 className="font-bold text-sm text-[#1B4D2E] mb-1">Need a fast quote in under 15 minutes?</h4>
              <p className="text-xs text-[#1B4D2E]/70 mb-4">
                Chat directly with CEO Oluyemi B. Ajibolade via WhatsApp with your event specs.
              </p>
              <button
                type="button"
                onClick={handleWhatsAppInquiry}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Instant Quote on WhatsApp</span>
              </button>
            </div>

          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/15 shadow-md">
            
            {submitted ? (
              <div className="text-center py-12 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-display font-extrabold text-2xl text-[#1B4D2E]">
                  Inquiry Received!
                </h3>
                <p className="text-sm text-[#1B4D2E]/80 max-w-md mx-auto">
                  Thank you, <span className="font-bold">{fullName}</span>. Your event catering request for {guestCount} guests has been logged. Our team will review your menu selection and reach out within 24 hours.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={handleWhatsAppInquiry}
                    className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Follow Up on WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFullName('');
                      setPhone('');
                    }}
                    className="inline-flex items-center justify-center bg-[#FFF8E7] text-[#1B4D2E] font-bold px-5 py-2.5 rounded-xl text-xs border border-[#1B4D2E]/20 cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#1B4D2E] mb-1">
                    Request an Event Catering Proposal
                  </h3>
                  <p className="text-xs text-[#1B4D2E]/70">
                    Fill out your event details below to receive a customized quote tailored to your gathering.
                  </p>
                </div>

                {/* Event Type & Guest Count Slider */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1.5">
                      Event Type
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    >
                      {eventTypesList.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1.5">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    />
                  </div>
                </div>

                {/* Guest Count Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70">
                      Estimated Guest Count
                    </label>
                    <span className="text-sm font-extrabold text-[#1B4D2E] bg-[#E1AD01]/25 px-2.5 py-0.5 rounded-lg">
                      {guestCount} Guests
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="500"
                    step="5"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full h-2 bg-[#FFF8E7] rounded-lg appearance-none cursor-pointer accent-[#1B4D2E]"
                  />
                  <div className="flex justify-between text-[10px] text-[#1B4D2E]/50 mt-1 font-semibold">
                    <span>15 Intimate</span>
                    <span>100 Standard</span>
                    <span>250 Grand</span>
                    <span>500+ Mega</span>
                  </div>
                </div>

                {/* Flavor Checkboxes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-2">
                    Select Flavors Desired (Multiple allowed):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allFlavorsList.map((flavor) => {
                      const isChecked = selectedFlavors.includes(flavor);
                      return (
                        <button
                          type="button"
                          key={flavor}
                          onClick={() => toggleFlavor(flavor)}
                          className={`p-2 rounded-xl text-[11px] font-semibold text-left transition-all border cursor-pointer ${
                            isChecked
                              ? 'bg-[#1B4D2E] text-[#FFF8E7] border-[#1B4D2E]'
                              : 'bg-[#FFF8E7] text-[#1B4D2E]/80 border-[#1B4D2E]/15 hover:bg-[#1B4D2E]/5'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs">{isChecked ? '✓' : '+'}</span>
                            <span className="truncate">{flavor}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottle Sizes Needed */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-2">
                    Preferred Bottle Sizes:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['35cl', '50cl', '1L'] as BottleSize[]).map((size) => {
                      const isChecked = selectedSizes.includes(size);
                      return (
                        <button
                          type="button"
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isChecked
                              ? 'bg-[#E1AD01] text-[#1B4D2E] border-[#E1AD01]'
                              : 'bg-[#FFF8E7] text-[#1B4D2E]/80 border-[#1B4D2E]/20'
                          }`}
                        >
                          {size === '35cl' ? '35cl Pocket Sip' : size === '50cl' ? '50cl Standard' : '1 Litre Family Jug'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Labeling Switch */}
                <div className="bg-[#FFF8E7] p-3 rounded-2xl border border-[#1B4D2E]/15 flex items-center justify-between">
                  <div className="pr-3">
                    <div className="text-xs font-bold text-[#1B4D2E]">Custom Event Branded Labels?</div>
                    <div className="text-[11px] text-[#1B4D2E]/70">Add your wedding monogram, anniversary photo, or corporate logo to every bottle.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={customLabeling}
                    onChange={(e) => setCustomLabeling(e.target.checked)}
                    className="w-5 h-5 accent-[#1B4D2E] cursor-pointer"
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Oluyemi Ajibolade"
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(484) 792-8023"
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Event Venue / City
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Quakertown, PA"
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3 py-2 text-xs text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Special Requests & Setup Needs
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about ice coolers, dietary requirements, or specific setup timing..."
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl p-3 text-xs text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#E1AD01]" />
                    <span>{isSubmitting ? 'Sending Proposal Request...' : 'Submit Catering Request'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppInquiry}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-xl text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
