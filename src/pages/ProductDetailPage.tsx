import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Truck, Droplet, Star, Minus, Plus, ShoppingCart, ArrowLeft, Leaf, Heart, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatWeightLabel } from "../utils/formatters";
import type { ProductReview } from "../types";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user, token, role } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showWriteReview, setShowWriteReview] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState<any>(null);

  // Dynamic reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewStatus, setReviewStatus] = useState<{ message: string; isError?: boolean } | null>(null);

  const fetchProductReviews = async (productId: string | number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/product/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setReviewCount(data.reviewCount || 0);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.slug === slug);
        setProduct(found);
        if (found) {
          setAvgRating(found.avgRating || found.rating || 0);
          setReviewCount(found.reviewCount || 0);
          fetchProductReviews(found.id);
        }
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setReviewStatus({ message: "Please log in to submit a review.", isError: true });
      return;
    }
    if (!reviewText.trim()) {
      setReviewStatus({ message: "Please enter your review text.", isError: true });
      return;
    }

    setIsSubmittingReview(true);
    setReviewStatus(null);

    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          rating: reviewRating,
          review_text: reviewText.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setReviewText("");
        setReviewStatus({ message: "Thank you! Your review has been submitted." });
        fetchProductReviews(product.id);
        setTimeout(() => {
          setShowWriteReview(false);
          setReviewStatus(null);
        }, 2000);
      } else {
        setReviewStatus({ message: data.message || "Failed to submit review", isError: true });
      }
    } catch (err) {
      console.error(err);
      setReviewStatus({ message: "Server error submitting review", isError: true });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 pb-20 forest-bg flex items-center justify-center text-amber-400/70 text-sm">Loading...</div>;
  }

  if (!product || !selectedWeight) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 forest-bg relative">
        <Leaf className="w-12 h-12 text-amber-400 mb-4" />
        <h2 className="text-2xl font-display font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-stone-400 text-xs mb-6">This item may have been moved or is unavailable.</p>
        <Link to="/shop" className="px-6 py-2.5 amber-gradient text-stone-950 text-xs font-bold rounded-xl">
          Back to Shop
        </Link>
      </div>
    );
  }

  const saved = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (!role && !user) {
      navigate('/login');
      return;
    }
    addItem(product, selectedWeight, quantity);
    openCart();
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-24 forest-bg relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Images Section */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full aspect-square rounded-3xl overflow-hidden bg-white/[0.03] border border-white/10"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  src={product.images[activeImage] || '/images/300G MULTI.png'}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </AnimatePresence>

              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="amber-gradient text-stone-950 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                    {product.badge}
                  </span>
                </div>
              )}

              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center hover:bg-black/70 transition-all z-10"
              >
                <Heart className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : "text-white"}`} />
              </button>
            </motion.div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2.5">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${
                      activeImage === idx
                        ? "border-amber-500 ring-2 ring-amber-500/20"
                        : "border-white/10 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-6 rounded-3xl bg-white/[0.04] border border-white/10 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs text-amber-400 uppercase tracking-widest font-semibold">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white font-sans">
                  {avgRating > 0 ? avgRating.toFixed(1) : "New"}
                </span>
                <span className="text-stone-400 font-sans">
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2.5 mb-5">
              <span className="text-2xl sm:text-3xl font-bold text-amber-400 font-sans">
                ₹{selectedWeight.price}
              </span>
              {product.originalPrice && selectedWeight.label === product.weightOptions[0].label && (
                <span className="text-sm text-stone-500 line-through font-sans">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="ml-auto text-xs">
                {product.inStock ? (
                  <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5" /> In Stock
                  </span>
                ) : (
                  <span className="text-red-400 font-medium">Out of Stock</span>
                )}
              </span>
            </div>

            <p className="text-stone-300 text-sm leading-relaxed mb-6 font-light">
              {product.description || product.shortDescription}
            </p>

            {/* Size & Quantity */}
            <div className="space-y-5 py-5 border-t border-b border-white/10 mb-6">
              <div>
                <span className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
                  Select Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.weightOptions.map((option: any, index: number) => {
                    const active = selectedWeight?.label === option.label && selectedWeight?.grams === option.grams;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedWeight(option)}
                        className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                          active
                            ? "border-amber-500 bg-amber-500/15 text-amber-400"
                            : "border-white/10 text-stone-300 hover:border-white/25 bg-white/[0.03]"
                        }`}
                      >
                        {formatWeightLabel(option.grams, option.label)} • ₹{option.price}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Quantity
                </span>
                <div className="flex items-center bg-black/30 border border-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-white font-sans">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            {product.inStock ? (
              role ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm amber-gradient text-stone-950 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart • ₹{selectedWeight.price * quantity}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm amber-gradient text-stone-950 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Sign In to Add to Cart
                </Link>
              )
            ) : (
              <button
                disabled
                className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-white/5 text-stone-500 cursor-not-allowed border border-white/5"
              >
                Sold Out
              </button>
            )}

            {/* Trust badges */}
            <div className="mt-5 grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">100% Raw & Pure</p>
                  <p className="text-[10px] text-stone-400">Lab tested quality</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">Safe Delivery</p>
                  <p className="text-[10px] text-stone-400">Direct from farm</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Reviews Section */}
        <div className="mt-14 pt-10 border-t border-white/10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                Customer Reviews
                {avgRating > 0 && (
                  <span className="text-sm font-sans font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    ★ {avgRating.toFixed(1)} / 5
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-400">
                {reviewCount} {reviewCount === 1 ? 'verified review' : 'verified reviews'} from honey lovers
              </p>
            </div>
            <button
              onClick={() => setShowWriteReview(!showWriteReview)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
            >
              {showWriteReview ? "Close" : user ? "Write Review" : "Sign In to Review"}
            </button>
          </div>

          <AnimatePresence>
            {showWriteReview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                {!user ? (
                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6 text-center">
                    <p className="text-stone-300 text-sm mb-3">Please sign in to share your review.</p>
                    <Link
                      to="/login"
                      className="inline-flex px-5 py-2 rounded-xl amber-gradient text-stone-950 text-xs font-bold"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : (
                  <form
                    onSubmit={handleReviewSubmit}
                    className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-300">Your Rating</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                            title={`${star} Star`}
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= reviewRating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-stone-600"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1.5">
                        Your Review
                      </label>
                      <textarea
                        rows={3}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500/50 resize-none font-sans"
                        placeholder="Share your thoughts on the taste, aroma, texture, and packaging..."
                        required
                      />
                    </div>

                    {reviewStatus && (
                      <div
                        className={`p-3 rounded-xl text-xs ${
                          reviewStatus.isError
                            ? "bg-red-500/10 border border-red-500/20 text-red-400"
                            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {reviewStatus.message}
                      </div>
                    )}

                    <div className="flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowWriteReview(false)}
                        className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-5 py-2 amber-gradient text-stone-950 text-xs font-bold rounded-xl hover:opacity-95 disabled:opacity-50"
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {reviews.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-8 text-center max-w-md mx-auto">
              <MessageSquare className="w-8 h-8 text-stone-500 mx-auto mb-2 opacity-50" />
              <p className="text-white text-sm font-semibold mb-1">No reviews yet</p>
              <p className="text-stone-400 text-xs font-light">
                Be the first to experience this pure harvest and share your thoughts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl bg-white/[0.04] border border-white/10 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                        {getInitials(r.user_name)}
                      </div>
                      <div>
                        <h4 className="text-white text-xs font-semibold">{r.user_name}</h4>
                        <span className="text-stone-500 text-[11px] font-sans">
                          {new Date(r.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= r.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-stone-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-stone-300 text-xs leading-relaxed font-light">{r.review_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
