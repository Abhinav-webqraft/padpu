import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CheckCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { addOrder } from "../data/mockData";
import { Order } from "../types";
import { formatWeightLabel } from "../utils/formatters";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);

  const TAX_RATE = 0.06;
  const shippingCharge = subtotal >= 500 || subtotal === 0 ? 0 : 60;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + shippingCharge;

  const [form, setForm] = useState({
    email: '', phone: '', fullName: '', line1: '', city: '', state: '', pincode: '', payment: 'card'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `PF-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      customerName: form.fullName,
      customerEmail: form.email,
      customerPhone: form.phone,
      items: items,
      shippingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        line1: form.line1,
        city: form.city,
        state: form.state,
        pincode: form.pincode
      },
      subtotal,
      tax,
      shippingCharge,
      discount: 0,
      total,
      paymentStatus: 'paid',
      paymentMethod: form.payment,
      orderStatus: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addOrder(newOrder);

    setIsSuccess(true);
    clearCart();
    window.scrollTo(0, 0);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen forest-bg flex items-center justify-center px-4 pt-24 pb-20 relative overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-card p-8 md:p-12 max-w-lg w-full text-center relative z-10"
        >
          <div className="w-20 h-20 rounded-3xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-4">Order Confirmed!</h1>
          <p className="text-gray-400 font-light mb-8">
            Thank you for choosing Padpu Farms. Your golden nectar is being prepared for dispatch. You will receive an email with tracking details shortly.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-8 py-4 amber-gradient text-stone-900 font-bold rounded-2xl hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all hover:scale-105"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen forest-bg flex items-center justify-center text-center px-4 pt-24 pb-20">
        <div className="glass-card p-12 max-w-sm w-full">
          <p className="text-3xl mb-4">🍯</p>
          <h1 className="text-2xl font-display font-bold text-white mb-3">Cart is empty</h1>
          <p className="text-gray-400 mb-6 font-light">Discover our premium honey collection</p>
          <Link to="/shop" className="inline-flex items-center gap-2 amber-gradient text-stone-900 font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all">
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen forest-bg relative overflow-hidden pt-24 pb-24 md:pb-10">
      {/* Ambient orbs */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mb-8">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mt-4">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form */}
          <div className="lg:col-span-2">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">

              {/* Contact Info */}
              <div className="glass p-6">
                <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-white/10">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input required type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="input-dark w-full" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
                    <input required type="tel" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="input-dark w-full" placeholder="+91 98765 43210" />
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="glass p-6">
                <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-white/10">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                    <input required type="text" value={form.fullName} onChange={e => setForm(p => ({...p, fullName: e.target.value}))} className="input-dark w-full" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Street Address</label>
                    <input required type="text" value={form.line1} onChange={e => setForm(p => ({...p, line1: e.target.value}))} className="input-dark w-full" placeholder="House number and street name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">City</label>
                    <input required type="text" value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} className="input-dark w-full" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">State</label>
                    <input required type="text" value={form.state} onChange={e => setForm(p => ({...p, state: e.target.value}))} className="input-dark w-full" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">PIN Code</label>
                    <input required type="text" value={form.pincode} onChange={e => setForm(p => ({...p, pincode: e.target.value}))} className="input-dark w-full" />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="glass p-6">
                <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-white/10">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: 'card', label: 'Credit / Debit Card (Mock)', defaultChecked: true },
                    { id: 'upi', label: 'UPI / Netbanking', defaultChecked: false },
                    { id: 'cod', label: 'Cash on Delivery', defaultChecked: false },
                  ].map(opt => (
                    <label
                      key={opt.id}
                      className="flex items-center p-4 rounded-xl cursor-pointer border transition-all hover:border-amber-500/30 hover:bg-amber-500/5"
                      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <input type="radio" name="payment" value={opt.id} checked={form.payment === opt.id} onChange={e => setForm(p => ({...p, payment: e.target.value}))} className="w-4 h-4 accent-amber-500" />
                      <span className="ml-3 font-medium text-gray-200 text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass p-6 sticky top-28">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-[35vh] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.selectedWeight.label}-${item.selectedWeight.grams}`} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-amber-900/20 border border-white/10">
                      <img src={item.product.images[0]} alt={item.product.name} className="object-cover w-full h-full" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 amber-gradient text-white text-[10px] font-bold rounded-full flex items-center justify-center z-10">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-semibold text-white line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{formatWeightLabel(item.selectedWeight.grams, item.selectedWeight.label)}</p>
                      <p className="text-sm font-bold text-amber-400 mt-1">₹{item.selectedWeight.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm py-4 border-t border-b border-white/10 mb-5">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span><span className="text-gray-200 font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>GST (6%)</span><span className="text-gray-200 font-medium">₹{tax}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>{shippingCharge === 0 ? <span className="text-green-400 font-medium">Free</span> : <span className="text-gray-200 font-medium">₹{shippingCharge}</span>}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="text-white font-bold">Total</span>
                <span className="text-3xl font-display font-bold text-amber-400">₹{total}</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full py-4 rounded-2xl amber-gradient text-stone-900 font-bold hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" /> Place Order
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
