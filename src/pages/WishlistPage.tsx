import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addItem, openCart } = useCart();

  return (
    <div className="min-h-screen forest-bg relative overflow-hidden pt-20 md:pt-28 pb-28 md:pb-16">
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Shop
            </Link>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Saved <span className="amber-gradient-text">Favourites</span>
            </h1>
          </div>
          {wishlistItems.length > 0 && (
            <span className="text-xs font-medium text-stone-400">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white/[0.04] border border-white/10 p-12 text-center max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-1">No saved items</h3>
            <p className="text-stone-400 text-xs mb-6">Tap the heart icon on any product to save it here.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-stone-950 amber-gradient hover:opacity-90 transition-all"
            >
              Explore Shop
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {wishlistItems.map((product, i) => {
              const defaultWeight = product.weightOptions?.[0];
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/30 overflow-hidden flex flex-col transition-all group"
                >
                  <div className="relative aspect-square bg-black/30 overflow-hidden">
                    <Link to={`/shop/${product.slug}`}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-stone-300 hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-1">
                      {product.category}
                    </span>
                    <Link to={`/shop/${product.slug}`}>
                      <h3 className="font-semibold text-white text-sm mb-3 line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
                      <span className="font-sans font-bold text-base text-white">
                        ₹{defaultWeight?.price ?? product.price}
                      </span>
                      <button
                        onClick={() => {
                          if (defaultWeight) {
                            addItem(product, defaultWeight, 1);
                            openCart();
                          }
                        }}
                        disabled={!product.inStock}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-950 amber-gradient disabled:opacity-50 hover:opacity-90 transition-all"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
