import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { CheckCircle, ArrowLeft, ShieldCheck, Package } from "lucide-react";
import { motion } from "framer-motion";
import { formatWeightLabel } from "../utils/formatters";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { refetchOrders } = useOrders();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const TAX_RATE = 0.06;
  const shippingCharge = subtotal >= 500 || subtotal === 0 ? 0 : 60;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + shippingCharge;

  const [form, setForm] = useState({
    email: '', phone: '', fullName: '', line1: '', city: '', state: '', pincode: '', payment: 'razorpay'
  });

  useEffect(() => {
    if (user) {
      setForm(p => ({
        ...p,
        email: p.email || user.email || '',
        phone: p.phone || user.phonenumber || '',
        fullName: p.fullName || user.name || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (form.payment === 'cod') {
        const res = await fetch('http://localhost:5000/api/orders/cod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, form, userId: user?.id })
        });
        const data = await res.json();
        if (data.success) {
          setIsSuccess(true);
          clearCart();
          refetchOrders();
          window.scrollTo(0, 0);
        } else {
          alert(data.message || 'Failed to place order');
        }
        setIsProcessing(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, form, userId: user?.id })
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Failed to create order');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'test_key',
        amount: data.order.amount * 100,
        currency: data.order.currency,
        name: "Padpu Farms",
        description: "Order Payment",
        order_id: data.order.razorpay_order_id,
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [{ method: "upi", blocks: ["qr"] }]
              }
            },
            sequence: ["block.upi", "block.cards", "block.netbanking"],
            preferences: { show_default_blocks: true }
          }
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('http://localhost:5000/api/orders/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items,
                form,
                userId: user?.id
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setIsSuccess(true);
              clearCart();
              refetchOrders();
              window.scrollTo(0, 0);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('An error occurred while verifying the payment.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone
        },
        theme: { color: "#f59e0b" },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        alert('Payment Failed: ' + response.error.description);
        setIsProcessing(false);
      });
      rzp1.open();

    } catch (err) {
      console.error('Order creation error:', err);
      alert('An error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen forest-bg flex items-center justify-center px-4 pt-20 pb-20 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-white/[0.04] border border-white/10 p-8 sm:p-10 max-w-md w-full text-center relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Order Confirmed</h1>
          <p className="text-stone-400 text-xs font-light mb-6">
            Your fresh harvest order is confirmed and being prepared for dispatch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 amber-gradient text-stone-950 font-bold rounded-xl w-full sm:w-auto text-xs"
            >
              <Package className="w-4 h-4" /> Track Order
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold w-full sm:w-auto text-xs"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen forest-bg flex items-center justify-center text-center px-4 pt-20 pb-20">
        <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-10 max-w-sm w-full">
          <p className="text-3xl mb-3">🍯</p>
          <h1 className="text-xl font-display font-bold text-white mb-1">Cart is empty</h1>
          <p className="text-stone-400 text-xs mb-5 font-light">Add items from the shop to checkout.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 amber-gradient text-stone-950 text-xs font-bold px-6 py-2.5 rounded-xl">
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen forest-bg relative overflow-hidden pt-20 md:pt-28 pb-28 md:pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mb-6">
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form */}
          <form id="checkout-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
            {/* Delivery Details */}
            <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Delivery Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Full Name</label>
                  <input required type="text" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-sm outline-none focus:border-amber-500/50" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-sm outline-none focus:border-amber-500/50" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Phone</label>
                  <input required type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-sm outline-none focus:border-amber-500/50" placeholder="+91 98765 43210" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Address</label>
                  <input required type="text" value={form.line1} onChange={e => setForm(p => ({ ...p, line1: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-sm outline-none focus:border-amber-500/50" placeholder="House no., street, landmark" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">City</label>
                  <input required type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-sm outline-none focus:border-amber-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">State</label>
                    <input required type="text" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-sm outline-none focus:border-amber-500/50" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">PIN</label>
                    <input required type="text" value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-sm outline-none focus:border-amber-500/50" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3.5">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'razorpay', label: 'Online (UPI / Cards)' },
                  { id: 'cod', label: 'Cash on Delivery' },
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-center p-3.5 rounded-xl cursor-pointer border text-xs font-semibold transition-all ${
                      form.payment === opt.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-white/10 bg-black/20 text-stone-300 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={form.payment === opt.id}
                      onChange={e => setForm(p => ({ ...p, payment: e.target.value }))}
                      className="w-3.5 h-3.5 accent-amber-500"
                    />
                    <span className="ml-2.5">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-5 rounded-3xl bg-white/[0.04] border border-white/10 p-6 sticky top-28">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-5 max-h-[30vh] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={`${item.productId}-${item.selectedWeight.label}-${item.selectedWeight.grams}`} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10">
                    <img src={item.product.images[0]} alt={item.product.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{item.product.name}</p>
                    <p className="text-[11px] text-stone-400 font-sans">
                      {formatWeightLabel(item.selectedWeight.grams, item.selectedWeight.label)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-amber-400 font-sans">₹{item.selectedWeight.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs py-3.5 border-t border-b border-white/10 mb-4 font-sans">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span><span className="text-stone-200">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>GST (6%)</span><span className="text-stone-200">₹{tax}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Shipping</span>
                <span>{shippingCharge === 0 ? <span className="text-emerald-400 font-medium">Free</span> : <span className="text-stone-200">₹{shippingCharge}</span>}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline mb-5 font-sans">
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-amber-400">₹{total}</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl amber-gradient text-stone-950 font-bold text-xs hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" /> {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
