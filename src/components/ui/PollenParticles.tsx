import React, { useMemo } from 'react';

export default function PollenParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}px`,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `${Math.random() * 5}s`,
      drift: `${Math.random() * 60 - 30}px`,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-amber-400 pollen-particle shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            bottom: '-20px',
            opacity: p.opacity,
            '--duration': p.duration,
            '--delay': p.delay,
            '--drift-x': p.drift,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
