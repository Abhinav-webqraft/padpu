import { ReactNode, CSSProperties } from 'react';

interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  radius?: number | string;
  /** Use stronger SVG distortion filter */
  strong?: boolean;
  /** Custom overlay tint color */
  tint?: string;
}

/**
 * Apple 2025 Liquid Glass panel.
 * Implements the full 4-layer technique:
 *   1. glass-filter  — backdrop-blur + SVG displacement distortion
 *   2. glass-overlay — semi-transparent tinted background
 *   3. glass-specular — inset specular highlight (top-left bright edge)
 *   4. glass-content — content rendered above all layers
 */
export default function LiquidGlass({
  children,
  className = '',
  style = {},
  radius = 28,
  strong = false,
  tint,
}: LiquidGlassProps) {
  const r = typeof radius === 'number' ? `${radius}px` : radius;

  const overlayBg = tint || `linear-gradient(
    145deg,
    rgba(255,255,255,0.12) 0%,
    rgba(255,255,255,0.05) 40%,
    rgba(255,255,255,0.02) 100%
  )`;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        borderRadius: r,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
        background: 'transparent',
        ...style,
      }}
    >
      {/* Layer 1: Backdrop blur + SVG displacement filter */}
      <div
        className="glass-filter"
        style={{
          borderRadius: r,
          filter: `url(#${strong ? 'lg-dist-strong' : 'lg-dist'})`,
        }}
      />

      {/* Layer 2: Tinted overlay */}
      <div
        className="glass-overlay"
        style={{
          borderRadius: r,
          ...(tint ? { background: tint } : {}),
        }}
      />

      {/* Layer 3: Specular highlight border */}
      <div
        className="glass-specular"
        style={{ borderRadius: r }}
      />

      {/* Layer 4: Content */}
      <div className="glass-content" style={{ borderRadius: r }}>
        {children}
      </div>
    </div>
  );
}
