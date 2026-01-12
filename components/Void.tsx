import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ThemeColor } from '../types';

interface VoidProps {
  themeColor: ThemeColor;
}

interface VoidItem {
  id: string;
  type: 'image' | 'text' | 'video';
  content: string;
  size: 'small' | 'medium' | 'large';
  caption?: string;
}

// Placeholder content - replace with Instagram API or your social content
const generateVoidContent = (): VoidItem[] => {
  const placeholders = [
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505506874110-6a7a69069a08?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1484589065579-248aad0d628b?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=600&h=400&fit=crop',
  ];

  const captions = [
    '137 // SIGNAL RECEIVED',
    'VOID TRANSMISSION',
    'MERKABA ONLINE',
    'FREQUENCY LOCKED',
    'AETHER DRIFT',
    'QUANTUM ENTANGLED',
    'SOLAR PEAK',
    'DENSITY PACKET',
    'NEURAL BRIDGE',
    'SIGNAL // NOISE',
    'KABBALAH = 137',
    'INFINITE RECEIVER',
  ];

  const sizes: ('small' | 'medium' | 'large')[] = ['small', 'small', 'medium', 'medium', 'large'];

  return [...Array(50)].map((_, i) => ({
    id: `void-${i}`,
    type: 'image' as const,
    content: placeholders[i % placeholders.length],
    size: sizes[Math.floor(Math.random() * sizes.length)],
    caption: Math.random() > 0.5 ? captions[i % captions.length] : undefined,
  }));
};

const Void: React.FC<VoidProps> = ({ themeColor }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const autoScrollRef = useRef<number | null>(null);

  const items = useMemo(() => generateVoidContent(), []);

  // Duplicate items for seamless infinite scroll
  const infiniteItems = useMemo(() => [...items, ...items, ...items], [items]);

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling) return;

    const scroll = () => {
      setScrollY(prev => {
        const newY = prev + 0.5;
        // Reset when we've scrolled through one set
        if (newY > items.length * 300) {
          return 0;
        }
        return newY;
      });
      autoScrollRef.current = requestAnimationFrame(scroll);
    };

    autoScrollRef.current = requestAnimationFrame(scroll);

    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, [isAutoScrolling, items.length]);

  // Pause auto-scroll on user interaction
  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);
  const handleWheel = (e: React.WheelEvent) => {
    setIsAutoScrolling(false);
    setScrollY(prev => Math.max(0, prev + e.deltaY * 0.5));
    // Resume auto-scroll after 3 seconds of no interaction
    setTimeout(() => setIsAutoScrolling(true), 3000);
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'large': return 'col-span-2 row-span-2';
      case 'medium': return 'col-span-1 row-span-2';
      default: return 'col-span-1 row-span-1';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-black overflow-hidden pt-28 pb-12"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    >
      {/* Header */}
      <div className="fixed top-28 left-0 right-0 z-30 px-6 md:px-12 py-4 bg-gradient-to-b from-black via-black/80 to-transparent">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="serif text-3xl md:text-4xl text-white italic">The Void</h2>
            <p className={`mono text-[10px] uppercase tracking-[0.3em] text-${themeColor}-400 mt-2`}>
              Infinite Signal Stream // Social Transmissions
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full bg-${themeColor}-400 ${isAutoScrolling ? 'animate-pulse' : ''}`} />
            <span className="mono text-[9px] uppercase tracking-widest text-white/40">
              {isAutoScrolling ? 'AUTO_DRIFT' : 'MANUAL_CONTROL'}
            </span>
          </div>
        </div>
      </div>

      {/* Infinite Grid */}
      <div
        className="relative pt-24 px-4 md:px-8"
        style={{ transform: `translateY(-${scrollY}px)` }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[200px]">
          {infiniteItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={`
                ${getSizeClasses(item.size)}
                group relative overflow-hidden
                bg-white/5 backdrop-blur-sm
                border border-white/5
                hover:border-${themeColor}-400/50
                transition-all duration-500
                cursor-pointer
              `}
            >
              {/* Image */}
              <img
                src={item.content}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
              />

              {/* Glitch Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div
                  className="absolute inset-0 mix-blend-overlay"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
                  }}
                />
              </div>

              {/* Caption */}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                  <span className={`mono text-[8px] md:text-[9px] uppercase tracking-widest text-${themeColor}-400 drop-shadow-lg`}>
                    {item.caption}
                  </span>
                </div>
              )}

              {/* Corner Accents */}
              <div className={`absolute top-2 left-2 w-3 h-3 border-t border-l border-${themeColor}-400/0 group-hover:border-${themeColor}-400/60 transition-all duration-300`} />
              <div className={`absolute bottom-2 right-2 w-3 h-3 border-b border-r border-${themeColor}-400/0 group-hover:border-${themeColor}-400/60 transition-all duration-300`} />
            </div>
          ))}
        </div>
      </div>

      {/* Scanline Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-20 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,0,0,0.8)_100%)]" />

      {/* Social Links Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-6 md:px-12 py-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex justify-center gap-8">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`mono text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-${themeColor}-400 transition-colors`}
          >
            Instagram
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`mono text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-${themeColor}-400 transition-colors`}
          >
            Twitter
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`mono text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-${themeColor}-400 transition-colors`}
          >
            TikTok
          </a>
        </div>
      </div>
    </div>
  );
};

export default Void;
