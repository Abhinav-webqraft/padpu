import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PhoneCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function PhoneCompletionModal({
  isOpen,
  onClose,
  onComplete,
}: PhoneCompletionModalProps) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateProfile } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateProfile({ phonenumber: cleanPhone });
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to update phone number');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-[#120e0a] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">Add Phone Number</h2>
              <p className="text-stone-400 text-xs">For order updates & delivery coordination</p>
            </div>
          </div>

          <p className="text-stone-300 text-xs leading-relaxed mb-4">
            Welcome to Padpu Farms! Please provide your phone number so we can notify you about fresh harvests and order deliveries.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">
                10-Digit Mobile Number
              </label>
              <div className="relative">
                <span className="text-stone-500 text-xs absolute left-3.5 top-1/2 -translate-y-1/2 font-sans">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setPhone(digits);
                    if (error) setError('');
                  }}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm outline-none focus:border-amber-500/50 font-sans"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-stone-950 amber-gradient hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
