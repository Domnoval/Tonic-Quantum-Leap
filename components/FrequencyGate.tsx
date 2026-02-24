import React, { useState, useEffect, useRef } from 'react';
import { SACRED_GEOMETRY } from '../constants';
import { ThemeColor } from '../types';

interface FrequencyGateProps {
  onEnter: () => void;
  themeColor: ThemeColor;
}

const FrequencyGate: React.FC<FrequencyGateProps> = ({ onEnter, themeColor }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isEntering, setIsEntering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Normalize coordinates to -1 to 1 range
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleEnter = () => {
    setIsEntering(true);
    // Simulate frequency stabilization
    setTimeout(onEnter, 1500);
  };

  // Helper to generate 3D cube faces
  const getFaceTransforms = (translateZ: number) => [
    `translateZ(${translateZ}px)`,                    // Front
    `rotateY(180deg) translateZ(${translateZ}px)`,    // Back
    `rotateY(90deg) translateZ(${translateZ}px)`,     // Right
    `rotateY(-90deg) translateZ(${translateZ}px)`,    // Left
    `rotateX(90deg) translateZ(${translateZ}px)`,     // Top
    `rotateX(-90deg) translateZ(${translateZ}px)`     // Bottom
  ];

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center transition-all duration-1000 overflow-hidden ${isEntering ? 'opacity-0 scale-150 blur-3xl pointer-events-none' : 'opacity-100'}`}
      style={{ perspective: '1200px' }}
    >
      {/* Background Gradient Field (Purple/Orange Cusp Energy) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[800px] md:h-[800px] rounded-full blur-[120px] opacity-20 pointer-events-none transition-transform duration-1000 ease-out"
        style={{
             background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.4), rgba(245, 158, 11, 0.2))', // Violet to Amber
             transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0) rotate(${mousePos.x * 10}deg)`
        }}
      />

      {/* Parallax HUD Metadata */}
      <div 
        className="absolute top-12 left-12 mono text-[9px] uppercase tracking-[0.5em] opacity-30 flex flex-col gap-1 transition-transform duration-700 ease-out"
        style={{ transform: `translate3d(${mousePos.x * -15}px, ${mousePos.y * -15}px, 0)` }}
      >
        <span>System: Tonic_Nexus_v4.5</span>
        <span>Frequency: 137.036 OSC</span>
        <div className={`w-12 h-px bg-${themeColor}-400/50 mt-2`} />
      </div>
      
      <div 
        className="absolute top-12 right-12 mono text-[9px] uppercase tracking-[0.5em] opacity-30 text-right transition-transform duration-700 ease-out"
        style={{ transform: `translate3d(${mousePos.x * 15}px, ${mousePos.y * -15}px, 0)` }}
      >
        <span>Cusp: July 21st</span>
        <span>Calibration: Required</span>
      </div>

      <div className="absolute bottom-12 left-12 mono text-[9px] uppercase tracking-[0.5em] opacity-10">
        [ Neural Interface Bridge ]
      </div>

      {/* Central Interactive 3D Tesseract */}
      <div 
        className="relative flex items-center justify-center group/tesseract cursor-pointer" 
        style={{ transformStyle: 'preserve-3d' }}
        onClick={handleEnter}
      >
        
        {/* The Tesseract Assembly */}
        <div 
            className="relative w-64 h-64 md:w-80 md:h-80 transition-transform duration-100 ease-out"
            style={{ 
                transformStyle: 'preserve-3d',
                transform: `rotateX(${mousePos.y * -25}deg) rotateY(${mousePos.x * 25}deg)`
            }}
        >
            {/* Outer Cube (Larger) */}
            <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
                {getFaceTransforms(128).map((transform, i) => (
                    <div 
                        key={`outer-${i}`}
                        className={`
                            absolute inset-0 
                            border border-${themeColor}-400/20 
                            bg-${themeColor}-400/5 backdrop-blur-[1px]
                            transition-all duration-500
                            group-hover/tesseract:border-${themeColor}-400/50
                            group-hover/tesseract:bg-${themeColor}-400/10
                        `}
                        style={{ transform }}
                    />
                ))}
            </div>

            {/* Inner Cube (Smaller, Counter-Rotating) representing the 4th Dimension */}
            <div 
                className="absolute top-1/2 left-1/2 w-40 h-40 -ml-20 -mt-20 md:w-48 md:h-48 md:-ml-24 md:-mt-24" 
                style={{ 
                    transformStyle: 'preserve-3d',
                    // This rotation adds the complex "tesseract" motion relative to outer
                    animation: 'spin-slow 15s linear infinite reverse' 
                }}
            >
                 {getFaceTransforms(80).map((transform, i) => (
                    <div 
                        key={`inner-${i}`}
                        className={`
                            absolute inset-0 
                            border border-white/30 
                            bg-white/5
                            transition-all duration-500
                            group-hover/tesseract:border-white/60
                            group-hover/tesseract:scale-110
                        `}
                        style={{ transform }}
                    />
                ))}
            </div>

            {/* Center: Master Sigil */}
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 text-white pointer-events-none"
                style={{ 
                    transformStyle: 'preserve-3d',
                    // Independent rotation for the core
                    transform: `rotateX(${mousePos.y * 10}deg) translateZ(0px)`
                }}
            >
                <div className="w-full h-full animate-spin-slow group-hover/tesseract:animate-[spin_2s_linear_infinite]">
                     {SACRED_GEOMETRY.masterSigil}
                </div>
                 {/* Sigil Glow */}
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse-slow mix-blend-screen group-hover/tesseract:bg-${themeColor}-400/40" />
            </div>
        </div>
      </div>

      {/* CTA Button with subtle parallax */}
      <div 
        className="mt-24 relative group pointer-events-auto transition-transform duration-700 ease-out z-[300] flex flex-col items-center gap-6"
        style={{ transform: `translate3d(${mousePos.x * 15}px, ${mousePos.y * 15}px, 100px)` }}
      >
        {/* What this is */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="mono text-[10px] uppercase tracking-[0.4em] text-white/40">Digital Art Studio</span>
          <span className="mono text-[9px] uppercase tracking-[0.2em] text-white/25">Gallery • Prints • AI Forge</span>
        </div>
        
        <div className={`absolute -inset-12 bg-${themeColor}-400/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
        <button
          onClick={handleEnter}
          aria-label="Enter the 137 Studio Nexus"
          className="relative px-24 py-8 border border-white/20 mono text-[13px] uppercase tracking-[1.2em] hover-spectral hover:text-black transition-all duration-700 ease-in-out group overflow-hidden bg-black/40 backdrop-blur-md"
        >
          <span className="relative z-10 font-black">Enter Gallery</span>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          
          {/* Internal Button Glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 spectral-bg" />
        </button>
        
        {/* Skip for returning visitors */}
        <button
          onClick={handleEnter}
          className="mono text-[8px] uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
        >
          Skip Intro →
        </button>
      </div>

      {/* Ambient Grid Distortion Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5 z-[-1]">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300vw] h-px bg-white/20 transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${45 + mousePos.x * 5}deg) translateY(${mousePos.y * 50}px)` }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300vw] h-px bg-white/20 transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${-45 - mousePos.x * 5}deg) translateY(${-mousePos.y * 50}px)` }}
        />
      </div>
    </div>
  );
};

export default FrequencyGate;