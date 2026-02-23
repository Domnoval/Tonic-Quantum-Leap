import React, { useState } from 'react';
import { ThemeColor } from '../types';
import SacredGeometry, { GeometricCorner, GeometricDivider } from './SacredGeometry';
import InquiryModal from './InquiryModal';

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
  onBuyClick?: (piece: FeaturedPiece) => void;
}

const FEATURED_PIECES: FeaturedPiece[] = [
  {
    id: 'feat-001',
    title: 'Neon Transcendence',
    price: 350,
    imageUrl: '/void/Neon Transendence.jpg',
    description: 'Light breaking through digital noise \u2014 a meditation on signal and void.',
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
    description: 'Nature inverted \u2014 what blooms in the dark.',
    medium: 'Generative art print',
  },
  {
    id: 'feat-005',
    title: 'Sad Robot v2',
    price: 400,
    imageUrl: '/void/Sadrobotv2_s copy.jpg',
    description: 'Empathy circuits overloaded. A portrait of synthetic melancholy.',
    medium: 'Digital painting, gicl\u00e9e print',
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

const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ themeColor }) => {
  const [inquiryPiece, setInquiryPiece] = useState<FeaturedPiece | null>(null);

  const hero = FEATURED_PIECES[0];
  const rest = FEATURED_PIECES.slice(1);

  return (
    <section className="relative w-full bg-[#0a0a0a]" aria-label="Featured Art Collection">
      {/* Background sacred geometry watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <SacredGeometry variant="flower-of-life" size={1000} opacity={0.05} animated />
      </div>

      {/* Section Header */}
      <div className="relative z-10 text-center pt-24 md:pt-32 pb-10 md:pb-14 px-4">
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

      {/* Hero Piece - Full Width Cinematic */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 mb-8 md:mb-12">
        <article
          className="group relative glass-card rounded-sm overflow-hidden cursor-pointer"
          onClick={() => setInquiryPiece(hero)}
        >
          <GeometricCorner position="top-left" />
          <GeometricCorner position="top-right" />
          <GeometricCorner position="bottom-left" />
          <GeometricCorner position="bottom-right" />

          <div className="relative aspect-[21/9] md:aspect-[21/9] overflow-hidden bg-black">
            <img
              src={hero.imageUrl}
              alt={hero.title}
              loading="eager"
              className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.03]"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Living Painting badge */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span
                className="mono text-[10px] uppercase tracking-widest px-3 py-1.5 backdrop-blur-md border border-[#C9A84C]/30 bg-black/40"
                style={{ color: '#C9A84C', textShadow: '0 0 12px rgba(201,168,76,0.5)' }}
              >
                &#10022; Living Painting
              </span>
            </div>

            {/* Hero info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <p className="mono text-[10px] uppercase tracking-widest text-white/30 mb-2">
                {hero.medium}
              </p>
              <h3 className="serif text-2xl md:text-4xl text-white/95 mb-2 tracking-wide">
                {hero.title}
              </h3>
              <p className="text-white/50 text-sm md:text-base max-w-xl mb-4 leading-relaxed">
                {hero.description}
              </p>
              <div className="flex items-center gap-6">
                <span className="mono text-xl" style={{ color: '#C9A84C' }}>
                  ${hero.price}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setInquiryPiece(hero); }}
                  className="mono text-xs uppercase tracking-widest border border-[#C9A84C]/30 text-[#C9A84C]/80 px-6 py-3 transition-all duration-500 hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] hover:border-[#C9A84C]/60"
                >
                  Inquire
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Bento Grid - Remaining Pieces */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 pb-16 md:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {rest.map((piece) => (
            <article
              key={piece.id}
              className="group relative glass-card rounded-sm transition-all duration-700 overflow-hidden"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(201,168,76,0.1), inset 0 0 30px rgba(201,168,76,0.02)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
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
                {/* Hover sacred geometry */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <SacredGeometry variant="seed-of-life" size={180} opacity={0.12} color="#C9A84C" animated={false} />
                </div>
                {/* Living Painting badge */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span
                    className="mono text-[9px] uppercase tracking-widest px-2 py-1 backdrop-blur-md border border-[#C9A84C]/25 bg-black/40"
                    style={{ color: '#C9A84C', textShadow: '0 0 10px rgba(201,168,76,0.4)' }}
                  >
                    &#10022; Living Painting
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 md:p-6">
                <h3 className="serif text-lg text-white/90 mb-1 tracking-wide">
                  {piece.title}
                </h3>
                <p className="mono text-[10px] uppercase tracking-widest text-white/30 mb-3">
                  {piece.medium}
                </p>
                <p className="text-white/50 text-sm leading-relaxed mb-5">
                  {piece.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="mono text-lg" style={{ color: '#C9A84C' }}>
                    ${piece.price}
                  </span>
                  <button
                    onClick={() => setInquiryPiece(piece)}
                    aria-label={`Inquire about ${piece.title}`}
                    className="mono text-xs uppercase tracking-widest border border-[#C9A84C]/20 text-[#C9A84C]/70 px-5 py-3 min-h-[44px] rounded-sm transition-all duration-500 hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] hover:border-[#C9A84C]/50 active:scale-95"
                  >
                    Inquire
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        piece={inquiryPiece}
        isOpen={!!inquiryPiece}
        onClose={() => setInquiryPiece(null)}
      />
    </section>
  );
};

export default FeaturedCollection;
