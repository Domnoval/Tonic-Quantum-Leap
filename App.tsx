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
import FeaturedCollection from './components/FeaturedCollection';
import About from './components/About';
import SimplifiedNav from './components/SimplifiedNav';
import HeroCube from './components/HeroCube';
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

    // Phase 1: Portal zoom — everything rushes toward you
    setTransitionState('COLLAPSING');

    setTimeout(() => {
      // Phase 2: Flash & swap
      setCurrentView(view);
      window.scrollTo(0, 0);
      setTransitionState('LEAPING');

      setTimeout(() => {
        // Phase 3: New page materializes
        setTransitionState('IDLE');
      }, 500);
    }, 600);
  };

  const handleIndexSelection = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
    navigate(View.Apothecary);
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
      
      {/* Golden portal flash overlay */}
      <div
        className="fixed inset-0 z-[100] pointer-events-none transition-opacity"
        style={{
          background: 'radial-gradient(circle at center, rgba(232,197,71,0.9) 0%, rgba(201,168,76,0.6) 30%, rgba(0,0,0,0.8) 70%, transparent 100%)',
          opacity: transitionState === 'COLLAPSING' ? 1 : 0,
          transitionDuration: transitionState === 'COLLAPSING' ? '0.5s' : '0.3s',
          transitionDelay: transitionState === 'COLLAPSING' ? '0.2s' : '0s',
        }}
      />

      <div className={containerClasses}>
        {currentView === View.Origin && (
          <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
            {/* Video Background — The Vibe IS the Site */}
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/hero-poster.jpg"
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{ filter: 'brightness(0.85) contrast(1.05)' }}
            >
              <source src="/hero-bg-web.mp4" type="video/mp4" />
            </video>

            {/* Subtle dark gradient overlay for text readability */}
            <div className="absolute inset-0 z-[1]" style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.6) 100%)'
            }} />

            {/* Interactive golden tesseract — layered over video */}
            <div className="absolute inset-0 z-[2]">
              <HeroCube />
            </div>
            
            {/* Content overlay */}
            <div className="relative z-10 flex flex-col items-center justify-end min-h-screen pb-24 px-6">
              
              <p className="serif text-xl md:text-2xl italic text-white/70 max-w-xl text-center mb-12 tracking-wide" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                Distilling the infinite noise of the void into grounded packets of meaning.
              </p>

              <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-md md:max-w-none md:w-auto">
                <button
                  onClick={() => navigate(View.Featured)}
                  className="mono text-[10px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.5em] px-8 md:px-12 py-4 md:py-5 transition-all duration-500 backdrop-blur-md active:scale-95 w-full md:w-auto"
                  style={{ border: '1px solid #C9A84C', color: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.08)', boxShadow: '0 0 20px rgba(201,168,76,0.1), inset 0 0 20px rgba(201,168,76,0.03)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.18)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(201,168,76,0.2), inset 0 0 30px rgba(201,168,76,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.08)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(201,168,76,0.1), inset 0 0 20px rgba(201,168,76,0.03)'; }}
                >
                  View Featured Art
                </button>
                <button
                  onClick={() => navigate(View.Void)}
                  className="mono text-[10px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.5em] border border-white/20 text-white/70 px-8 md:px-12 py-4 md:py-5 transition-all duration-500 bg-black/20 backdrop-blur-md active:scale-95 w-full md:w-auto hover:border-white/40 hover:text-white/90 hover:bg-black/30"
                >
                  Explore Gallery
                </button>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 mono text-[9px] uppercase tracking-widest text-white/20 hidden md:block z-10" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
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
        {currentView === View.Featured && <FeaturedCollection themeColor={themeColor} />}
        {currentView === View.Void && <Void themeColor={themeColor} />}
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