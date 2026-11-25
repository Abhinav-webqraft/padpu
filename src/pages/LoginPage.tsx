import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import AccountLinkingModal from '../components/auth/AccountLinkingModal';
import PhoneCompletionModal from '../components/auth/PhoneCompletionModal';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [error, setError] = useState('');
  const { login, googleAuth, linkGoogleAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || '/';

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // Account Linking Modal state
  const [linkingState, setLinkingState] = useState<{
    isOpen: boolean;
    email: string;
    name?: string;
    credential: string;
  }>({
    isOpen: false,
    email: '',
    credential: '',
  });

  // Phone Completion Modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [postAuthRole, setPostAuthRole] = useState<string>('user');

  const handleGoogleSuccess = async (credential: string) => {
    setIsGoogleLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await googleAuth(credential);

      if (result.requiresLink) {
        setLinkingState({
          isOpen: true,
          email: result.email || '',
          name: result.name || '',
          credential,
        });
        setIsGoogleLoading(false);
        return;
      }

      const userRole = result.role || 'user';
      setPostAuthRole(userRole);

      if (result.requiresPhone) {
        setShowPhoneModal(true);
      } else {
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate(redirectTo, { replace: true });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLinkingSuccess = (role: string) => {
    setLinkingState({ isOpen: false, email: '', credential: '' });
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate(redirectTo, { replace: true });
    }
  };

  const handlePhoneComplete = () => {
    setShowPhoneModal(false);
    if (postAuthRole === 'admin') {
      navigate('/admin');
    } else {
      navigate(redirectTo, { replace: true });
    }
  };

  const validate = () => {
    const errs: { identifier?: string; password?: string } = {};
    const trimmed = identifier.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!trimmed) {
      errs.identifier = 'Email or 10-digit phone is required';
    } else if (!emailRegex.test(trimmed) && !phoneRegex.test(trimmed.replace(/\D/g, ''))) {
      errs.identifier = 'Enter a valid email or 10-digit phone';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 4) {
      errs.password = 'Password must be at least 4 characters';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      const userRole = await login(identifier.trim(), password);
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email/phone or password');
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
        className="w-full max-w-sm relative z-10 rounded-3xl bg-white/[0.04] border border-white/10 p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <img src="/logo.png" alt="Padpu Farms" className="h-11 w-auto object-contain mb-3.5" />
          <h1 className="text-2xl font-display font-bold text-white">Welcome Back</h1>
          <p className="text-stone-400 text-xs mt-1 font-light">Sign in to your account</p>
        </div>

        {/* Google Sign In Button */}
        <div className="mb-4">
          <GoogleAuthButton
            text="signin_with"
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
            disabled={isGoogleLoading || isLoading}
          />
        </div>

        <div className="relative flex items-center justify-center mb-4">
          <div className="w-full border-t border-white/10" />
          <span className="px-3 text-[10px] uppercase tracking-wider text-stone-500">or</span>
          <div className="w-full border-t border-white/10" />
        </div>

        <form onSubmit={handleLogin} noValidate className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Email or Phone</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/70" />
              <input
                type="text"
                value={identifier}
                onChange={e => {
                  setIdentifier(e.target.value);
                  if (fieldErrors.identifier) setFieldErrors(p => ({ ...p, identifier: undefined }));
                  if (error) setError('');
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/30 border text-white placeholder-stone-500 text-xs outline-none transition-all ${
                  fieldErrors.identifier ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
                }`}
                placeholder="name@padpu.com"
              />
            </div>
            {fieldErrors.identifier && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.identifier}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/70" />
              <input
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined }));
                  if (error) setError('');
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/30 border text-white placeholder-stone-500 text-xs outline-none transition-all ${
                  fieldErrors.password ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
                }`}
                placeholder="••••••••"
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.password}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-stone-950 amber-gradient hover:opacity-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] mt-4 disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-6 font-light">
          Don't have an account?{' '}
          <Link
            to="/signup"
            state={{ from: redirectTo }}
            className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
          >
            Create one
          </Link>
        </p>
      </motion.div>

      {/* Account Linking Modal */}
      <AccountLinkingModal
        isOpen={linkingState.isOpen}
        onClose={() => setLinkingState({ isOpen: false, email: '', credential: '' })}
        email={linkingState.email}
        name={linkingState.name}
        credential={linkingState.credential}
        onSuccess={handleLinkingSuccess}
        linkGoogleAccount={linkGoogleAccount}
      />

      {/* Phone Completion Modal */}
      <PhoneCompletionModal
        isOpen={showPhoneModal}
        onClose={() => handlePhoneComplete()}
        onComplete={() => handlePhoneComplete()}
      />
    </div>
  );
}
