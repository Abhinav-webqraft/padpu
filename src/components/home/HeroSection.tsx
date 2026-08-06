import { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const ALL_FRAMES = Array.from({ length: 164 }, (_, i) => {
  const num = (i + 2).toString().padStart(3, '0');
  return '/hero_frames/' + num + '.jpg';
});
const TOTAL_FRAMES = ALL_FRAMES.length;

// 250vh track = 150vh actual scroll for 164 frames.
// Smooth with lerp. After animation done, only 150vh of back-scroll to clear the hero.
const SCROLL_TRACK_VH = 600;

const LERP = 0.05;

// Tracks if the user has already seen the animation without a hard refresh
let hasPlayedThisSession = false;

export default function HeroSection() {
  const trackRef    = useRef(null);
  const canvasRef   = useRef(null);
  const imagesRef   = useRef(new Array(TOTAL_FRAMES).fill(null));
  const loadingSet  = useRef(new Set());
  const loadedCount = useRef(0);
  // Capture if animation ALREADY played before this component mounted (e.g. they navigated away and came back)
  const [isReturningUser] = useState(hasPlayedThisSession);
  const animDone    = useRef(isReturningUser);

  const currentRef  = useRef(0);
  const targetRef   = useRef(0);
  const rafId       = useRef(0);
  const loopActive  = useRef(false);
  const lastScrollY = useRef(0);

  const [loadProgress, setLoadProgress] = useState(isReturningUser ? 100 : 0);
  const [isLoaded,     setIsLoaded]     = useState(isReturningUser);
  const [logoVisible,  setLogoVisible]  = useState(!isReturningUser);
  const [showOverlay,  setShowOverlay]  = useState(isReturningUser);
  const [showEndImage, setShowEndImage] = useState(isReturningUser);

  // ── Canvas helpers ──────────────────────────────────────────────────
  const syncCanvas = useCallback((canvas) => {
    const w = window.innerWidth, h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw; canvas.height = bh;
    }
    return { w, h, dpr };
  }, []);

  const cover = useCallback((img, w, h) => {
    const ir = img.naturalWidth / img.naturalHeight, cr = w / h;
    if (ir > cr) {
      const dh = h, dw = h * ir;
      return { dw, dh, ox: (w - dw) / 2, oy: 0 };
    }
    const dw = w, dh = w / ir;
    return { dw, dh, ox: 0, oy: (h - dh) / 2 };
  }, []);

  const nearest = useCallback((idx) => {
    const f = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(idx)));
    for (let d = 0; d < TOTAL_FRAMES; d++) {
      if (f - d >= 0 && imagesRef.current[f - d]) return f - d;
      if (f + d < TOTAL_FRAMES && imagesRef.current[f + d]) return f + d;
    }
    return -1;
  }, []);

  const drawFrame = useCallback((floatIdx) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { w, h, dpr } = syncCanvas(canvas);
    const floor = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(floatIdx)));
    const ceil  = Math.min(TOTAL_FRAMES - 1, floor + 1);
    const frac  = floatIdx - floor;
    let imgA = imagesRef.current[floor];
    let imgB = imagesRef.current[ceil];
    if (!imgA) {
      const ni = nearest(floor);
      if (ni < 0) return;
      imgA = imagesRef.current[ni]; imgB = null;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const dA = cover(imgA, w, h);
    ctx.globalAlpha = 1;
    ctx.drawImage(imgA, dA.ox, dA.oy, dA.dw, dA.dh);
    if (imgB && frac > 0.005 && ceil !== floor) {
      const dB = cover(imgB, w, h);
      ctx.globalAlpha = frac;
      ctx.drawImage(imgB, dB.ox, dB.oy, dB.dw, dB.dh);
      ctx.globalAlpha = 1;
    }
  }, [syncCanvas, cover, nearest]);

  // ── Lerp RAF loop ──────────────────────────────────────────────────
  const startLoop = useCallback(() => {
    if (loopActive.current) return;
    loopActive.current = true;
    const tick = () => {
      const target  = targetRef.current;
      const current = currentRef.current;
      const diff    = target - current;
      const next    = Math.abs(diff) < 0.04 ? target : current + diff * LERP;
      currentRef.current = next;
      drawFrame(next);
      if (!animDone.current && next >= TOTAL_FRAMES - 1 - 0.05) {
        animDone.current = true;
        hasPlayedThisSession = true; // Mark as played for this SPA session
        drawFrame(TOTAL_FRAMES - 1);
        // Short delay then cross-fade to the static end image
        setTimeout(() => {
          setShowEndImage(true);
          setShowOverlay(true);
        }, 200);
        loopActive.current = false;
        return;
      }
      if (Math.abs(diff) > 0.04) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        loopActive.current = false;
      }
    };
    rafId.current = requestAnimationFrame(tick);
  }, [drawFrame]);

  // ── Loader ────────────────────────────────────────────────────────
  const loadSingleFrame = useCallback((index) => {
    if (isReturningUser) return;
    if (index < 0 || index >= TOTAL_FRAMES) return;
    if (imagesRef.current[index] || loadingSet.current.has(index)) return;
    loadingSet.current.add(index);
    const img = new Image();
    img.decoding = 'async';
    img.src = ALL_FRAMES[index];
    img.onload = () => {
      imagesRef.current[index] = img;
      loadedCount.current += 1;
      setLoadProgress(Math.round((loadedCount.current / TOTAL_FRAMES) * 100));
      if (index === 0) { setIsLoaded(true); drawFrame(0); }
      loadingSet.current.delete(index);
    };
    img.onerror = () => loadingSet.current.delete(index);
  }, [drawFrame]);

  useEffect(() => {
    if (isReturningUser) return;
    const links = [];
    for (let i = 0; i < Math.min(20, TOTAL_FRAMES); i++) {
      const link = document.createElement('link');
      link.rel = 'preload'; link.as = 'image';
      link.href = ALL_FRAMES[i];
      document.head.appendChild(link);
      links.push(link);
    }
    for (let i = 0; i < TOTAL_FRAMES; i++) loadSingleFrame(i);
    return () => links.forEach((l) => { if (l.parentNode) l.parentNode.removeChild(l); });
  }, [loadSingleFrame]);

  useEffect(() => {
    if (!isLoaded) return;
    const t = setTimeout(() => setLogoVisible(false), 800);
    return () => clearTimeout(t);
  }, [isLoaded]);

  // ── Scroll handler ────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;

    const onScroll = () => {
      const track = trackRef.current;
      if (!track) return;

      const rect            = track.getBoundingClientRect();
      const scrolledInTrack = -rect.top;
      const trackScrollRange = track.offsetHeight - window.innerHeight;
      const isInsideTrack   = scrolledInTrack >= 0 && scrolledInTrack <= trackScrollRange;
      const scrollingUp     = window.scrollY < lastScrollY.current;
      lastScrollY.current   = window.scrollY;

      // When animation is done, the 600vh track becomes a "dead zone".
      // To make it behave like a 100vh section, we teleport the user across it.
      if (animDone.current) {
        if (scrolledInTrack > 0 && scrolledInTrack < trackScrollRange) {
          if (scrollingUp) {
            window.scrollTo({ top: track.offsetTop, behavior: 'instant' });
          } else {
            window.scrollTo({ top: track.offsetTop + trackScrollRange, behavior: 'instant' });
          }
        }
        return;
      }

      const progress = Math.max(0, Math.min(1, scrolledInTrack / trackScrollRange));
      targetRef.current = progress * (TOTAL_FRAMES - 1);
      startLoop();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [isLoaded, startLoop]);

  useEffect(() => {
    const onResize = () => {
      if (!isLoaded) return;
      drawFrame(animDone.current ? TOTAL_FRAMES - 1 : currentRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isLoaded, drawFrame]);

  return (
    <>
      {!isLoaded && (
        <div className='fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f170c]'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center gap-6'
          >
            <div className='font-display text-3xl sm:text-4xl font-bold text-white'>
              <span className='amber-gradient-text italic'>Padpu Farms</span>
            </div>
            <div className='w-64 h-1.5 bg-white/10 rounded-full overflow-hidden'>
              <motion.div
                className='h-full amber-gradient rounded-full'
                initial={{ width: 0 }}
                animate={{ width: loadProgress + '%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className='text-amber-200/60 text-sm font-light tracking-wider'>
              Loading experience... {loadProgress}%
            </p>
          </motion.div>
        </div>
      )}

      <div
        ref={trackRef}
        style={{ height: isReturningUser ? '100vh' : SCROLL_TRACK_VH + 'vh' }}
        className='relative'
      >
        <div
          className='sticky top-0 w-full overflow-hidden'
          style={{ height: '100vh' }}
        >
          {/* Mobile Logo - Top Center - Only visible on small screens */}
          <img 
            src='/mobile-logo.png' 
            alt='Padpu Farms Logo' 
            className='absolute top-6 left-1/2 -translate-x-1/2 z-50 w-28 md:hidden object-contain drop-shadow-md'
          />

          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 1,
            }}
          />

          {/* Static end image — cross-fades in after animation completes */}
          <div
            className='absolute inset-0 pointer-events-none'
            style={{
              opacity: showEndImage ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
              zIndex: 1,
            }}
          >
            <img
              src='/hero_end.jpg'
              alt=''
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          <div
            className='absolute inset-0 z-10 flex items-center justify-center pointer-events-none'
            style={{ opacity: logoVisible ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
          >
            <img
              src='/logo.png'
              alt='Padpu Farms Logo'
              className='w-64 md:w-80 lg:w-96 object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)]'
            />
          </div>

          <motion.div
            className='absolute inset-0 z-10 flex items-center justify-center pointer-events-none'
            animate={{ opacity: showOverlay ? 1 : 0, y: showOverlay ? 0 : 24 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <HeroOverlayContent />
          </motion.div>

          <div
            className='absolute bottom-0 left-0 w-full z-20 pointer-events-none'
            style={{
              height: '120px',
              background: 'linear-gradient(to top, rgba(15,23,12,0.9) 0%, transparent 100%)',
            }}
          />
        </div>
      </div>
    </>
  );
}

function HeroOverlayContent() {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 w-full pointer-events-auto'>
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
