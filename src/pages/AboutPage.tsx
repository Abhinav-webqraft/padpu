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

const founder = {
  name: 'Lingappa Gowda Padpu',
  subtitle: 'Founder, 40+ years in Apiculture',
  image: '/images/founder.jpeg',
  achievements: [
    'District-level Best Agriculturist (2014–15)',
    'Kempegowda Jayanti Taluk-level Award (2024)',
    'Best Agriculturist of the Year (2023–24)',
  ],
};

const team = [
  {
    name: 'Vivek Padpu',
    initials: 'VP',
    role: 'Trainer & Developer',
    experience: '15+ years experience',
    highlight: 'Modern Youth Apiculturist 2022',
  },
  {
    name: 'Keerthan Pare',
    initials: 'KP',
    role: 'Trainer',
    experience: '10+ years experience',
  },
  {
    name: 'Astik Chithadka',
    initials: 'AC',
    role: 'Trainer',
    experience: '10+ years experience',
  },
  {
    name: 'Vineeth Tanteppady',
    initials: 'VT',
    role: 'Trainer',
    experience: '10+ years experience',
  },
  {
    name: 'Akshay Kumar Madabhakilu',
    initials: 'AM',
    role: 'Trainer',
    experience: '3+ years experience',
  },
  {
    name: 'Kaushik Kolpe',
    initials: 'KK',
    role: 'Business Promoter',
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
            About <span className="amber-gradient-text">Padpu Farms</span>
          </h1>
          <p className="text-stone-400 font-light text-sm sm:text-base leading-relaxed">
            Independent beekeepers from Sullia, Dakshina Kannada, cultivating pure Multi-Floral Apis cerena honey across the Western Ghats and Pushpagiri Reserve Forest.
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

        {/* Founder */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 text-center mb-6">Our Founder</h2>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto rounded-3xl bg-white/[0.04] border border-amber-500/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8"
          >
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-amber-500/40 bg-stone-900/60 shrink-0 shadow-lg">
              <img
                src={founder.image}
                alt={founder.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="text-center sm:text-left">
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
                {founder.name}
              </h3>
              <p className="text-amber-400 text-xs sm:text-sm font-medium mt-1 mb-4">
                {founder.subtitle}
              </p>
              <ul className="space-y-2 text-left inline-block">
                {founder.achievements.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-300 font-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Meet Our Team */}
        <div>
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-widest text-amber-400 border border-amber-500/20 bg-amber-500/10 uppercase mb-3">
              ✦ The Apiculturists ✦
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">Meet Our Team</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-amber-500/35 p-6 sm:p-7 text-center flex flex-col items-center justify-center transition-colors duration-300"
              >
                {/* Top golden shimmer accent */}
                <div className="absolute top-0 inset-x-10 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Subtle honeycomb corner watermark */}
                <svg
                  viewBox="0 0 80 80"
                  className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-400 opacity-[0.04] group-hover:opacity-[0.09] transition-opacity duration-300 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polygon points="40,6 68,22 68,54 40,70 12,54 12,22" />
                  <polygon points="40,18 58,28 58,48 40,58 22,48 22,28" />
                </svg>

                {/* Hexagonal Monogram Crest */}
                <div className="relative w-14 h-14 flex items-center justify-center mb-4">
                  <svg
                    viewBox="0 0 60 60"
                    className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
                  >
                    <polygon
                      points="30,3 54,16.5 54,43.5 30,57 6,43.5 6,16.5"
                      className="fill-amber-500/10 stroke-amber-500/35 group-hover:fill-amber-500/20 group-hover:stroke-amber-400/70 transition-colors duration-300"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span className="relative z-10 font-display font-bold text-sm tracking-wider text-amber-300">
                    {member.initials}
                  </span>
                </div>

                {/* Centered Member Info */}
                <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-100 transition-colors leading-snug">
                  {member.name}
                </h3>

                <span className="mt-2 inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                  {member.role}
                </span>

                {(member.experience || member.highlight) && (
                  <>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent my-3.5" />
                    <div className="space-y-1">
                      {member.experience && (
                        <p className="text-stone-300 font-light text-xs">{member.experience}</p>
                      )}
                      {member.highlight && (
                        <p className="text-amber-300/90 text-[11px] font-medium">
                          ✦ {member.highlight}
                        </p>
                      )}
                    </div>
                  </>
                )}
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
