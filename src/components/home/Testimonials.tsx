import { Star } from "lucide-react";
import { testimonials } from "../../data/mockData";
import { motion } from "framer-motion";

export default function Testimonials() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Dark theme background elements */}
      <div className="absolute inset-0 bg-honeycomb-pattern opacity-5 mix-blend-overlay z-0"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full z-0 mix-blend-screen"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Loved by Thousands
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-xl mx-auto font-light"
          >
            Hear what our customers have to say.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((t, idx) => (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="glass-card p-8 group flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= t.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>

              {/* Review */}
              <p className="text-gray-300 mb-8 leading-relaxed font-light italic flex-grow">
                "{t.review}"
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/[0.12] mt-auto">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-amber-500/50">
                  <img 
                    src={t.avatar} 
                    alt={t.name} 
                    className="object-cover w-full h-full" 
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-50">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
