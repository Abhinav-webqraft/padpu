import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { mockOrders } from '../data/mockData';
import { User, Package, Heart, LogOut, X, ChevronRight, MapPin, CreditCard } from 'lucide-react';

type OrderStatus = 'confirmed' | 'processing' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  processing: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  packed: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  dispatched: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  delivered: 'bg-green-500/15 text-green-300 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const STATUS_STEPS = ['confirmed', 'processing', 'packed', 'dispatched', 'delivered'];

export default function ProfilePage() {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const [showOrders, setShowOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalSpent = mockOrders.reduce((s, o) => s + o.total, 0);
  const userName = role === 'admin' ? 'Admin User' : 'Demo Customer';
  const userEmail = role === 'admin' ? 'admin@padpu.com' : 'user@padpu.com';

  return (
    <div className="min-h-screen bg-[#0d0a05] relative overflow-hidden pt-20 pb-24 md:pb-8">
      {/* Background Image Layer matching Landing Page */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          background: 'url("/scenic-bg.jpeg") center/cover no-repeat fixed',
        }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0d0a05] via-[#0d0a05]/80 to-[#0d0a05]" />

      {/* Ambient orbs */}
      <div className="absolute top-0 left-[-10%] w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-[-10%] w-[400px] h-[400px] rounded-full bg-green-500/10 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-20 relative z-10">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 rounded-3xl amber-gradient flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] flex-shrink-0">
              <User className="w-10 h-10 text-stone-900" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="font-display font-bold text-2xl text-white">{userName}</h1>
              <p className="text-gray-400 text-sm mt-1">{userEmail}</p>
              <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider mt-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-0.5 inline-block">
                {role === 'admin' ? '👑 Admin' : '🐝 Honey Lover'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-400/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { label: 'Orders', value: mockOrders.length, icon: Package },
            { label: 'Wishlist', value: '0', icon: Heart },
            { label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, icon: CreditCard },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <Icon className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              <div className="font-display font-bold text-xl text-white mb-0.5">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* View Orders Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setShowOrders(true)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">My Orders</p>
              <p className="text-gray-400 text-xs">{mockOrders.length} orders placed</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </motion.button>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Account Information</h2>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Name', value: userName },
              { label: 'Email', value: userEmail },
              { label: 'Phone', value: '+91 98765 43210' },
              { label: 'Location', value: 'Himachal Pradesh, India' },
              { label: 'Member Since', value: 'January 2026' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-200 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Orders Modal */}
      <AnimatePresence>
        {showOrders && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md"
            onClick={() => { setShowOrders(false); setSelectedOrder(null); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full sm:max-w-xl max-h-[85vh] overflow-y-auto bg-black/80 sm:bg-[#120e0a] border border-white/15 sm:rounded-3xl rounded-t-3xl"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0d0a05]/90 backdrop-blur z-10">
                <div>
                  {selectedOrder ? (
                    <div>
                      <button onClick={() => setSelectedOrder(null)} className="text-xs text-amber-400 hover:text-amber-300 mb-1">← Back to Orders</button>
                      <h2 className="font-display font-bold text-lg text-white">{selectedOrder.orderNumber}</h2>
                    </div>
                  ) : (
                    <h2 className="font-display font-bold text-xl text-white">My Orders</h2>
                  )}
                </div>
                <button onClick={() => { setShowOrders(false); setSelectedOrder(null); }} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5">
                {!selectedOrder ? (
                  // Orders List
                  <div className="space-y-3">
                    {mockOrders.map((order, i) => (
                      <motion.button
                        key={order.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => setSelectedOrder(order)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left group hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold text-sm">{order.orderNumber}</p>
                          <span className={`text-[10px] font-semibold border rounded-full px-2.5 py-1 capitalize ${STATUS_STYLES[order.orderStatus]}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                          <span className="text-amber-400 font-bold">₹{order.total.toFixed(0)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  // Order Detail
                  <div className="space-y-4">
                    {/* Status Stepper */}
                    {selectedOrder.orderStatus !== 'cancelled' && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">Order Progress</p>
                        <div className="flex items-center gap-1">
                          {STATUS_STEPS.map((step, i) => {
                            const currentIdx = STATUS_STEPS.indexOf(selectedOrder.orderStatus);
                            const isPast = i <= currentIdx;
                            return (
                              <div key={step} className="flex-1 flex flex-col items-center">
                                <div className={`w-full h-1 rounded-full mb-1.5 ${isPast ? 'bg-amber-500' : 'bg-white/10'}`} />
                                <span className={`text-[9px] capitalize ${isPast ? 'text-amber-400' : 'text-gray-600'}`}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Items Ordered</p>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
                            <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover bg-amber-900/20 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{item.product.name}</p>
                              <p className="text-gray-400 text-xs">{item.selectedWeight.label} × {item.quantity}</p>
                            </div>
                            <p className="text-amber-400 text-sm font-bold">₹{item.selectedWeight.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="text-gray-200">₹{selectedOrder.subtotal}</span></div>
                      <div className="flex justify-between text-gray-400"><span>GST</span><span className="text-gray-200">₹{selectedOrder.tax.toFixed(0)}</span></div>
                      <div className="flex justify-between text-gray-400"><span>Shipping</span><span className="text-green-400">Free</span></div>
                      <div className="flex justify-between font-bold pt-2 border-t border-white/10"><span className="text-white">Total</span><span className="text-amber-400 text-base">₹{selectedOrder.total.toFixed(0)}</span></div>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Delivery Address</p>
                      </div>
                      <p className="text-gray-200 text-sm">{selectedOrder.shippingAddress.fullName}</p>
                      <p className="text-gray-400 text-xs">{selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} – {selectedOrder.shippingAddress.pincode}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
