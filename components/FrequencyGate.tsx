import React, { useState, useRef } from 'react';
import { ThemeColor } from '../types';

interface FrequencyGateProps {
  onEnter: () => void;
  themeColor: ThemeColor;
}

const FrequencyGate: React.FC<FrequencyGateProps> = ({ onEnter }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isEntering, setIsEntering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(onEnter, 1200);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={handleEnter}
      className={`fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-1000 ${isEntering ? 'opacity-0 scale-110 blur-lg pointer-events-none' : 'opacity-100'}`}
    >
      {/* 137 Chalkboard Background — full bleed */}
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{
          backgroundImage: 'url(/137-logo.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(1.05) translate3d(${mousePos.x * -8}px, ${mousePos.y * -8}px, 0)`,
          filter: 'brightness(0.6)',
        }}
      />

      {/* Vignette overlay */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.95) 100%)',
      }} />

      {/* Subtle gold glow behind center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 60%)',
        filter: 'blur(40px)',
      }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* 137 — the number itself, large and centered */}
        <div className="flex flex-col items-center gap-4">
          <h1
            className="text-[120px] md:text-[180px] font-thin tracking-[0.15em] leading-none"
            style={{
              color: 'rgba(201,168,76,0.9)',
              textShadow: '0 0 60px rgba(201,168,76,0.3), 0 0 120px rgba(201,168,76,0.1)',
              fontFamily: "'Playfair Display', serif",
            }}
          >
            137
          </h1>
          <div className="w-24 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />
          <span className="mono text-[9px] uppercase tracking-[0.6em] text-white/30">
            Studio
          </span>
        </div>

        {/* Tagline */}
        <p className="serif text-lg md:text-xl italic text-white/40 max-w-md text-center tracking-wide mt-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
          See the pattern. Feel the frequency. Open the door.
        </p>

        {/* Enter */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <button
            onClick={(e) => { e.stopPropagation(); handleEnter(); }}
            className="mono text-[10px] uppercase tracking-[0.5em] px-12 py-4 transition-all duration-500 backdrop-blur-md"
            style={{
              border: '1px solid rgba(201,168,76,0.3)',
              color: 'rgba(201,168,76,0.8)',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)';
              e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.1)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(201,168,76,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Enter
          </button>
          <span className="mono text-[8px] uppercase tracking-widest text-white/15">
            α = 1/137.036
          </span>
        </div>
      </div>

      {/* Corner metadata */}
      <div className="absolute bottom-6 left-6 mono text-[8px] uppercase tracking-widest text-white/10 hidden md:block">
        [ Fine Structure Constant ]<br />
        [ The Fingerprint of Light ]
      </div>
      <div className="absolute bottom-6 right-6 mono text-[8px] uppercase tracking-widest text-white/10 hidden md:block text-right">
        [ Sacred Geometry × Fine Art ]<br />
        [ Digital Craft ]
      </div>
    </div>
  );
};

export default FrequencyGate;
