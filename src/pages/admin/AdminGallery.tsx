import { motion } from 'framer-motion';
import { Upload, Trash2, Plus } from 'lucide-react';
import { galleryImages } from '../../data/mockData';

export default function AdminGallery() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Gallery</h1>
          <p className="text-white/40 text-sm">{galleryImages.length} images</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-amber-950 text-sm amber-gradient hover:opacity-90">
          <Plus className="w-4 h-4" /> Upload Image
        </button>
      </div>

      {/* Upload area */}
      <div className="bg-white/5 rounded-2xl p-8 text-center border-2 border-dashed border-amber-500/20 hover:border-amber-400/40 transition-colors cursor-pointer">
        <Upload className="w-8 h-8 text-amber-400/40 mx-auto mb-3" />
        <p className="text-white/40 text-sm mb-1">Drag & drop images here</p>
        <p className="text-white/20 text-xs">PNG, JPG, WebP up to 10MB each</p>
        <button className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-amber-950 amber-gradient hover:opacity-90">
          Browse Files
        </button>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {galleryImages.map((img, i) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group relative rounded-2xl overflow-hidden aspect-square"
          >
            <img
              src={img.url}
              alt={img.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <p className="text-white text-xs font-medium text-center px-2">{img.title}</p>
              <span className="text-[10px] text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">{img.category}</span>
              <button className="mt-2 w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
