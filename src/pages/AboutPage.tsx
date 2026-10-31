import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { galleryImages } from '../data/mockData';
import { Leaf, Shield, Globe, Heart } from 'lucide-react';

const timeline = [
  { year: '1983', title: 'First Colony', desc: 'Started with one native Apis cerana colony in Dakshina Kannada.' },
  { year: '1992–93', title: 'A Difficult Pause', desc: 'Overcame a severe apiary outbreak through patience and resilience.' },
  { year: '2003', title: 'Starting Again', desc: 'Rebuilt our farm from a single hive with traditional care.' },
  { year: '2017', title: 'Padpu Farms', desc: 'Launched our brand to deliver pure honey directly to homes.' },
];

const values = [
  { icon: Leaf, title: 'Pure & Natural', desc: 'Traditional harvesting that preserves natural enzymes.' },
  { icon: Shield, title: 'Bee-Centred', desc: 'Prioritizing colony health, pollination, and biodiversity.' },
  { icon: Globe, title: 'Western Ghats', desc: 'Foraged across rich medicinal and fruit-bearing landscapes.' },
  { icon: Heart, title: 'Farm Direct', desc: 'Honest honey straight from our apiaries to your table.' },
];

const team = [
  {
    name: 'Ramesh Padpu',
    role: 'Founder & Master Beekeeper',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  },
  {
    name: 'Sunita Devi',
    role: 'Quality & Extraction',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  },
  {
    name: 'Aryan Padpu',
    role: 'Operations & Logistics',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  },
  {
    name: 'Meena Negi',
    role: 'Customer Care',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
  },
];

export default function AboutPage() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });

  // Calculate the wave polyline points
  const waves = 2;
  // Desktop Wave (amplitude 3) - gently points to the cards
  const desktopWavePoints = Array.from({ length: 100 }).map((_, i) => {
    const t = i / 99;
    const x = 50 - Math.cos((t - 0.125) * Math.PI * 2 * waves) * 3;
    const y = t * 100;
    return `${x},${y}`;
  }).join(" ");

  // Mobile Wave (amplitude 4.5) - fits 0..100 viewBox and aligns with the 4 alternating cards
  const mobileWaves = 2;
  const mobileWavePoints = Array.from({ length: 100 }).map((_, i) => {
    const t = i / 99;
    const x = 50 - Math.cos((t - 0.125) * Math.PI * 2 * mobileWaves) * 4.5;
    const y = t * 100;
    return `${x},${y}`;
  }).join(" ");

  // Simple hard cut for progress reveal
  const clipPath = useTransform(
    scrollYProgress,
    (v) => `inset(0 0 ${100 - (v * 100)}% 0)`
  );

  return (
    <div className="min-h-screen forest-bg relative overflow-hidden pt-20 md:pt-28 pb-28 md:pb-16">
      <div className="absolute top-[10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto pt-4"
        >
          <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-widest text-amber-400 border border-amber-500/20 bg-amber-500/10 uppercase mb-4">
            Since 1983
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-white mb-4 leading-tight">
            From Nature <span className="amber-gradient-text">to Your Table</span>
          </h1>
          <p className="text-stone-400 font-light text-sm sm:text-base leading-relaxed">
            Born in Dakshina Kannada, Padpu Farms crafts 100% pure, raw honey through ethical beekeeping and deep respect for the Western Ghats.
          </p>
        </motion.div>

        {/* Timeline with Wave Pattern */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest text-amber-500 border border-amber-500/20 bg-amber-500/10 uppercase mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              ✦ Our Journey ✦
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white">Decades of Resilience and Pure Honey</h2>
          </div>

          <div className="relative grid auto-rows-fr" ref={timelineRef}>
            {/* Desktop Paths */}
            <div className="hidden sm:block absolute inset-0 z-0">
              {/* Faint Background Path */}
              <svg
                className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <polyline
                  points={desktopWavePoints}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Glowing Active Path */}
              <motion.div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ clipPath }}
              >
                <svg
                  className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <polyline
                    points={desktopWavePoints}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </motion.div>
            </div>

            {/* Mobile Paths */}
            <div className="block sm:hidden absolute inset-0 z-0">
              {/* Faint Background Path */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <polyline
                  points={mobileWavePoints}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Glowing Active Path */}
              <motion.div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ clipPath }}
              >
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <polyline
                    points={mobileWavePoints}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </motion.div>
            </div>

            {timeline.map((event, i) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`relative flex items-center gap-2 sm:gap-6 py-3 sm:py-8 flex-row ${i % 2 !== 0 ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-1/2 ${i % 2 === 0 ? 'pr-5 sm:pr-12 text-right' : 'pl-5 sm:pl-12 text-left'}`}>
                  <div className="glass-light p-3 sm:p-6 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-shadow">
                    <span className="text-[10px] sm:text-xs font-bold text-amber-500 font-sans uppercase tracking-widest">{event.year}</span>
                    <h3 className="font-display font-bold text-sm sm:text-xl text-white mt-0.5 sm:mt-2 mb-1 sm:mb-3 leading-snug">{event.title}</h3>
                    <p className="text-stone-400 font-light text-[11px] sm:text-sm leading-snug sm:leading-relaxed">{event.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 text-center mb-6">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 text-amber-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-white text-sm mb-1">{title}</h3>
                <p className="text-stone-400 font-light text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 text-center mb-6">Our Team</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 text-center"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 border border-amber-500/30">
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <h3 className="font-display font-bold text-white text-sm">{member.name}</h3>
                <p className="text-amber-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Farm Glimpse */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 text-center mb-6">Life at the Farm</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.slice(0, 6).map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="rounded-2xl overflow-hidden aspect-[4/3] border border-white/10"
              >
                <img src={img.url} alt={img.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
