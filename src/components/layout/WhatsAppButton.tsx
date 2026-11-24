import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

const BUTTON_SIZE = 48;
const SWIPE_THRESHOLD = 35;

export default function WhatsAppButton() {
  const [phone, setPhone] = useState('919876543210');
  const [side, setSide] = useState<'left' | 'right'>('right');
  const [ready, setReady] = useState(false);

  const x = useMotionValue(0);
  const sideRef = useRef<'left' | 'right'>('right');
  const isDraggingRef = useRef(false);
  const didSlideRef = useRef(false);
  const startClientXRef = useRef(0);
  const startXRef = useRef(0);

  const getBounds = useCallback(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 390;
    const edge = w >= 768 ? 24 : 16;
    const leftX = edge;
    const rightX = Math.max(edge, w - BUTTON_SIZE - edge);
    return { leftX, rightX };
  }, []);

  useEffect(() => {
    const { leftX, rightX } = getBounds();
    x.set(sideRef.current === 'right' ? rightX : leftX);
    setReady(true);

    const handleResize = () => {
      const bounds = getBounds();
      x.set(sideRef.current === 'right' ? bounds.rightX : bounds.leftX);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getBounds, x]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/settings');
        const data = await response.json();
        if (data.success && data.data && data.data.phone) {
          const digits = data.data.phone.replace(/\D/g, '');
          if (digits.length === 10) {
            setPhone(`91${digits}`);
          } else if (digits.length > 0) {
            setPhone(digits);
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings for WhatsApp:', error);
      }
    };
    fetchSettings();
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
    isDraggingRef.current = true;
    didSlideRef.current = false;
    startClientXRef.current = e.clientX;
    startXRef.current = x.get();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startClientXRef.current;

    if (Math.abs(dx) > 6) {
      didSlideRef.current = true;
    }

    if (didSlideRef.current) {
      const { leftX, rightX } = getBounds();
      const clampedX = Math.max(leftX, Math.min(rightX, startXRef.current + dx));
      x.set(clampedX);
    }
  };

  const snapToSide = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore if capture was already released
    }

    if (!didSlideRef.current) return;

    const { leftX, rightX } = getBounds();
    const dx = e.clientX - startClientXRef.current;
    const currentX = x.get();
    const midX = (leftX + rightX) / 2;

    let nextSide: 'left' | 'right' = sideRef.current;

    if (sideRef.current === 'right') {
      if (dx <= -SWIPE_THRESHOLD || currentX < midX) {
        nextSide = 'left';
      }
    } else {
      if (dx >= SWIPE_THRESHOLD || currentX > midX) {
        nextSide = 'right';
      }
    }

    sideRef.current = nextSide;
    setSide(nextSide);

    const targetX = nextSide === 'right' ? rightX : leftX;
    animate(x, targetX, {
      type: 'spring',
      stiffness: 420,
      damping: 30,
      mass: 0.8,
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (didSlideRef.current) {
      e.preventDefault();
      didSlideRef.current = false;
    }
  };

  if (!ready) return null;

  return (
    <motion.a
      href={`https://wa.me/${phone}?text=Hi%2C%20I%27m%20interested%20in%20your%20honey%20products!`}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={snapToSide}
      onPointerCancel={snapToSide}
      onClick={handleClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 320, damping: 24 }}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.94 }}
      style={{
        x,
        touchAction: 'none',
        background: 'linear-gradient(135deg, #25d366, #128c7e)',
      }}
      data-side={side}
      className="fixed bottom-20 md:bottom-6 left-0 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-md border border-white/15 cursor-grab active:cursor-grabbing select-none"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp (slide left or right to switch side)"
    >
      {/* WhatsApp SVG */}
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white pointer-events-none">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </motion.a>
  );
}
