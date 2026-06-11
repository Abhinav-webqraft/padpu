import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { products } from "../../data/mockData";
import ProductCard from "../shop/ProductCard";
import { useCart } from "../../context/CartContext";
import { motion } from "framer-motion";

export default function FeaturedProducts() {
  const { addItem, openCart } = useCart();
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0f170c 0%, #142010 30%, #1a2a14 50%, #142010 70%, #0f170c 100%)",
      }}
    >
      {/* Ambient glow accents */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-[120px]"
          style={{ background: "rgba(245, 158, 11, 0.06)" }}
        />
        <div
          className="absolute bottom-20 right-10 w-72 h-72 rounded-full blur-[120px]"
          style={{ background: "rgba(34, 85, 34, 0.12)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Our <span className="amber-gradient-text">Honey</span>
          </h2>

          <p className="text-gray-400 max-w-xl mx-auto text-lg font-light">
            Handpicked from our most pristine apiaries, each jar tells a story.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featured.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <ProductCard
                product={product}
                onAddToCart={() => {
                  addItem(product, product.weightOptions[0]);
                  openCart();
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 amber-gradient text-stone-900 font-bold rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300 hover:scale-105"
          >
            Explore All Products <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
