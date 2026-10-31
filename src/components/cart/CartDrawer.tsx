import { useState } from "react";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";
import { formatWeightLabel } from "../../utils/formatters";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  processing: { label: 'Processing', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  packed: { label: 'Packed', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  dispatched: { label: 'Dispatched', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  delivered: { label: 'Delivered', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { orders, orderCount, loading: ordersLoading } = useOrders();
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');

  const TAX_RATE = 0.06;
  const shippingCharge = subtotal >= 500 || subtotal === 0 ? 0 : 60;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + shippingCharge;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[390px] z-[60] flex flex-col transition-transform duration-300 ease-out bg-[#0d0a05] border-l border-white/10 ${
          isOpen ? "translate-x-0 shadow-[-20px_0_40px_rgba(0,0,0,0.6)]" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
            <button
              onClick={() => setActiveTab('cart')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'cart'
                  ? 'amber-gradient text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart ({itemCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'amber-gradient text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Orders ({orderCount})</span>
            </button>
          </div>

          <button
            onClick={closeCart}
            className="p-2 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition-all"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CART VIEW */}
        {activeTab === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-amber-400/50" />
                  </div>
                  <p className="text-white font-semibold text-sm">Your cart is empty</p>
                  <button
                    onClick={closeCart}
                    className="mt-1 px-5 py-2 rounded-xl amber-gradient text-stone-950 font-bold text-xs"
                  >
                    Shop Honey
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.selectedWeight.label}`}
                      className="bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 flex gap-3.5 items-center"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs font-semibold text-white truncate">{item.product.name}</p>
                          <button
                            onClick={() => removeItem(item.productId, item.selectedWeight.label, item.selectedWeight.grams)}
                            className="text-stone-500 hover:text-red-400 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-amber-400/80 uppercase tracking-wider mt-0.5 mb-2">
                          {formatWeightLabel(item.selectedWeight.grams, item.selectedWeight.label)}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-black/30 rounded-lg p-0.5 border border-white/10">
                            <button
                              onClick={() => updateQuantity(item.productId, item.selectedWeight.label, item.selectedWeight.grams, item.quantity - 1)}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs text-white font-semibold w-4 text-center font-sans">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.selectedWeight.label, item.selectedWeight.grams, item.quantity + 1)}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-amber-400 font-sans">
                            ₹{item.selectedWeight.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-white/10 p-5 bg-black/40">
                {subtotal < 500 && (
                  <p className="text-[11px] text-amber-400 text-center bg-amber-500/10 border border-amber-500/20 rounded-xl py-1.5 px-3 mb-3 font-sans">
                    Add ₹{500 - subtotal} more for <span className="font-bold">free shipping</span>
                  </p>
                )}
                <div className="space-y-1.5 text-xs mb-4 font-sans">
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
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                    <span>Total</span><span className="text-amber-400">₹{total}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl amber-gradient text-stone-950 font-bold text-xs hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all"
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        )}

        {/* ORDERS VIEW */}
        {activeTab === 'orders' && (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col">
            {ordersLoading ? (
              <div className="h-full flex items-center justify-center text-stone-400 text-xs">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Package className="w-7 h-7" />
                </div>
                <p className="text-white font-semibold text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {orders.map((order) => {
                  const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.confirmed;
                  return (
                    <Link
                      key={order.id}
                      to="/orders"
                      onClick={closeCart}
                      className="block p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white font-bold font-sans text-xs">#{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${status.color} ${status.bg}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-400 font-sans">
                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {order.items.length} items</span>
                        <span className="text-amber-400 font-bold text-xs">₹{order.total.toFixed(0)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {orders.length > 0 && (
              <div className="pt-4 border-t border-white/10 mt-4">
                <Link
                  to="/orders"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs transition-colors"
                >
                  All Orders <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
