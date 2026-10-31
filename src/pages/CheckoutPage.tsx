import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { CheckCircle, ArrowLeft, ShieldCheck, Package, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { formatWeightLabel } from "../utils/formatters";

type CheckoutErrors = {
  fullName?: string;
  email?: string;
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { refetchOrders } = useOrders();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CheckoutErrors>({});
  const [submitError, setSubmitError] = useState('');

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

  const validate = () => {
    const errs: CheckoutErrors = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      errs.fullName = 'Enter your full name';
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email';
    }
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10) {
      errs.phone = 'Enter a 10-digit phone number';
    }
    if (!form.line1.trim() || form.line1.trim().length < 5) {
      errs.line1 = 'Enter complete delivery address';
    }
    if (!form.city.trim()) {
      errs.city = 'City is required';
    }
    if (!form.state.trim()) {
      errs.state = 'State is required';
    }
    if (!/^[0-9]{6}$/.test(form.pincode.trim())) {
      errs.pincode = '6-digit PIN required';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const updateField = (key: keyof typeof form, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    if (fieldErrors[key as keyof CheckoutErrors]) {
      setFieldErrors(p => ({ ...p, [key]: undefined }));
    }
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

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
          setSubmitError(data.message || 'Failed to place order');
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
        setSubmitError(data.message || 'Failed to create order');
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
              setSubmitError('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setSubmitError('An error occurred while verifying the payment.');
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
        setSubmitError('Payment Failed: ' + response.error.description);
        setIsProcessing(false);
      });
      rzp1.open();

    } catch (err) {
      console.error('Order creation error:', err);
      setSubmitError('An error occurred. Please try again.');
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

  const inputClass = (hasErr?: string) =>
    `w-full px-3.5 py-2.5 rounded-xl bg-black/30 border text-white placeholder-stone-500 text-xs sm:text-sm outline-none transition-colors ${
      hasErr ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
    }`;

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
          <form id="checkout-form" onSubmit={handleSubmit} noValidate className="w-full min-w-0 lg:col-span-7 space-y-5">
            {/* Delivery Details */}
            <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5 sm:p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Delivery Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2 min-w-0">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={e => updateField('fullName', e.target.value)}
                    className={inputClass(fieldErrors.fullName)}
                    placeholder="John Doe"
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    className={inputClass(fieldErrors.email)}
                    placeholder="you@example.com"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Phone *</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={e => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={inputClass(fieldErrors.phone)}
                    placeholder="9876543210"
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2 min-w-0">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">Address *</label>
                  <input
                    type="text"
                    value={form.line1}
                    onChange={e => updateField('line1', e.target.value)}
                    className={inputClass(fieldErrors.line1)}
                    placeholder="House no., street, landmark"
                  />
                  {fieldErrors.line1 && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.line1}
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => updateField('city', e.target.value)}
                    className={inputClass(fieldErrors.city)}
                    placeholder="Mangaluru"
                  />
                  {fieldErrors.city && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.city}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 min-w-0">
                  <div className="min-w-0">
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">State *</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={e => updateField('state', e.target.value)}
                      className={inputClass(fieldErrors.state)}
                      placeholder="Karnataka"
                    />
                    {fieldErrors.state && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.state}
                      </p>
                    )}
                  </div>
                  <div className="min-w-0">
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">PIN *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={form.pincode}
                      onChange={e => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={inputClass(fieldErrors.pincode)}
                      placeholder="575001"
                    />
                    {fieldErrors.pincode && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5 sm:p-6">
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
          <div className="w-full min-w-0 lg:col-span-5 rounded-3xl bg-white/[0.04] border border-white/10 p-5 sm:p-6 sticky top-28">
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

            <div className="flex justify-between items-baseline mb-4 font-sans">
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-amber-400">₹{total}</span>
            </div>

            {submitError && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

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
