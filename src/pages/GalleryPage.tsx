import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AnimatedSection from '../components/ui/AnimatedSection';

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
    <div className="min-h-screen forest-bg relative overflow-hidden pb-24 md:pb-0">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-[-10%] w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-[-10%] w-[400px] h-[400px] rounded-full bg-green-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Hero Header */}
      <div className="relative py-24 pt-32 text-center z-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest text-amber-500 border border-amber-500/20 bg-amber-500/10 uppercase mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          >
            ✦ Gallery ✦
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display font-bold text-4xl md:text-6xl text-white mb-4"
          >
            Life at Padpu Farms
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-400 font-light text-lg max-w-xl mx-auto"
          >
            A glimpse into our world — bees, blooms, harvests, and the journey from hive to jar.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        {/* Filter tabs */}
        <AnimatedSection className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat
                  ? 'text-stone-900 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'glass-light text-gray-400 hover:text-white border-transparent'
              }`}
              style={activeCategory === cat ? { background: 'linear-gradient(135deg, #fbbf24, #d97706)' } : {}}
            >
              {cat}
            </button>
          ))}
        </AnimatedSection>

        {/* Masonry Grid */}
        <motion.div layout className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((img, i) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="break-inside-avoid mb-4 relative rounded-3xl overflow-hidden cursor-pointer group border border-white/10"
              onClick={() => setLightboxImg({ url: img.url, title: img.title, description: img.description })}
            >
              <img
                src={img.url}
                alt={img.title}
                loading="lazy"
                className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Hover overlay with water glass effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-4"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                  backdropFilter: 'blur(2px)',
                  WebkitBackdropFilter: 'blur(2px)',
                }}
              >
                <div>
                  <p className="text-white font-semibold text-sm">{img.title}</p>
                  <p className="text-amber-400 text-xs">{img.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">
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
              className="absolute top-6 right-6 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setLightboxImg(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-4xl w-full"
            >
              <img
                src={lightboxImg.url}
                alt={lightboxImg.title}
                className="w-full rounded-3xl object-contain max-h-[80vh] border border-white/10"
              />
              <div className="mt-3 text-center glass p-4">
                <p className="text-white font-semibold">{lightboxImg.title}</p>
                <p className="text-gray-400 text-sm font-light">{lightboxImg.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
