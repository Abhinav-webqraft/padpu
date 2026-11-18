import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, User, Phone, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import AccountLinkingModal from '../components/auth/AccountLinkingModal';
import PhoneCompletionModal from '../components/auth/PhoneCompletionModal';

type SignupErrors = {
  name?: string;
  phonenumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupPage() {
  const [name, setName] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register, googleAuth, linkGoogleAccount } = useAuth();
  const navigate = useNavigate();

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
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Google sign up failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLinkingSuccess = (role: string) => {
    setLinkingState({ isOpen: false, email: '', credential: '' });
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handlePhoneComplete = () => {
    setShowPhoneModal(false);
    if (postAuthRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const validate = () => {
    const errs: SignupErrors = {};
    if (!name.trim()) {
      errs.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errs.name = 'Min 2 characters';
    }

    if (!/^[0-9]{10}$/.test(phonenumber)) {
      errs.phonenumber = 'Must be 10 digits';
    }

    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Min 6 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(name.trim(), phonenumber, email.trim(), password);
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
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
        className="w-full max-w-md relative z-10 rounded-3xl bg-white/[0.04] border border-white/10 p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <img src="/logo.png" alt="Padpu Farms" className="h-11 w-auto object-contain mb-3" />
          <h1 className="text-2xl font-display font-bold text-white">Create Account</h1>
          <p className="text-stone-400 text-xs mt-1 font-light">Join Padpu Farms</p>
        </div>

        {/* Google Sign Up Button */}
        <div className="mb-4">
          <GoogleAuthButton
            text="signup_with"
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

        <form onSubmit={handleSignup} noValidate className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="min-w-0">
              <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400/70" />
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors(p => ({ ...p, name: undefined }));
                    if (error) setError('');
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/30 border text-white placeholder-stone-500 text-xs outline-none transition-all ${
                    fieldErrors.name ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.name}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400/70" />
                <input
                  type="tel"
                  maxLength={10}
                  value={phonenumber}
                  onChange={e => {
                    setPhonenumber(e.target.value.replace(/\D/g, ''));
                    if (fieldErrors.phonenumber) setFieldErrors(p => ({ ...p, phonenumber: undefined }));
                    if (error) setError('');
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/30 border text-white placeholder-stone-500 text-xs outline-none transition-all ${
                    fieldErrors.phonenumber ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
                  }`}
                  placeholder="9876543210"
                />
              </div>
              {fieldErrors.phonenumber && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.phonenumber}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/70" />
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined }));
                  if (error) setError('');
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/30 border text-white placeholder-stone-500 text-xs outline-none transition-all ${
                  fieldErrors.email ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
                }`}
                placeholder="name@padpu.com"
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="min-w-0">
              <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400/70" />
                <input
                  type="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined }));
                    if (error) setError('');
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/30 border text-white placeholder-stone-500 text-xs outline-none transition-all ${
                    fieldErrors.password ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
                  }`}
                  placeholder="Min 6 chars"
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Confirm</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400/70" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors(p => ({ ...p, confirmPassword: undefined }));
                    if (error) setError('');
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/30 border text-white placeholder-stone-500 text-xs outline-none transition-all ${
                    fieldErrors.confirmPassword ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
                  }`}
                  placeholder="Re-type"
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-stone-950 amber-gradient hover:opacity-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] mt-4 disabled:opacity-50"
          >
            <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-6 font-light">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
            Sign in
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
