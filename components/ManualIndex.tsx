import React, { useState, useEffect, useMemo } from 'react';
import { Artifact, ThemeColor } from '../types';

interface ManualIndexProps {
  artifacts: Artifact[];
  onSelect: (a: Artifact) => void;
  themeColor: ThemeColor;
}

const ManualIndex: React.FC<ManualIndexProps> = ({ artifacts, onSelect, themeColor }) => {
  // mousePos targets normalized coordinates (-1 to 1)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  // offset is the interpolated current position
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Memoize particles to prevent random regeneration on every render frame
  const particles = useMemo(() => {
    return [...Array(24)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.3 + 0.1,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.5, // Parallax multiplier
    }));
  }, []);

  // Smooth parallax interpolation loop
  useEffect(() => {
    let animationFrame: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      setOffset(prev => ({
        x: lerp(prev.x, mousePos.x, 0.08), // Slightly tighter response (0.05 -> 0.08)
        y: lerp(prev.y, mousePos.y, 0.08)
      }));
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [mousePos]);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only calculate parallax on larger screens
    if (window.innerWidth < 768) return;
    
    const { innerWidth, innerHeight } = window;
    // Normalize to -1 to 1 range
    setMousePos({
      x: (e.clientX / innerWidth) * 2 - 1,
      y: (e.clientY / innerHeight) * 2 - 1
    });
  };

  if (artifacts.length === 0) {
      return (
          <div className="flex h-screen items-center justify-center bg-[#020202]">
             <div className="flex flex-col items-center gap-4">
                 <div className={`w-8 h-8 border-t-2 border-${themeColor}-400 rounded-full animate-spin`} />
                 <span className={`mono text-xs uppercase tracking-widest text-${themeColor}-400 animate-pulse`}>
                    Scanning Void...
                 </span>
             </div>
          </div>
      );
  }

  return (
    <div 
      className="relative min-h-screen w-full bg-[#020202] overflow-x-hidden flex flex-col pt-32 pb-12 px-6 md:px-12"
      onMouseMove={handleMouseMove}
    >
        {/* Layer 1: Deep Background (Moves opposite to mouse, slowly) */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-40 transition-transform duration-75 ease-linear will-change-transform z-0"
          style={{ transform: `translate3d(${offset.x * -15}px, ${offset.y * -15}px, 0)` }}
        >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />
        </div>

        {/* Layer 2: Mid-Ground Particles (Move varying speeds opposite to mouse) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {particles.map((p) => (
                <div 
                   key={p.id}
                   className="absolute rounded-full bg-white transition-transform duration-75 ease-linear will-change-transform"
                   style={{
                       top: p.top,
                       left: p.left,
                       width: `${p.size}px`,
                       height: `${p.size}px`,
                       opacity: p.opacity,
                       transform: `translate3d(${offset.x * -30 * p.speed}px, ${offset.y * -30 * p.speed}px, 0)`
                   }}
                />
            ))}
        </div>
        
        {/* Layer 3: Header Section (Static or very subtle movement) */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/10 pb-6">
            <div style={{ transform: `translate3d(${offset.x * -5}px, ${offset.y * -5}px, 0)` }} className="transition-transform duration-100">
                <h2 className="serif text-4xl md:text-5xl text-white italic">The Net</h2>
                <div className="flex items-center gap-3 mt-3">
                   <div className={`w-1.5 h-1.5 rounded-full bg-${themeColor}-400 animate-pulse`} />
                   <p className="mono text-[10px] uppercase tracking-[0.3em] opacity-50">
                       Captured Frequencies // Count: {artifacts.length}
                   </p>
                </div>
            </div>
            <div className="mono text-[9px] uppercase tracking-widest text-right hidden md:block opacity-40">
                [ Grid_View: Active ] <br/> [ Parallax: Nominal ]
            </div>
        </div>

        {/* Layer 4: The Grid (Moves slightly WITH mouse to simulate foreground/glass pane) */}
        <div 
            className="relative z-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 pb-24 transition-transform duration-75 ease-linear will-change-transform"
            style={{ 
                transform: `translate3d(${offset.x * 10}px, ${offset.y * 10}px, 0)` 
            }}
        >
            {artifacts.map((item) => (
                <div 
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`
                        group relative aspect-[3/4] cursor-pointer 
                        bg-black/20 backdrop-blur-sm
                        transition-all duration-700 ease-out
                        hover:z-30 hover:-translate-y-2
                    `}
                >
                    {/* Card Border & Glow Container */}
                    <div className={`
                        absolute inset-0 border border-white/5 
                        group-hover:border-${themeColor}-400/50
                        transition-colors duration-500
                        group-hover:shadow-[0_0_40px_rgba(var(--theme-rgb),0.15)]
                    `} />

                    {/* Image Container */}
                    <div className="w-full h-full overflow-hidden relative">
                        {/* Glitch Overlay on Hover */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-0 group-hover:opacity-10 mix-blend-overlay transition-opacity duration-300 z-10 pointer-events-none" />
                        
                        <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                        />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
                        {/* Top: Tech Spec Tags */}
                        <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-2 group-hover:translate-y-0">
                             <span className={`mono text-[8px] bg-black/60 backdrop-blur px-2 py-1 border border-${themeColor}-400/30 text-${themeColor}-400 uppercase tracking-widest`}>
                                {item.category.substring(0, 3)}
                             </span>
                        </div>

                        {/* Bottom: Title & Price */}
                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="bg-black/80 backdrop-blur-md p-4 border-t border-white/10 group-hover:border-${themeColor}-400/30 transition-colors">
                                <h3 className="serif text-xl italic text-white leading-none mb-2">{item.name}</h3>
                                <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2">
                                    <span className="mono text-[9px] uppercase tracking-widest text-white/40">
                                        V.{item.version}
                                    </span>
                                    <span className={`mono text-[9px] uppercase tracking-widest text-${themeColor}-400`}>
                                        {item.formattedPrice}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default ManualIndex;