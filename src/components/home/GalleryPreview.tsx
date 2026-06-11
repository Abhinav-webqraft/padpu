import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { galleryImages } from "../../data/mockData";
import { motion } from "framer-motion";

export default function GalleryPreview() {
  const preview = galleryImages.slice(0, 6); // 6 images to perfectly fill the masonry grid

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
              Life at the Farm
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/gallery"
              className="hidden sm:inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium uppercase tracking-wider text-sm transition-colors group"
            >
              View Full Gallery <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Masonry Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {preview.map((img, i) => {
            // Determine span classes for masonry look — perfect fit for 6 items
            let spanClass = "col-span-1 row-span-1";
            if (i === 0) spanClass = "col-span-2 row-span-2";
            if (i === 1) spanClass = "col-span-1 row-span-2";
            if (i === 4) spanClass = "col-span-2 row-span-1";
            if (i === 5) spanClass = "col-span-2 row-span-1";
            
            return (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-2xl overflow-hidden group border border-white/[0.12] ${spanClass}`}
              >
                <Link to="/gallery" className="block w-full h-full">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-amber-400 text-xs uppercase tracking-widest font-semibold mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {img.category}
                    </p>
                    <p className="text-white font-display text-xl font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {img.title}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/gallery"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 amber-gradient text-stone-900 font-bold rounded-xl w-full"
          >
            View Full Gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
