import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, User, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import LiquidGlass from '../components/ui/LiquidGlass';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (phonenumber.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, phonenumber, email, password);
      // On success, redirect to login page with success message
      navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-start justify-center p-4 overflow-hidden"
      style={{
        background: 'url("/Video Project 4 1_frames/landing image (3).jpeg") center/cover no-repeat',
      }}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60" />

      {/* Ambient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/15 blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.175, 0.885, 0.32, 1.1] }}
        className="w-full max-w-md relative z-10 mb-8"
      >
        <LiquidGlass radius={32} strong>
          <div className="p-10 flex flex-col items-center">
            {/* Logo */}
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="Padpu Farms"
                className="w-24 h-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
              />
            </div>

            <h1 className="text-2xl font-display font-bold text-white mb-1 text-center">Create Account</h1>
            <p className="text-white/50 text-sm mb-6 text-center font-light">Join the Padpu Farms community</p>

            <form onSubmit={handleSignup} className="w-full space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-white/30 text-sm outline-none transition-all"
                    placeholder="John Doe"
                    required
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderTopColor: 'rgba(255,255,255,0.30)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
                  <input
                    type="tel"
                    value={phonenumber}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setPhonenumber(val);
                    }}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-white/30 text-sm outline-none transition-all"
                    placeholder="9876543210"
                    required
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderTopColor: 'rgba(255,255,255,0.30)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-white/30 text-sm outline-none transition-all"
                    placeholder="name@padpu.com"
                    required
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderTopColor: 'rgba(255,255,255,0.30)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-white/30 text-sm outline-none transition-all"
                    placeholder="••••••••"
                    required
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderTopColor: 'rgba(255,255,255,0.30)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-white/30 text-sm outline-none transition-all"
                    placeholder="••••••••"
                    required
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderTopColor: 'rgba(255,255,255,0.30)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-300 text-xs text-center py-2.5 px-4 rounded-xl"
                  style={{
                    background: 'rgba(251,68,104,0.12)',
                    border: '1px solid rgba(251,68,104,0.25)',
                    borderTopColor: 'rgba(251,68,104,0.4)',
                  }}
                >
                  {error}
                </motion.p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.95) 50%, rgba(217,119,6,0.9) 100%)',
                  color: '#1c1005',
                  boxShadow: '0 4px 20px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'rgba(255,255,255,0.7)',
                }}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-7 pt-5 w-full border-t border-white/10 text-center space-y-1">
              <p className="text-xs text-white/50">
                Already have an account?{' '}
                <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </LiquidGlass>
      </motion.div>
    </div>
  );
}
