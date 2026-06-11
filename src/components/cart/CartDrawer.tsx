import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  const TAX_RATE = 0.06;
  const shippingCharge = subtotal >= 500 || subtotal === 0 ? 0 : 60;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + shippingCharge;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] z-50 flex flex-col transition-transform duration-300 ease-out bg-[#0d0a05] border-l border-amber-500/20 ${
          isOpen ? "translate-x-0 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="font-semibold text-white text-lg">Your Cart</h2>
            {itemCount > 0 && (
              <span className="w-6 h-6 rounded-full amber-gradient text-xs font-bold text-stone-900 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-6 px-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-24 h-24 rounded-full border border-white/5 bg-white/5 flex items-center justify-center animate-float">
                <ShoppingBag className="w-10 h-10 text-amber-500/30" />
              </div>
              <div>
                <p className="text-white font-medium mb-2 text-lg">Your cart is empty</p>
                <p className="text-sm text-gray-400">Add some golden goodness to your cart!</p>
              </div>
              <button
                onClick={closeCart}
                className="mt-4 px-8 py-3 rounded-full amber-gradient text-stone-900 font-bold text-sm hover:scale-105 transition-transform"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.selectedWeight.label}`}
                  className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-4 hover:border-amber-500/20 transition-colors"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-black/50">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-semibold text-white line-clamp-1 pr-2">{item.product.name}</p>
                      <button
                        onClick={() => removeItem(item.productId, item.selectedWeight.label)}
                        className="text-gray-500 hover:text-red-400 transition-colors mt-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-amber-400/80 mb-3 uppercase tracking-wider">{item.selectedWeight.label}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3 bg-black/30 rounded-lg p-1 border border-white/5">
                        <button
                          onClick={() => updateQuantity(item.productId, item.selectedWeight.label, item.quantity - 1)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm text-white font-medium w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.selectedWeight.label, item.quantity + 1)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-amber-400">
                        ₹{item.selectedWeight.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 px-6 py-6 bg-black/20">
            {subtotal < 500 && (
              <p className="text-xs text-amber-400/90 text-center bg-amber-500/10 border border-amber-500/20 rounded-lg py-2.5 px-4 mb-4">
                Add ₹{500 - subtotal} more for <span className="font-bold">free shipping!</span>
              </p>
            )}
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span><span className="text-gray-200">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>GST (6%)</span><span className="text-gray-200">₹{tax}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{shippingCharge === 0 ? <span className="text-green-400 font-medium">Free</span> : <span className="text-gray-200">₹{shippingCharge}</span>}</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />
              <div className="flex justify-between font-display text-xl font-bold text-white">
                <span>Total</span><span className="text-amber-400">₹{total}</span>
              </div>
            </div>
            
            <Link
              to="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl amber-gradient text-stone-900 font-bold hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 hover:scale-[1.02]"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Link>
            
            <button
              onClick={closeCart}
              className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors mt-4"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
