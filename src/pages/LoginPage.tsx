import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import LiquidGlass from '../components/ui/LiquidGlass';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const userRole = await login(identifier, password);
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
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
        className="w-full max-w-md relative z-10"
      >
        <LiquidGlass radius={32} strong>
          <div className="p-10 flex flex-col items-center">
            {/* Logo */}
            <div className="mb-8">
              <img
                src="/logo.png"
                alt="Padpu Farms"
                className="w-28 h-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
              />
            </div>

            {/* User icon with glass ring */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{
                background: 'linear-gradient(145deg, rgba(245,158,11,0.3), rgba(245,158,11,0.1))',
                boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.6), 0 4px 16px rgba(245,158,11,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderTopColor: 'rgba(255,255,255,0.7)',
              }}
            >
              <User className="w-8 h-8 text-amber-400" />
            </div>

            <h1 className="text-2xl font-display font-bold text-white mb-1 text-center">Welcome Back</h1>
            <p className="text-white/50 text-sm mb-8 text-center font-light">Sign in to Padpu Farms portal</p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Email or Phone Number</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-white placeholder-white/30 text-sm outline-none transition-all"
                    placeholder="name@padpu.com or 9876543210"
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
                <label className="block text-xs font-semibold text-white/60 mb-1.5 ml-1 uppercase tracking-wider">Password</label>
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

              {successMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-300 text-xs text-center py-2.5 px-4 rounded-xl"
                  style={{
                    background: 'rgba(74,222,128,0.12)',
                    border: '1px solid rgba(74,222,128,0.25)',
                    borderTopColor: 'rgba(74,222,128,0.4)',
                  }}
                >
                  {successMessage}
                </motion.p>
              )}

              {/* Submit button — liquid glass amber */}
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
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-7 pt-5 w-full border-t border-white/10 text-center space-y-1">
              <p className="text-xs text-white/50">
                Don't have an account?{' '}
                <Link to="/signup" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </LiquidGlass>
      </motion.div>
    </div>
  );
}
