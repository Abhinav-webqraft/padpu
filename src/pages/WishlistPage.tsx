import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div
        className="py-16 pt-24"
        style={{ background: 'linear-gradient(160deg, #080f08 0%, #0c1f0c 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest text-amber-400 border border-amber-500/20 bg-amber-500/8 uppercase mb-4">
            ✦ Your Wishlist ✦
          </span>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white">
            Saved Favourites
          </h1>
        </div>
        <div className="h-16 bg-gradient-to-t from-gray-50 to-transparent mt-6" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"
            >
              <Heart className="w-9 h-9 text-red-300" />
            </motion.div>
            <h3 className="font-display font-bold text-2xl text-gray-800 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 text-sm mb-6">Save products you love to revisit them later!</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-amber-950"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-square bg-amber-50 overflow-hidden">
                    <Link to={`/shop/${product.slug}`}>
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </Link>
                    {product.badge && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase" style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>
                        {product.badge}
                      </div>
                    )}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-amber-600 font-medium uppercase tracking-wide mb-1">{product.category}</p>
                    <Link to={`/shop/${product.slug}`}>
                      <h3 className="font-display font-semibold text-gray-900 text-sm mb-2 hover:text-amber-700 transition-colors">{product.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-display font-bold text-lg text-gray-900">₹{product.price}</span>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addItem(product, product.weightOptions[0])}
                        disabled={!product.inStock}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-950 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
