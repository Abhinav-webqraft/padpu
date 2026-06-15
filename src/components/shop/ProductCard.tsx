import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useState } from "react";
import { Product } from "../../types";
import { formatWeightLabel } from "../../utils/formatters";

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const defaultWeight = product.weightOptions[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, defaultWeight, 1);
    onAddToCart?.();
  };

  return (
    <div
      className="group rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 h-full flex flex-col relative"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
        e.currentTarget.style.boxShadow =
          "0 12px 30px rgba(0, 0, 0, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Badges */}
      {product.badge && (
        <div className="absolute top-4 left-4 z-10">
          <span className="amber-gradient text-stone-900 text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
            {product.badge}
          </span>
        </div>
      )}

      {/* Image */}
      <Link to={`/shop/${product.slug}`} className="relative h-64 overflow-hidden block" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        
        {/* Quick View Overlay (Desktop) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
          <span className="bg-amber-500 text-stone-900 text-sm font-semibold py-2 px-6 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            Quick View
          </span>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-4 right-4 p-2.5 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all z-20 hover:scale-110"
          style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.15)" }}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${
              isWishlisted ? "fill-red-500 text-red-500 scale-110" : "text-gray-400"
            }`}
          />
        </button>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/shop/${product.slug}`} className="block mb-2 group-hover:text-amber-400 transition-colors">
          <h3 className="font-semibold text-white line-clamp-1">{product.name}</h3>
        </Link>
        
        <p className="text-xs text-gray-400 mb-4 line-clamp-2 flex-grow">{product.shortDescription}</p>
        
        {defaultWeight && (
          <p
            className="text-[10px] font-bold text-amber-400 mb-3 uppercase tracking-widest self-start px-2 py-1 rounded"
            style={{ background: "rgba(245, 158, 11, 0.1)" }}
          >
            {formatWeightLabel(defaultWeight.grams, defaultWeight.label)}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-4 mt-auto" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-gray-500 line-through">₹{product.originalPrice}</span>
            )}
            <span className="text-lg font-bold text-white">₹{defaultWeight.price}</span>
          </div>
          
          <button
            onClick={handleAddToCart}
            className="w-10 h-10 rounded-full amber-gradient text-stone-900 flex items-center justify-center hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all hover:scale-110"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
