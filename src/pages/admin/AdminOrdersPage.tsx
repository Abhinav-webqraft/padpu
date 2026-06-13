import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockOrders } from '../../data/mockData';
import type { Order } from '../../types';
import { Package, X, Search, Filter, MapPin } from 'lucide-react';

type OrderStatus = 'confirmed' | 'processing' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';

const STATUS_OPTIONS: OrderStatus[] = ['confirmed', 'processing', 'packed', 'dispatched', 'delivered', 'cancelled'];

const STATUS_STYLES: Record<OrderStatus, string> = {
  confirmed: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  processing: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  packed: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  dispatched: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  delivered: 'bg-green-500/15 text-green-300 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus, updatedAt: new Date().toISOString() } : o)
    );
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
    <div className="p-6 lg:p-8 pt-20 lg:pt-8 bg-[#0d0a05] text-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-1">Orders</h1>
        <p className="text-gray-400 text-sm">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order #, name or email..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 outline-none focus:border-amber-500/40"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-amber-500/40 appearance-none"
          >
            <option value="all" className="bg-[#0f170c]">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s} className="bg-[#0f170c] capitalize">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
          >
            {/* Order Row */}
              <div
                className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{order.orderNumber}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{order.customerName} · {order.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-bold">₹{order.total.toFixed(0)}</p>
                  <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                {/* Status badge + dropdown */}
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <select
                    value={order.orderStatus}
                    onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                    className={`text-xs font-semibold border rounded-full px-3 py-1.5 outline-none cursor-pointer appearance-none ${STATUS_STYLES[order.orderStatus as OrderStatus]} bg-transparent capitalize`}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s} className="bg-[#0f170c] text-white capitalize">{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No orders found.</p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setSelectedOrder(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0f170c]">
                <div>
                  <h2 className="font-display font-bold text-xl text-white">Order Details</h2>
                  <p className="text-sm text-gray-400">{selectedOrder.orderNumber}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0d0a05]">
                {/* Customer & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer Info</p>
                    <p className="text-white font-medium">{selectedOrder.customerName}</p>
                    <p className="text-gray-400 text-sm mt-1">{selectedOrder.customerEmail}</p>
                    <p className="text-gray-400 text-sm">{selectedOrder.customerPhone}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Shipping Address</p>
                    </div>
                    <p className="text-white font-medium">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-gray-400 text-sm mt-1">{selectedOrder.shippingAddress.line1}</p>
                    {selectedOrder.shippingAddress.line2 && <p className="text-gray-400 text-sm">{selectedOrder.shippingAddress.line2}</p>}
                    <p className="text-gray-400 text-sm">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Items Ordered</p>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white/5 rounded-lg p-3">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover bg-amber-900/20 border border-white/5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{item.product.name}</p>
                          <p className="text-gray-400 text-sm">{item.selectedWeight.label} × {item.quantity}</p>
                        </div>
                        <p className="text-amber-400 font-bold">₹{item.selectedWeight.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span><span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Tax</span><span>₹{selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Shipping</span><span>{selectedOrder.shippingCharge === 0 ? 'Free' : `₹${selectedOrder.shippingCharge.toFixed(2)}`}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-white font-bold text-base">Total</span>
                    <span className="text-xl font-display font-bold text-amber-400">₹{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </div>
  );
}
