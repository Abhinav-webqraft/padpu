import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxImg, setLightboxImg] = useState<null | { url: string; title: string; description: string }>(null);
  const [images, setImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    fetch('http://localhost:5000/api/gallery')
      .then(res => res.json())
      .then(data => {
        setImages(data.map((item: any) => ({
          id: String(item.id),
          url: item.image,
          title: item.title,
          description: item.description,
          category: item.category
        })));
      })
      .catch(err => console.error(err));

    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(['All', ...data]);
      })
      .catch(err => console.error(err));
  }, []);

  const filtered = activeCategory === 'All'
    ? images
    : images.filter(img => img.category === activeCategory);

  return (
    <div className="min-h-screen forest-bg relative overflow-hidden pt-20 md:pt-28 pb-28 md:pb-16">
      <div className="absolute top-0 left-[-10%] w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[140px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header & Filter Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-bold text-3xl sm:text-4xl text-white"
            >
              Farm <span className="amber-gradient-text">Gallery</span>
            </motion.h1>
            <p className="text-stone-400 text-sm font-light mt-1">
              Bees, blooms, and harvests across the Western Ghats.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border ${
                  activeCategory === cat
                    ? 'amber-gradient text-stone-950 border-amber-400/50'
                    : 'bg-white/[0.04] border-white/10 text-stone-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <motion.div layout className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((img, i) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="break-inside-avoid mb-4 relative rounded-2xl overflow-hidden cursor-pointer group border border-white/10"
              onClick={() => setLightboxImg({ url: img.url, title: img.title, description: img.description })}
            >
              <img
                src={img.url}
                alt={img.title}
                loading="lazy"
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <p className="text-white font-semibold text-xs">{img.title}</p>
                  <p className="text-amber-400 text-[10px] uppercase tracking-wider">{img.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-stone-500 text-xs">
            No images in this category.
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setLightboxImg(null)}
          >
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setLightboxImg(null)}
            >
              <X className="w-4 h-4" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-3xl w-full"
            >
              <img
                src={lightboxImg.url}
                alt={lightboxImg.title}
                className="w-full rounded-2xl object-contain max-h-[78vh] border border-white/10"
              />
              {(lightboxImg.title || lightboxImg.description) && (
                <div className="mt-3 text-center rounded-2xl bg-white/[0.05] border border-white/10 p-3.5">
                  <p className="text-white font-semibold text-sm">{lightboxImg.title}</p>
                  {lightboxImg.description && (
                    <p className="text-stone-400 text-xs font-light mt-0.5">{lightboxImg.description}</p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
