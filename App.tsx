import React, { useState, useEffect } from 'react';
import { View, Artifact, CartItem, ThemeColor } from './types';
import HUD from './components/HUD';
import FrequencyGate from './components/FrequencyGate';
import TransmissionFeed from './components/TransmissionFeed';
import Apothecary from './components/Apothecary';
import Architect from './components/Architect';
import Oracle from './components/Oracle';
import ManualIndex from './components/ManualIndex';
import Void from './components/Void';
import QuantumField from './components/QuantumField';
import { fetchShopifyArtifacts } from './services/shopifyService';
import { SACRED_GEOMETRY } from './constants';

const THEME_CONFIG = {
  sky: { hex: '#38bdf8', rgb: '56, 189, 248' },   // Tailwind sky-400
  violet: { hex: '#a78bfa', rgb: '167, 139, 250' }, // Tailwind violet-400
  amber: { hex: '#fbbf24', rgb: '251, 191, 36' },   // Tailwind amber-400
};

type TransitionState = 'IDLE' | 'COLLAPSING' | 'LEAPING';

const App: React.FC = () => {
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.Origin);
  const [transitionState, setTransitionState] = useState<TransitionState>('IDLE');
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initial mount
    try {
      const saved = localStorage.getItem('tonic-thought-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  
  // Perspective Awareness State (Default: Aether/Sky)
  const [themeColor, setThemeColor] = useState<ThemeColor>('sky');
  const [lunarPhase, setLunarPhase] = useState<string>('');
  const [lunarProgress, setLunarProgress] = useState<number>(0);

  // 1. Lunar Sync & Inventory Load
  useEffect(() => {
    const loadInventory = async () => {
      const data = await fetchShopifyArtifacts();
      setArtifacts(data);
      setIsLoadingInventory(false);
    };
    loadInventory();

    const synchronizeLunarCycle = () => {
        const d = new Date();
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();
        
        // Standard Algorithm for Julian Day
        if (month < 3) {
            year--;
            month += 12;
        }
        
        month++;
        
        const c = 365.25 * year;
        const e = 30.6 * month;
        let jd = c + e + day - 694039.09; 
        jd /= 29.5305882; 
        let b = parseInt(jd.toString()); 
        jd -= b; // Fractional part of the cycle (0 to 1)
        
        setLunarProgress(jd * 100);

        b = Math.round(jd * 8); 
        
        if (b >= 8) b = 0;
        
        // Phase Logic: 0 = New Moon, 4 = Full Moon
        let autoTheme: ThemeColor = 'sky';
        let phaseName = 'Aether Transit';

        if (b === 0 || b === 1 || b === 7) {
            autoTheme = 'violet';
            phaseName = 'Void Cycle (New Moon)';
        } else if (b === 4) {
            autoTheme = 'amber';
            phaseName = 'Solar Peak (Full Moon)';
        } else {
            autoTheme = 'sky';
            phaseName = 'Aether Transit';
        }

        setThemeColor(autoTheme);
        setLunarPhase(phaseName);
    };

    synchronizeLunarCycle();
  }, []);

  // 2. CSS Variable Injection for Dynamic Styles
  useEffect(() => {
    const config = THEME_CONFIG[themeColor];
    if (config) {
      document.documentElement.style.setProperty('--theme-rgb', config.rgb);
      document.documentElement.style.setProperty('--theme-hex', config.hex);
    }
  }, [themeColor]);

  // 3. Cart Persistence - Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('tonic-thought-cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to persist cart:', e);
    }
  }, [cart]);

  const addToCart = (artifact: Artifact) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === artifact.id);
      if (existing) {
        return prev.map(item => item.id === artifact.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...artifact, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const navigate = (view: View) => {
    if (transitionState !== 'IDLE' || view === currentView) return;

    // Phase 1: Collapse the Quantum State (Decoherence)
    setTransitionState('COLLAPSING');

    setTimeout(() => {
      // Phase 2: Quantum Leap (Swap View & Rematerialize)
      setCurrentView(view);
      window.scrollTo(0, 0);
      setTransitionState('LEAPING');

      setTimeout(() => {
        // Phase 3: Stabilization
        setTransitionState('IDLE');
      }, 800); // Matches rematerialize animation duration
    }, 800); // Matches decohere animation duration
  };

  const handleIndexSelection = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
    navigate(View.Apothecary);
  };

  if (!isCalibrated) {
    return <FrequencyGate onEnter={() => setIsCalibrated(true)} themeColor={themeColor} />;
  }

  // Determine container classes based on transition state
  let containerClasses = "min-h-screen w-full relative transition-none perspective-container";
  if (transitionState === 'COLLAPSING') containerClasses += " quantum-exit-active";
  if (transitionState === 'LEAPING') containerClasses += " quantum-enter-active";

  return (
    <main id="main-content" className="relative min-h-screen bg-black overflow-hidden">
      <HUD currentView={currentView} setView={navigate} themeColor={themeColor} />
      
      {/* 
         Quantum Transition Container 
         - The animation logic is handled via CSS classes applied to this wrapper 
      */}
      <div className={containerClasses}>
        {currentView === View.Origin && (
          <div className="flex flex-col items-center justify-center min-h-screen relative px-6 overflow-hidden">
            <QuantumField particleCount={60} connectionDistance={120} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] bg-[#111] border border-white/5 opacity-40 z-0" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex flex-col items-center gap-6 mb-12 text-center">
                {/* Master Sigil Display */}
                <div className="w-16 h-16 opacity-80 animate-pulse" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                  {SACRED_GEOMETRY.masterSigil}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="mono text-[10px] uppercase tracking-[1.5em] font-bold transition-colors duration-500" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>Mainframe_Access</span>
                  <div className="w-full h-px transition-colors duration-500" style={{ backgroundColor: 'rgba(var(--theme-rgb), 0.3)' }} />
                  {isLoadingInventory && <span className="mono text-[8px] animate-pulse text-white/40 mt-2 uppercase tracking-widest">Scanning Shopify Nexus...</span>}
                </div>
              </div>

              <h1 className="serif text-6xl md:text-[10rem] leading-none uppercase font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                TONIC<br/><span className="italic opacity-50">THOUGHT</span>
              </h1>
              
              <p className="serif text-xl md:text-2xl mt-8 italic text-white/40 max-w-xl text-center mb-12">
                Distilling the infinite noise of the void into grounded packets of meaning.
              </p>

              {/* Automatic Lunar Sync Indicator (Replaces Manual Buttons) */}
              <div className="flex flex-col items-center gap-4 mb-16 w-full max-w-sm">
                 <div className="flex flex-col items-center gap-2">
                     <span className="mono text-[8px] uppercase tracking-[0.6em] opacity-30">Live Lunar Sync</span>
                     {lunarPhase && (
                         <span className="mono text-[9px] uppercase tracking-[0.2em] opacity-80 animate-pulse" style={{ color: 'rgba(var(--theme-rgb), 1)' }}>
                             [ {lunarPhase} ]
                         </span>
                     )}
                 </div>
                 
                 <div className="relative w-full h-[1px] bg-white/10 mt-2 flex items-center">
                    {/* Progress Bar */}
                    <div
                        className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out"
                        style={{ width: `${lunarProgress}%`, backgroundColor: 'rgba(var(--theme-rgb), 1)' }}
                    />
                    {/* Current Position Marker */}
                    <div
                        className="absolute w-3 h-3 rounded-full bg-black flex items-center justify-center transition-all duration-1000 ease-out"
                        style={{ left: `${lunarProgress}%`, transform: 'translateX(-50%)', border: '1px solid rgba(var(--theme-rgb), 1)', boxShadow: '0 0 10px rgba(var(--theme-rgb), 0.5)' }}
                    >
                         <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(var(--theme-rgb), 1)' }} />
                    </div>
                 </div>

                 <div className="flex justify-between w-full mono text-[8px] uppercase tracking-widest opacity-20">
                     <span>Void (0%)</span>
                     <span>Solar (50%)</span>
                     <span>Void (100%)</span>
                 </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <button
                  onClick={() => navigate(View.Index)}
                  className="origin-btn mono text-[11px] uppercase tracking-[0.5em] border border-white/10 px-12 py-5 transition-all duration-500 bg-black/40 backdrop-blur"
                >
                  Initiate Scan
                </button>
                <button
                  onClick={() => navigate(View.Architect)}
                  className="origin-btn mono text-[11px] uppercase tracking-[0.5em] border border-white/10 px-12 py-5 transition-all duration-500 bg-black/40 backdrop-blur"
                >
                  The Blueprint
                </button>
              </div>
            </div>

            <div className="absolute bottom-12 left-12 mono text-[9px] uppercase tracking-widest text-white/20 hidden md:block">
              [ Protocol: Ethereal_Essentialism ]<br/>
              [ Frequency: 137.036hz ]<br/>
              [ State: {isLoadingInventory ? 'Syncing...' : 'Active'} ]
            </div>
          </div>
        )}

        {currentView === View.Transmission && <TransmissionFeed themeColor={themeColor} />}
        {currentView === View.Index && <ManualIndex artifacts={artifacts} onSelect={handleIndexSelection} themeColor={themeColor} />}
        {currentView === View.Apothecary && (
          <Apothecary 
            artifacts={artifacts}
            cart={cart} 
            addToCart={addToCart} 
            removeFromCart={removeFromCart}
            initialArtifact={selectedArtifact}
            themeColor={themeColor}
          />
        )}
        {currentView === View.Architect && <Architect />}
        {currentView === View.Void && <Void themeColor={themeColor} />}
      </div>

      <Oracle cartCount={cart.length} themeColor={themeColor} />

      <footer className="fixed bottom-6 right-12 pointer-events-none z-50">
         <span className="mono text-[8px] uppercase tracking-widest opacity-20">SYSTEM_137 // BUILD_210724</span>
      </footer>
    </main>
  );
};

export default App;