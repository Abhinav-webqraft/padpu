import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import AnimatedSection from '../components/ui/AnimatedSection';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }, 3000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f170c]">
      {/* Faded Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          background: 'url("/scenic-bg.jpeg") center/cover no-repeat fixed',
        }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0f170c]/60 via-transparent to-[#0f170c]" />

      {/* Liquid Glass Ambient Orbs */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-green-500/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="relative py-24 pt-32 text-center">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest text-amber-500 border border-amber-500/20 bg-amber-500/10 uppercase mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            ✦ Contact ✦
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display font-bold text-4xl md:text-6xl text-white mb-4">
            Get In Touch
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-400 font-light text-lg max-w-xl mx-auto">
            Questions about our honey? Custom orders? We'd love to hear from you!
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <AnimatedSection direction="left">
            <div className="glass p-8 relative overflow-hidden">
              <h2 className="font-display font-bold text-2xl text-white mb-6">Send Us a Message</h2>

              {submitted ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="font-display font-bold text-xl text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400 text-sm">We'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Subject</label>
                    <input
                      type="text"
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={e => setFormData(f => ({ ...f, subject: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us everything..."
                      value={formData.message}
                      onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-stone-900 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all amber-gradient"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </motion.button>
                </form>
              )}
            </div>
          </AnimatedSection>

          {/* Contact Info */}
          <AnimatedSection direction="right" className="flex flex-col gap-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">Let's Talk</h2>
              <p className="text-gray-400 font-light leading-relaxed">
                Whether you have questions about our products, want to place a bulk order, or just want to know more about our bees — we're always happy to chat!
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: Phone,
                  label: 'Phone',
                  value: '+91 98765 43210',
                  sub: 'Mon–Sat, 9:00 AM – 6:00 PM IST',
                  color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
                },
                {
                  icon: Mail,
                  label: 'Email',
                  value: 'hello@padpufarms.in',
                  sub: 'We reply within 24 hours',
                  color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
                },
                {
                  icon: MapPin,
                  label: 'Farm Address',
                  value: 'Padpu Village, Kangra District',
                  sub: 'Himachal Pradesh — 176 001, India',
                  color: 'text-green-400 bg-green-400/10 border-green-400/20',
                },
              ].map(({ icon: Icon, label, value, sub, color }) => (
                <div key={label} className="flex gap-4 p-5 rounded-2xl glass-light border border-white/10 hover:bg-white/5 transition-colors">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="font-semibold text-white text-sm mt-0.5">{value}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/919876543210?text=Hi%2C%20I%27m%20interested%20in%20your%20honey%20products!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white text-sm hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(37,211,102,0.2)]"
              style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp — Quickest Response!
            </a>

            {/* Working hours */}
            <div className="p-5 rounded-2xl glass border-white/10">
              <h3 className="font-semibold text-white text-sm mb-3">Business Hours</h3>
              <div className="space-y-1.5 text-sm text-gray-400">
                <div className="flex justify-between"><span>Monday – Friday</span><span className="font-medium text-white">9:00 AM – 6:00 PM</span></div>
                <div className="flex justify-between"><span>Saturday</span><span className="font-medium text-white">10:00 AM – 4:00 PM</span></div>
                <div className="flex justify-between"><span>Sunday</span><span className="text-gray-500">Closed</span></div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
