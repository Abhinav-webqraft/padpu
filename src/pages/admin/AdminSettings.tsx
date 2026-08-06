import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Phone, Mail, MapPin } from 'lucide-react';
import LiquidGlass from '../../components/ui/LiquidGlass';

export default function AdminSettings() {
  const [email, setEmail] = useState('admin@padpu.com');
  const [phone, setPhone] = useState('+91 9876543210');
  const [address, setAddress] = useState('Padpu Farms, Western Ghats, Karnataka');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    
    // Simulate save without backend
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Contact details updated successfully (Mock)');
      
      // Hide message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-white tracking-wide">
          Settings
        </h1>
      </div>

      <LiquidGlass radius={24} className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Contact Information</h2>
          <p className="text-white/50 text-sm">Update the contact details displayed across the website.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 ml-1 uppercase tracking-wider">
                Support Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                  placeholder="contact@padpu.com"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 ml-1 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                  placeholder="+91 9876543210"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 ml-1 uppercase tracking-wider">
              Farm Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-4 h-4 w-4 text-amber-400/60" />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none transition-all resize-none"
                placeholder="Enter complete farm address..."
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4 border-t border-white/10">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                color: '#1c1005'
              }}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>

            {saveMessage && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-400 text-sm flex items-center gap-2"
              >
                {saveMessage}
              </motion.span>
            )}
          </div>
        </form>
      </LiquidGlass>
    </div>
  );
}
