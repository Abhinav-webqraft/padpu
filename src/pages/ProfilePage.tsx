import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useWishlist } from '../context/WishlistContext';
import {
  User,
  Package,
  Heart,
  LogOut,
  X,
  ChevronRight,
  MapPin,
  CreditCard,
  Edit2,
  Phone,
  Mail,
  Calendar,
  Shield,
  ArrowUpRight,
  ShoppingBag,
} from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  processing: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  packed: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  dispatched: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout, role, user, updateProfile } = useAuth();
  const { orders, loading: loadingOrders } = useOrders();
  const { wishlistItems } = useWishlist();

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({ name: '', email: '', location: '', password: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  const userName = user?.name || 'Member';
  const userEmail = user?.email || '—';
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenUpdateModal = () => {
    if (user) {
      setUpdateData({ name: user.name, email: user.email, location: user.location || '', password: '' });
    }
    setUpdateError('');
    setUpdateSuccess('');
    setShowUpdateModal(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');

    if (!updateData.name.trim() || updateData.name.trim().length < 2) {
      setUpdateError('Name must be at least 2 characters');
      return;
    }
    if (!updateData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email.trim())) {
      setUpdateError('Please enter a valid email address');
      return;
    }
    if (updateData.password && updateData.password.length < 6) {
      setUpdateError('New password must be at least 6 characters');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({
        ...updateData,
        name: updateData.name.trim(),
        email: updateData.email.trim(),
        location: updateData.location.trim(),
      });
      setUpdateSuccess('Saved!');
      setTimeout(() => setShowUpdateModal(false), 1200);
    } catch (err: any) {
      setUpdateError(err.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="min-h-screen forest-bg relative overflow-hidden pt-20 md:pt-28 pb-28 md:pb-16">
      {/* Subtle Ambient Glows */}
      <div className="absolute top-0 left-[-10%] w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[140px] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-5">
        {/* Top Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white/[0.04] border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl amber-gradient flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)] shrink-0">
              <User className="w-9 h-9 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">{userName}</h1>
                {role === 'admin' && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 rounded-full px-2.5 py-0.5">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <p className="text-stone-400 text-sm mt-0.5">{userEmail}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-stone-400">
                {user?.phonenumber && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400/80" /> {user.phonenumber}
                  </span>
                )}
                {user?.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400/80" /> {user.location}
                  </span>
                )}
                {user?.created_at && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400/80" /> Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {role === 'admin' && (
              <Link
                to="/admin"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-950 amber-gradient hover:opacity-90 transition-all"
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={handleOpenUpdateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 transition-all"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3 sm:gap-4"
        >
          <Link
            to="/orders"
            className="rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/30 p-4 sm:p-5 flex items-center justify-between group transition-all"
          >
            <div>
              <p className="text-xs text-stone-400 font-medium mb-1">Orders</p>
              <p className="font-sans font-bold text-xl sm:text-2xl text-white">{orders.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </Link>

          <Link
            to="/wishlist"
            className="rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/30 p-4 sm:p-5 flex items-center justify-between group transition-all"
          >
            <div>
              <p className="text-xs text-stone-400 font-medium mb-1">Wishlist</p>
              <p className="font-sans font-bold text-xl sm:text-2xl text-white">{wishlistItems.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
          </Link>

          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 font-medium mb-1">Spent</p>
              <p className="font-sans font-bold text-xl sm:text-2xl text-amber-400">₹{totalSpent.toFixed(0)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 hidden sm:flex">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        {/* Two-Column Grid: Account Details & Recent Orders */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 rounded-3xl bg-white/[0.04] border border-white/10 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">Details</h2>
                <button
                  onClick={handleOpenUpdateModal}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  Change
                </button>
              </div>
              <div className="space-y-3.5 text-sm">
                {[
                  { icon: User, label: 'Name', value: userName },
                  { icon: Mail, label: 'Email', value: userEmail },
                  { icon: Phone, label: 'Phone', value: user?.phonenumber || 'Not set' },
                  { icon: MapPin, label: 'Location', value: user?.location || 'Not set' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 gap-3">
                    <span className="text-stone-400 flex items-center gap-2 text-xs">
                      <Icon className="w-3.5 h-3.5 text-amber-500/70" />
                      {label}
                    </span>
                    <span className="text-stone-200 font-medium text-xs truncate max-w-[160px]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Browse Shop
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-white"
              >
                Support <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-3 rounded-3xl bg-white/[0.04] border border-white/10 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">Recent Orders</h2>
              <Link
                to="/orders"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingOrders ? (
              <div className="flex-1 flex items-center justify-center py-10 text-stone-500 text-xs">
                Loading orders...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                <Package className="w-8 h-8 text-stone-600 mb-2" />
                <p className="text-stone-400 text-sm font-medium">No orders yet</p>
                <Link
                  to="/shop"
                  className="mt-3 px-4 py-2 rounded-xl amber-gradient text-stone-950 font-bold text-xs"
                >
                  Shop Honey
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to="/orders"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-amber-500/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={order.items[0]?.product?.images?.[0] || '/images/300G MULTI.png'}
                        alt=""
                        className="w-11 h-11 rounded-xl object-cover bg-stone-900 border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-xs font-sans">#{order.orderNumber}</p>
                          <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 capitalize ${STATUS_STYLES[order.orderStatus] || STATUS_STYLES.confirmed}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-stone-400 text-[11px] mt-0.5 truncate">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-amber-400 font-bold text-sm font-sans">₹{order.total.toFixed(0)}</span>
                      <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setShowUpdateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#120e0a] border border-white/15 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-display font-bold text-white">Edit Profile</h2>
                <button onClick={() => setShowUpdateModal(false)} className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    value={updateData.name}
                    onChange={e => setUpdateData({ ...updateData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-amber-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={updateData.email}
                    onChange={e => setUpdateData({ ...updateData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-amber-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    value={updateData.location}
                    onChange={e => setUpdateData({ ...updateData, location: e.target.value })}
                    placeholder="City, State"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={updateData.password}
                    onChange={e => setUpdateData({ ...updateData, password: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-amber-500/50"
                  />
                </div>

                {updateError && <p className="text-red-400 text-xs text-center">{updateError}</p>}
                {updateSuccess && <p className="text-emerald-400 text-xs text-center">{updateSuccess}</p>}

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-3 mt-2 rounded-xl font-bold text-sm text-stone-950 amber-gradient transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
