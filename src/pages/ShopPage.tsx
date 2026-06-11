import { useState } from "react";
import { products } from "../data/mockData";
import ProductCard from "../components/shop/ProductCard";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 forest-bg relative overflow-hidden">
      {/* Liquid Glass Ambient Orbs */}
      <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-green-500/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Our <span className="amber-gradient-text">Honey Shop</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto font-light"
          >
            Pure, raw, farm-sourced — choose your golden companion. Every jar is packed with natural goodness and health benefits.
          </motion.p>
        </div>


        {/* Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-3xl">
            <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-gray-400 font-light">Try adjusting your search or filter criteria.</p>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
              className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-colors border border-white/10"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
