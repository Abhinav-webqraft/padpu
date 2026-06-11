import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Home, ArrowLeft } from 'lucide-react';
import { mockOrders } from '../data/mockData';

const statusSteps = [
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, desc: 'Order received and confirmed' },
  { key: 'processing', label: 'Processing', icon: Package, desc: 'Being carefully packed' },
  { key: 'packed', label: 'Packed', icon: Package, desc: 'Packed and ready to ship' },
  { key: 'dispatched', label: 'Dispatched', icon: Truck, desc: 'On its way to you' },
  { key: 'delivered', label: 'Delivered', icon: Home, desc: 'Delivered successfully!' },
];

const statusOrder = ['confirmed', 'processing', 'packed', 'dispatched', 'delivered'];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const order = mockOrders.find(o => o.id === id) ?? mockOrders[0];

  const currentStatusIdx = statusOrder.indexOf(order.orderStatus);

  const statusColorMap: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-yellow-100 text-yellow-700',
    packed: 'bg-amber-100 text-amber-700',
    dispatched: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/profile" className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-600 text-sm transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="font-display font-bold text-2xl text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-400 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${statusColorMap[order.orderStatus]}`}>
              {order.orderStatus}
            </span>
          </div>

          {/* Timeline */}
          <div className="relative">
            {statusSteps.map((step, i) => {
              const isCompleted = i <= currentStatusIdx;
              const isCurrent = i === currentStatusIdx;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex gap-4 relative">
                  {/* Line */}
                  {i < statusSteps.length - 1 && (
                    <div className="absolute left-5 top-10 w-0.5 h-10 z-0" style={{ background: isCompleted ? '#f59e0b' : '#e5e7eb' }} />
                  )}

                  {/* Icon */}
                  <motion.div
                    initial={isCurrent ? { scale: 0.8 } : {}}
                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isCompleted
                        ? 'text-amber-950'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    style={isCompleted ? { background: 'linear-gradient(135deg, #fbbf24, #d97706)' } : {}}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>

                  {/* Content */}
                  <div className="pb-8 pt-1.5">
                    <p className={`font-semibold text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                    <p className={`text-xs mt-0.5 ${isCurrent ? 'text-amber-600' : 'text-gray-400'}`}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{item.product.name}</p>
                  <p className="text-xs text-gray-400">{item.selectedWeight.label} × {item.quantity}</p>
                </div>
                <span className="font-semibold text-gray-800 text-sm">₹{(item.selectedWeight.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-500"><span>Tax</span><span>₹{order.tax.toFixed(0)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge}`}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount.toFixed(0)}</span></div>}
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
              <span>Total</span><span className="text-amber-700">₹{order.total.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-3">Delivery Address</h2>
          <p className="font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
          <p className="text-gray-600 text-sm">{order.shippingAddress.line1}</p>
          {order.shippingAddress.line2 && <p className="text-gray-600 text-sm">{order.shippingAddress.line2}</p>}
          <p className="text-gray-600 text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
          <p className="text-gray-500 text-sm mt-1">{order.shippingAddress.phone}</p>
        </div>
      </div>
    </div>
  );
}
