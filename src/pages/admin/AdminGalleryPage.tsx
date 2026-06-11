import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryImages } from '../../data/mockData';
import type { GalleryImage } from '../../types';
import { Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = ['Farm', 'Products', 'Bees', 'Harvest'];

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>(galleryImages);
  const [showAdd, setShowAdd] = useState(false);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [newImage, setNewImage] = useState({ url: '', title: '', description: '', category: 'Farm' });

  const addImage = () => {
    if (!newImage.url || !newImage.title) { alert('URL and title are required.'); return; }
    setImages(prev => [
      {
        id: String(Date.now()),
        url: newImage.url,
        title: newImage.title,
        description: newImage.description,
        category: newImage.category,
        order: prev.length + 1,
      },
      ...prev,
    ]);
    setNewImage({ url: '', title: '', description: '', category: 'Farm' });
    setShowAdd(false);
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8 bg-[#0d0a05] text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Gallery</h1>
          <p className="text-gray-400 text-sm">{images.length} images</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 amber-gradient text-stone-900 font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
        >
          <Plus className="w-5 h-5" />
          Add Image
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="relative group rounded-2xl overflow-hidden aspect-square cursor-pointer border border-white/10"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onClick={() => setLightbox(img)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-white font-semibold text-xs truncate">{img.title}</p>
                <p className="text-amber-400 text-[10px]">{img.category}</p>
              </div>
              <button
                onClick={() => deleteImage(img.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Image Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setShowAdd(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl text-white">Add Gallery Image</h2>
                <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Image URL *</label>
                  <input type="text" value={newImage.url} onChange={e => setNewImage(p => ({ ...p, url: e.target.value }))} className="input-dark w-full" placeholder="https://... or /images/..." />
                </div>
                {newImage.url && (
                  <div className="rounded-xl overflow-hidden h-32">
                    <img src={newImage.url} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.src = '/images/honey-jar.png')} />
                  </div>
                )}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Title *</label>
                  <input type="text" value={newImage.title} onChange={e => setNewImage(p => ({ ...p, title: e.target.value }))} className="input-dark w-full" placeholder="Image title" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Description</label>
                  <input type="text" value={newImage.description} onChange={e => setNewImage(p => ({ ...p, description: e.target.value }))} className="input-dark w-full" placeholder="Short description..." />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Category *</label>
                  <select value={newImage.category} onChange={e => setNewImage(p => ({ ...p, category: e.target.value }))} className="input-dark w-full">
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0f170c]">{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all text-sm">Cancel</button>
                <button onClick={addImage} className="flex items-center gap-2 amber-gradient text-stone-900 font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all">
                  <ImageIcon className="w-4 h-4" />
                  Add to Gallery
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
            <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
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
