import React, { useState, useEffect } from 'react';

type ForgeMode = 'style' | 'remix' | 'inpaint' | 'mashup';

interface VoidItemCardProps {
  id: string;
  content: string;
  size: 'small' | 'medium' | 'large';
  caption?: string;
  onView: () => void;
  onForge: (mode: ForgeMode) => void;
  onPrint?: () => void;
}

const FORGE_MODES: { mode: ForgeMode; icon: string; label: string; description: string }[] = [
  { mode: 'style', icon: '⚗️', label: 'STYLE', description: 'Style Alchemy' },
  { mode: 'remix', icon: '🌀', label: 'REMIX', description: 'Corruption' },
  { mode: 'inpaint', icon: '🔪', label: 'EDIT', description: 'The Surgeon' },
  { mode: 'mashup', icon: '⚡', label: 'FUSE', description: 'Fusion' },
];

const VoidItemCard: React.FC<VoidItemCardProps> = ({
  id,
  content,
  size,
  caption,
  onView,
  onForge,
  onPrint,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [hoveredMode, setHoveredMode] = useState<ForgeMode | null>(null);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile device
  useEffect(() => {
    setIsMobile('ontouchstart' in window);
  }, []);

  // Scanning animation
  useEffect(() => {
    const isActive = isTouched || isHovered;
    if (!isActive) {
      setScanPhase(0);
      return;
    }

    const timer1 = setTimeout(() => setScanPhase(1), 100);
    const timer2 = setTimeout(() => setScanPhase(2), 400);
    const timer3 = setTimeout(() => setScanPhase(3), 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isHovered, isTouched]);

  const getSizeClasses = () => {
    switch (size) {
      case 'large': return 'col-span-2 row-span-2';
      case 'medium': return 'col-span-1 row-span-2';
      default: return 'col-span-1 row-span-1';
    }
  };

  const handleForgeClick = (e: React.MouseEvent, mode: ForgeMode) => {
    e.stopPropagation();
    onForge(mode);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView();
  };

  const handlePrintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrint?.();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) {
      e.preventDefault();
      setIsTouched(true);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isMobile && !isTouched) {
      // First tap on mobile - show overlay
      e.preventDefault();
      setIsTouched(true);
    } else {
      // Desktop or second tap on mobile - view
      onView();
    }
  };

  const handleCloseOverlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTouched(false);
  };

  return (
    <div
      className={`
        ${getSizeClasses()}
        void-item-card group relative overflow-visible
        transition-all duration-500 ease-out
        cursor-pointer
        ${(isTouched || isHovered) ? 'z-40' : 'z-10'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onClick={handleCardClick}
    >
      {/* Main Card Container */}
      <div
        className={`
          relative w-full h-full overflow-hidden
          bg-black/50 backdrop-blur-sm
          border transition-all duration-500
          ${(isTouched || isHovered)
            ? 'border-[rgba(var(--theme-rgb),0.8)] shadow-[0_0_30px_rgba(var(--theme-rgb),0.4)]' 
            : 'border-white/10'
          }
        `}
        style={{
          transform: (isTouched || isHovered) ? 'scale(1.02) translateY(-4px)' : 'scale(1)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease',
        }}
      >
        {/* Image */}
        <img
          src={content}
          alt=""
          loading="lazy"
          className={`
            w-full h-full object-cover
            transition-all duration-700
            ${(isTouched || isHovered)
              ? 'opacity-100 grayscale-0 scale-110' 
              : 'opacity-70 grayscale scale-100'
            }
          `}
        />

        {/* ✨ FEATURE 1: Print Available Badge (visible on mobile, hidden on desktop hover) */}
        <div
          className={`
            absolute top-2 right-2 z-10
            flex items-center gap-1
            px-1.5 py-0.5
            bg-black/70 backdrop-blur-sm
            border border-amber-500/30
            transition-all duration-300
            cursor-pointer
            ${(isTouched || isHovered) && !isMobile ? 'opacity-0 scale-90' : 'opacity-80 hover:opacity-100'}
          `}
          onClick={handlePrintClick}
        >
          <span className="mono text-[10px] uppercase tracking-wider text-amber-400/80">
            $65+
          </span>
        </div>

        {/* Mobile close button */}
        {isMobile && isTouched && (
          <button
            className="absolute top-2 left-2 z-20 w-8 h-8 flex items-center justify-center bg-black/80 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300"
            onClick={handleCloseOverlay}
          >
            <span className="text-white/80 text-lg">×</span>
          </button>
        )}

        {/* Scan Line Effect */}
        {(isTouched || isHovered) && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ mixBlendMode: 'overlay' }}
          >
            <div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[rgba(var(--theme-rgb),0.8)] to-transparent"
              style={{
                top: `${(scanPhase * 33) % 100}%`,
                opacity: scanPhase > 0 ? 1 : 0,
                transition: 'top 0.3s ease-out, opacity 0.2s',
                boxShadow: '0 0 20px rgba(var(--theme-rgb), 0.6)',
              }}
            />
          </div>
        )}

        {/* Chromatic Aberration / Glitch Effect */}
        {(isTouched || isHovered) && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 mix-blend-screen opacity-30"
              style={{
                backgroundImage: `url(${content})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: 'translateX(2px)',
                filter: 'hue-rotate(90deg)',
              }}
            />
            <div
              className="absolute inset-0 mix-blend-screen opacity-20"
              style={{
                backgroundImage: `url(${content})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: 'translateX(-2px)',
                filter: 'hue-rotate(-90deg)',
              }}
            />
          </div>
        )}

        {/* Noise Overlay */}
        <div
          className={`
            absolute inset-0 pointer-events-none transition-opacity duration-300
            ${(isTouched || isHovered) ? 'opacity-40' : 'opacity-0'}
          `}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Gradient Overlay */}
        <div
          className={`
            absolute inset-0 pointer-events-none transition-opacity duration-500
            bg-gradient-to-t from-black via-black/20 to-transparent
            ${(isTouched || isHovered) ? 'opacity-90' : 'opacity-0'}
          `}
        />

        {/* Corner Brackets - Animated */}
        <div
          className={`
            absolute top-2 left-2 border-t-2 border-l-2 transition-all duration-500
            ${(isTouched || isHovered) ? 'w-6 h-6 opacity-100' : 'w-3 h-3 opacity-30'}
            ${isMobile && isTouched ? 'top-12' : ''}
          `}
          style={{ borderColor: (isTouched || isHovered) ? 'rgba(var(--theme-rgb), 1)' : 'rgba(255,255,255,0.3)' }}
        />
        <div
          className={`
            absolute top-2 right-2 border-t-2 border-r-2 transition-all duration-500
            ${(isTouched || isHovered) ? 'w-6 h-6 opacity-100' : 'w-3 h-3 opacity-30'}
          `}
          style={{ borderColor: (isTouched || isHovered) ? 'rgba(var(--theme-rgb), 1)' : 'rgba(255,255,255,0.3)' }}
        />
        <div
          className={`
            absolute bottom-2 left-2 border-b-2 border-l-2 transition-all duration-500
            ${(isTouched || isHovered) ? 'w-6 h-6 opacity-100' : 'w-3 h-3 opacity-30'}
          `}
          style={{ borderColor: (isTouched || isHovered) ? 'rgba(var(--theme-rgb), 1)' : 'rgba(255,255,255,0.3)' }}
        />
        <div
          className={`
            absolute bottom-2 right-2 border-b-2 border-r-2 transition-all duration-500
            ${(isTouched || isHovered) ? 'w-6 h-6 opacity-100' : 'w-3 h-3 opacity-30'}
          `}
          style={{ borderColor: (isTouched || isHovered) ? 'rgba(var(--theme-rgb), 1)' : 'rgba(255,255,255,0.3)' }}
        />

        {/* Scanning Status Text */}
        <div
          className={`
            absolute top-4 left-1/2 -translate-x-1/2
            mono text-[8px] uppercase tracking-[0.3em]
            transition-all duration-300
            ${(isTouched || isHovered) && scanPhase < 3 ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ color: 'rgba(var(--theme-rgb), 1)' }}
        >
          {scanPhase === 1 && 'SCANNING...'}
          {scanPhase === 2 && 'ANALYZING...'}
        </div>

        {/* FORGE PORTAL UI - Appears on Hover */}
        <div
          className={`
            absolute inset-x-0 bottom-0 p-3
            transition-all duration-500 ease-out
            ${(isTouched || isHovered) && scanPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {/* Two-button row: Forge + Materialize */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Main Forge Button */}
            <button
              onClick={(e) => handleForgeClick(e, 'remix')}
              className={`
                py-2
                bg-black/80 backdrop-blur-md
                border border-[rgba(var(--theme-rgb),0.6)]
                hover:border-[rgba(var(--theme-rgb),1)]
                hover:bg-[rgba(var(--theme-rgb),0.15)]
                transition-all duration-300
                group/forge
              `}
            >
              <span
                className="mono text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-1.5"
                style={{ color: 'rgba(var(--theme-rgb), 1)' }}
              >
                <span className="text-sm">⚡</span>
                FORGE
              </span>
            </button>

            {/* ✨ FEATURE 2: Get Print Button (hover action) */}
            <button
              onClick={handlePrintClick}
              onMouseEnter={() => setHoveredAction('print')}
              onMouseLeave={() => setHoveredAction(null)}
              className={`
                py-2
                bg-black/80 backdrop-blur-md
                border border-amber-500/40
                hover:border-amber-400
                hover:bg-amber-500/15
                transition-all duration-300
                group/print
              `}
            >
              <span
                className="mono text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-1.5 text-amber-400/90 group-hover/print:text-amber-300"
              >
                <span className="text-sm">🖼️</span>
                GET PRINT
              </span>
            </button>
          </div>

          {/* Quick Mode Grid */}
          <div className="grid grid-cols-4 gap-1">
            {FORGE_MODES.map(({ mode, icon, label, description }) => (
              <button
                key={mode}
                onClick={(e) => handleForgeClick(e, mode)}
                onMouseEnter={() => setHoveredMode(mode)}
                onMouseLeave={() => setHoveredMode(null)}
                className={`
                  relative py-1.5 px-1
                  bg-black/60 backdrop-blur-sm
                  border border-white/10
                  hover:border-[rgba(var(--theme-rgb),0.6)]
                  hover:bg-[rgba(var(--theme-rgb),0.1)]
                  transition-all duration-200
                  group/mode
                `}
                title={description}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs">{icon}</span>
                  <span className="mono text-[9px] uppercase tracking-wider text-white/60 group-hover/mode:text-white/90">
                    {label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Mode Description Tooltip */}
          {hoveredMode && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 border border-[rgba(var(--theme-rgb),0.4)] whitespace-nowrap"
            >
              <span className="mono text-[10px] uppercase tracking-wider" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                {FORGE_MODES.find(m => m.mode === hoveredMode)?.description}
              </span>
            </div>
          )}

          {/* Print Tooltip */}
          {hoveredAction === 'print' && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 border border-amber-500/40 whitespace-nowrap"
            >
              <span className="mono text-[10px] uppercase tracking-wider text-amber-400">
                Order poster or canvas — ships worldwide
              </span>
            </div>
          )}

          {/* View Button */}
          <button
            onClick={handleViewClick}
            className="w-full mt-1 py-1 hover:bg-white/5 transition-colors"
          >
            <span className="mono text-[8px] uppercase tracking-[0.2em] text-white/40 hover:text-white/70">
              [ VIEW FULL ]
            </span>
          </button>
        </div>

        {/* Caption (shows when not in portal mode) */}
        {caption && !(isTouched || isHovered) && (
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span
              className="mono text-[8px] uppercase tracking-widest drop-shadow-lg"
              style={{ color: 'rgba(var(--theme-rgb), 1)' }}
            >
              {caption}
            </span>
          </div>
        )}
      </div>

      {/* External Glow Ring */}
      {(isTouched || isHovered) && (
        <div
          className="absolute -inset-1 rounded-sm pointer-events-none animate-pulse"
          style={{
            background: `radial-gradient(ellipse at center, rgba(var(--theme-rgb), 0.15) 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Styles */}
      <style>{`
        .void-item-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(var(--theme-rgb), 0.1) 50%,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
          z-index: -1;
        }
        .void-item-card:hover::before {
          opacity: 1;
          animation: shimmer 2s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default VoidItemCard;
