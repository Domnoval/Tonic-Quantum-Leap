import React from 'react';
import { ThemeColor } from '../types';
import SacredGeometry, { GeometricCorner, GeometricDivider } from './SacredGeometry';

interface FeaturedPiece {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  description: string;
  medium: string;
}

interface FeaturedCollectionProps {
  themeColor: ThemeColor;
  onBuyClick: (piece: FeaturedPiece) => void;
}

const FEATURED_PIECES: FeaturedPiece[] = [
  {
    id: 'feat-001',
    title: 'Neon Transcendence',
    price: 350,
    imageUrl: '/void/Neon Transendence.jpg',
    description: 'Light breaking through digital noise — a meditation on signal and void.',
    medium: 'AI-assisted digital painting',
  },
  {
    id: 'feat-002',
    title: 'Sacred Maze',
    price: 500,
    imageUrl: '/void/FRAMED painting maze copy.jpg',
    description: 'Hand-painted labyrinth exploring sacred geometry and infinite recursion.',
    medium: 'Acrylic on canvas, framed',
  },
  {
    id: 'feat-003',
    title: 'Graf Moon',
    price: 275,
    imageUrl: '/void/Graf Moon X.jpg',
    description: 'Urban lunar frequencies rendered in spray and pixel.',
    medium: 'Mixed media digital',
  },
  {
    id: 'feat-004',
    title: 'Floral Inversion',
    price: 225,
    imageUrl: '/void/inverted 3_s.jpg',
    description: 'Nature inverted — what blooms in the dark.',
    medium: 'Generative art print',
  },
  {
    id: 'feat-005',
    title: 'Sad Robot v2',
    price: 400,
    imageUrl: '/void/Sadrobotv2_s copy.jpg',
    description: 'Empathy circuits overloaded. A portrait of synthetic melancholy.',
    medium: 'Digital painting, giclée print',
  },
  {
    id: 'feat-006',
    title: 'Repent',
    price: 450,
    imageUrl: '/void/Repent 300 2 x.jpg',
    description: 'Raw expression distilled from noise into meaning.',
    medium: 'Acrylic and digital composite',
  },
];

const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ themeColor, onBuyClick }) => {
  return (
    <section className="relative w-full px-4 md:px-12 py-16 md:py-24 bg-[#0a0a0a]" aria-label="Featured Art Collection">
      {/* Background sacred geometry watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <SacredGeometry variant="flower-of-life" size={800} opacity={0.03} animated />
      </div>

      {/* Section Header */}
      <div className="relative z-10 text-center mb-12 md:mb-16">
        <h2
          className="mono text-xs tracking-[0.5em] uppercase mb-3"
          style={{ color: '#C9A84C' }}
        >
          Featured Collection
        </h2>
        <p className="serif text-3xl md:text-4xl text-white/90 font-light tracking-wide">
          Selected Works
        </p>
        <GeometricDivider className="max-w-xs mx-auto mt-6" />
      </div>

      {/* Art Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
        {FEATURED_PIECES.map((piece) => (
          <article
            key={piece.id}
            className="gallery-piece group relative glass-card rounded-sm transition-all duration-700"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px rgba(201, 168, 76, 0.1), inset 0 0 30px rgba(201, 168, 76, 0.02)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Geometric corner accents */}
            <GeometricCorner position="top-left" />
            <GeometricCorner position="top-right" />
            <GeometricCorner position="bottom-left" />
            <GeometricCorner position="bottom-right" />

            {/* Image */}
            <div className="aspect-square overflow-hidden bg-black relative">
              <img
                src={piece.imageUrl}
                alt={piece.title}
                loading="lazy"
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.04]"
              />
              {/* Hover sacred geometry reveal */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <SacredGeometry variant="seed-of-life" size={200} opacity={0.12} color="#C9A84C" animated={false} />
              </div>
            </div>

            {/* Info */}
            <div className="p-5 md:p-6">
              <h3 className="serif text-lg text-white/90 mb-1 tracking-wide">{piece.title}</h3>
              <p className="mono text-[10px] uppercase tracking-widest text-white/30 mb-3">
                {piece.medium}
              </p>
              <p className="text-sm text-white/50 leading-relaxed mb-5">
                {piece.description}
              </p>

              <div className="flex items-center justify-between">
                <span
                  className="mono text-lg font-light"
                  style={{ color: '#C9A84C' }}
                >
                  ${piece.price}
                </span>
                <button
                  onClick={() => onBuyClick(piece)}
                  aria-label={`Buy ${piece.title} for $${piece.price}`}
                  className="mono text-xs uppercase tracking-widest px-5 py-3 min-h-[44px] min-w-[44px] border border-[#C9A84C]/20 text-[#C9A84C]/70 rounded-sm transition-all duration-500 hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] hover:border-[#C9A84C]/50 focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/30 active:scale-95"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollection;
