import React, { useState } from 'react';
import { SiteContent } from '../types';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Instagram, 
  Send, 
  CheckCircle2, 
  MessageCircle,
  ExternalLink
} from 'lucide-react';

interface ContactSectionProps {
  content: SiteContent;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ content }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 400);
  };

  return (
    <section id="contact" className="py-20 bg-[#FFF8E7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center space-x-2 bg-[#1B4D2E]/10 border border-[#1B4D2E]/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1B4D2E]">
            <MapPin className="w-3.5 h-3.5 text-[#E1AD01]" />
            <span>CONNECT WITH DELIGHTFUL JUICE</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1B4D2E] tracking-tight">
            Visit Us or Get in Touch
          </h2>

          <p className="text-xs sm:text-sm text-[#1B4D2E]/75 leading-relaxed">
            Have a question about bottle orders, custom catering packages, or retail distribution? We would love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Details Cards */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Primary Details Card */}
            <div className="bg-[#1B4D2E] text-[#FFF8E7] rounded-3xl p-6 sm:p-7 shadow-lg border border-[#E1AD01]/30 space-y-6">
              
              <div>
                <span className="text-xs font-bold text-[#E1AD01] uppercase tracking-wider block mb-1">
                  Our Quakertown Location
                </span>
                <h3 className="font-display font-bold text-2xl text-white">
                  Delightful Juice Headquarters
                </h3>
                <p className="text-xs text-[#FFF8E7]/80 mt-1">
                  Commercial Kitchen & Customer Order Pickup
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#143822] text-[#E1AD01] flex items-center justify-center shrink-0 border border-[#E1AD01]/30">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Address</div>
                    <div className="text-[#FFF8E7]/80">{content.address}</div>
                    <div className="text-[#FFF8E7]/80">{content.cityStateZip}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#143822] text-[#E1AD01] flex items-center justify-center shrink-0 border border-[#E1AD01]/30">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Phone & WhatsApp</div>
                    <a
                      href={`tel:${content.phone.replace(/[^0-9]/g, '')}`}
                      className="text-[#E1AD01] hover:underline font-semibold block"
                    >
                      {content.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#143822] text-[#E1AD01] flex items-center justify-center shrink-0 border border-[#E1AD01]/30">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Email</div>
                    <a
                      href={`mailto:${content.email}`}
                      className="text-[#FFF8E7]/80 hover:text-white"
                    >
                      {content.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#143822] text-[#E1AD01] flex items-center justify-center shrink-0 border border-[#E1AD01]/30">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Operating Hours</div>
                    <div className="text-[#FFF8E7]/80">{content.operatingHours}</div>
                  </div>
                </div>

              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-[#FFF8E7]/15 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#FFF8E7]/80">Follow our fresh drops:</span>
                <div className="flex items-center space-x-2">
                  <a
                    href="https://instagram.com/delightful_juicecreation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#143822] text-[#E1AD01] hover:bg-[#E1AD01] hover:text-[#1B4D2E] transition-all"
                    title="Instagram @delightful_juicecreation"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/${content.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#143822] text-[#E1AD01] hover:bg-[#E1AD01] hover:text-[#1B4D2E] transition-all"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#1B4D2E]/15 shadow-md">
            {sent ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-2xl text-[#1B4D2E]">Message Sent!</h3>
                <p className="text-xs sm:text-sm text-[#1B4D2E]/80 max-w-sm mx-auto">
                  Thank you for reaching out. We will respond promptly to your email or telephone number.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-3 text-xs font-bold text-[#E1AD01] bg-[#1B4D2E] px-4 py-2 rounded-lg"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#1B4D2E] mb-1">
                    Send Us a Message
                  </h3>
                  <p className="text-xs text-[#1B4D2E]/70">
                    Direct message our kitchen team for special orders or general questions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(484) 000-0000"
                      className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B4D2E]/70 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what drinks or questions you have in mind..."
                    className="w-full bg-[#FFF8E7] border border-[#1B4D2E]/20 rounded-xl p-3 text-xs sm:text-sm text-[#1B4D2E] focus:outline-hidden focus:ring-2 focus:ring-[#E1AD01]"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#1B4D2E] hover:bg-[#143822] text-[#FFF8E7] font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#E1AD01]" />
                    <span>Send Message to Kitchen</span>
                  </button>

                  <a
                    href={`https://wa.me/${content.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Direct</span>
                  </a>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
