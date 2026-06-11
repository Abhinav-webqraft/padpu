import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { products } from "../data/mockData";
import { useCart } from "../context/CartContext";
import { ShieldCheck, Truck, Droplet, Star, Minus, Plus, ShoppingCart, ArrowLeft, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  const product = products.find((p) => p.slug === slug);
  const [selectedWeight, setSelectedWeight] = useState(product?.weightOptions[0]);

  useEffect(() => {
    if (product && !selectedWeight) {
      setSelectedWeight(product.weightOptions[0]);
    }
  }, [product, selectedWeight]);

  if (!product || !selectedWeight) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <Leaf className="w-16 h-16 text-amber-200 mb-6" />
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Product Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md">We couldn't find the honey you're looking for. It might have been moved or is no longer available.</p>
        <Link to="/shop" className="px-8 py-3 amber-gradient text-stone-900 font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, selectedWeight, quantity);
    openCart();
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Images Section */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full aspect-[4/5] sm:aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </AnimatePresence>
              
              {product.badge && (
                <div className="absolute top-6 left-6 z-10">
                  <span className="amber-gradient text-stone-900 text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                    {product.badge}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === idx ? "border-amber-500" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-1/2 flex flex-col"
          >
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wider font-semibold">
              <span className="text-amber-600">{product.category}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-gray-900">{product.rating}</span>
              </div>
              <span className="text-gray-400 text-sm">({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-3xl font-bold text-gray-900">₹{selectedWeight.price}</span>
              {product.originalPrice && selectedWeight.label === product.weightOptions[0].label && (
                <span className="text-lg text-gray-400 line-through">₹{product.originalPrice}</span>
              )}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-10 font-light">
              {product.description}
            </p>

            {/* Options */}
            <div className="space-y-8 mb-10 border-t border-b border-gray-100 py-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.weightOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setSelectedWeight(option)}
                      className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
                        selectedWeight.label === option.label
                          ? "border-amber-500 bg-amber-50 text-amber-700 shadow-[0_0_0_1px_rgba(245,158,11,1)]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                      }`}
                    >
                      {option.label} — ₹{option.price}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.inStock ? (
                      <span className="text-green-600 font-medium flex items-center gap-1.5"><Droplet className="w-4 h-4"/> In Stock</span>
                    ) : (
                      <span className="text-red-500 font-medium">Out of Stock</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all duration-300 ${
                product.inStock
                  ? "amber-gradient text-stone-900 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:-translate-y-1"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {product.inStock ? "Add to Cart" : "Sold Out"}
            </button>

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Lab Tested</p>
                  <p className="text-xs text-gray-500">100% Pure Certified</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <Truck className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Fast Delivery</p>
                  <p className="text-xs text-gray-500">Secure packaging</p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
