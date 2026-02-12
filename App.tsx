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
import Forge from './components/Forge';
import FeaturedCollection from './components/FeaturedCollection';
import About from './components/About';
import SimplifiedNav from './components/SimplifiedNav';
import QuantumField from './components/QuantumField';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './contexts/AuthContext';
import { fetchShopifyArtifacts } from './services/shopifyService';
import { createCheckout } from './services/shopifyCheckout';
import { SACRED_GEOMETRY } from './constants';
import SacredGeometry from './components/SacredGeometry';
import CustomCursor from './components/CustomCursor';

const THEME_CONFIG = {
  sky: { hex: '#38bdf8', rgb: '56, 189, 248' },   // Tailwind sky-400
  violet: { hex: '#a78bfa', rgb: '167, 139, 250' }, // Tailwind violet-400
  amber: { hex: '#fbbf24', rgb: '251, 191, 36' },   // Tailwind amber-400
};

const VIEW_ROUTES = {
  [View.Origin]: '',
  [View.Featured]: 'featured',
  [View.Apothecary]: 'shop',
  [View.Void]: 'gallery',
  [View.Forge]: 'forge',
  [View.About]: 'about',
  [View.Index]: 'prints',
  [View.Transmission]: 'transmission',
  [View.Architect]: 'architect'
};

const ROUTE_VIEWS = Object.fromEntries(
  Object.entries(VIEW_ROUTES).map(([view, route]) => [route, view as View])
);

type TransitionState = 'IDLE' | 'COLLAPSING' | 'LEAPING';

