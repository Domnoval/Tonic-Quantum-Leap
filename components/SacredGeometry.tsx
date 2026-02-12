import React from 'react';

interface SacredGeometryProps {
  variant?: 'flower-of-life' | 'metatrons-cube' | 'seed-of-life';
  size?: number;
  opacity?: number;
  className?: string;
  animated?: boolean;
  color?: string;
}

/**
 * Reusable Sacred Geometry SVG component.
 * Renders delicate gold wireframe patterns for use as background elements.
 */
const SacredGeometry: React.FC<SacredGeometryProps> = ({
  variant = 'flower-of-life',
  size = 400,
  opacity = 0.06,
  className = '',
  animated = true,
  color = '#C9A84C',
}) => {
  const strokeWidth = 0.5;

  // Generate Flower of Life circles
  const flowerOfLifeCircles = () => {
    const r = 50; // base radius
    const circles: { cx: number; cy: number }[] = [{ cx: 200, cy: 200 }];
    // First ring (6 circles)
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180;
      circles.push({ cx: 200 + r * Math.cos(angle), cy: 200 + r * Math.sin(angle) });
    }
    // Second ring (6 circles)
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180;
      circles.push({ cx: 200 + 2 * r * Math.cos(angle), cy: 200 + 2 * r * Math.sin(angle) });
    }
    // Intermediate ring (6 circles between second ring)
    for (let i = 0; i < 6; i++) {
      const angle = ((i * 60 + 30) * Math.PI) / 180;
      const dist = r * Math.sqrt(3);
      circles.push({ cx: 200 + dist * Math.cos(angle), cy: 200 + dist * Math.sin(angle) });
    }
    return circles;
  };

  // Generate Metatron's Cube
  const metatronsCube = () => {
    const r = 80;
    const innerR = 40;
    const points: { x: number; y: number }[] = [{ x: 200, y: 200 }];
    // Inner hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180 - Math.PI / 2;
      points.push({ x: 200 + innerR * Math.cos(angle), y: 200 + innerR * Math.sin(angle) });
    }
    // Outer hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180 - Math.PI / 2;
      points.push({ x: 200 + r * Math.cos(angle), y: 200 + r * Math.sin(angle) });
    }
    return points;
  };

  const seedOfLife = () => {
    const r = 50;
    const circles: { cx: number; cy: number }[] = [{ cx: 200, cy: 200 }];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180;
      circles.push({ cx: 200 + r * Math.cos(angle), cy: 200 + r * Math.sin(angle) });
    }
    return circles;
  };

  const animClass = animated ? 'sacred-geo-rotate' : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      className={`${animClass} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {variant === 'flower-of-life' && (
        <g>
          {/* Outer boundary circle */}
          <circle cx="200" cy="200" r="150" fill="none" stroke={color} strokeWidth={strokeWidth} />
          {flowerOfLifeCircles().map((c, i) => (
            <circle key={i} cx={c.cx} cy={c.cy} r="50" fill="none" stroke={color} strokeWidth={strokeWidth} />
          ))}
        </g>
      )}

      {variant === 'metatrons-cube' && (() => {
        const points = metatronsCube();
        const lines: JSX.Element[] = [];
        // Connect every point to every other point
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            lines.push(
              <line
                key={`${i}-${j}`}
                x1={points[i].x} y1={points[i].y}
                x2={points[j].x} y2={points[j].y}
                stroke={color} strokeWidth={strokeWidth * 0.7}
              />
            );
          }
        }
        return (
          <g>
            {lines}
            {points.map((p, i) => (
              <circle key={`p${i}`} cx={p.x} cy={p.y} r="3" fill="none" stroke={color} strokeWidth={strokeWidth} />
            ))}
            {/* Outer circle */}
            <circle cx="200" cy="200" r="90" fill="none" stroke={color} strokeWidth={strokeWidth} />
          </g>
        );
      })()}

      {variant === 'seed-of-life' && (
        <g>
          <circle cx="200" cy="200" r="90" fill="none" stroke={color} strokeWidth={strokeWidth} />
          {seedOfLife().map((c, i) => (
            <circle key={i} cx={c.cx} cy={c.cy} r="50" fill="none" stroke={color} strokeWidth={strokeWidth} />
          ))}
        </g>
      )}
    </svg>
  );
};

/** Corner accent — small geometric L-bracket with a tiny circle */
export const GeometricCorner: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color?: string;
  size?: number;
}> = ({ position, color = '#C9A84C', size = 24 }) => {
  const posClasses: Record<string, string> = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 -scale-x-100',
    'bottom-left': 'bottom-0 left-0 -scale-y-100',
    'bottom-right': 'bottom-0 right-0 -scale-x-100 -scale-y-100',
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`absolute ${posClasses[position]} pointer-events-none`}
      style={{ opacity: 0.4 }}
      aria-hidden="true"
    >
      <path d="M0 0 L12 0 L12 2 L2 2 L2 12 L0 12 Z" fill={color} />
      <circle cx="6" cy="6" r="1.5" fill="none" stroke={color} strokeWidth="0.5" />
    </svg>
  );
};

/** Geometric divider line with diamond center */
export const GeometricDivider: React.FC<{
  color?: string;
  className?: string;
}> = ({ color = '#C9A84C', className = '' }) => (
  <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}40)` }} />
    <svg width="12" height="12" viewBox="0 0 12 12" style={{ opacity: 0.5 }}>
      <rect x="6" y="0" width="6" height="6" transform="rotate(45 6 6)" fill="none" stroke={color} strokeWidth="0.8" />
    </svg>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}40)` }} />
  </div>
);

export default SacredGeometry;
