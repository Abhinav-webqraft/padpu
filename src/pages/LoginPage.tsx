import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setError('');
    setTimeout(() => {
      setIsGoogleLoading(false);
      setError('Google OAuth is ready. Connect your Google Client ID to complete login.');
    }, 600);
  };

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
    <div className="min-h-screen forest-bg relative flex items-center justify-center px-4 pt-20 pb-24">
      <div className="absolute top-[10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10 rounded-3xl bg-white/[0.04] border border-white/10 p-7 sm:p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <img src="/logo.png" alt="Padpu Farms" className="h-12 w-auto object-contain mb-4" />
          <h1 className="text-2xl font-display font-bold text-white">Welcome Back</h1>
          <p className="text-stone-400 text-xs mt-1 font-light">Sign in to your account</p>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl font-medium text-xs text-white bg-white/[0.06] hover:bg-white/10 border border-white/10 transition-all mb-4 disabled:opacity-60"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{isGoogleLoading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        <div className="relative flex items-center justify-center mb-4">
          <div className="w-full border-t border-white/10" />
          <span className="px-3 text-[10px] uppercase tracking-wider text-stone-500">or</span>
          <div className="w-full border-t border-white/10" />
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Email or Phone</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/70" />
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-stone-500 text-xs outline-none focus:border-amber-500/50 transition-all"
                placeholder="name@padpu.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/70" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-stone-500 text-xs outline-none focus:border-amber-500/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          {successMessage && <p className="text-emerald-400 text-xs text-center">{successMessage}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl text-xs text-stone-950 amber-gradient hover:opacity-95 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
            {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-stone-400">
            New here?{' '}
            <Link to="/signup" className="text-amber-400 hover:text-amber-300 font-semibold">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
