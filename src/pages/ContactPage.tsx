import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const { role, user, token } = useAuth();
  const [formData, setFormData] = useState({ name: '', emailOrPhone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    phone: '+91 98765 43210',
    email: 'hello@padpufarms.in',
    address: 'Padpu Farms, Dakshina Kannada, Karnataka'
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings({
            phone: data.data.phone || '+91 98765 43210',
            email: data.data.email || 'hello@padpufarms.in',
            address: data.data.address || 'Padpu Farms, Dakshina Kannada, Karnataka'
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        emailOrPhone: user.email || user.phonenumber || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to send message');

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData(prev => ({ ...prev, subject: '', message: '' }));
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen forest-bg relative overflow-hidden pt-20 md:pt-28 pb-28 md:pb-16">
      <div className="absolute top-[15%] right-[-10%] w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[15%] left-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-bold text-3xl sm:text-4xl text-white"
          >
            Get in <span className="amber-gradient-text">Touch</span>
          </motion.h1>
          <p className="text-stone-400 text-sm font-light mt-1">
            Questions, custom orders, or farm inquiries — reach out anytime.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 rounded-3xl bg-white/[0.04] border border-white/10 p-6 sm:p-8"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-5">Send a Message</h2>

            {submitted ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-display font-bold text-lg text-white mb-1">Message Sent</h3>
                <p className="text-stone-400 text-xs">We'll get back to you within 24 hours.</p>
              </div>
            ) : !role ? (
              <div className="text-center py-10">
                <h3 className="font-display font-bold text-lg text-white mb-1">Sign in to message us</h3>
                <p className="text-stone-400 text-xs mb-5">Log in to send direct inquiries from your account.</p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-2.5 amber-gradient text-stone-950 text-xs font-bold rounded-xl"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-stone-500 text-sm outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Email / Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="john@example.com"
                      value={formData.emailOrPhone}
                      onChange={e => setFormData(f => ({ ...f, emailOrPhone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-stone-500 text-sm outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    placeholder="Order inquiry"
                    value={formData.subject}
                    onChange={e => setFormData(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-stone-500 text-sm outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we help?"
                    value={formData.message}
                    onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-stone-500 text-sm outline-none focus:border-amber-500/50 resize-none"
                  />
                </div>
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs text-stone-950 amber-gradient hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-5 space-y-3.5"
          >
            {[
              { icon: Phone, label: 'Phone', value: settings.phone },
              { icon: Mail, label: 'Email', value: settings.email },
              { icon: MapPin, label: 'Location', value: settings.address },
              { icon: Clock, label: 'Hours', value: 'Mon – Sat, 9 AM – 6 PM' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</p>
                  <p className="font-semibold text-white text-xs mt-0.5 truncate">{value}</p>
                </div>
              </div>
            ))}

            <a
              href={`https://wa.me/${settings.phone.replace(/\D/g, '')}?text=Hi%2C%20I%27m%20interested%20in%20your%20honey%20products!`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-white text-xs hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
