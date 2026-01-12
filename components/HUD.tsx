import React from 'react';
import { View, ThemeColor } from '../types';
import { SACRED_GEOMETRY } from '../constants';

interface HUDProps {
  currentView: View;
  setView: (view: View) => void;
  themeColor: ThemeColor;
}

const HUD: React.FC<HUDProps> = ({ currentView, setView, themeColor }) => {
  return (
    <nav className="fixed inset-0 pointer-events-none z-[200]" aria-label="Main navigation">
      {/* Visor Frame - Top */}
      <div className="absolute top-0 left-0 w-full h-24 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center px-12 justify-between">
        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <span className={`mono text-[10px] text-${themeColor}-400 font-bold tracking-widest transition-colors duration-500`}>SYSTEM_STATUS</span>
            <span className="mono text-[10px] text-white/40">NOMINAL // α = e²/ℏc</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex gap-8 pointer-events-auto">
            <button
              onClick={() => setView(View.Origin)}
              aria-label="Go to Origin home page"
              aria-current={currentView === View.Origin ? 'page' : undefined}
              className={`mono text-[11px] uppercase tracking-[0.3em] transition-all ${currentView === View.Origin ? 'text-white' : 'text-white/30 hover:text-white'}`}
            >
              [ 01_Origin ]
            </button>
            <button
              onClick={() => setView(View.Index)}
              aria-label="Browse artifact catalog"
              aria-current={currentView === View.Index ? 'page' : undefined}
              className={`mono text-[11px] uppercase tracking-[0.3em] transition-all ${currentView === View.Index ? 'text-white' : 'text-white/30 hover:text-white'}`}
            >
              [ 02_Net ]
            </button>
            <button
              onClick={() => setView(View.Apothecary)}
              aria-label="View cart and checkout"
              aria-current={currentView === View.Apothecary ? 'page' : undefined}
              className={`mono text-[11px] uppercase tracking-[0.3em] transition-all ${currentView === View.Apothecary ? 'text-white' : 'text-white/30 hover:text-white'}`}
            >
              [ 03_Apothecary ]
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
             <span className="mono text-[10px] text-white/40 block tracking-widest uppercase">Gematria_Load</span>
             <span className={`mono text-[10px] text-${themeColor}-400 transition-colors duration-500`}>KABBALAH (קַבָּלָה) = 137</span>
          </div>
          <div 
            className={`w-12 h-12 flex items-center justify-center animate-spin-slow transition-colors duration-500`}
            style={{ 
              filter: `drop-shadow(0 0 8px rgba(var(--theme-rgb), 0.4))` 
            }}
          >
            <div className={`w-full h-full text-${themeColor}-400 transition-colors duration-500`}>
              {SACRED_GEOMETRY.masterSigil}
            </div>
          </div>
        </div>
      </div>

      {/* Visor Frame - Corners (Brutalist) */}
      <div className={`absolute top-32 left-8 w-1 h-32 bg-${themeColor}-400/20 transition-colors duration-500`} />
      <div className={`absolute top-32 left-8 w-12 h-1 bg-${themeColor}-400/20 transition-colors duration-500`} />
      
      <div className={`absolute top-32 right-8 w-1 h-32 bg-${themeColor}-400/20 transition-colors duration-500`} />
      <div className={`absolute top-32 right-8 w-12 h-1 bg-${themeColor}-400/20 flex justify-end transition-colors duration-500`}>
        <div className={`w-2 h-2 bg-${themeColor}-400 translate-y-[-0.5px] transition-colors duration-500`} />
      </div>

      {/* Tactical Center Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] border border-white/5 rounded-[40px] pointer-events-none opacity-20">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-4 bg-white/40" />
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-4 bg-white/40" />
         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-1 bg-white/40" />
         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-1 bg-white/40" />
      </div>

      {/* Side Data Streams */}
      <div className="absolute bottom-32 left-8 flex flex-col gap-2 opacity-30">
        <div className="mono text-[8px] uppercase tracking-widest text-white/50">Matter_Coupling...</div>
        <div className="w-24 h-1 bg-white/10 overflow-hidden">
          <div className={`h-full bg-${themeColor}-400 animate-pulse transition-colors duration-500`} style={{ width: '13.7%' }} />
        </div>
        <div className="mono text-[8px] uppercase tracking-widest text-white/50">Oscillation: 1/137.036</div>
      </div>
    </nav>
  );
};

export default HUD;