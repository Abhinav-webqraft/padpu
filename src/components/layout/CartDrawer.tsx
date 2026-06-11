import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  const tax = subtotal * 0.06;
  const shipping = subtotal > 500 ? 0 : 79;
  const total = subtotal + tax + shipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            style={{ background: 'linear-gradient(180deg, #0d1a0d 0%, #080f08 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h2 className="font-display font-bold text-lg text-white">Your Cart</h2>
                {itemCount > 0 && (
                  <span className="w-5 h-5 bg-amber-500 text-amber-950 text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4"
                  >
                    <ShoppingBag className="w-9 h-9 text-amber-400/40" />
                  </motion.div>
                  <p className="text-white/40 text-sm mb-1">Your cart is empty</p>
                  <p className="text-white/25 text-xs">Add some golden goodness!</p>
                  <button
                    onClick={closeCart}
                    className="mt-6 px-5 py-2.5 amber-gradient text-amber-950 font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <motion.div
                      key={`${item.productId}-${item.selectedWeight.label}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-4 p-4 rounded-2xl bg-white/3 border border-white/5"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium leading-snug line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-amber-400/60 text-xs mt-0.5">{item.selectedWeight.label}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.selectedWeight.label, item.quantity - 1)}
                              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/60 hover:text-amber-400 flex items-center justify-center transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white text-sm w-5 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.selectedWeight.label, item.quantity + 1)}
                              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/60 hover:text-amber-400 flex items-center justify-center transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-semibold text-sm">
                              ₹{(item.selectedWeight.price * item.quantity).toLocaleString()}
                            </span>
                            <button
                              onClick={() => removeItem(item.productId, item.selectedWeight.label)}
                              className="p-1 text-white/20 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-white/50">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Tax (6%)</span>
                    <span>₹{tax.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-400">Free</span> : `₹${shipping}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-amber-400/50">Add ₹{(500 - subtotal).toFixed(0)} more for free shipping</p>
                  )}
                  <div className="flex justify-between text-white font-semibold pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span className="text-amber-400">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-3.5 amber-gradient text-amber-950 font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={closeCart}
                  className="w-full py-2.5 text-white/40 hover:text-white/70 text-sm transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
