import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories as globalCategories, addCategory, deleteCategory } from '../../data/mockData';
import { Plus, Trash2, Tags } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<string[]>(globalCategories);
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      alert('Category already exists!');
      return;
    }
    
    addCategory(trimmed);
    setCategories([...globalCategories]);
    setNewCategory('');
  };

  const handleDelete = (cat: string) => {
    if (confirm(`Are you sure you want to delete the category "${cat}"?`)) {
      deleteCategory(cat);
      setCategories([...globalCategories]);
    }
  };

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8 bg-[#0d0a05] text-white min-h-screen">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-1">Categories</h1>
        <p className="text-gray-400 text-sm">Manage product and gallery categories</p>
      </div>

      <div className="max-w-xl">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="e.g. Exotic Honey"
              className="input-dark flex-1"
            />
            <button
              type="submit"
              className="flex items-center gap-2 amber-gradient text-stone-900 font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {categories.map((cat, i) => (
              <motion.div
                key={cat}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Tags className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{cat}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {categories.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-white/5 rounded-xl border border-white/10 border-dashed">
              <p>No categories found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
