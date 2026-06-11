import { Leaf, Shield, Truck, Beaker, Heart, Sprout } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Leaf,
    title: "100% Raw & Pure",
    description: "Never heated or pasteurised. Natural enzymes and nutrients fully intact.",
  },
  {
    icon: Shield,
    title: "No Additives",
    description: "Just pure honey. No refined sugars, corn syrup, or artificial flavours.",
  },
  {
    icon: Beaker,
    title: "Lab Verified",
    description: "Every batch independently verified for absolute purity.",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Delivered securely in eco-friendly, insulated packaging across India.",
  },
  {
    icon: Heart,
    title: "Ethical Beekeeping",
    description: "Sustainable harvesting that protects bee colonies and habitats.",
  },
  {
    icon: Sprout,
    title: "Direct from Farms",
    description: "From our mountain hives to your table, cutting out all middlemen.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Liquid glass floating ambient orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-amber-500/20 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-amber-500 uppercase">The Gold Standard</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
          >
            Why Choose <span className="amber-gradient-text">Padpu</span>?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg font-light"
          >
            We believe in transparency, purity, and the unadulterated goodness of nature. Discover what makes our honey truly exceptional.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(245,158,11,0.05)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                  <Icon className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="font-semibold text-white mb-3 text-xl font-display group-hover:text-amber-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light max-w-xs">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
