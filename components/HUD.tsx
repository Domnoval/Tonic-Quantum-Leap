import React, { useState } from 'react';
import { View, ThemeColor } from '../types';
import { SACRED_GEOMETRY } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface HUDProps {
  currentView: View;
  setView: (view: View) => void;
  themeColor: ThemeColor;
}

const NAV_ITEMS = [
  { view: View.Origin, label: '01_Origin', subtitle: 'Home', ariaLabel: 'Go to Origin home page' },
  { view: View.Void, label: '02_Void', subtitle: 'Gallery', ariaLabel: 'Browse the art gallery' },
  { view: View.Forge, label: '03_Forge', subtitle: 'Create', ariaLabel: 'Enter the Forge remix studio' },
  { view: View.Index, label: '04_Shop', subtitle: 'Prints', ariaLabel: 'Browse prints for sale' },
  { view: View.Apothecary, label: '05_Cart', subtitle: 'Checkout', ariaLabel: 'View cart and checkout' },
];

const HUD: React.FC<HUDProps> = ({ currentView, setView, themeColor }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, setShowAuthModal } = useAuth();

  const handleNavClick = (view: View) => {
    setView(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed inset-0 pointer-events-none z-[200]" aria-label="Main navigation">
      {/* Visor Frame - Top */}
      <div className="absolute top-0 left-0 w-full h-16 md:h-24 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center px-4 md:px-12 justify-between">
        <div className="flex items-center gap-4 md:gap-12">
          {/* System Status - Hidden on mobile */}
          <div className="hidden md:flex flex-col">
            <span
              className="mono text-[10px] font-bold tracking-widest transition-colors duration-500"
              style={{ color: 'rgba(var(--theme-rgb), 1)' }}
            >
              SYSTEM_STATUS
            </span>
            <span className="mono text-[10px] text-white/40">NOMINAL // α = e²/ℏc</span>
          </div>
          <div className="hidden md:block h-8 w-px bg-white/10" />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden pointer-events-auto p-2 -ml-2"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}
                style={{ backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
              />
              <span
                className={`block h-0.5 w-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}
                style={{ backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
              />
              <span
                className={`block h-0.5 w-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}
                style={{ backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
              />
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 pointer-events-auto">
            {NAV_ITEMS.map(({ view, label, subtitle, ariaLabel }) => (
              <button
                key={view}
                onClick={() => handleNavClick(view)}
                aria-label={ariaLabel}
                aria-current={currentView === view ? 'page' : undefined}
                className={`group flex flex-col items-center transition-all ${
                  currentView === view ? 'text-white' : 'text-white/30 hover:text-white'
                }`}
              >
                <span className="mono text-[10px] uppercase tracking-[0.2em]">[ {label} ]</span>
                <span className={`mono text-[8px] uppercase tracking-widest transition-all ${
                  currentView === view 
                    ? 'opacity-60' 
                    : 'opacity-0 group-hover:opacity-40'
                }`} style={{ color: currentView === view ? 'rgba(var(--theme-rgb), 1)' : undefined }}>
                  {subtitle}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile Logo/Title */}
          <span
            className="md:hidden mono text-[10px] font-bold tracking-widest"
            style={{ color: 'rgba(var(--theme-rgb), 1)' }}
          >
            137_STUDIO
          </span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Auth Button */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="pointer-events-auto mono text-[9px] md:text-[10px] uppercase tracking-widest transition-all px-3 py-1.5 border border-white/10 hover:border-white/30"
            style={{ color: user ? 'rgba(var(--theme-rgb), 1)' : 'rgba(255,255,255,0.5)' }}
          >
            {user ? '[ Connected ]' : '[ Connect ]'}
          </button>

          {/* Gematria - Hidden on mobile */}
          <div className="hidden md:block text-right">
            <span className="mono text-[10px] text-white/40 block tracking-widest uppercase">Gematria_Load</span>
            <span
              className="mono text-[10px] transition-colors duration-500"
              style={{ color: 'rgba(var(--theme-rgb), 1)' }}
            >
              KABBALAH (קַבָּלָה) = 137
            </span>
          </div>
          <div
            className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center animate-spin-slow transition-colors duration-500"
            style={{
              filter: `drop-shadow(0 0 8px rgba(var(--theme-rgb), 0.4))`
            }}
          >
            <div
              className="w-full h-full transition-colors duration-500"
              style={{ color: 'rgba(var(--theme-rgb), 1)' }}
            >
              {SACRED_GEOMETRY.masterSigil}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden absolute top-16 left-0 w-full bg-black/95 backdrop-blur-md border-b border-white/10 transition-all duration-300 pointer-events-auto ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex flex-col p-4 gap-1">
          {NAV_ITEMS.map(({ view, label, subtitle, ariaLabel }) => (
            <button
              key={view}
              onClick={() => handleNavClick(view)}
              aria-label={ariaLabel}
              aria-current={currentView === view ? 'page' : undefined}
              className={`w-full text-left py-3 px-4 mono transition-all border-l-2 flex justify-between items-center ${
                currentView === view
                  ? 'text-white bg-white/5'
                  : 'text-white/50 border-transparent'
              }`}
              style={{
                borderColor: currentView === view ? 'rgba(var(--theme-rgb), 1)' : 'transparent',
              }}
            >
              <span className="text-sm uppercase tracking-widest">{label}</span>
              <span className="text-[10px] uppercase tracking-wider opacity-40">{subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visor Frame - Corners (Brutalist) - Hidden on mobile */}
      <div
        className="hidden md:block absolute top-32 left-8 w-1 h-32 transition-colors duration-500"
        style={{ backgroundColor: 'rgba(var(--theme-rgb), 0.2)' }}
      />
      <div
        className="hidden md:block absolute top-32 left-8 w-12 h-1 transition-colors duration-500"
        style={{ backgroundColor: 'rgba(var(--theme-rgb), 0.2)' }}
      />

      <div
        className="hidden md:block absolute top-32 right-8 w-1 h-32 transition-colors duration-500"
        style={{ backgroundColor: 'rgba(var(--theme-rgb), 0.2)' }}
      />
      <div
        className="hidden md:flex absolute top-32 right-8 w-12 h-1 justify-end transition-colors duration-500"
        style={{ backgroundColor: 'rgba(var(--theme-rgb), 0.2)' }}
      >
        <div
          className="w-2 h-2 translate-y-[-0.5px] transition-colors duration-500"
          style={{ backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
        />
      </div>

      {/* Tactical Center Reticle - Hidden on mobile */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] border border-white/5 rounded-[40px] pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-4 bg-white/40" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-4 bg-white/40" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-1 bg-white/40" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-1 bg-white/40" />
      </div>

      {/* Side Data Streams - Hidden on mobile */}
      <div className="hidden md:flex absolute bottom-32 left-8 flex-col gap-2 opacity-30">
        <div className="mono text-[8px] uppercase tracking-widest text-white/50">Matter_Coupling...</div>
        <div className="w-24 h-1 bg-white/10 overflow-hidden">
          <div
            className="h-full animate-pulse transition-colors duration-500"
            style={{ width: '13.7%', backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
          />
        </div>
        <div className="mono text-[8px] uppercase tracking-widest text-white/50">Oscillation: 1/137.036</div>
      </div>
    </nav>
  );
};

export default HUD;
