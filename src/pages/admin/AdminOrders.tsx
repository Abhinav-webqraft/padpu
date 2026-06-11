import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { mockOrders } from '../../data/mockData';
import { Order } from '../../types';

const statuses = ['All', 'confirmed', 'processing', 'packed', 'dispatched', 'delivered', 'cancelled'];

const statusColorMap: Record<string, string> = {
  confirmed: 'text-blue-400 bg-blue-500/10',
  processing: 'text-yellow-400 bg-yellow-500/10',
  packed: 'text-amber-400 bg-amber-500/10',
  dispatched: 'text-purple-400 bg-purple-500/10',
  delivered: 'text-green-400 bg-green-500/10',
  cancelled: 'text-red-400 bg-red-500/10',
};

export default function AdminOrders() {
  const [orders] = useState<Order[]>(mockOrders);
  const [activeStatus, setActiveStatus] = useState('All');

  const filtered = activeStatus === 'All'
    ? orders
    : orders.filter(o => o.orderStatus === activeStatus);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Orders</h1>
        <p className="text-white/40 text-sm">{orders.length} total orders</p>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              activeStatus === status
                ? 'text-amber-950 amber-gradient'
                : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td className="font-mono text-amber-400/80 text-sm">{order.orderNumber}</td>
                  <td>
                    <div className="text-white/80 text-sm">{order.customerName}</div>
                    <div className="text-white/30 text-xs">{order.customerPhone}</div>
                  </td>
                  <td className="text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>{order.items.length}</td>
                  <td className="font-semibold text-white">₹{order.total.toFixed(0)}</td>
                  <td>
                    <span className={`text-xs font-medium ${
                      order.paymentStatus === 'paid' ? 'text-green-400' :
                      order.paymentStatus === 'pending' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {order.paymentStatus} · {order.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${statusColorMap[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/orders/${order.id}`}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/40 hover:text-amber-400 transition-all inline-flex"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-white/30 text-sm">
              No orders found for status: {activeStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
