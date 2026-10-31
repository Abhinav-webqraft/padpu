import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrders } from '../context/OrderContext';
import {
  Package,
  MapPin,
  CreditCard,
  ArrowLeft,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
} from 'lucide-react';

const STATUS_STEPS = ['confirmed', 'processing', 'packed', 'dispatched', 'delivered'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  confirmed: { label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  processing: { label: 'Processing', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  packed: { label: 'Packed', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  dispatched: { label: 'Dispatched', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  delivered: { label: 'Delivered', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

export default function OrdersPage() {
  const { orders, loading } = useOrders();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'delivered'>('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled';
    }
    if (activeTab === 'delivered') {
      return order.orderStatus === 'delivered';
    }
    return true;
  });

  return (
    <div className="min-h-screen forest-bg relative overflow-hidden pt-20 md:pt-28 pb-28 md:pb-16">
      <div className="absolute top-[5%] left-[-10%] w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Shop
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              My <span className="amber-gradient-text">Orders</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {orders.length > 0 && (
              <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
                {[
                  { id: 'all', label: `All (${orders.length})` },
                  { id: 'active', label: `Active (${orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length})` },
                  { id: 'delivered', label: `Done (${orders.filter(o => o.orderStatus === 'delivered').length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'amber-gradient text-stone-950 font-bold'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <a
              href="https://wa.me/919876543210?text=Hi%2C%20I%20have%20a%20question%20about%20my%20Padpu%20Farms%20orders"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
              title="WhatsApp Support"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-3" />
            <p className="text-stone-400 text-xs">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 rounded-3xl bg-white/[0.04] border border-white/10 text-center max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-1">No orders yet</h2>
            <p className="text-stone-400 text-xs mb-6 font-light">
              Explore our cold-extracted honey from the Western Ghats.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl amber-gradient text-stone-950 text-xs font-bold"
            >
              Browse Shop
            </Link>
          </motion.div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white/[0.04] border border-white/10 text-center max-w-md mx-auto">
            <p className="text-stone-300 text-sm">No {activeTab} orders.</p>
            <button onClick={() => setActiveTab('all')} className="mt-2 text-xs text-amber-400 hover:underline">
              Show all
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const isExpanded = expandedOrders[order.id] ?? (index === 0);
              const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.confirmed;
              const currentStepIdx = STATUS_STEPS.indexOf(order.orderStatus);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-3xl bg-white/[0.04] border border-white/10 hover:border-amber-500/25 transition-all overflow-hidden"
                >
                  {/* Card Header */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold font-sans text-sm">#{order.orderNumber}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${status.color} ${status.bg} ${status.border}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 font-sans mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-amber-400 font-sans">
                        ₹{order.total.toFixed(0)}
                      </span>
                      <div className="p-1.5 rounded-lg bg-white/5 text-stone-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Progress Stepper */}
                  {order.orderStatus !== 'cancelled' && (
                    <div className="px-5 pb-3 pt-1 border-b border-white/5">
                      <div className="grid grid-cols-5 gap-1.5">
                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;
                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div className={`w-full h-1 rounded-full ${isDone ? 'bg-amber-500' : 'bg-white/10'}`} />
                              <span
                                className={`text-[9px] mt-1 capitalize truncate w-full text-center ${
                                  isCurrent ? 'text-amber-400 font-bold' : isDone ? 'text-stone-400' : 'text-stone-600'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="p-5 space-y-4 bg-black/20"
                      >
                        {/* Items */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 items-center"
                            >
                              <img
                                src={item.product.images?.[0] || '/images/300G MULTI.png'}
                                alt={item.product.name}
                                className="w-11 h-11 rounded-lg object-cover bg-black/40 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">{item.product.name}</p>
                                <p className="text-[11px] text-stone-400 font-sans">
                                  {item.selectedWeight.label} × {item.quantity}
                                </p>
                              </div>
                              <p className="text-xs text-amber-400 font-bold font-sans">
                                ₹{item.selectedWeight.price * item.quantity}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Summary</span>
                            <div className="flex justify-between text-stone-400"><span>Subtotal</span><span className="text-stone-200">₹{order.subtotal}</span></div>
                            <div className="flex justify-between text-stone-400"><span>GST</span><span className="text-stone-200">₹{order.tax.toFixed(0)}</span></div>
                            <div className="flex justify-between font-bold pt-1 border-t border-white/5"><span className="text-white">Total</span><span className="text-amber-400">₹{order.total.toFixed(0)}</span></div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-amber-400" /> Payment
                            </span>
                            <div className="flex justify-between text-stone-400">
                              <span>Method</span>
                              <span className="text-stone-200 uppercase">{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</span>
                            </div>
                            <div className="flex justify-between text-stone-400">
                              <span>Status</span>
                              <span className={`font-semibold capitalize ${order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-amber-400" /> Address
                            </span>
                            <p className="text-white font-semibold truncate">{order.shippingAddress?.fullName}</p>
                            <p className="text-stone-400 text-[11px] line-clamp-2">
                              {order.shippingAddress?.line1}, {order.shippingAddress?.city} – {order.shippingAddress?.pincode}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