const App: React.FC = () => {
  // Initialize based on URL hash
  const initializeFromHash = () => {
    const hash = window.location.hash.slice(1); // Remove #
    const view = ROUTE_VIEWS[hash] || View.Origin;
    return { 
      isCalibrated: hash !== '',  // Skip FrequencyGate if there's a hash
      currentView: view 
    };
  };

  const { isCalibrated: initialIsCalibrated, currentView: initialView } = initializeFromHash();
  
  const [isCalibrated, setIsCalibrated] = useState(initialIsCalibrated);
  const [currentView, setCurrentView] = useState<View>(initialView);
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

  // 1. Hash routing - handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1);
      const view = ROUTE_VIEWS[hash] || View.Origin;
      if (view !== currentView) {
        setCurrentView(view);
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  // 2. Lunar Sync & Inventory Load
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

  // 3. CSS Variable Injection for Dynamic Styles
  useEffect(() => {
    const config = THEME_CONFIG[themeColor];
    if (config) {
      document.documentElement.style.setProperty('--theme-rgb', config.rgb);
      document.documentElement.style.setProperty('--theme-hex', config.hex);
    }
  }, [themeColor]);

  // 4. Cart Persistence - Save to localStorage on changes
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

    // Update URL hash
    const route = VIEW_ROUTES[view];
    const newHash = route ? `#${route}` : '#';
    window.history.pushState(null, '', newHash);

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
      }, 250); // Speeded up transition
    }, 250); // Speeded up transition
  };

  const handleIndexSelection = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
    navigate(View.Apothecary);
  };

  const handleFeaturedPurchase = async (piece: any) => {
    // For now, create a simple checkout flow for featured pieces
    // This could be enhanced to map featured pieces to actual Shopify products
    const checkoutUrl = `https://${import.meta.env.VITE_SHOPIFY_DOMAIN || 'tonic-thought-studios-2.myshopify.com'}/cart?note=${encodeURIComponent(`Featured piece: ${piece.title} - $${piece.price}`)}&attributes[Featured+Piece]=${encodeURIComponent(piece.id)}`;
    window.open(checkoutUrl, '_blank');
  };

  if (!isCalibrated) {
    return (
      <AuthProvider>
        <FrequencyGate onEnter={() => setIsCalibrated(true)} themeColor={themeColor} />
      </AuthProvider>
    );
  }

  // Determine container classes based on transition state
  let containerClasses = "min-h-screen w-full relative transition-none perspective-container";
  if (transitionState === 'COLLAPSING') containerClasses += " quantum-exit-active";
  if (transitionState === 'LEAPING') containerClasses += " quantum-enter-active";

  return (
    <AuthProvider>
      <CustomCursor />
    <main id="main-content" className="relative min-h-screen bg-[#0a0a0a] overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}>
      {/* SimplifiedNav for cleaner UX — swap with HUD */}
      <SimplifiedNav currentView={currentView} setView={navigate} cartCount={cart.length} themeColor={themeColor} />
      {/* <HUD currentView={currentView} setView={navigate} themeColor={themeColor} /> */}
      <AuthModal />
      
      {/* 
         Quantum Transition Container 
         - The animation logic is handled via CSS classes applied to this wrapper 
      */}
      <div className={containerClasses}>
        {currentView === View.Origin && (
          <div className="flex flex-col items-center justify-center min-h-screen relative px-6 overflow-hidden">
            <QuantumField particleCount={60} connectionDistance={120} />
            
            {/* Sacred Geometry Background — Flower of Life */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
              <SacredGeometry variant="flower-of-life" size={1000} opacity={0.1} animated />
            </div>
            {/* Secondary geometry — slower counter-rotation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
              <div className="sacred-geo-rotate-reverse" style={{ opacity: 0.07 }}>
                <SacredGeometry variant="metatrons-cube" size={650} opacity={1} animated={false} />
              </div>
            </div>
            
            {/* Concentric pulse rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
              <div className="concentric-ring absolute" style={{ width: 400, height: 400, left: -200, top: -200 }} />
              <div className="concentric-ring absolute" style={{ width: 600, height: 600, left: -300, top: -300 }} />
              <div className="concentric-ring absolute" style={{ width: 800, height: 800, left: -400, top: -400 }} />
            </div>
            
            {/* Radial gold glow behind title */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 40%, transparent 70%)' }} />
            
            {/* Reflective water surface at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-48 reflection-surface pointer-events-none z-[1]" />
            
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

              <h1 className="serif text-[clamp(3rem,12vw,10rem)] leading-none uppercase font-black tracking-tighter text-white" style={{ textShadow: '0 0 60px rgba(201,168,76,0.15), 0 0 120px rgba(201,168,76,0.05)' }}>
                TONIC<br/><span className="italic" style={{ color: '#C9A84C', textShadow: '0 0 40px rgba(201,168,76,0.3)' }}>THOUGHT</span>
              </h1>
              
              <div className="w-32 h-px my-8" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />
              
              <p className="serif text-xl md:text-2xl italic text-white/50 max-w-xl text-center mb-12 tracking-wide">
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

              <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-md md:max-w-none md:w-auto">
                <button
                  onClick={() => navigate(View.Featured)}
                  className="mono text-[10px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.5em] px-8 md:px-12 py-4 md:py-5 transition-all duration-500 backdrop-blur active:scale-95 w-full md:w-auto"
                  style={{ border: '1px solid #C9A84C', color: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.08)', boxShadow: '0 0 20px rgba(201,168,76,0.1), inset 0 0 20px rgba(201,168,76,0.03)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.18)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(201,168,76,0.2), inset 0 0 30px rgba(201,168,76,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.08)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(201,168,76,0.1), inset 0 0 20px rgba(201,168,76,0.03)'; }}
                >
                  View Featured Art
                </button>
                <button
                  onClick={() => navigate(View.Void)}
                  className="mono text-[10px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.5em] border border-white/15 text-white/60 px-8 md:px-12 py-4 md:py-5 transition-all duration-500 bg-white/[0.02] backdrop-blur active:scale-95 w-full md:w-auto hover:border-white/30 hover:text-white/80 hover:bg-white/[0.05]"
                >
                  Explore Gallery
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
        {currentView === View.Featured && <FeaturedCollection themeColor={themeColor} onBuyClick={handleFeaturedPurchase} />}
        {currentView === View.Void && <Void themeColor={themeColor} />}
        {currentView === View.Forge && <Forge themeColor={themeColor} />}
        {currentView === View.About && <About themeColor={themeColor} />}
      </div>

      <Oracle cartCount={cart.length} themeColor={themeColor} />

      <footer className="hidden md:block fixed bottom-6 right-12 pointer-events-none z-10">
         <span className="mono text-[8px] uppercase tracking-widest opacity-20">SYSTEM_137 // BUILD_210724</span>
      </footer>
      
      <div className="film-grain" aria-hidden="true" />
    </main>
    </AuthProvider>
  );
};

export default App;