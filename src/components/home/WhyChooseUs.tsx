import { Leaf, Shield, Truck, Beaker, Heart, Sprout } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Leaf, title: "100% Raw & Pure", description: "Unheated & unpasteurised with natural enzymes intact." },
  { icon: Shield, title: "Zero Additives", description: "No refined sugars, syrups, or artificial flavours." },
  { icon: Beaker, title: "Lab Verified", description: "Independently tested batches for guaranteed purity." },
  { icon: Truck, title: "Safe Delivery", description: "Secure, eco-friendly packaging across India." },
  { icon: Heart, title: "Ethical Care", description: "Sustainable harvesting that protects bee colonies." },
  { icon: Sprout, title: "Farm Direct", description: "Straight from our Western Ghats apiary to you." },
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 max-w-xl mx-auto">
          <span className="inline-block text-[11px] font-semibold tracking-widest text-amber-400 uppercase mb-2">
            The Gold Standard
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Why Choose <span className="amber-gradient-text">Padpu</span>?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 flex items-start gap-4 hover:border-amber-500/25 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-stone-400 text-xs leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
