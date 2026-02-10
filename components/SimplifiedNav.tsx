import React, { useState } from 'react';
import { View, ThemeColor } from '../types';

interface SimplifiedNavProps {
  currentView: View;
  setView: (view: View) => void;
  cartCount: number;
  themeColor: ThemeColor;
}

const NAV_ITEMS: { view: View; label: string }[] = [
  { view: View.Origin, label: 'Home' },
  { view: View.Featured, label: 'Featured' },
  { view: View.Apothecary, label: 'Quantum Apothecary' },
  { view: View.Void, label: 'Gallery' },
  { view: View.Forge, label: 'Forge' },
  { view: View.About, label: 'About' },
];

const SimplifiedNav: React.FC<SimplifiedNavProps> = ({ currentView, setView, cartCount, themeColor }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: View) => {
    setView(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[200] bg-black/80 backdrop-blur-md border-b border-white/10" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => handleNavClick(View.Origin)}
          className="flex items-center gap-2 group"
          aria-label="Go to home page"
        >
          <span
            className="mono text-sm md:text-base font-bold tracking-[0.25em] transition-colors duration-500"
            style={{ color: 'rgba(var(--theme-rgb), 1)' }}
          >
            TONIC THOUGHT
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map(({ view, label }) => (
            <button
              key={view}
              onClick={() => handleNavClick(view)}
              aria-current={currentView === view ? 'page' : undefined}
              className={`mono text-[12px] uppercase tracking-[0.2em] transition-all duration-300 py-1 border-b-2 ${
                currentView === view
                  ? 'text-white border-current'
                  : 'text-white/40 border-transparent hover:text-white/70'
              }`}
              style={currentView === view ? { borderColor: 'rgba(var(--theme-rgb), 0.8)' } : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: Cart + Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <button
            onClick={() => handleNavClick(View.Apothecary)}
            className="relative p-2 text-white/50 hover:text-white/80 transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-white/30 rounded-sm"
            aria-label={`Cart with ${cartCount} items`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center mono text-[9px] font-bold text-black rounded-full min-w-[18px] h-[18px]"
                style={{ backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}
                style={{ backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
              />
              <span
                className={`block h-0.5 w-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}
                style={{ backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
              />
              <span
                className={`block h-0.5 w-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}
                style={{ backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-black/95 backdrop-blur-md border-b border-white/10 transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col py-2">
          {NAV_ITEMS.map(({ view, label }) => (
            <button
              key={view}
              onClick={() => handleNavClick(view)}
              aria-current={currentView === view ? 'page' : undefined}
              className={`w-full text-left py-3 px-6 mono text-sm uppercase tracking-widest transition-all duration-300 border-l-2 ${
                currentView === view
                  ? 'text-white bg-white/5'
                  : 'text-white/40 border-transparent hover:text-white/60 hover:bg-white/[0.02]'
              }`}
              style={{
                borderColor: currentView === view ? 'rgba(var(--theme-rgb), 1)' : 'transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SimplifiedNav;
