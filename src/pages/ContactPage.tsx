import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

type FieldErrors = {
  name?: string;
  emailOrPhone?: string;
  subject?: string;
  message?: string;
};

export default function ContactPage() {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({ name: '', emailOrPhone: '', subject: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
      .catch(() => { });
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

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    const trimmedName = formData.name.trim();
    const trimmedContact = formData.emailOrPhone.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName) {
      errs.name = 'Full name is required';
    } else if (trimmedName.length < 2) {
      errs.name = 'Enter at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const cleanDigits = trimmedContact.replace(/\D/g, '');

    if (!trimmedContact) {
      errs.emailOrPhone = 'Email or 10-digit phone is required';
    } else if (!emailRegex.test(trimmedContact) && !phoneRegex.test(cleanDigits)) {
      errs.emailOrPhone = 'Enter a valid email or 10-digit phone';
    }

    if (!trimmedMessage) {
      errs.message = 'Please enter your message';
    } else if (trimmedMessage.length < 10) {
      errs.message = 'Message must be at least 10 characters';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    if (!token) {
      setError('Please sign in to send a message.');
      return;
    }

    setIsSubmitting(true);

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

  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors(prev => ({ ...prev, [key]: undefined }));
    }
    if (error) setError('');
  };

  return (
    <div className="min-h-screen forest-bg relative overflow-hidden pt-20 md:pt-28 pb-28 md:pb-16">
      <div className="absolute top-[15%] right-[-10%] w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[15%] left-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest text-amber-400 border border-amber-500/20 bg-amber-500/10 uppercase mb-2.5">
            Contact Us
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-bold text-2xl sm:text-4xl text-white"
          >
            Get in <span className="amber-gradient-text">Touch</span>
          </motion.h1>
          <p className="text-stone-400 text-xs sm:text-sm font-light mt-1">
            Questions, bulk orders, or farm inquiries — reach out anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full min-w-0 lg:col-span-7 rounded-3xl bg-white/[0.04] border border-white/10 p-5 sm:p-7"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">Send a Message</h2>
              {!token && (
                <Link to="/login" className="text-[11px] font-semibold text-amber-400 hover:text-amber-300">
                  Sign in required →
                </Link>
              )}
            </div>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-1">Message Sent</h3>
                <p className="text-stone-400 text-xs">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full min-w-0">
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">
                      Full Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => updateField('name', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-black/30 border text-white placeholder-stone-500 text-xs sm:text-sm outline-none transition-colors ${fieldErrors.name
                          ? 'border-red-500/60 focus:border-red-500'
                          : 'border-white/10 focus:border-amber-500/50'
                        }`}
                    />
                    {fieldErrors.name && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.name}</span>
                      </p>
                    )}
                  </div>

                  <div className="w-full min-w-0">
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">
                      Email / Phone <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="you@example.com"
                      value={formData.emailOrPhone}
                      onChange={e => updateField('emailOrPhone', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-black/30 border text-white placeholder-stone-500 text-xs sm:text-sm outline-none transition-colors ${fieldErrors.emailOrPhone
                          ? 'border-red-500/60 focus:border-red-500'
                          : 'border-white/10 focus:border-amber-500/50'
                        }`}
                    />
                    {fieldErrors.emailOrPhone && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.emailOrPhone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Order or product inquiry"
                    value={formData.subject}
                    onChange={e => updateField('subject', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-stone-500 text-xs sm:text-sm outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">
                    Message <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={e => updateField('message', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-black/30 border text-white placeholder-stone-500 text-xs sm:text-sm outline-none transition-colors resize-none ${fieldErrors.message
                        ? 'border-red-500/60 focus:border-red-500'
                        : 'border-white/10 focus:border-amber-500/50'
                      }`}
                  />
                  {fieldErrors.message && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.message}</span>
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {error}
                    </span>
                    {!token && (
                      <Link to="/login" className="font-bold underline text-amber-400 shrink-0">
                        Sign In
                      </Link>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-stone-950 amber-gradient hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
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
            className="w-full min-w-0 lg:col-span-5 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {[
                { icon: Phone, label: 'Phone', value: settings.phone },
                { icon: Mail, label: 'Email', value: settings.email },
                { icon: MapPin, label: 'Location', value: settings.address },
                { icon: Clock, label: 'Hours', value: 'Mon – Sat, 9 AM – 6 PM' },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 min-w-0"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</p>
                    <p className="font-semibold text-white text-xs mt-0.5 break-words leading-snug">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={`https://wa.me/${settings.phone.replace(/\D/g, '')}?text=Hi%2C%20I%27m%20interested%20in%20your%20honey%20products!`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-xs hover:opacity-90 transition-opacity"
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
