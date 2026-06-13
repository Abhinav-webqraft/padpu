import { useState } from 'react';
import { motion } from 'framer-motion';
import { products as initialProducts, categories as globalCategories } from '../../data/mockData';
import type { Product } from '../../types';
import { Plus, Edit2, Trash2, Package, X, Check, Search, Upload } from 'lucide-react';

const WEIGHT_LABELS = ['250g', '500g', '1kg', '3×250g', '3×500g', 'Complete Set'];

type WeightOption = { label: string; price: number; grams: number };
type NewProduct = {
  name: string; shortDescription: string; description: string;
  category: string; price: number; originalPrice: number;
  inStock: boolean; stockQuantity: number; featured: boolean;
  weightOptions: WeightOption[]; images: string[];
};

const BLANK: NewProduct = {
  name: '', shortDescription: '', description: '',
  category: 'Pure Honey', price: 0, originalPrice: 0,
  inStock: true, stockQuantity: 0, featured: false,
  weightOptions: [{ label: '250g', price: 0, grams: 250 }],
  images: ['/images/honey-jar.png'],
};

export default function AdminProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<NewProduct>(BLANK);
  const [search, setSearch] = useState('');

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({...BLANK, category: globalCategories[0] || 'Pure Honey'}); setEditing(null); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({
      name: p.name, shortDescription: p.shortDescription,
      description: p.description, category: p.category,
      price: p.price, originalPrice: p.originalPrice || 0,
      inStock: p.inStock, stockQuantity: p.stockQuantity,
      featured: p.featured, weightOptions: [...p.weightOptions],
      images: [...p.images],
    });
    setEditing(p);
    setShowForm(true);
  };

  const deleteProduct = (id: string) => {
    if (confirm('Delete this product?')) {
      setAllProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const addWeightOption = () => {
    setForm(prev => ({
      ...prev,
      weightOptions: [...prev.weightOptions, { label: '500g', price: 0, grams: 500 }]
    }));
  };

  const removeWeightOption = (i: number) => {
    setForm(prev => ({
      ...prev,
      weightOptions: prev.weightOptions.filter((_, idx) => idx !== i)
    }));
  };

  const updateWeight = (i: number, field: keyof WeightOption, value: string | number) => {
    setForm(prev => ({
      ...prev,
      weightOptions: prev.weightOptions.map((w, idx) => idx === i ? { ...w, [field]: value } : w)
    }));
  };

  const saveProduct = () => {
    if (!form.name.trim()) { alert('Product name is required.'); return; }
    if (form.weightOptions.length === 0) { alert('At least one weight option is required.'); return; }

    if (editing) {
      setAllProducts(prev => prev.map(p => p.id === editing.id ? {
        ...p, ...form,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        stockQuantity: Number(form.stockQuantity),
        weightOptions: form.weightOptions.map(w => ({
          ...w, price: Number(w.price), grams: Number(w.grams)
        })),
      } : p));
    } else {
      const newId = String(Date.now());
      const newProd: Product = {
        id: newId,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        name: form.name,
        shortDescription: form.shortDescription,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        inStock: form.inStock,
        stockQuantity: Number(form.stockQuantity),
        featured: form.featured,
        weightOptions: form.weightOptions.map(w => ({
          ...w, price: Number(w.price), grams: Number(w.grams)
        })),
        images: form.images.filter(Boolean),
        tags: [],
        rating: 0,
        reviewCount: 0,
        badge: undefined,
      };
      setAllProducts(prev => [newProd, ...prev]);
    }
    setShowForm(false);
  };

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8 min-h-screen bg-[#0d0a05] text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Products</h1>
          <p className="text-gray-400 text-sm">{allProducts.length} products in catalogue</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 amber-gradient text-stone-900 font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 outline-none focus:border-amber-500/40"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            <div className="flex gap-3 mb-3">
              <img src={p.images[0]} alt={p.name} className="w-14 h-14 rounded-2xl object-cover bg-amber-900/20 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight truncate">{p.name}</p>
                <p className="text-amber-500/70 text-xs mt-0.5">{p.category}</p>
                <p className="text-amber-400 font-bold text-sm mt-1">₹{p.price}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.inStock ? 'text-green-300 bg-green-500/10 border-green-500/20' : 'text-red-300 bg-red-500/10 border-red-500/20'}`}>
                  {p.inStock ? `In Stock (${p.stockQuantity})` : 'Out of Stock'}
                </span>
                {p.featured && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">Featured</span>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setShowForm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/5 border border-white/10 rounded-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-white">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Product Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-dark w-full" placeholder="e.g. Wild Forest Honey" />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Category *</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-dark w-full">
                    {globalCategories.map(c => <option key={c} value={c} className="bg-[#0f170c]">{c}</option>)}
                  </select>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Short Description *</label>
                  <input type="text" value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} className="input-dark w-full" placeholder="Brief tagline..." maxLength={120} />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Full Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-dark w-full resize-none h-24" placeholder="Detailed description..." />
                </div>

                {/* Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Base Price (₹) *</label>
                    <input type="number" value={form.price || ''} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} className="input-dark w-full" min={0} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Original Price (₹)</label>
                    <input type="number" value={form.originalPrice || ''} onChange={e => setForm(p => ({ ...p, originalPrice: Number(e.target.value) }))} className="input-dark w-full" min={0} />
                  </div>
                </div>

                {/* Weight Options */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Weight & Price Options *</label>
                    <button onClick={addWeightOption} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                  {form.weightOptions.map((w, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <select value={w.label} onChange={e => updateWeight(i, 'label', e.target.value)} className="input-dark flex-1 text-sm">
                        {WEIGHT_LABELS.map(l => <option key={l} value={l} className="bg-[#0f170c]">{l}</option>)}
                      </select>
                      <input type="number" placeholder="Price ₹" value={w.price || ''} onChange={e => updateWeight(i, 'price', e.target.value)} className="input-dark w-24 text-sm" min={0} />
                      <input type="number" placeholder="Grams" value={w.grams || ''} onChange={e => updateWeight(i, 'grams', e.target.value)} className="input-dark w-20 text-sm" min={0} />
                      {form.weightOptions.length > 1 && (
                        <button onClick={() => removeWeightOption(i)} className="text-red-400 hover:text-red-300 px-1">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Stock Quantity</label>
                    <input type="number" value={form.stockQuantity || ''} onChange={e => setForm(p => ({ ...p, stockQuantity: Number(e.target.value) }))} className="input-dark w-full" min={0} />
                  </div>
                  <div className="flex flex-col gap-2 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.inStock} onChange={e => setForm(p => ({ ...p, inStock: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
                      <span className="text-sm text-gray-300">In Stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
                      <span className="text-sm text-gray-300">Featured</span>
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Product Image *</label>
                  <label 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-amber-500/50 transition-all relative overflow-hidden"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        setForm(p => ({ ...p, images: [URL.createObjectURL(e.dataTransfer.files[0])] }));
                      }
                    }}
                  >
                    {form.images[0] ? (
                      <>
                        <img src={form.images[0]} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Upload className="w-8 h-8 text-white mb-2" />
                          <span className="text-sm font-semibold text-white">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Upload className="w-8 h-8 mb-2" />
                        <p className="text-sm font-medium">Click or drag image to upload</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setForm(p => ({ ...p, images: [URL.createObjectURL(e.target.files[0])] }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all text-sm">Cancel</button>
                <button
                  onClick={saveProduct}
                  className="flex items-center gap-2 amber-gradient text-stone-900 font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all"
                >
                  <Check className="w-4 h-4" />
                  {editing ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
