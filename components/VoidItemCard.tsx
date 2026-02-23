import React, { useState, useEffect } from 'react';

interface VoidItemCardProps {
  id: string;
  content: string;
  size: 'small' | 'medium' | 'large';
  caption?: string;
  onView: () => void;
  onPrint?: () => void;
}

const VoidItemCard: React.FC<VoidItemCardProps> = ({
  id,
  content,
  size,
  caption,
  onView,
  onPrint,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile('ontouchstart' in window);
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case 'large': return 'col-span-2 row-span-2';
      case 'medium': return 'col-span-1 row-span-2';
      default: return 'col-span-1 row-span-1';
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView();
  };

  const handlePrintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrint?.();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isMobile && !isTouched) {
      e.preventDefault();
      setIsTouched(true);
    } else {
      onView();
    }
  };

  const active = isTouched || isHovered;

  return (
    <div
      className={`${getSizeClasses()} void-item-card group relative overflow-visible transition-all duration-500 ease-out cursor-pointer ${active ? 'z-40' : 'z-10'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div
        className={`relative w-full h-full overflow-hidden bg-black/50 backdrop-blur-sm border transition-all duration-500 ${active ? 'border-[rgba(var(--theme-rgb),0.8)] shadow-[0_0_30px_rgba(var(--theme-rgb),0.4)]' : 'border-white/10'}`}
        style={{
          transform: active ? 'scale(1.02) translateY(-4px)' : 'scale(1)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease',
        }}
      >
        <img
          src={content}
          alt=""
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-700 ${active ? 'opacity-100 grayscale-0 scale-110' : 'opacity-70 grayscale scale-100'}`}
        />

        {/* Corner Brackets */}
        <div className={`absolute top-2 left-2 border-t-2 border-l-2 transition-all duration-500 ${active ? 'w-6 h-6 opacity-100' : 'w-3 h-3 opacity-30'}`} style={{ borderColor: active ? 'rgba(var(--theme-rgb), 1)' : 'rgba(255,255,255,0.3)' }} />
        <div className={`absolute top-2 right-2 border-t-2 border-r-2 transition-all duration-500 ${active ? 'w-6 h-6 opacity-100' : 'w-3 h-3 opacity-30'}`} style={{ borderColor: active ? 'rgba(var(--theme-rgb), 1)' : 'rgba(255,255,255,0.3)' }} />
        <div className={`absolute bottom-2 left-2 border-b-2 border-l-2 transition-all duration-500 ${active ? 'w-6 h-6 opacity-100' : 'w-3 h-3 opacity-30'}`} style={{ borderColor: active ? 'rgba(var(--theme-rgb), 1)' : 'rgba(255,255,255,0.3)' }} />
        <div className={`absolute bottom-2 right-2 border-b-2 border-r-2 transition-all duration-500 ${active ? 'w-6 h-6 opacity-100' : 'w-3 h-3 opacity-30'}`} style={{ borderColor: active ? 'rgba(var(--theme-rgb), 1)' : 'rgba(255,255,255,0.3)' }} />

        {/* Gradient overlay */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 bg-gradient-to-t from-black via-black/20 to-transparent ${active ? 'opacity-90' : 'opacity-0'}`} />

        {/* Action buttons on hover */}
        <div className={`absolute inset-x-0 bottom-0 p-3 transition-all duration-500 ease-out ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex gap-2">
            <button
              onClick={handleViewClick}
              className="flex-1 py-2 bg-black/80 backdrop-blur-md border border-[rgba(var(--theme-rgb),0.6)] hover:border-[rgba(var(--theme-rgb),1)] hover:bg-[rgba(var(--theme-rgb),0.15)] transition-all duration-300"
            >
              <span className="mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>VIEW</span>
            </button>
            <button
              onClick={handlePrintClick}
              className="flex-1 py-2 bg-black/80 backdrop-blur-md border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/15 transition-all duration-300"
            >
              <span className="mono text-[10px] uppercase tracking-[0.15em] text-amber-400/90">PRINT $65+</span>
            </button>
          </div>
        </div>

        {/* Caption */}
        {caption && !active && (
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="mono text-[8px] uppercase tracking-widest drop-shadow-lg" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>{caption}</span>
          </div>
        )}

        {/* Mobile close */}
        {isMobile && isTouched && (
          <button
            className="absolute top-2 left-2 z-20 w-8 h-8 flex items-center justify-center bg-black/80 backdrop-blur-sm border border-white/20"
            onClick={(e) => { e.stopPropagation(); setIsTouched(false); }}
          >
            <span className="text-white/80 text-lg">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VoidItemCard;
