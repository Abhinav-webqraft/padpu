import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalleryImage } from '../../types';
import { Plus, Trash2, X, Image as ImageIcon, Upload } from 'lucide-react';

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [newImage, setNewImage] = useState({ url: '', title: '', description: '', category: '' });

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
    if (!newImage.url || !newImage.title) { alert('Image and title are required.'); return; }
    try {
      const res = await fetch('http://localhost:5000/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newImage.title,
          description: newImage.description,
          category: newImage.category,
          image: newImage.url
        })
      });
      if (res.ok) {
        fetchImages();
        setNewImage({ url: '', title: '', description: '', category: categories[0] || '' });
        setShowAdd(false);
      } else {
        alert('Failed to add image');
      }
    } catch (err) {
      console.error(err);
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
                {/* Image Upload */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Image *</label>
                  <label 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-amber-500/50 transition-all relative overflow-hidden"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewImage(p => ({ ...p, url: reader.result as string }));
                        };
                        reader.readAsDataURL(e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    {newImage.url ? (
                      <>
                        <img src={newImage.url} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
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
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewImage(p => ({ ...p, url: reader.result as string }));
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
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
                    {categories.map(c => <option key={c} value={c} className="bg-[#0f170c]">{c}</option>)}
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
