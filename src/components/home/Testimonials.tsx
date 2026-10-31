import { Star } from "lucide-react";
import { testimonials } from "../../data/mockData";
import { motion } from "framer-motion";

export default function Testimonials() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-semibold tracking-widest text-amber-400 uppercase mb-2">
            Reviews
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Loved by <span className="amber-gradient-text">Thousands</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.slice(0, 3).map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="rounded-3xl bg-white/[0.04] border border-white/10 p-6 flex flex-col"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= t.rating ? "fill-amber-400 text-amber-400" : "text-stone-600"
                    }`}
                  />
                ))}
              </div>

              <p className="text-stone-300 text-xs leading-relaxed font-light mb-6 flex-grow">
                "{t.review}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-auto">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-xl object-cover border border-amber-500/40 shrink-0"
                  loading="lazy"
                />
                <div>
                  <p className="text-xs font-semibold text-white">{t.name}</p>
                  <p className="text-[11px] text-stone-400">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
