import { Star, ArrowUpRight } from "lucide-react";
import { testimonials } from "../../data/mockData";
import { motion } from "framer-motion";

const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/place/Padpu+Farms/@12.6173261,75.4429751,17z/data=!4m18!1m9!3m8!1s0x3ba4efe41e461883:0x28fac153ee055770!2sPadpu+Farms!8m2!3d12.6173261!4d75.44555!9m1!1b1!16s%2Fg%2F11jcljyp18!3m7!1s0x3ba4efe41e461883:0x28fac153ee055770!8m2!3d12.6173261!4d75.44555!9m1!1b1!16s%2Fg%2F11jcljyp18?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MTExOC4xIKXMDSoASAFQAw%3D%3D";

export default function Testimonials() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-semibold tracking-widest text-amber-400 uppercase mb-2">
            Reviews
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Customer <span className="amber-gradient-text">Reviews</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="w-full md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] rounded-3xl bg-white/[0.04] border border-white/10 hover:border-amber-500/25 p-6 flex flex-col transition-colors"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= t.rating ? "fill-amber-400 text-amber-400" : "text-stone-600"
                    }`}
                  />
                ))}
              </div>

              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-light whitespace-pre-line mb-6 flex-grow">
                {t.review}
              </p>

              <div className="pt-4 border-t border-white/10 mt-auto">
                <p className="text-sm font-semibold text-white">{t.name}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl amber-gradient text-stone-950 text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            See More <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
