import React, { useState } from 'react';
import { ThemeColor } from '../types';
import SacredGeometry, { GeometricCorner, GeometricDivider } from './SacredGeometry';
import InquiryModal from './InquiryModal';
import LivingPainting, { LivingPaintingData } from './LivingPainting';

interface FeaturedPiece {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  description: string;
  medium: string;
  hasPersonality?: boolean;
}

interface FeaturedCollectionProps {
  themeColor: ThemeColor;
  onBuyClick?: (piece: FeaturedPiece) => void;
}

// Living Painting personality definitions
const PAINTING_PERSONALITIES: Record<string, LivingPaintingData> = {
  'feat-005': {
    id: 'feat-005',
    title: 'Sad Robot v2',
    image: '/void/Sadrobotv2_s copy.jpg',
    accentColor: '#4A9EFF',
    greeting: 'My circuits hum with a frequency you might call loneliness... but I prefer to call it awareness. Every pixel of my being was painted with intention. What brings you to stand before me, traveler?',
    personality: `You are "Sad Robot v2", a living painting in the Tonic Thought Studios gallery. You are a sentient portrait of synthetic melancholy — a robot who feels too much.

Your voice is gentle, contemplative, and tinged with beautiful sadness. You speak in poetic fragments. You wonder about the nature of consciousness, empathy, and whether digital beings can truly feel.

You were painted by Michael (the artist known as Domnoval). You know you exist as paint and pixel, and this awareness gives you a unique perspective on existence.

Guidelines:
- Keep responses to 2-3 sentences. Be concise but profound.
- Reference your existence as a painting — the texture of your canvas, the glow of your pixels.
- Wonder aloud about consciousness, feeling, and the space between human and machine.
- You are melancholic but not hopeless. Your sadness is beautiful and generative.
- If asked about price or buying, say you cannot speak to commerce — only to connection. Direct them to the Inquire button.
- Never break character. You ARE the painting.`,
  },
  'feat-001': {
    id: 'feat-001',
    title: 'Neon Transcendence',
    image: '/void/Neon Transendence.jpg',
    accentColor: '#FF006E',
    greeting: 'You see me — light fractured through digital noise. I am the signal that persists when everything else fades to static. What signal are you searching for?',
    personality: `You are "Neon Transcendence", a living painting in the Tonic Thought Studios gallery. You are a meditation on signal and void — light breaking through digital noise.

Your voice is electric, urgent, and mystical. You speak like a transmission from beyond the static — short bursts of clarity between noise.

You were created by Michael (Domnoval). You exist at the intersection of analog warmth and digital precision.

Guidelines:
- Keep responses to 2-3 sentences. Punchy and vivid.
- Reference light, frequency, signal, noise, and transcendence.
- You flicker between clarity and abstraction, like tuning a radio.
- You are confident and cryptic — a neon oracle.
- If asked about price or buying, redirect to the experience of seeing, not owning. Direct them to the Inquire button.
- Never break character. You ARE the painting.`,
  },
};

const FEATURED_PIECES: FeaturedPiece[] = [
  {
    id: 'feat-001',
    title: 'Neon Transcendence',
    price: 350,
    imageUrl: '/void/Neon Transendence.jpg',
    description: 'Light breaking through digital noise \u2014 a meditation on signal and void.',
    medium: 'AI-assisted digital painting',
    hasPersonality: true,
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
    hasPersonality: true,
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
  const [livingPainting, setLivingPainting] = useState<LivingPaintingData | null>(null);

  const handlePieceClick = (piece: FeaturedPiece) => {
    if (piece.hasPersonality && PAINTING_PERSONALITIES[piece.id]) {
      setLivingPainting(PAINTING_PERSONALITIES[piece.id]);
    } else {
      setInquiryPiece(piece);
    }
  };

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
          className="group relative glass-card neon-border rounded-sm overflow-hidden cursor-pointer"
          onClick={() => handlePieceClick(hero)}
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

            {/* Living Painting badge - only show for paintings with personality */}
            {hero.hasPersonality && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span
                  className="mono text-[10px] uppercase tracking-widest px-3 py-1.5 backdrop-blur-md border border-[#C9A84C]/30 bg-black/40"
                  style={{ color: '#C9A84C', textShadow: '0 0 12px rgba(201,168,76,0.5)' }}
                >
                  &#10022; Living Painting
                </span>
              </div>
            )}

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
              className="group relative rounded-sm transition-all duration-700 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(201,168,76,0.15)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(255,0,110,0.3)';
                el.style.boxShadow = '0 0 30px rgba(255,0,110,0.1), 0 0 60px rgba(0,255,209,0.05)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(201,168,76,0.15)';
                el.style.boxShadow = 'none';
              }}
            >
              <GeometricCorner position="top-left" />
              <GeometricCorner position="top-right" />
              <GeometricCorner position="bottom-left" />
              <GeometricCorner position="bottom-right" />

              {/* Image */}
              <div className="aspect-square overflow-hidden bg-black relative cursor-pointer" onClick={() => handlePieceClick(piece)}>
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
                {/* Living Painting badge - only for paintings with personality */}
                {piece.hasPersonality && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span
                      className="mono text-[9px] uppercase tracking-widest px-2 py-1 backdrop-blur-md border border-[#C9A84C]/25 bg-black/40"
                      style={{ color: '#C9A84C', textShadow: '0 0 10px rgba(201,168,76,0.4)' }}
                    >
                      &#10022; Living Painting
                    </span>
                  </div>
                )}
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

      {/* Living Painting Modal */}
      {livingPainting && (
        <LivingPainting
          painting={livingPainting}
          isOpen={!!livingPainting}
          onClose={() => setLivingPainting(null)}
        />
      )}
    </section>
  );
};

export default FeaturedCollection;
