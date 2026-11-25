import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { Product } from "../../types";
import { formatWeightLabel } from "../../utils/formatters";

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const defaultWeight = product.weightOptions[0];
  const saved = isWishlisted(product.id);
  const rating = product.rating ?? product.avgRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, defaultWeight, 1);
    onAddToCart?.();
  };

  return (
    <div className="group rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/30 hover:bg-white/[0.06] overflow-hidden transition-all duration-300 hover:-translate-y-1 h-full flex flex-col relative">
      {/* Badge / Out of Stock indicator */}
      {!product.inStock ? (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-red-950/85 backdrop-blur-md border border-red-500/40 text-red-300 text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full shadow-sm">
            Out of Stock
          </span>
        </div>
      ) : product.badge ? (
        <div className="absolute top-3 left-3 z-10">
          <span className="amber-gradient text-stone-950 text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full shadow-sm">
            {product.badge}
          </span>
        </div>
      ) : null}

      {/* Image */}
      <Link
        to={`/shop/${product.slug}`}
        className="relative aspect-[4/3] overflow-hidden block bg-black/20"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 p-2 backdrop-blur-md rounded-full bg-black/40 border border-white/15 hover:bg-black/60 transition-all z-20"
          aria-label="Toggle wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-all ${
              saved ? "fill-red-500 text-red-500 scale-110" : "text-white/80"
            }`}
          />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
            {product.category}
          </span>
          {defaultWeight && (
            <span className="text-[10px] font-bold text-stone-300 px-2 py-0.5 rounded bg-white/5 border border-white/5">
              {formatWeightLabel(defaultWeight.grams, defaultWeight.label)}
            </span>
          )}
        </div>

        <Link
          to={`/shop/${product.slug}`}
          className="block mb-1 group-hover:text-amber-400 transition-colors"
        >
          <h3 className="font-semibold text-white text-sm line-clamp-1">{product.name}</h3>
        </Link>

        {/* Dynamic Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          {rating > 0 ? (
            <>
              <div className="flex items-center gap-0.5 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-white font-sans">{rating.toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-stone-400 font-sans">
                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </>
          ) : (
            <span className="text-[10px] text-stone-500 font-sans flex items-center gap-1">
              <Star className="w-3 h-3 text-stone-600" />
              No reviews yet
            </span>
          )}
        </div>

        <p className="text-xs text-stone-400 mb-3 line-clamp-1 flex-grow font-light">
          {product.shortDescription}
        </p>

        <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/10">
          <div className="flex items-baseline gap-1.5">
            {(() => {
              const displayPrice = defaultWeight?.price ?? product.price;
              const displayOriginalPrice = defaultWeight?.originalPrice || product.originalPrice || 0;
              return (
                <>
                  <span className="text-base font-bold text-white font-sans">₹{displayPrice}</span>
                  {displayOriginalPrice > displayPrice && (
                    <span className="text-xs text-stone-500 line-through font-sans">₹{displayOriginalPrice}</span>
                  )}
                </>
              );
            })()}
          </div>

          {product.inStock ? (
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 rounded-xl amber-gradient text-stone-950 flex items-center justify-center hover:shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all hover:scale-105"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/25 text-[11px] font-semibold text-red-400 select-none">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
