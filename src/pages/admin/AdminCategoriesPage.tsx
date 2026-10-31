import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tags, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = newCategory.trim();
    if (!trimmed) {
      setError('Category name is required');
      return;
    }
    if (trimmed.length < 2) {
      setError('Category name must be at least 2 characters');
      return;
    }
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setError('This category already exists');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      if (response.ok) {
        setCategories([...categories, trimmed]);
        setNewCategory('');
        setSuccess(`Added "${trimmed}"`);
        setTimeout(() => setSuccess(''), 2500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error adding category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to connect to server');
    }
  };

  const handleDelete = async (cat: string) => {
    if (confirm(`Delete category "${cat}"?`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/categories/${encodeURIComponent(cat)}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCategories(categories.filter(c => c !== cat));
        } else {
          setError('Cannot delete category while products are assigned to it');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Taxonomy</span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-0.5">Categories</h1>
        </div>
        <span className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-stone-400 font-sans">
          Total: <strong className="text-white">{categories.length}</strong>
        </span>
      </div>

      {/* Add Category Card */}
      <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5 sm:p-6">
        <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-3">
          Create New Category
        </label>
        <form onSubmit={handleAdd} noValidate className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={e => {
              setNewCategory(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Medicinal Honey"
            className={`flex-1 px-4 py-2.5 rounded-xl bg-black/30 border text-white text-xs sm:text-sm placeholder-stone-500 outline-none transition-colors ${
              error ? 'border-red-500/60' : 'border-white/10 focus:border-amber-500/50'
            }`}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 amber-gradient text-stone-950 font-bold text-xs px-5 py-2.5 rounded-xl hover:opacity-95 transition-all whitespace-nowrap shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </form>

        {error && (
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
          </p>
        )}
        {success && (
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {success}
          </p>
        )}
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {categories.map((cat) => (
            <motion.div
              key={cat}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 p-4 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Tags className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-white truncate">{cat}</span>
              </div>
              <button
                onClick={() => handleDelete(cat)}
                className="p-2 rounded-xl hover:bg-red-500/15 text-stone-400 hover:text-red-400 transition-colors shrink-0"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-stone-500 rounded-3xl bg-white/[0.03] border border-white/10 border-dashed text-xs">
          No categories found. Add your first category above.
        </div>
      )}
    </div>
  );
}
