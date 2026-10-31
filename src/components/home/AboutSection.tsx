import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative h-[380px] sm:h-[420px] w-full rounded-3xl overflow-hidden border border-white/15"
          >
            <img
              src="/images/beehive-forest.png"
              alt="Padpu Apiaries"
              className="object-cover w-full h-full"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <span className="text-2xl font-sans font-bold text-amber-400">Since 1983</span>
              <p className="text-xs text-stone-300">Dakshina Kannada, Karnataka</p>
            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 text-white"
          >
            <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-amber-400 mb-2">
              Our Heritage
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              A Journey from <span className="amber-gradient-text">Nature</span> to Your Table
            </h2>

            <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed mb-6">
              Padpu Farms began in 1983 with a single native Apis cerana colony. Today, we harvest 100% pure, raw honey from the rich biodiversity of the Western Ghats, bringing honest farm goodness straight to your home.
            </p>

            <div className="grid grid-cols-3 gap-4 py-5 mb-6 border-y border-white/10">
              <div>
                <p className="text-xl sm:text-2xl font-sans font-bold text-amber-400">1983</p>
                <p className="text-[11px] text-stone-400 uppercase tracking-wider">Founded</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-sans font-bold text-amber-400">100%</p>
                <p className="text-[11px] text-stone-400 uppercase tracking-wider">Raw & Pure</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-sans font-bold text-amber-400">Direct</p>
                <p className="text-[11px] text-stone-400 uppercase tracking-wider">From Farm</p>
              </div>
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors"
            >
              Read Our Story <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
