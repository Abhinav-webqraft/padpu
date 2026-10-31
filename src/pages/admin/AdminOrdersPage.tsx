import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '../../types';
import { Package, X, Search, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';

type OrderStatus = 'confirmed' | 'processing' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';

const STATUS_OPTIONS: OrderStatus[] = ['confirmed', 'processing', 'packed', 'dispatched', 'delivered', 'cancelled'];

const STATUS_STYLES: Record<OrderStatus, string> = {
  confirmed: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  processing: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  packed: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  dispatched: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setOrders(prev =>
          prev.map(o => {
            if (o.id === orderId) {
              let newPaymentStatus = o.paymentStatus;
              if (o.paymentMethod === 'cod') {
                newPaymentStatus = newStatus === 'delivered' ? 'paid' : 'pending';
              }
              return { ...o, orderStatus: newStatus, paymentStatus: newPaymentStatus, updatedAt: new Date().toISOString() };
            }
            return o;
          })
        );

        if (selectedOrder && selectedOrder.id === orderId) {
          let newPaymentStatus = selectedOrder.paymentStatus;
          if (selectedOrder.paymentMethod === 'cod') {
            newPaymentStatus = newStatus === 'delivered' ? 'paid' : 'pending';
          }
          setSelectedOrder(prev => prev ? { ...prev, orderStatus: newStatus, paymentStatus: newPaymentStatus, updatedAt: new Date().toISOString() } : null);
        }

        setToast(`Order status updated to ${newStatus}`);
        setTimeout(() => setToast(''), 2500);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || o.orderStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Fulfillment</span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-0.5">Orders</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400 font-sans">
          <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
            Total: <strong className="text-white">{orders.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            Delivered: <strong>{orders.filter(o => o.orderStatus === 'delivered').length}</strong>
          </span>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Status Pills */}
      <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-4 space-y-3.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order #, customer name, or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-xs sm:text-sm placeholder-stone-500 outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['all', ...STATUS_OPTIONS].map(status => {
            const active = filterStatus === status;
            const count = status === 'all' ? orders.length : orders.filter(o => o.orderStatus === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
                  active
                    ? 'amber-gradient text-stone-950 border-transparent'
                    : 'bg-white/[0.03] text-stone-400 border-white/10 hover:text-white'
                }`}
              >
                {status} <span className="ml-1 opacity-75 font-sans">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white/[0.03] border border-white/10 text-stone-500">
          <Package className="w-10 h-10 mx-auto mb-2.5 opacity-40" />
          <p className="text-sm font-medium text-stone-300">No orders found</p>
          <p className="text-xs mt-0.5">Try adjusting your search or status filter.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedOrder(order)}
              className="rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 hover:border-amber-500/25 p-4 cursor-pointer transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 font-sans font-bold text-xs">
                    #{order.items.length}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans font-bold text-white text-sm">#{order.orderNumber}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}>
                        {order.paymentStatus}
                      </span>
                      <span className="text-[10px] text-stone-500 uppercase font-semibold">{order.paymentMethod}</span>
                    </div>
                    <p className="text-stone-400 text-xs mt-0.5 truncate">
                      {order.customerName} <span className="text-stone-600">•</span> {order.customerEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-left sm:text-right font-sans">
                    <p className="text-amber-400 font-bold text-sm">₹{order.total.toFixed(0)}</p>
                    <p className="text-stone-500 text-[11px]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>

                  <div onClick={e => e.stopPropagation()}>
                    <select
                      value={order.orderStatus}
                      onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                      className={`text-xs font-semibold border rounded-xl px-3 py-1.5 outline-none cursor-pointer capitalize ${STATUS_STYLES[order.orderStatus as OrderStatus]}`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s} className="bg-[#0b1009] text-white capitalize">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl bg-[#0b1009] border border-white/15 rounded-3xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Order Summary</span>
                  <h2 className="font-sans font-bold text-lg text-white mt-0.5">#{selectedOrder.orderNumber}</h2>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                {/* Customer & Shipping */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 space-y-2">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Customer</p>
                    <p className="text-white font-semibold text-sm">{selectedOrder.customerName}</p>
                    <p className="text-stone-400 text-xs flex items-center gap-1.5 break-all">
                      <Mail className="w-3.5 h-3.5 text-amber-400/70 shrink-0" /> {selectedOrder.customerEmail}
                    </p>
                    <p className="text-stone-400 text-xs flex items-center gap-1.5 font-sans">
                      <Phone className="w-3.5 h-3.5 text-amber-400/70 shrink-0" /> {selectedOrder.customerPhone}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 space-y-1.5">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> Delivery Address
                    </p>
                    <p className="text-white font-semibold text-xs">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-stone-400 text-xs leading-relaxed">
                      {selectedOrder.shippingAddress.line1}
                      {selectedOrder.shippingAddress.line2 ? `, ${selectedOrder.shippingAddress.line2}` : ''}
                      <br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} – {selectedOrder.shippingAddress.pincode}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-3">Items Ordered</p>
                  <div className="space-y-2.5">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-11 h-11 rounded-xl object-cover bg-stone-900 border border-white/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-xs truncate">{item.product.name}</p>
                          <p className="text-stone-400 text-[11px] font-sans">{item.selectedWeight.label} × {item.quantity}</p>
                        </div>
                        <p className="text-amber-400 font-bold text-xs font-sans">₹{item.selectedWeight.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-xs font-sans space-y-2">
                  <div className="flex justify-between text-stone-400">
                    <span>Subtotal</span><span className="text-white">₹{selectedOrder.subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Tax</span><span className="text-white">₹{selectedOrder.tax.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Shipping</span>
                    <span className="text-white">{selectedOrder.shippingCharge === 0 ? 'Free' : `₹${selectedOrder.shippingCharge.toFixed(0)}`}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-white/10">
                    <span className="text-white font-bold text-sm">Total</span>
                    <span className="text-lg font-bold text-amber-400">₹{selectedOrder.total.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
