import { useRef, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

// Scroll animation image sequence:
// Landing image (static before scroll) → scroll frames 0-121 → end image (static after scroll)
const SCROLL_FRAME_NAMES = Array.from({ length: 122 }, (_, i) => {
  const paddedIndex = i.toString().padStart(6, "0");
  return `frame_${paddedIndex}.jpeg`;
});

const LANDING_IMAGE = "/Video Project 4 1_frames/landing image (3).jpeg";
const END_IMAGE = "/Video Project 4 1_frames/end image (2).jpeg";

// Total sequence: landing + scroll frames + end
const ALL_FRAMES = [
  LANDING_IMAGE,
  ...SCROLL_FRAME_NAMES.map((name) => `/Video Project 4 1_frames/${name}`),
  END_IMAGE,
];
const TOTAL_FRAMES = ALL_FRAMES.length;

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);

  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);
  const landingTextRef = useRef<HTMLDivElement>(null);

  const scrollProgressRef = useRef(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [logoVisible, setLogoVisible] = useState(true);

  // Draw a single frame on the canvas with cover-fit
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const targetW = width * dpr;
    const targetH = height * dpr;
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const clampedIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
    const img = imagesRef.current[clampedIdx];

    ctx.clearRect(0, 0, width, height);

    if (img) {
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;
      let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

      if (imgRatio > canvasRatio) {
        drawHeight = height;
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = width;
        drawHeight = width / imgRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.globalAlpha = 1;
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
  }, []);

  // Compute cover-fit dimensions for an image in the viewport
  const getCoverDimensions = useCallback(
    (img: HTMLImageElement, width: number, height: number) => {
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;
      if (imgRatio > canvasRatio) {
        const drawHeight = height;
        const drawWidth = height * imgRatio;
        return { drawWidth, drawHeight, offsetX: (width - drawWidth) / 2, offsetY: 0 };
      } else {
        const drawWidth = width;
        const drawHeight = width / imgRatio;
        return { drawWidth, drawHeight, offsetX: 0, offsetY: (height - drawHeight) / 2 };
      }
    },
    []
  );

  // Draw a blended frame at a floating-point index (crossfade between adjacent frames)
  const drawBlendedFrame = useCallback(
    (floatIndex: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      const targetW = width * dpr;
      const targetH = height * dpr;
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const floorIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(floatIndex)));
      const ceilIdx = Math.min(TOTAL_FRAMES - 1, floorIdx + 1);
      const frac = floatIndex - floorIdx;

      const imgA = imagesRef.current[floorIdx];
      const imgB = imagesRef.current[ceilIdx];

      ctx.clearRect(0, 0, width, height);

      // Draw base frame at full opacity
      if (imgA) {
        const d = getCoverDimensions(imgA, width, height);
        ctx.globalAlpha = 1;
        ctx.drawImage(imgA, d.offsetX, d.offsetY, d.drawWidth, d.drawHeight);
      }

      // Crossfade: draw next frame on top with fractional opacity
      if (imgB && frac > 0.01 && ceilIdx !== floorIdx) {
        const d = getCoverDimensions(imgB, width, height);
        ctx.globalAlpha = frac;
        ctx.drawImage(imgB, d.offsetX, d.offsetY, d.drawWidth, d.drawHeight);
        ctx.globalAlpha = 1;
      }
    },
    [getCoverDimensions]
  );

  // Preload all frames
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    const promises = ALL_FRAMES.map((framePath, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = framePath;
        img.onload = () => {
          images[index] = img;
          loaded++;
          setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load scroll frame: ${framePath}`);
          loaded++;
          setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
          resolve();
        };
      });
    });

    Promise.all(promises).then(() => {
      imagesRef.current = images;
      setIsLoaded(true);
      drawFrame(0); // Show landing image initially
      // Auto-fade the logo out after 1 second
      setTimeout(() => {
        setLogoVisible(false);
      }, 1000);
    });
  }, [drawFrame]);

  // Continuous animation loop — lerps the displayed frame toward the target
  useEffect(() => {
    if (!isLoaded) return;

    let running = true;

    const tick = () => {
      if (!running) return;

      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const diff = target - current;

      // Lerp toward target — 3% of remaining distance per frame for ultra-smooth cinematic feel
      const next =
        Math.abs(diff) < 0.02 ? target : current + diff * 0.03;

      if (Math.abs(next - current) > 0.001) {
        drawBlendedFrame(next);
      }
      currentFrameRef.current = next;

      // Update text overlay opacity
      const progress = scrollProgressRef.current;

      const updateIntermediateText = (ref: React.RefObject<HTMLDivElement>, start: number, end: number) => {
        if (!ref.current) return;
        const mid = (start + end) / 2;
        let opacity = 0;
        let translateY = 40;
        
        if (progress >= start && progress <= end) {
          if (progress < mid) {
            const p = (progress - start) / (mid - start);
            const easeP = p * (2 - p); // ease out
            opacity = Math.min(1, easeP * 1.5); // Peak opacity 1
            translateY = 40 * (1 - easeP);
          } else {
            const p = (end - progress) / (end - mid);
            const easeP = p * p; // ease in
            opacity = Math.min(1, easeP * 1.5);
            translateY = -40 * (1 - easeP);
          }
        } else if (progress > end) {
            translateY = -40;
        }
        
        ref.current.style.opacity = String(opacity);
        ref.current.style.transform = `translateY(${translateY}px)`;
      };

      // The scroll frames map progress from 0.0 to 0.85 roughly
      updateIntermediateText(text1Ref, 0.08, 0.26);
      updateIntermediateText(text2Ref, 0.30, 0.48);
      updateIntermediateText(text3Ref, 0.52, 0.70);

      if (overlayRef.current) {
        let textOpacity = 0;
        if (progress > 0.75) {
          // Fade in from 75% to 85%
          textOpacity = Math.min(1, (progress - 0.75) / 0.10);
        }
        overlayRef.current.style.opacity = String(textOpacity);
        // Slide up gently as it appears
        const translateY = progress > 0.75 ? (1 - Math.min(1, (progress - 0.75) / 0.10)) * 40 : 40;
        overlayRef.current.style.transform = `translateY(${translateY}px)`;
      }

      // Landing text fades out as soon as scroll begins
      if (landingTextRef.current) {
        // Opacity is 1 until progress 0.02, then fades to 0 by 0.08
        const landingOpacity = progress < 0.02 ? 1 : Math.max(0, 1 - (progress - 0.02) / 0.06);
        // Slide up slightly as it fades out
        const landingY = progress < 0.02 ? 0 : -(progress - 0.02) * 200;
        landingTextRef.current.style.opacity = String(landingOpacity);
        landingTextRef.current.style.transform = `translateY(${landingY}px)`;
      }

      // Hide scroll indicator once scrolling begins
      if (scrollIndicatorRef.current) {
        const indicatorOpacity =
          progress < 0.03 ? 1 : Math.max(0, 1 - (progress - 0.03) / 0.05);
        scrollIndicatorRef.current.style.opacity = String(indicatorOpacity);
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);

    return () => {
      running = false;
    };
  }, [isLoaded, drawBlendedFrame]);

  // Handle scroll — map scroll progress to frame index
  useEffect(() => {
    if (!isLoaded) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollableHeight = container.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

      scrollProgressRef.current = progress;

      // Map scroll progress to frames:
      // progress 0.0       → frame 0 (landing image — stays visible initially)
      // progress 0.0-0.85  → frames 0 through TOTAL_FRAMES-2 (landing → scroll frames)
      // progress 0.85-1.0  → frame TOTAL_FRAMES-1 (end image — holds before product section)

      const SCROLL_END = 0.85; // When to reach the end image
      if (progress <= SCROLL_END) {
        const p = progress / SCROLL_END;
        let targetIdx = 0;
        
        // Piecewise mapping to slow down frames 19 to 87 (indices 20 to 88)
        // We give them 70% of the entire scrolling space (p from 0.10 to 0.80)
        
        if (p <= 0.10) {
          // p: 0.0 -> 0.10 maps to indices 0 -> 20
          targetIdx = (p / 0.10) * 20;
        } else if (p <= 0.80) {
          // p: 0.10 -> 0.80 maps to indices 20 -> 88
          const segmentP = (p - 0.10) / 0.70;
          targetIdx = 20 + segmentP * 68; // (88 - 20)
        } else {
          // p: 0.80 -> 1.0 maps to indices 88 -> end
          const segmentP = (p - 0.80) / 0.20;
          targetIdx = 88 + segmentP * (TOTAL_FRAMES - 1 - 88);
        }

        targetFrameRef.current = Math.min(TOTAL_FRAMES - 1, targetIdx);
      } else {
        // Hold on end image
        targetFrameRef.current = TOTAL_FRAMES - 1;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLoaded]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      drawBlendedFrame(currentFrameRef.current);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawBlendedFrame]);

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: "1000vh" }}
    >
      {/* Loading screen */}
      {!isLoaded && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f170c]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="font-display text-3xl sm:text-4xl font-bold text-white">
              <span className="amber-gradient-text italic">Padpu Farms</span>
            </div>
            <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full amber-gradient rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${loadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-amber-200/60 text-sm font-light tracking-wider">
              Loading experience... {loadProgress}%
            </p>
          </motion.div>
        </div>
      )}

      {/* Sticky viewport — stays pinned until all frames have scrolled through */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Canvas for frame animation */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-80"
          style={{ display: "block" }}
        />

        {/* Dark overlay for text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        {/* Vignette effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        {/* Landing Logo — Visible on load, auto-fades out after 3 seconds */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{
            opacity: logoVisible ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full flex justify-center">
            <img
              src="/logo.png"
              alt="Padpu Farms Logo"
              className="w-64 md:w-80 lg:w-96 object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)]"
            />
          </div>
        </div>

        {/* Intermediate Text 1 */}
        <div
          ref={text1Ref}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0, transform: "translateY(40px)" }}
        >
          <IntermediateText title="100% Raw & Unfiltered." subtitle="Straight from the deep forest to your table." />
        </div>

        {/* Intermediate Text 2 */}
        <div
          ref={text2Ref}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0, transform: "translateY(40px)" }}
        >
          <IntermediateText title="Ethically Harvested." subtitle="Respecting nature's delicate balance." />
        </div>

        {/* Intermediate Text 3 */}
        <div
          ref={text3Ref}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0, transform: "translateY(40px)" }}
        >
          <IntermediateText title="Rich in Antioxidants." subtitle="Nature's pure, liquid gold." />
        </div>

        {/* Hero text content — fades in on the end image */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0, transition: "opacity 0.15s ease-out, transform 0.15s ease-out" }}
        >
          <HeroOverlayContent />
        </div>

        {/* Scroll indicator */}
        <div ref={scrollIndicatorRef} style={{ transition: "opacity 0.2s ease-out" }}>
          <ScrollIndicator />
        </div>

        {/* Bottom gradient fade into next section */}
        {/* Bottom gradient fade — earthy dark tones matching the farm landscape */}
        <div
          className="absolute bottom-0 left-0 w-full z-20 pointer-events-none"
          style={{
            height: "180px",
            background:
              "linear-gradient(to top, rgba(15, 23, 12, 0.95) 0%, rgba(20, 30, 16, 0.6) 35%, rgba(30, 42, 22, 0.25) 65%, transparent 100%)",
          }}
        />
      </div>
    </section>
  );
}

/** The main text overlay — appears on the end image (aerial farm view) */
function HeroOverlayContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
      <div className="flex flex-col items-center text-center">
        {/* Main heading */}
        <h1
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.05] drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
        >
          Pure Honey
          <br />
          <span
            className="italic"
            style={{
              background:
                "linear-gradient(135deg, #fde68a 0%, #fbbf24 30%, #f59e0b 60%, #d97706 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            From Nature
          </span>
        </h1>

        {/* Subtitle — shortened */}
        <p
          className="text-base sm:text-lg md:text-xl text-white/85 mb-10 leading-relaxed max-w-xl font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
        >
          Every golden drop carries the soul of the forest to your table.
        </p>

        {/* CTA Button — only Shop Now */}
        <div
          className="flex flex-wrap gap-4 mb-10 justify-center pointer-events-auto"
        >
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-stone-900 font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.5)]"
            style={{
              background:
                "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
            }}
          >
            Shop Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Trust Badges */}
        <div
          className="flex items-center gap-6 text-sm text-white/70 pointer-events-auto"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              Lab Tested
            </span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/30" />
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <span className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              Free Shipping
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Animated scroll indicator */
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
    >
      <span className="text-white/50 text-xs tracking-[0.3em] uppercase font-light">
        Scroll to explore
      </span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-5 h-5 text-amber-400/70" />
      </motion.div>
    </motion.div>
  );
}

function IntermediateText({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full text-center">
      <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <span className="amber-gradient-text">{title.split(' ')[0]}</span>{" "}
        {title.split(' ').slice(1).join(' ')}
      </h2>
      <p className="text-xl sm:text-2xl text-white/90 font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
        {subtitle}
      </p>
    </div>
  );
}
