import { useState, useEffect } from "react";
import ProductCard from "../components/shop/ProductCard";
import { Search, Filter, X } from "lucide-react";
import { motion } from "framer-motion";

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-24 forest-bg relative overflow-hidden">
      <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl sm:text-4xl font-bold text-white"
            >
              Our <span className="amber-gradient-text">Honey Shop</span>
            </motion.h1>
            <p className="text-stone-400 text-sm font-light mt-1">
              Pure, raw, farm-sourced harvest from the Western Ghats.
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search honey..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-stone-500 text-xs outline-none focus:border-amber-500/40 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border ${
                  selectedCategory === cat
                    ? "amber-gradient text-stone-950 border-amber-400/50 shadow-sm"
                    : "bg-white/[0.04] border-white/10 text-stone-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl bg-white/[0.04] border border-white/10 max-w-md mx-auto">
            <Filter className="w-8 h-8 text-stone-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No products found</h3>
            <p className="text-stone-400 text-xs font-light mb-5">Try another search or category.</p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
              className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl transition-colors border border-white/10"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
