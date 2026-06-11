import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { products as initialProducts } from '../../data/mockData';
import { Product } from '../../types';

export default function AdminProducts() {
  const [products] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const stockStatus = (qty: number) => {
    if (qty === 0) return { label: 'Out of Stock', class: 'text-red-400 bg-red-500/10' };
    if (qty < 50) return { label: 'Low Stock', class: 'text-yellow-400 bg-yellow-500/10' };
    return { label: 'In Stock', class: 'text-green-400 bg-green-500/10' };
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Products</h1>
          <p className="text-white/40 text-sm">{products.length} products total</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-amber-950 text-sm amber-gradient hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-dark pl-10 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => {
                const stock = stockStatus(product.stockQuantity);
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-white/80 font-medium text-sm">{product.name}</div>
                          {product.badge && (
                            <span className="text-[10px] text-amber-400 font-medium">{product.badge}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td className="text-white font-semibold">₹{product.price}</td>
                    <td>{product.stockQuantity}</td>
                    <td>
                      <span className="text-amber-400">★</span> {product.rating}
                      <span className="text-white/30 text-xs ml-1">({product.reviewCount})</span>
                    </td>
                    <td>
                      <span className={`badge ${stock.class}`}>{stock.label}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/40 hover:text-amber-400 transition-all">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
