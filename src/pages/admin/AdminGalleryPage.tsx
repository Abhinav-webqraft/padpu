import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalleryImage } from '../../types';
import { Plus, Trash2, X, Image as ImageIcon, Upload, AlertCircle } from 'lucide-react';

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [newImage, setNewImage] = useState({ url: '', title: '', description: '', category: '' });
  const [errors, setErrors] = useState<{ url?: string; title?: string }>({});

  useEffect(() => {
    fetchImages();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !newImage.category) {
      setNewImage(p => ({ ...p, category: categories[0] }));
    }
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchImages = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/gallery');
      const data = await res.json();
      setImages(data.map((item: any) => ({
        id: String(item.id),
        url: item.image,
        title: item.title,
        description: item.description,
        category: item.category
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const addImage = async () => {
    const errs: { url?: string; title?: string } = {};
    if (!newImage.url) errs.url = 'Please upload an image';
    if (!newImage.title.trim()) errs.title = 'Image title is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const res = await fetch('http://localhost:5000/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newImage.title.trim(),
          description: newImage.description.trim(),
          category: newImage.category,
          image: newImage.url
        })
      });
      if (res.ok) {
        fetchImages();
        setNewImage({ url: '', title: '', description: '', category: categories[0] || '' });
        setErrors({});
        setShowAdd(false);
      } else {
        setErrors({ title: 'Failed to add image' });
      }
    } catch (err) {
      console.error(err);
      setErrors({ title: 'Server error' });
    }
  };

  const deleteImage = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setImages(prev => prev.filter(img => img.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = selectedCategory === 'all' ? images : images.filter(img => img.category === selectedCategory);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Media</span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-0.5">Farm Gallery</h1>
        </div>
        <button
          onClick={() => {
            setErrors({});
            setShowAdd(true);
          }}
          className="inline-flex items-center justify-center gap-2 amber-gradient text-stone-950 font-bold text-xs px-5 py-2.5 rounded-xl hover:opacity-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Add Photo
        </button>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['all', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'amber-gradient text-stone-950 border-transparent'
                  : 'bg-white/[0.04] text-stone-400 border-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white/[0.03] border border-white/10 text-stone-500">
          <ImageIcon className="w-10 h-10 mx-auto mb-2.5 opacity-40" />
          <p className="text-sm font-medium text-stone-300">No gallery photos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <AnimatePresence>
            {filtered.map((img, i) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                className="relative group rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-white/10 bg-stone-900"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onClick={() => setLightbox(img)}
                />
                <div
                  onClick={() => setLightbox(img)}
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3.5"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">{img.category}</span>
                  <p className="text-white font-semibold text-xs truncate mt-0.5">{img.title}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(img.id);
                  }}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  title="Delete photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Image Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#0b1009] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Upload</span>
                  <h2 className="font-display font-bold text-lg text-white mt-0.5">Add Gallery Photo</h2>
                </div>
                <button onClick={() => setShowAdd(false)} className="p-2 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1.5 font-semibold uppercase tracking-wider">Photo *</label>
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 border border-dashed rounded-2xl cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden ${
                      errors.url ? 'border-red-500/60' : 'border-white/20 hover:border-amber-500/50'
                    }`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewImage(p => ({ ...p, url: reader.result as string }));
                          setErrors(p => ({ ...p, url: undefined }));
                        };
                        reader.readAsDataURL(e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    {newImage.url ? (
                      <>
                        <img src={newImage.url} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Upload className="w-6 h-6 text-white mb-1" />
                          <span className="text-xs font-semibold text-white">Change Photo</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-stone-500">
                        <Upload className="w-6 h-6 mb-1.5" />
                        <p className="text-xs font-medium">Click or drag image to upload</p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewImage(p => ({ ...p, url: reader.result as string }));
                            setErrors(p => ({ ...p, url: undefined }));
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {errors.url && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.url}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 font-semibold uppercase tracking-wider">Title *</label>
                  <input
                    type="text"
                    value={newImage.title}
                    onChange={e => {
                      setNewImage(p => ({ ...p, title: e.target.value }));
                      if (errors.title) setErrors(p => ({ ...p, title: undefined }));
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-black/40 border text-white text-xs sm:text-sm outline-none ${
                      errors.title ? 'border-red-500/60' : 'border-white/10 focus:border-amber-500/50'
                    }`}
                    placeholder="e.g. Morning Harvest"
                  />
                  {errors.title && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 font-semibold uppercase tracking-wider">Category *</label>
                  <select
                    value={newImage.category}
                    onChange={e => setNewImage(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm outline-none focus:border-amber-500/50"
                  >
                    {categories.map(c => <option key={c} value={c} className="bg-[#0b1009]">{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 font-semibold uppercase tracking-wider">Caption</label>
                  <input
                    type="text"
                    value={newImage.description}
                    onChange={e => setNewImage(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm outline-none focus:border-amber-500/50"
                    placeholder="Optional short caption..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-300 hover:bg-white/5 transition-all text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={addImage}
                  className="flex items-center gap-1.5 amber-gradient text-stone-950 font-bold px-5 py-2.5 rounded-xl hover:opacity-95 transition-all text-xs"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Save Photo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightbox.url}
              alt={lightbox.title}
              className="max-w-3xl w-full max-h-[80vh] object-contain rounded-2xl"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
