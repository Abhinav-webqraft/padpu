import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AnimatedSection from '../components/ui/AnimatedSection';
import PollenParticles from '../components/ui/PollenParticles';
import { galleryImages } from '../data/mockData';

const timeline = [
  { year: '2010', title: 'The Beginning', desc: 'Our founder started with just 5 beehives in a small village in Himachal Pradesh, inspired by generations of traditional beekeeping.' },
  { year: '2016', title: 'Going Organic', desc: 'Achieved organic certification. All our practices aligned with sustainable, chemical-free beekeeping.' },
  { year: '2023', title: 'Himalayan Forest Honey', desc: 'Introduced our most prized product — Himalayan Forest Honey from wild bee colonies in protected forest areas.' },
  { year: '2026', title: 'Today', desc: 'Over 1 million jars delivered. 200+ hives. A family growing with yours.' },
];

const team = [
  {
    name: 'Ramesh Padpu',
    role: 'Founder & Master Beekeeper',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    bio: '35 years of beekeeping experience, passed down through generations.',
  },
  {
    name: 'Sunita Devi',
    role: 'Head of Quality & Extraction',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    bio: 'Ensures every jar meets our exacting standards before it leaves the farm.',
  },
  {
    name: 'Aryan Padpu',
    role: 'Operations & Logistics',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    bio: 'Keeps everything running smoothly — from hive to doorstep.',
  },
  {
    name: 'Meena Negi',
    role: 'Customer Relations',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    bio: 'Your happiness is her mission. Always here to help.',
  },
];

const values = [
  { emoji: '🌿', title: 'Purity First', desc: 'We never compromise. No additives, no heating, no shortcuts.' },
  { emoji: '🐝', title: 'Bee Welfare', desc: 'Happy bees make better honey. Our colonies are treated with care.' },
  { emoji: '🌍', title: 'Sustainability', desc: 'From packaging to practices, we minimize our footprint.' },
  { emoji: '❤️', title: 'Community', desc: 'Supporting local farmers and families who work alongside us.' },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const quoteOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    // Start drawing when timeline top hits center of screen.
    // Finish drawing completely when timeline bottom hits center of screen.
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

  // Mobile Wave (amplitude 6) - centered for alternating column layout
  const mobileWaves = 4; // Exactly 4 waves to match the 4 cards
  const mobileWavePoints = Array.from({ length: 130 }).map((_, i) => {
    const t = i / 149;
    const x = 50 + Math.cos((t - 0.155) * Math.PI * 2 * mobileWaves) * 6;
    const y = t * 300; // extend slightly past 100
    return `${x},${y}`;
  }).join(" ");

  // Simple hard cut for progress reveal
  const clipPath = useTransform(
    scrollYProgress,
    (v) => `inset(0 0 ${100 - (v * 100)}% 0)`
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f170c]">
      {/* Faded Background Image Layer */}
      <div
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          background: 'url("/scenic-bg.jpeg") center/cover no-repeat fixed',
        }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0f170c]/60 via-transparent to-[#0f170c]" />

      {/* Liquid Glass Ambient Orbs */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-green-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none" />

      {/* Cinematic Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-32 pb-24 overflow-hidden">
        <PollenParticles count={15} />

        {/* Intro Quote Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          style={{ opacity: quoteOpacity }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative max-w-4xl w-full text-center px-4 sm:px-6 lg:px-8 z-20"
        >
          <div className="glass p-10 md:p-14 border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
            <p className="font-display text-xl md:text-3xl text-white leading-relaxed italic">
              "Our mission is simple: to bring the purest, most delicious honey from our hives to your home —
              with complete transparency, respect for nature, and love for our craft."
            </p>
            <p className="text-amber-500 font-semibold mt-6 md:text-lg">— Ramesh Padpu, Founder</p>
          </div>
        </motion.div>
      </section>

      {/* Main Hero Text (Second Screen) */}
      <section className="relative py-24 flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest text-amber-500 border border-amber-500/20 bg-amber-500/10 uppercase mb-5 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            ✦ Our Story ✦
          </span>
          <h1 className="font-display font-bold text-white mb-5" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            Born from Nature,<br />
            <span className="amber-gradient-text">Built with Love</span>
          </h1>
          <p className="text-gray-400 font-light text-lg max-w-xl mx-auto">
            A family farm in the Himalayan foothills, producing India's finest pure honey since 2010.
          </p>
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest text-amber-500 border border-amber-500/20 bg-amber-500/10 uppercase mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              ✦ Our Journey ✦
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white">15+ Years of Pure Honey</h2>
          </AnimatedSection>

          <div className="relative grid auto-rows-fr" ref={timelineRef}>
            {/* Desktop Paths */}
            <div className="hidden sm:block absolute inset-0 z-0">
              {/* Faint Background Path */}
              <svg
                className="absolute left-0 top-0 bottom-0 w-full overflow-visible pointer-events-none"
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
                className="absolute left-0 top-0 bottom-0 w-full pointer-events-none"
                style={{ clipPath }}
              >
                <svg
                  className="absolute left-0 top-0 bottom-0 w-full overflow-visible pointer-events-none"
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

            {/* Mobile Paths - extended downwards to continue the path */}
            <div className="block sm:hidden absolute top-12 left-0 right-0 -bottom-24 z-0">
              {/* Faint Background Path */}
              <svg
                className="absolute left-0 top-0 bottom-0 w-full overflow-visible pointer-events-none"
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
                className="absolute left-0 top-0 bottom-0 w-full pointer-events-none"
                style={{ clipPath }}
              >
                <svg
                  className="absolute left-0 top-0 bottom-0 w-full overflow-visible pointer-events-none"
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
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`relative flex items-center gap-3 sm:gap-6 py-6 sm:py-8 flex-row ${i % 2 !== 0 ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-1/2 ${i % 2 === 0 ? 'pr-4 sm:pr-12 text-right' : 'pl-4 sm:pl-12 text-left'}`}>
                  <div className="glass-light p-4 sm:p-6 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-shadow">
                    <span className="text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-widest">{event.year}</span>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-white mt-1 sm:mt-2 mb-2 sm:mb-3">{event.title}</h3>
                    <p className="text-gray-400 font-light text-xs sm:text-sm leading-relaxed">{event.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white">What We Stand For</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center p-8 glass-card group"
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{v.emoji}</div>
                <h3 className="font-display font-bold text-white mb-3 text-lg group-hover:text-amber-400 transition-colors">{v.title}</h3>
                <p className="text-gray-400 font-light text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest text-amber-500 border border-amber-500/20 bg-amber-500/10 uppercase mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              ✦ Our Team ✦
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white">The Faces Behind the Farm</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="glass-card p-6 text-center"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 ring-2 ring-amber-500/30">
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <h3 className="font-display font-bold text-white mb-1 text-lg">{member.name}</h3>
                <p className="text-amber-500 text-xs font-semibold uppercase tracking-wider mb-3">{member.role}</p>
                <p className="text-gray-400 font-light text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Farm images */}
      <section className="py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl text-white">Life on the Farm</h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {galleryImages.slice(0, 6).map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="rounded-3xl overflow-hidden aspect-square border border-white/10"
              >
                <img src={img.url} alt={img.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" loading="lazy" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
