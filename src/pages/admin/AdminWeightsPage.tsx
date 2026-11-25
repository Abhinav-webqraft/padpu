import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Check, X, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface WeightItem {
  id: number;
  label: string;
  grams: number;
  defaultPrice: number;
}

function parseGramsFromLabel(label: string): string {
  const clean = label.trim().toLowerCase();
  const multiMatch = clean.match(/^(\d+)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(kg|g|ml|l)$/);
  if (multiMatch) {
    const count = Number(multiMatch[1]);
    const qty = Number(multiMatch[2]);
    const unit = multiMatch[3];
    const mult = unit === 'kg' || unit === 'l' ? 1000 : 1;
    return String(Math.round(count * qty * mult));
  }
  const singleMatch = clean.match(/^(\d+(?:\.\d+)?)\s*(kg|g|ml|l)$/);
  if (singleMatch) {
    const qty = Number(singleMatch[1]);
    const unit = singleMatch[2];
    const mult = unit === 'kg' || unit === 'l' ? 1000 : 1;
    return String(Math.round(qty * mult));
  }
  return '';
}

export default function AdminWeightsPage() {
  const [weights, setWeights] = useState<WeightItem[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newGrams, setNewGrams] = useState('');
  const [newDefaultPrice, setNewDefaultPrice] = useState('');
  const [gramsTouched, setGramsTouched] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editGrams, setEditGrams] = useState('');
  const [editDefaultPrice, setEditDefaultPrice] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/weights');
      if (response.ok) {
        const data = await response.json();
        setWeights(data);
      }
    } catch (err) {
      console.error('Error fetching weights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLabelChange = (value: string) => {
    setNewLabel(value);
    if (error) setError('');
    if (!gramsTouched) {
      const parsed = parseGramsFromLabel(value);
      if (parsed) setNewGrams(parsed);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = newLabel.trim();
    const gramsNum = Number(newGrams);
    const priceNum = newDefaultPrice.trim() ? Number(newDefaultPrice) : 0;

    if (!trimmed) {
      setError('Weight label is required (e.g. 250g, 500g, 1kg)');
      return;
    }
    if (!newGrams.trim() || Number.isNaN(gramsNum) || gramsNum <= 0) {
      setError('Please enter a valid weight in grams (greater than 0)');
      return;
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError('Default price must be 0 or greater');
      return;
    }
    if (weights.some((w) => w.label.toLowerCase() === trimmed.toLowerCase())) {
      setError('This weight option already exists');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: trimmed,
          grams: Math.round(gramsNum),
          defaultPrice: priceNum,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setWeights((prev) =>
          [...prev, data].sort((a, b) => a.grams - b.grams || a.id - b.id)
        );
        setNewLabel('');
        setNewGrams('');
        setNewDefaultPrice('');
        setGramsTouched(false);
        setSuccess(
          priceNum > 0
            ? `Added "${trimmed}" (${Math.round(gramsNum)}g • Default ₹${priceNum})`
            : `Added "${trimmed}" (${Math.round(gramsNum)}g)`
        );
        setTimeout(() => setSuccess(''), 2500);
      } else {
        setError(data.message || 'Error adding weight');
      }
    } catch (err) {
      console.error('Error adding weight:', err);
      setError('Failed to connect to server');
    }
  };

  const startEdit = (item: WeightItem) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditGrams(String(item.grams));
    setEditDefaultPrice(item.defaultPrice > 0 ? String(item.defaultPrice) : '');
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
    setEditGrams('');
    setEditDefaultPrice('');
  };

  const saveEdit = async (id: number) => {
    setError('');
    setSuccess('');
    const trimmed = editLabel.trim();
    const gramsNum = Number(editGrams);
    const priceNum = editDefaultPrice.trim() ? Number(editDefaultPrice) : 0;

    if (!trimmed) {
      setError('Weight label is required');
      return;
    }
    if (!editGrams.trim() || Number.isNaN(gramsNum) || gramsNum <= 0) {
      setError('Please enter a valid weight in grams');
      return;
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError('Default price must be 0 or greater');
      return;
    }
    if (weights.some((w) => w.id !== id && w.label.toLowerCase() === trimmed.toLowerCase())) {
      setError('Another weight with this label already exists');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/weights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: trimmed,
          grams: Math.round(gramsNum),
          defaultPrice: priceNum,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setWeights((prev) =>
          prev
            .map((w) => (w.id === id ? data : w))
            .sort((a, b) => a.grams - b.grams || a.id - b.id)
        );
        cancelEdit();
        setSuccess(`Updated weight "${trimmed}"`);
        setTimeout(() => setSuccess(''), 2500);
      } else {
        setError(data.message || 'Error updating weight');
      }
    } catch (err) {
      console.error('Error updating weight:', err);
      setError('Failed to connect to server');
    }
  };

  const handleDelete = async (item: WeightItem) => {
    if (!confirm(`Delete weight "${item.label}"?`)) return;
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/weights/${item.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setWeights((prev) => prev.filter((w) => w.id !== item.id));
        if (editingId === item.id) cancelEdit();
        setSuccess(`Deleted "${item.label}"`);
        setTimeout(() => setSuccess(''), 2500);
      } else {
        const data = await response.json();
        setError(data.message || 'Could not delete weight');
      }
    } catch (err) {
      console.error('Error deleting weight:', err);
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            Catalogue Options
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-0.5">
            Weights
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Manage weight options and optional default prices for the product dropdown. You can also set custom prices per weight inside each product.
          </p>
        </div>
        <span className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-stone-400 font-sans">
          Total: <strong className="text-white">{weights.length}</strong>
        </span>
      </div>

      {/* Add Weight Card */}
      <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5 sm:p-6">
        <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-3">
          Create New Weight Option
        </label>
        <form onSubmit={handleAdd} noValidate className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Weight Label *
            </span>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="e.g. 250g, 500g, 1kg"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-black/30 border text-white text-xs sm:text-sm placeholder-stone-500 outline-none transition-colors ${
                error && !newLabel.trim()
                  ? 'border-red-500/60'
                  : 'border-white/10 focus:border-amber-500/50'
              }`}
            />
          </div>
          <div className="sm:col-span-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Grams *
            </span>
            <input
              type="number"
              min={1}
              onWheel={(e) => e.currentTarget.blur()}
              value={newGrams}
              onChange={(e) => {
                setNewGrams(e.target.value);
                setGramsTouched(Boolean(e.target.value));
                if (error) setError('');
              }}
              placeholder="e.g. 500"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-black/30 border text-white text-xs sm:text-sm placeholder-stone-500 outline-none font-sans transition-colors ${
                error && (!newGrams || Number(newGrams) <= 0)
                  ? 'border-red-500/60'
                  : 'border-white/10 focus:border-amber-500/50'
              }`}
            />
          </div>
          <div className="sm:col-span-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
              Default Price ₹ (Opt)
            </span>
            <input
              type="number"
              min={0}
              onWheel={(e) => e.currentTarget.blur()}
              value={newDefaultPrice}
              onChange={(e) => {
                setNewDefaultPrice(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 499"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 focus:border-amber-500/50 text-white text-xs sm:text-sm placeholder-stone-500 outline-none font-sans transition-colors"
            />
          </div>
          <button
            type="submit"
            className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 amber-gradient text-stone-950 font-bold text-xs px-4 py-2.5 rounded-xl hover:opacity-95 transition-all whitespace-nowrap shadow-[0_0_20px_rgba(245,158,11,0.2)] h-[42px]"
          >
            <Plus className="w-4 h-4" /> Add
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

      {/* Weights List */}
      {loading ? (
        <div className="text-center py-12 text-stone-500 text-xs">Loading weights...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {weights.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/10 p-4 transition-colors"
                >
                  {isEditing ? (
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-stone-500 mb-0.5">Label</span>
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-amber-500/40 text-white text-xs outline-none"
                            placeholder="Label"
                          />
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-stone-500 mb-0.5">Grams</span>
                          <input
                            type="number"
                            min={1}
                            onWheel={(e) => e.currentTarget.blur()}
                            value={editGrams}
                            onChange={(e) => setEditGrams(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-amber-500/40 text-white text-xs font-sans outline-none"
                            placeholder="Grams"
                          />
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-stone-500 mb-0.5">Def. ₹</span>
                          <input
                            type="number"
                            min={0}
                            onWheel={(e) => e.currentTarget.blur()}
                            value={editDefaultPrice}
                            onChange={(e) => setEditDefaultPrice(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-amber-500/40 text-white text-xs font-sans outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={cancelEdit}
                          className="px-2.5 py-1 rounded-lg bg-white/5 text-stone-400 hover:text-white text-[11px] font-medium inline-flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-white truncate">{item.label}</p>
                          <p className="text-[11px] text-stone-400 font-sans">
                            {item.grams} grams
                            {item.defaultPrice > 0 && (
                              <span className="text-amber-400/90"> • Default ₹{item.defaultPrice}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
                          title="Edit weight"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 rounded-xl hover:bg-red-500/15 text-stone-400 hover:text-red-400 transition-colors"
                          title="Delete weight"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!loading && weights.length === 0 && (
        <div className="text-center py-12 text-stone-500 rounded-3xl bg-white/[0.03] border border-white/10 border-dashed text-xs">
          No weights found. Add your first weight option above.
        </div>
      )}
    </div>
  );
}
