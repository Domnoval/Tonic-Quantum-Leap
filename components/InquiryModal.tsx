import React, { useEffect } from 'react';

interface InquiryPiece {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

interface InquiryModalProps {
  piece: InquiryPiece | null;
  isOpen: boolean;
  onClose: () => void;
}

const InquiryModal: React.FC<InquiryModalProps> = ({ piece, isOpen, onClose }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !piece) return null;

  const subject = encodeURIComponent(`Inquiry: ${piece.title} ($${piece.price})`);
  const body = encodeURIComponent(`Hi Michael,\n\nI'm interested in purchasing "${piece.title}" ($${piece.price}).\n\nPlease let me know about availability and next steps.\n\nThank you!`);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-4 bg-[#0a0a0a] border border-[#C9A84C]/20 p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 0 80px rgba(201,168,76,0.08)' }}
      >
        {/* Image */}
        <div className="aspect-[16/10] overflow-hidden bg-black">
          <img
            src={piece.imageUrl}
            alt={piece.title}
            className="w-full h-full object-cover opacity-90"
          />
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="serif text-xl text-white/90 tracking-wide">{piece.title}</h3>
            <span className="mono text-lg" style={{ color: '#C9A84C' }}>${piece.price}</span>
          </div>

          <div className="w-full h-px mb-5" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />

          <p className="text-white/50 text-sm leading-relaxed mb-6">
            This is an original work by Michael of 137 Studio. Contact the artist directly to purchase.
          </p>

          <div className="flex flex-col gap-3">
            <a
              href={`mailto:tonicthoughtstudios@gmail.com?subject=${subject}&body=${body}`}
              className="flex items-center justify-center gap-2 w-full py-4 mono text-xs uppercase tracking-[0.3em] transition-all duration-500"
              style={{
                border: '1px solid #C9A84C',
                color: '#C9A84C',
                backgroundColor: 'rgba(201,168,76,0.08)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.18)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.08)'; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Contact for Purchase
            </a>

            <a
              href="https://instagram.com/domnoval_art"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 mono text-[11px] uppercase tracking-widest text-white/40 border border-white/10 transition-all duration-300 hover:text-white/70 hover:border-white/25"
            >
              Instagram @domnoval_art
            </a>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors p-2"
        >
          [ X ]
        </button>
      </div>
    </div>
  );
};

export default InquiryModal;
