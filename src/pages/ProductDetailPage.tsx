import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShieldCheck, Truck, Droplet, Star, Minus, Plus, ShoppingCart, ArrowLeft, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatWeightLabel } from "../utils/formatters";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.slug === slug);
        setProduct(found);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (product && product.weightOptions && product.weightOptions.length > 0 && !selectedWeight) {
      setSelectedWeight(product.weightOptions[0]);
    }
  }, [product, selectedWeight]);

  if (loading) {
    return <div className="min-h-screen pt-24 pb-20 bg-stone-950 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!product || !selectedWeight) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-stone-950 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587049352847-4d4b12746440?q=80&w=2000&auto=format&fit=crop')] opacity-[0.03] object-cover pointer-events-none" />
        <Leaf className="w-16 h-16 text-amber-400 mb-6 relative z-10" />
        <h2 className="text-3xl font-display font-bold text-white mb-4 relative z-10">Product Not Found</h2>
        <p className="text-stone-400 mb-8 max-w-md relative z-10">We couldn't find the honey you're looking for. It might have been moved or is no longer available.</p>
        <Link to="/shop" className="px-8 py-3 amber-gradient text-stone-900 font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all relative z-10">
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
    <div className="min-h-screen pt-24 pb-20 bg-stone-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587049352847-4d4b12746440?q=80&w=2000&auto=format&fit=crop')] opacity-[0.03] object-cover" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-amber-400 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Images Section */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full aspect-[4/5] sm:aspect-square rounded-3xl overflow-hidden bg-stone-900/50 backdrop-blur-sm border border-white/5"
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
                  <span className="amber-gradient text-stone-900 text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">
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
                      activeImage === idx ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="object-cover w-full h-full" />
                    {activeImage !== idx && <div className="absolute inset-0 bg-black/20" />}
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
            <div className="mb-2 flex items-center gap-2 text-sm text-amber-500/80 uppercase tracking-wider font-semibold">
              <span className="text-amber-400">{product.category}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">{product.rating}</span>
              </div>
              <span className="text-stone-400 text-sm">({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-3xl font-bold text-white">₹{selectedWeight.price}</span>
              {product.originalPrice && selectedWeight.label === product.weightOptions[0].label && (
                <span className="text-lg text-stone-500 line-through">₹{product.originalPrice}</span>
              )}
            </div>

            <p className="text-stone-300 text-lg leading-relaxed mb-10 font-light">
              {product.description}
            </p>

            {/* Options */}
            <div className="space-y-8 mb-10 border-t border-b border-white/10 py-8">
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.weightOptions.map((option: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedWeight(option)}
                      className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                        selectedWeight?.label === option.label && selectedWeight?.grams === option.grams
                          ? "border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          : "border-white/10 text-stone-300 hover:border-white/30 hover:bg-white/5 bg-stone-900/50 backdrop-blur-sm"
                      }`}
                    >
                      {formatWeightLabel(option.grams, option.label)} — ₹{option.price}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-stone-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-stone-400 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-stone-400 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-stone-400">
                    {product.inStock ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1.5"><Droplet className="w-4 h-4"/> In Stock</span>
                    ) : (
                      <span className="text-red-400 font-medium">Out of Stock</span>
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
                  : "bg-stone-800 text-stone-500 cursor-not-allowed border border-white/5"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {product.inStock ? "Add to Cart" : "Sold Out"}
            </button>

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-900/50 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-colors">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-white">Lab Tested</p>
                  <p className="text-xs text-stone-400">100% Pure Certified</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-900/50 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-colors">
                <Truck className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-white">Fast Delivery</p>
                  <p className="text-xs text-stone-400">Secure packaging</p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24 border-t border-white/10 pt-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-white mb-12 text-center">Customer Reviews</h2>
            
            {/* Add Review Form */}
            <div className="bg-stone-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 sm:p-8 mb-16 relative overflow-hidden group">
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-amber-500/10 transition-colors duration-700" />
              
              <h3 className="text-xl font-bold text-white mb-6">Write a Review</h3>
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); /* Handle submit */ }}>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-3">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" className="text-amber-500 hover:scale-110 transition-transform">
                        <Star className="w-8 h-8 fill-amber-500/20 hover:fill-amber-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="review" className="block text-sm font-medium text-stone-300 mb-2">Your Review</label>
                  <textarea 
                    id="review" 
                    rows={4} 
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-y shadow-inner"
                    placeholder="What did you think about this honey?"
                  ></textarea>
                </div>
                <div className="pt-2 flex justify-center sm:justify-end">
                  <button type="submit" className="w-full sm:w-auto px-8 py-3 amber-gradient text-stone-900 font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 transition-all">
                    Submit Review
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Reviews */}
            <div className="space-y-6">
              <div className="bg-stone-900/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-stone-900/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 font-bold text-lg border border-white/10">
                      AS
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Arjun Sharma</h4>
                      <span className="text-stone-500 text-sm">2 days ago</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-stone-300 leading-relaxed pl-16">
                  Absolutely amazing quality! The taste is so pure and natural. I've been using this for my morning tea and the difference is night and day compared to store-bought honey. The packaging was also top-notch.
                </p>
              </div>
              
              <div className="bg-stone-900/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-stone-900/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 font-bold text-lg border border-white/10">
                      PP
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Priya Patel</h4>
                      <span className="text-stone-500 text-sm">1 week ago</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                    <Star className="w-4 h-4 text-stone-700 fill-stone-700" />
                  </div>
                </div>
                <p className="text-stone-300 leading-relaxed pl-16">
                  Very good packaging and fast delivery. The consistency is perfect and it feels very premium. It pairs wonderfully with warm water and lemon. Will definitely order again!
                </p>
              </div>

              {showAllReviews && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-stone-900/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-stone-900/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 font-bold text-lg border border-white/10">
                        RM
                      </div>
                      <div>
                        <h4 className="text-white font-bold">Rohan Mehta</h4>
                        <span className="text-stone-500 text-sm">2 weeks ago</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-stone-300 leading-relaxed pl-16">
                    A beautiful product from start to finish. The honey has a very distinct, rich flavor profile that I haven't experienced before. Highly recommend it to anyone looking for genuine organic honey.
                  </p>
                </motion.div>
              )}
            </div>
            
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="px-6 py-2 rounded-full border border-white/20 text-stone-300 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
              >
                {showAllReviews ? "Show Less" : "Show More"}
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
