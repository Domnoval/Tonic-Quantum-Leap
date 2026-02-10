import React from 'react';
import { ThemeColor } from '../types';

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
    <section className="w-full px-4 md:px-12 py-16 md:py-24" aria-label="Featured Art Collection">
      {/* Section Header */}
      <div className="text-center mb-12 md:mb-16">
        <h2
          className="mono text-xs tracking-[0.4em] uppercase mb-3 transition-colors duration-500"
          style={{ color: 'rgba(var(--theme-rgb), 0.6)' }}
        >
          Featured Collection
        </h2>
        <p className="serif text-3xl md:text-4xl text-white/90 font-light">
          Selected Works
        </p>
        <div
          className="w-16 h-px mx-auto mt-6 transition-colors duration-500"
          style={{ backgroundColor: 'rgba(var(--theme-rgb), 0.4)' }}
        />
      </div>

      {/* Art Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
        {FEATURED_PIECES.map((piece) => (
          <article
            key={piece.id}
            className="group relative bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04]"
            style={{
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px rgba(var(--theme-rgb), 0.08)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Image */}
            <div className="aspect-square overflow-hidden bg-black">
              <img
                src={piece.imageUrl}
                alt={piece.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>

            {/* Info */}
            <div className="p-5 md:p-6">
              <h3 className="serif text-lg text-white/90 mb-1">{piece.title}</h3>
              <p className="mono text-[10px] uppercase tracking-widest text-white/30 mb-3">
                {piece.medium}
              </p>
              <p className="text-sm text-white/50 leading-relaxed mb-5">
                {piece.description}
              </p>

              <div className="flex items-center justify-between">
                <span
                  className="mono text-lg font-light transition-colors duration-500"
                  style={{ color: 'rgba(var(--theme-rgb), 0.9)' }}
                >
                  ${piece.price}
                </span>
                <button
                  onClick={() => onBuyClick(piece)}
                  aria-label={`Buy ${piece.title} for $${piece.price}`}
                  className="mono text-xs uppercase tracking-widest px-5 py-3 min-h-[44px] min-w-[44px] border border-white/20 text-white/70 rounded-sm transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 active:scale-95"
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
