import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { hasHeroPlayed, markHeroPlayed } from '../../utils/heroSession';

const TOTAL_FRAMES = 84;
const ALL_FRAMES = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const num = i.toString().padStart(6, '0');
  return `/hero_frames/frame_${num}.jpeg?q=100`;
});

const FINAL_FRAME_SRC = '/hero_frames/hf_20260805_115143_13cba17d-6486-4236-ae55-b873597462a5.jpg';

// 260vh = 160vh scroll travel -> one natural scroll completes the full flight smoothly
const SCROLL_TRACK_VH = 260;

// Smooth damped follow speed + max playback speed (frames/sec) so even one fast wheel flick plays every frame cleanly
const DAMPING = 10;
const MAX_FPS_SPEED = 54;

type FrameSource = ImageBitmap | HTMLImageElement;

function getSourceSize(src: FrameSource) {
  if ('naturalWidth' in src) {
    return { sw: src.naturalWidth, sh: src.naturalHeight };
  }
  return { sw: src.width, sh: src.height };
}

export default function HeroSection() {
  const [alreadyPlayed] = useState(() => hasHeroPlayed());

  const trackRef      = useRef<HTMLDivElement | null>(null);
  const canvasRef     = useRef<HTMLCanvasElement | null>(null);
  const ctxRef        = useRef<CanvasRenderingContext2D | null>(null);
  const framesRef     = useRef<(FrameSource | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const drawnIndexRef = useRef<number>(-1);

  const animDoneRef     = useRef(alreadyPlayed);
  const maxProgressRef  = useRef(alreadyPlayed ? 1 : 0);
  const currentRef      = useRef(alreadyPlayed ? TOTAL_FRAMES - 1 : 0);
  const targetRef       = useRef(alreadyPlayed ? TOTAL_FRAMES - 1 : 0);
  const rafIdRef        = useRef(0);
  const loopActiveRef   = useRef(false);
  const lastTimeRef     = useRef(0);
  const collapseDeltaRef = useRef(0);

  const [loadProgress, setLoadProgress] = useState(alreadyPlayed ? 100 : 0);
  const [isLoaded,     setIsLoaded]     = useState(alreadyPlayed);
  const [isLocked,     setIsLocked]     = useState(alreadyPlayed);
  const [logoVisible,  setLogoVisible]  = useState(!alreadyPlayed);
  const [showHint,     setShowHint]     = useState(!alreadyPlayed);
  const [showOverlay,  setShowOverlay]  = useState(alreadyPlayed);
  const [showEndImage, setShowEndImage] = useState(alreadyPlayed);

  // ── Full native Retina resolution GPU blit (zero downsampling blur) ──
  const syncCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
      drawnIndexRef.current = -1;
    }
    return { w, h, dpr };
  }, []);

  const drawDiscreteFrame = useCallback((frameIdx: number, force = false) => {
    const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIdx)));
    if (!force && idx === drawnIndexRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { alpha: false });
    }
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Pick exact frame (or nearest decoded frame if fallback kicked in)
    let src = framesRef.current[idx];
    if (!src) {
      for (let d = 1; d < TOTAL_FRAMES; d++) {
        if (idx - d >= 0 && framesRef.current[idx - d]) { src = framesRef.current[idx - d]; break; }
        if (idx + d < TOTAL_FRAMES && framesRef.current[idx + d]) { src = framesRef.current[idx + d]; break; }
      }
    }
    if (!src) return;

    const { w, h, dpr } = syncCanvas(canvas);
    const { sw, sh } = getSourceSize(src);
    const ir = sw / sh;
    const cr = w / h;
    let dw: number, dh: number, ox: number, oy: number;
    if (ir > cr) {
      dh = h;
      dw = h * ir;
      ox = (w - dw) / 2;
      oy = 0;
    } else {
      dw = w;
      dh = w / ir;
      ox = 0;
      oy = (h - dh) / 2;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, ox, oy, dw, dh);
    drawnIndexRef.current = idx;
  }, [syncCanvas]);

  // ── Seamless zero-jump track collapse after final frame locks ──────
  useLayoutEffect(() => {
    if (!isLocked || collapseDeltaRef.current <= 0) return;
    const delta = collapseDeltaRef.current;
    collapseDeltaRef.current = 0;
    const nextScrollY = Math.max(0, window.scrollY - delta);
    window.scrollTo({ top: nextScrollY, behavior: 'instant' as ScrollBehavior });
  }, [isLocked]);

  // ── Smooth velocity-capped RAF playback loop ───────────────────────
  const startLoop = useCallback(() => {
    if (loopActiveRef.current || animDoneRef.current) return;
    loopActiveRef.current = true;
    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (animDoneRef.current) {
        loopActiveRef.current = false;
        return;
      }

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTimeRef.current) / 1000));
      lastTimeRef.current = now;

      const target  = targetRef.current;
      const current = currentRef.current;
      const diff    = target - current;

      // Damped step capped at MAX_FPS_SPEED so fast scroll flicks play through every frame like silk
      const dampedStep = diff * (1 - Math.exp(-DAMPING * dt));
      const maxStep    = MAX_FPS_SPEED * dt;
      const step       = Math.abs(dampedStep) > maxStep ? Math.sign(dampedStep) * maxStep : dampedStep;
      const next       = Math.abs(diff) < 0.08 ? target : current + step;

      currentRef.current = next;
      drawDiscreteFrame(next);

      if (next >= TOTAL_FRAMES - 1 - 0.12) {
        animDoneRef.current = true;
        markHeroPlayed();
        currentRef.current = TOTAL_FRAMES - 1;
        drawDiscreteFrame(TOTAL_FRAMES - 1, true);
        setShowEndImage(true);
        setShowOverlay(true);
        loopActiveRef.current = false;

        // After static final image cross-fades cleanly over frame 83, collapse dead scroll track invisibly
        setTimeout(() => {
          const track = trackRef.current;
          if (track) {
            collapseDeltaRef.current = Math.max(0, track.offsetHeight - window.innerHeight);
          }
          setIsLocked(true);
        }, 550);
        return;
      }

      if (Math.abs(target - next) > 0.05) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        loopActiveRef.current = false;
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [drawDiscreteFrame]);

  // ── Preload ALL 84 frames at full native 1920x1080 resolution + final image ──
  useEffect(() => {
    if (alreadyPlayed) return;
    let cancelled = false;

    // Pre-decode final high-res frame too so the lock crossfade has 0ms delay
    const finalImg = new Image();
    finalImg.decoding = 'async';
    finalImg.src = FINAL_FRAME_SRC;
    finalImg.decode?.().catch(() => {});

    let completed = 0;
    let nextIdx = 0;
    const CONCURRENCY = 12;

    const loadOne = async (index: number) => {
      try {
        const res = await fetch(ALL_FRAMES[index]);
        if (!res.ok) throw new Error('Frame fetch failed');
        const blob = await res.blob();
        if (cancelled) return;

        let bitmap: FrameSource;
        if (typeof createImageBitmap === 'function') {
          // Full native 1920x1080 bitmap (no pre-downscaling so portrait & Retina screens stay razor-sharp)
          bitmap = await createImageBitmap(blob);
        } else {
          const img = new Image();
          img.src = URL.createObjectURL(blob);
          await img.decode?.().catch(() => {});
          bitmap = img;
        }

        if (cancelled) {
          if ('close' in bitmap) bitmap.close();
          return;
        }

        framesRef.current[index] = bitmap;
        if (index === 0) {
          drawDiscreteFrame(0, true);
        }
      } catch {
        // Ignore individual frame error; nearest-frame fallback covers it
      } finally {
        if (!cancelled) {
          completed += 1;
          setLoadProgress(Math.round((completed / TOTAL_FRAMES) * 100));
          if (completed >= TOTAL_FRAMES) {
            drawDiscreteFrame(0, true);
            setIsLoaded(true);
          }
        }
      }
    };

    const worker = async () => {
      while (!cancelled && nextIdx < TOTAL_FRAMES) {
        const idx = nextIdx++;
        await loadOne(idx);
      }
    };

    for (let w = 0; w < CONCURRENCY; w++) {
      worker();
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafIdRef.current);
      for (let i = 0; i < framesRef.current.length; i++) {
        const f = framesRef.current[i];
        if (f && 'close' in f) f.close();
        framesRef.current[i] = null;
      }
    };
  }, [alreadyPlayed, drawDiscreteFrame]);

  // Free GPU ImageBitmaps once locked permanently onto the static final image
  useEffect(() => {
    if (!isLocked) return;
    for (let i = 0; i < framesRef.current.length; i++) {
      const f = framesRef.current[i];
      if (f && 'close' in f) f.close();
      framesRef.current[i] = null;
    }
  }, [isLocked]);

  useEffect(() => {
    if (!isLoaded || alreadyPlayed) return;
    const t = setTimeout(() => setLogoVisible(false), 850);
    return () => clearTimeout(t);
  }, [isLoaded, alreadyPlayed]);

  // ── Forward-only scroll listener until completion lock ─────────────
  useEffect(() => {
    if (!isLoaded || isLocked) return;

    const onScroll = () => {
      if (animDoneRef.current) return;
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const scrolledInTrack = -rect.top;
      const trackScrollRange = Math.max(1, track.offsetHeight - window.innerHeight);

      const rawProgress = Math.max(0, Math.min(1, scrolledInTrack / trackScrollRange));
      if (rawProgress > 0.015) {
        setLogoVisible(false);
        setShowHint(false);
      }

      // Forward-only progression prevents micro reverse jitter and guarantees locking onto final frame
      if (rawProgress > maxProgressRef.current) {
        maxProgressRef.current = rawProgress;
        targetRef.current = maxProgressRef.current * (TOTAL_FRAMES - 1);
        startLoop();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [isLoaded, isLocked, startLoop]);

  useEffect(() => {
    const onResize = () => {
      if (!isLoaded || isLocked) return;
      drawDiscreteFrame(currentRef.current, true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isLoaded, isLocked, drawDiscreteFrame]);

  return (
    <>
      {!isLoaded && (
        <div className='fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b1109]'>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center gap-5'
          >
            <img
              src='/logo.png'
              alt='Padpu Farms'
              className='h-16 w-auto object-contain drop-shadow-lg'
            />
            <div className='w-60 h-1.5 bg-white/10 rounded-full overflow-hidden'>
              <motion.div
                className='h-full amber-gradient rounded-full'
                initial={{ width: 0 }}
                animate={{ width: `${loadProgress}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
            <p className='text-amber-200/70 text-xs font-medium tracking-widest uppercase font-sans'>
              Loading experience... {loadProgress}%
            </p>
          </motion.div>
        </div>
      )}

      <div
        ref={trackRef}
        style={{ height: isLocked ? '100vh' : `${SCROLL_TRACK_VH}vh` }}
        className='relative'
      >
        <div
          className='sticky top-0 w-full overflow-hidden bg-[#0b1109]'
          style={{ height: '100vh' }}
        >
          {/* Mobile Logo - Top Center - Only visible on small screens */}
          <img
            src='/image (5).png'
            alt='Padpu Farms Logo'
            className='absolute top-6 left-1/2 -translate-x-1/2 z-50 w-28 md:hidden object-contain drop-shadow-md'
          />

          {!isLocked && (
            <canvas
              ref={canvasRef}
              style={{
                display: 'block',
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
              }}
            />
          )}

          {/* Final locked homestead frame */}
          <div
            className='absolute inset-0 pointer-events-none'
            style={{
              opacity: showEndImage ? 1 : 0,
              transition: alreadyPlayed ? 'none' : 'opacity 0.5s ease-out',
              zIndex: 1,
            }}
          >
            <img
              src={FINAL_FRAME_SRC}
              alt='Padpu Farms Western Ghats Homestead'
              decoding='async'
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* Subtle vignette for text legibility */}
          <div
            className='absolute inset-0 pointer-events-none'
            style={{
              opacity: showOverlay ? 1 : 0.2,
              transition: 'opacity 0.6s ease-out',
              background: 'radial-gradient(circle at center, rgba(10,16,8,0.25) 0%, rgba(10,16,8,0.55) 100%)',
              zIndex: 2,
            }}
          />

          {/* Opening Center Logo */}
          {!alreadyPlayed && (
            <div
              className='absolute inset-0 z-10 flex items-center justify-center pointer-events-none'
              style={{ opacity: logoVisible ? 1 : 0, transition: 'opacity 0.7s ease-out' }}
            >
              <img
                src='/logo.png'
                alt='Padpu Farms Logo'
                className='w-56 md:w-72 lg:w-80 object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)]'
              />
            </div>
          )}

          {/* Destination Hero Content */}
          <motion.div
            className={`absolute inset-0 z-10 flex items-center justify-center ${showOverlay ? 'pointer-events-auto' : 'pointer-events-none'}`}
            initial={false}
            animate={{
              opacity: showOverlay ? 1 : 0,
              y: showOverlay ? 0 : 24,
            }}
            transition={{ duration: alreadyPlayed ? 0 : 0.55, ease: 'easeOut' }}
          >
            <HeroOverlayContent />
          </motion.div>

          {/* Scroll Cue */}
          {!isLocked && (
            <div
              className='absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 pointer-events-none transition-opacity duration-500'
              style={{ opacity: showHint && !showOverlay ? 0.85 : 0 }}
            >
              <span className='text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-200/90 drop-shadow'>
                Scroll to Explore
              </span>
              <ChevronDown className='w-4 h-4 text-amber-400 animate-bounce' />
            </div>
          )}

          {/* Bottom Forest Gradient Blend */}
          <div
            className='absolute bottom-0 left-0 w-full z-20 pointer-events-none'
            style={{
              height: '130px',
              background: 'linear-gradient(to top, rgba(15,23,12,0.95) 0%, transparent 100%)',
            }}
          />
        </div>
      </div>
    </>
  );
}

function HeroOverlayContent() {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 w-full'>
      <div className='flex flex-col items-center text-center'>
        <h1 className='font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.05] drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]'>
          Pure Honey
          <br />
          <span
            className='italic'
            style={{
              background: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 30%, #f59e0b 60%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            From Nature
          </span>
        </h1>
        <p className='text-base sm:text-lg md:text-xl text-white/85 mb-10 leading-relaxed max-w-xl font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]'>
          Every golden drop carries the soul of the forest to your table.
        </p>
        <div className='flex flex-wrap gap-4 mb-10 justify-center'>
          <Link
            to='/shop'
            className='inline-flex items-center justify-center gap-2 px-8 py-4 text-stone-900 font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.5)]'
            style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' }}
          >
            Shop Now <ArrowRight className='w-5 h-5' />
          </Link>
        </div>
        <div className='flex items-center gap-6 text-sm text-white/70'>
          <div className='flex items-center gap-2'>
            <ShieldCheck className='w-5 h-5 text-amber-400' />
            <span className='drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]'>Lab Tested</span>
          </div>
          <div className='w-1 h-1 rounded-full bg-white/30' />
          <div className='flex items-center gap-2'>
            <Truck className='w-5 h-5 text-amber-400' />
            <span className='drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]'>Free Shipping</span>
          </div>
        </div>
      </div>
    </div>
  );
}
