import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useState } from 'react';

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const [selectedWeight, setSelectedWeight] = useState(0);
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  if (!product) return null;

  const weight = product.weightOptions[selectedWeight];
  const wishlisted = isWishlisted(product.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          <div className="grid sm:grid-cols-2">
            <div className="aspect-square bg-amber-50 overflow-hidden">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex flex-col gap-3">
              <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">{product.category}</p>
              <h3 className="font-display font-bold text-xl text-gray-900">{product.name}</h3>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{product.rating} ({product.reviewCount})</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{product.shortDescription}</p>

              <div className="flex gap-2 flex-wrap">
                {product.weightOptions.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedWeight(i)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      i === selectedWeight ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {w.label} — ₹{w.price}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-2xl text-gray-900">₹{weight.price}</span>
                {product.originalPrice && (
                  <span className="text-gray-400 line-through text-sm">₹{product.originalPrice}</span>
                )}
              </div>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => { addItem(product, weight); onClose(); }}
                  disabled={!product.inStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-amber-950"
                  style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)' }}
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className="p-3 rounded-xl border border-gray-200 hover:border-red-300 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
