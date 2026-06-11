import { Droplets } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Subtle ambient light */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-1/2 h-full"
          style={{
            background:
              "linear-gradient(to left, rgba(34, 85, 34, 0.08), transparent)",
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-[100px]"
          style={{ background: "rgba(20, 60, 20, 0.15)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Image Group */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative h-[500px] w-full max-w-md mx-auto lg:mx-0 rounded-3xl overflow-hidden"
              style={{ border: "1px solid rgba(255, 255, 255, 0.15)" }}
            >
              <img
                src="/images/beekeeper.png"
                alt="Our Beekeepers"
                className="object-cover w-full h-full"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-8 left-8 text-white">
                <span className="text-3xl font-display font-bold text-amber-400">
                  10+
                </span>
                <p className="text-sm text-gray-300 font-medium">
                  Years of Tradition
                </p>
              </div>
            </motion.div>

            {/* Floating abstract element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute -right-12 top-1/4 w-32 h-32 rounded-full flex items-center justify-center animate-spin-slow hidden md:flex backdrop-blur-sm"
              style={{
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "rgba(255, 255, 255, 0.07)",
              }}
            >
              <Droplets className="w-8 h-8 text-amber-500/50" />
            </motion.div>
          </div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-white"
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]">
              Crafted by <span className="amber-gradient-text">Nature</span>,{" "}
              <br />
              Nurtured by Us.
            </h2>

            <div className="space-y-5 text-gray-400 text-lg font-light leading-relaxed mb-10">
              <p>
                Our bees forage freely across wild meadows untouched by modern
                agriculture. The result is honey exactly as nature intended —
                raw, unpasteurised, and vibrating with natural enzymes.
              </p>
            </div>

            <div
              className="grid grid-cols-2 gap-8 mb-10 py-8"
              style={{
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div>
                <p className="text-3xl font-display font-bold text-amber-400 mb-1">
                  50+
                </p>
                <p className="text-sm text-gray-400 uppercase tracking-wider text-xs">
                  Floral Varieties
                </p>
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-amber-400 mb-1">
                  1M+
                </p>
                <p className="text-sm text-gray-400 uppercase tracking-wider text-xs">
                  Happy Homes
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
