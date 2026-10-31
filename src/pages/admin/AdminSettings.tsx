import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Phone, Mail, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

type SettingsErrors = {
  email?: string;
  phone?: string;
  address?: string;
};

export default function AdminSettings() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [fieldErrors, setFieldErrors] = useState<SettingsErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/settings');
      const data = await response.json();
      if (data.success && data.data) {
        setEmail(data.data.email || '');
        setPhone((data.data.phone || '').replace(/\D/g, '').substring(0, 10));
        setAddress(data.data.address || '');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const errs: SettingsErrors = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid support email address';
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      errs.phone = 'Phone number must be 10 digits';
    }
    if (!address.trim() || address.trim().length < 5) {
      errs.address = 'Enter complete farm address';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('');
    setSaveError('');

    if (!validate()) return;

    setIsSaving(true);

    try {
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phone, address: address.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setSaveMessage('Settings updated successfully');
      } else {
        setSaveError('Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveError('An error occurred while saving');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="text-stone-400 text-xs text-center py-16">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Configuration</span>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-0.5">Store Settings</h1>
      </div>

      <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5 sm:p-8">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-white">Public Contact Details</h2>
          <p className="text-stone-400 text-xs mt-0.5">Displayed on the Contact page, Footer, and WhatsApp links.</p>
        </div>

        <form onSubmit={handleSave} noValidate className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label className="block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">
                Support Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border text-white text-xs sm:text-sm outline-none transition-colors ${
                    fieldErrors.email ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
                  }`}
                  placeholder="hello@padpufarms.in"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">
                Phone Number (10 digits) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/70" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) setPhone(val);
                    if (fieldErrors.phone) setFieldErrors(p => ({ ...p, phone: undefined }));
                  }}
                  maxLength={10}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border text-white text-xs sm:text-sm outline-none transition-colors font-sans ${
                    fieldErrors.phone ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
                  }`}
                  placeholder="9876543210"
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">
              Farm Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-400/70" />
              <textarea
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (fieldErrors.address) setFieldErrors(p => ({ ...p, address: undefined }));
                }}
                rows={3}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border text-white text-xs sm:text-sm outline-none transition-colors resize-none ${
                  fieldErrors.address ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
                }`}
                placeholder="Padpu Farms, Dakshina Kannada, Karnataka"
              />
            </div>
            {fieldErrors.address && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.address}
              </p>
            )}
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-white/10">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-stone-950 amber-gradient transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>

            {saveMessage && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {saveMessage}
              </motion.span>
            )}

            {saveError && (
              <span className="text-red-400 text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {saveError}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
