/**
 * VoidCatalog - Catalog-driven gallery component
 * 
 * Uses catalog.json for metadata, thumbnails for fast loading.
 * Drop-in replacement for the original Void component.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ThemeColor } from '../types';
import catalogData from '../catalog.json';

interface VoidCatalogProps {
  themeColor: ThemeColor;
}

interface CatalogPiece {
  id: string;
  title: string;
  series: string;
  tags: string[];
  year: number;
  files: {
    original: string;
    thumbnail?: string;
    webOptimized?: string;
  };
  dimensions?: { width: number; height: number };
  description?: string;
  featured: boolean;
  forgeEnabled: boolean;
}

interface Catalog {
  pieces: CatalogPiece[];
  series: Record<string, { name: string; description?: string; color?: string }>;
  tags: Record<string, { name: string; category: string }>;
}

const VoidCatalog: React.FC<VoidCatalogProps> = ({ themeColor }) => {
  const catalog = catalogData as Catalog;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const autoScrollRef = useRef<number | null>(null);
  const [lightboxPiece, setLightboxPiece] = useState<CatalogPiece | null>(null);
  
  // Filters
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and shuffle pieces
  const displayPieces = useMemo(() => {
    let pieces = catalog.pieces.filter(p => !p.tags.includes('needs-review'));
    
    if (selectedSeries) {
      pieces = pieces.filter(p => p.series === selectedSeries);
    }
    if (selectedTag) {
      pieces = pieces.filter(p => p.tags.includes(selectedTag));
    }
    
    // Featured pieces first, then shuffle the rest
    const featured = pieces.filter(p => p.featured);
    const rest = pieces.filter(p => !p.featured);
    
    // Fisher-Yates shuffle
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    
    return [...featured, ...rest];
  }, [catalog.pieces, selectedSeries, selectedTag]);

  // Infinite scroll items
  const infiniteItems = useMemo(() => 
    [...displayPieces, ...displayPieces, ...displayPieces], 
    [displayPieces]
  );

  // Close lightbox on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxPiece(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling) return;

    const scroll = () => {
      setScrollY(prev => {
        const newY = prev + 0.5;
        if (newY > displayPieces.length * 300) return 0;
        return newY;
      });
      autoScrollRef.current = requestAnimationFrame(scroll);
    };

    autoScrollRef.current = requestAnimationFrame(scroll);
    return () => {
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
    };
  }, [isAutoScrolling, displayPieces.length]);

  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);
  const handleWheel = (e: React.WheelEvent) => {
    setIsAutoScrolling(false);
    setScrollY(prev => Math.max(0, prev + e.deltaY * 0.5));
    setTimeout(() => setIsAutoScrolling(true), 3000);
  };

  const openLightbox = (piece: CatalogPiece) => {
    setIsAutoScrolling(false);
    setLightboxPiece(piece);
  };

  const closeLightbox = () => {
    setLightboxPiece(null);
    setTimeout(() => setIsAutoScrolling(true), 500);
  };

  // Get image URL with fallback
  const getImageUrl = (piece: CatalogPiece, size: 'thumb' | 'optimized' | 'original') => {
    const base = '/void/';
    if (size === 'thumb' && piece.files.thumbnail) {
      return base + piece.files.thumbnail;
    }
    if (size === 'optimized' && piece.files.webOptimized) {
      return base + piece.files.webOptimized;
    }
    return base + piece.files.original;
  };

  // Get unique tags for filter
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    catalog.pieces.forEach(p => p.tags.forEach(t => {
      if (t !== 'needs-review') tags.add(t);
    }));
    return Array.from(tags).sort();
  }, [catalog.pieces]);

  // Determine grid size based on dimensions
  const getGridSize = (piece: CatalogPiece) => {
    if (piece.featured) return 'col-span-2 row-span-2';
    if (piece.dimensions) {
      const ratio = piece.dimensions.width / piece.dimensions.height;
      if (ratio > 1.5) return 'col-span-2 row-span-1';
      if (ratio < 0.7) return 'col-span-1 row-span-2';
    }
    return 'col-span-1 row-span-1';
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-black overflow-hidden pt-20 md:pt-28 pb-12"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    >
      {/* Header */}
      <div className="fixed top-16 md:top-24 left-0 right-0 z-30 px-4 md:px-12 py-3 md:py-4 bg-gradient-to-b from-black via-black/80 to-transparent">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="serif text-2xl md:text-4xl text-white italic">The Void</h2>
            <p
              className="mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1 md:mt-2"
              style={{ color: 'rgba(var(--theme-rgb), 1)' }}
            >
              {displayPieces.length} Transmissions
              {selectedSeries && ` · ${catalog.series[selectedSeries]?.name}`}
              {selectedTag && ` · #${selectedTag}`}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              [ {showFilters ? 'Hide' : 'Filter'} ]
            </button>
            
            <div className="hidden md:flex items-center gap-4">
              <div
                className={`w-2 h-2 rounded-full ${isAutoScrolling ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
              />
              <span className="mono text-[9px] uppercase tracking-widest text-white/40">
                {isAutoScrolling ? 'AUTO_DRIFT' : 'MANUAL_CONTROL'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border border-white/10 bg-black/80 backdrop-blur">
            <div className="flex flex-wrap gap-4">
              {/* Series Filter */}
              <div>
                <label className="block mono text-[9px] uppercase tracking-widest text-white/40 mb-2">
                  Series
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSeries(null)}
                    className={`mono text-[9px] uppercase px-2 py-1 border transition-colors ${
                      !selectedSeries ? 'border-white/40 text-white' : 'border-white/10 text-white/40'
                    }`}
                  >
                    All
                  </button>
                  {Object.entries(catalog.series).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedSeries(selectedSeries === key ? null : key)}
                      className={`mono text-[9px] uppercase px-2 py-1 border transition-colors ${
                        selectedSeries === key ? 'border-white/40 text-white' : 'border-white/10 text-white/40'
                      }`}
                      style={selectedSeries === key ? { borderColor: val.color } : undefined}
                    >
                      {val.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tag Filter */}
              <div>
                <label className="block mono text-[9px] uppercase tracking-widest text-white/40 mb-2">
                  Tags
                </label>
                <select
                  value={selectedTag || ''}
                  onChange={(e) => setSelectedTag(e.target.value || null)}
                  className="mono text-[10px] uppercase bg-black border border-white/20 px-3 py-1 text-white"
                >
                  <option value="">All Tags</option>
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div
        className="relative pt-16 md:pt-24 px-2 md:px-8"
        style={{ transform: `translateY(-${scrollY}px)` }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 auto-rows-[120px] md:auto-rows-[200px]">
          {infiniteItems.map((piece, index) => (
            <div
              key={`${piece.id}-${index}`}
              onClick={() => openLightbox(piece)}
              className={`
                ${getGridSize(piece)}
                group relative overflow-hidden
                bg-white/5 backdrop-blur-sm
                border border-white/5
                transition-all duration-500
                cursor-pointer
                hover:border-white/20
              `}
              style={{
                borderColor: piece.featured ? 'rgba(var(--theme-rgb), 0.3)' : undefined
              }}
            >
              <img
                src={getImageUrl(piece, 'thumb')}
                alt={piece.title}
                loading="lazy"
                className="w-full h-full object-cover opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes(piece.files.original)) {
                    target.src = `/void/${piece.files.original}`;
                  }
                }}
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              {/* Title & Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                <span className="block text-white text-xs font-medium truncate">
                  {piece.title}
                </span>
                <span
                  className="mono text-[8px] md:text-[9px] uppercase tracking-widest"
                  style={{ color: 'rgba(var(--theme-rgb), 1)' }}
                >
                  {piece.year} · {catalog.series[piece.series]?.name || piece.series}
                </span>
              </div>

              {/* Featured Badge */}
              {piece.featured && (
                <div 
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-20 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,0,0,0.8)_100%)]" />

      {/* Lightbox */}
      {lightboxPiece && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm cursor-zoom-out"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 md:top-6 md:right-6 mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors z-10 p-2"
          >
            [ CLOSE ]
          </button>

          <div
            className="relative max-w-[90vw] max-h-[85vh] animate-[lightbox-in_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(lightboxPiece, 'optimized')}
              alt={lightboxPiece.title}
              className="max-w-full max-h-[85vh] object-contain"
              style={{ boxShadow: '0 0 60px rgba(var(--theme-rgb), 0.3)' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes(lightboxPiece.files.original)) {
                  target.src = `/void/${lightboxPiece.files.original}`;
                }
              }}
            />

            {/* Info Panel */}
            <div className="absolute -bottom-16 left-0 right-0 text-center">
              <h3 className="text-white text-lg font-medium">{lightboxPiece.title}</h3>
              <p
                className="mono text-[10px] uppercase tracking-widest mt-1"
                style={{ color: 'rgba(var(--theme-rgb), 1)' }}
              >
                {lightboxPiece.year} · {catalog.series[lightboxPiece.series]?.name}
              </p>
              {lightboxPiece.description && (
                <p className="text-white/60 text-sm mt-2 max-w-md mx-auto">
                  {lightboxPiece.description}
                </p>
              )}
              <div className="flex justify-center gap-2 mt-2">
                {lightboxPiece.tags.slice(0, 5).map(tag => (
                  <span key={tag} className="mono text-[8px] uppercase px-2 py-1 border border-white/20 text-white/40">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Corner decorations */}
            <div
              className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2"
              style={{ borderColor: 'rgba(var(--theme-rgb), 0.6)' }}
            />
            <div
              className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2"
              style={{ borderColor: 'rgba(var(--theme-rgb), 0.6)' }}
            />
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes lightbox-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default VoidCatalog;
