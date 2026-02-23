import React, { useState, useEffect } from 'react';
import { Artifact, CartItem, ThemeColor } from '../types';
import { createCheckout } from '../services/shopifyCheckout';

interface ApothecaryProps {
  artifacts: Artifact[];
  cart: CartItem[];
  addToCart: (artifact: Artifact) => void;
  removeFromCart: (id: string) => void;
  initialArtifact?: Artifact | null;
  themeColor: ThemeColor;
}

const Apothecary: React.FC<ApothecaryProps> = ({ artifacts, cart, addToCart, removeFromCart, initialArtifact, themeColor }) => {
  const [selected, setSelected] = useState<Artifact | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [agreedToCovenant, setAgreedToCovenant] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (initialArtifact) setSelected(initialArtifact);
  }, [initialArtifact]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({
      x: (clientX / innerWidth - 0.5) * 40, // Increased parallax range
      y: (clientY / innerHeight - 0.5) * 40,
    });
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const getCategoryBackground = (category: string) => {
    // Smooth damping for parallax
    const parallaxStyle = {
      transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px, 0)`,
      transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
    };

    switch (category) {
      case 'GROUNDING':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#050505] transition-colors duration-1000">
            {/* Deep Space Texture: A slow rotating void structure */}
            <div 
              className="absolute -inset-[50%] opacity-30"
              style={{
                 background: 'radial-gradient(circle at center, #1a1a1a 0%, transparent 60%)',
                 transform: `translate3d(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px, 0) rotate(${mousePos.x * 0.1}deg)`,
                 transition: 'transform 1s ease-out'
              }}
            />
            {/* Ambient Nebula Fog */}
            <div 
              className="absolute inset-0 opacity-20 mix-blend-screen"
              style={{
                backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
                filter: 'contrast(150%) brightness(50%)',
              }}
            />
            <div 
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.1)_0%,transparent_50%)] animate-[spin_120s_linear_infinite]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-90" />
          </div>
        );
      case 'VISION':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#020202]">
             {/* Ethereal Spectral Glow: Using the spectral-bg animation blurred heavily */}
            <div 
              className="absolute -inset-[20%] spectral-bg opacity-25 blur-[120px] animate-[pulse_8s_ease-in-out_infinite] mix-blend-screen" 
              style={parallaxStyle}
            />
             <div 
              className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_60%)] mix-blend-overlay"
            />
            {/* Light Leaks */}
            <div 
               className={`absolute top-0 right-0 w-[50vw] h-[50vw] blur-3xl mix-blend-screen animate-drift`}
               style={{ background: 'radial-gradient(circle at center, rgba(var(--theme-rgb), 0.1) 0%, transparent 70%)' }}
            />
          </div>
        );
      case 'ONENESS':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black">
             {/* Singularity: A central, pure light source */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[100px] animate-[pulse_6s_ease-in-out_infinite]" 
              style={parallaxStyle}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]" />
            {/* Light Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full opacity-30 animate-[spin_30s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full opacity-20 animate-[spin_20s_linear_infinite_reverse]" />
          </div>
        );
      case 'PROTOCOL':
      default:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#080808]">
             {/* Iridescent Digital Grid */}
            <div 
              className="absolute inset-[-50%] opacity-[0.05]" 
              style={{ 
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', 
                backgroundSize: '50px 50px',
                transform: `rotateX(60deg) rotateZ(20deg) translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`
              }} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] border border-white/5 rounded-full animate-[spin_60s_linear_infinite] opacity-10 border-dashed" />
             {/* Subtle Spectral interference */}
             <div className="absolute top-0 left-0 w-full h-1 spectral-bg opacity-30 blur-md" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-64 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col items-center mb-24 text-center">
        <h2 className="serif text-4xl md:text-6xl italic mb-6">Asset Repository</h2>
        <div className="flex gap-4 items-center opacity-40">
           <span className="mono text-[10px] uppercase tracking-[0.4em]">Distilling 5D intent into 3D utility</span>
           <button 
             onClick={() => setIsCartOpen(true)}
             className="mono text-[10px] border border-white/20 px-3 py-1 hover-spectral transition-all"
           >
             Circuit: ({cart.length})
           </button>
        </div>
      </div>

      {artifacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-48 text-center">
            <div className="w-16 h-16 mb-6 opacity-20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-white">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="serif text-2xl text-white/60 mb-3 italic">Coming Soon</h3>
            <p className="mono text-[11px] uppercase tracking-widest text-white/30 max-w-sm">New pieces arriving. Check back soon or visit our Featured collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-24">
          {artifacts.map((artifact) => {
            const isVision = artifact.category === 'VISION';
            
            return (
              <div 
                key={artifact.id}
                onClick={() => setSelected(artifact)}
                className="group cursor-pointer flex flex-col gap-6"
              >
                <div 
                  className={`aspect-[4/5] relative overflow-hidden bg-white/5 transition-all duration-700
                      ${isVision ? '' : 'border border-white/5'}
                  `}
                  style={!isVision ? { boxShadow: '0 0 0 rgba(0,0,0,0)' } : {}}
                  onMouseEnter={(e) => {
                      if (!isVision) {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                          e.currentTarget.style.boxShadow = `0 0 30px rgba(var(--theme-rgb), 0.15)`;
                      }
                  }}
                  onMouseLeave={(e) => {
                      if (!isVision) {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.boxShadow = 'none';
                      }
                  }}
                >
                    {/* VISION: Ethereal Layer Stack */}
                    {isVision && (
                      <>
                        {/* 1. Animated Spectral Border Frame */}
                        <div className="absolute inset-0 p-[1px] opacity-40 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none">
                            <div className="absolute inset-0 spectral-bg opacity-70" />
                            <div className="absolute inset-[1px] bg-black" />
                        </div>
                        
                        {/* 2. Iridescent Glow Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 via-transparent to-amber-500/20 opacity-0 group-hover:opacity-100 transition-all duration-1000 mix-blend-screen z-10 pointer-events-none blur-xl group-hover:blur-md" />
                        
                        {/* 3. Prismatic Lens Flare Swipe */}
                        <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1.5s] ease-in-out z-20 pointer-events-none" />
                      </>
                    )}

                    <img 
                        src={artifact.imageUrl} 
                        alt={artifact.name}
                        className={`w-full h-full object-cover transition-all duration-700 relative z-0
                          ${isVision 
                              ? 'grayscale-[0.3] opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110' 
                              : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105'
                          }
                        `}
                    />
                    <div className={`absolute top-4 right-4 mono text-[9px] px-2 py-1 backdrop-blur tracking-widest uppercase z-20 transition-colors
                      ${isVision 
                          ? 'border border-white/30 bg-black/30 text-white spectral-bg shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                          : 'border border-white/20 bg-black/50 group-hover:spectral-bg group-hover:text-black'
                      }
                    `}>
                        Protocol [{artifact.version}]
                    </div>
                </div>
                
                <div className="flex flex-col gap-2">
                    <h3 className={`mono text-xs uppercase tracking-widest transition-colors ${isVision ? 'group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-amber-400 font-bold' : `group-hover:text-${themeColor}-200`}`}>
                        {artifact.name}
                    </h3>
                    <p className="mono text-[10px] opacity-40 uppercase">{artifact.formattedPrice}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-6 overflow-y-auto"
          onMouseMove={handleMouseMove}
        >
          {getCategoryBackground(selected.category)}
          
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 py-12 relative animate-in fade-in zoom-in-95 duration-700 z-10">
            <button onClick={() => setSelected(null)} className={`absolute -top-10 right-0 mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-${themeColor}-200 transition-colors`}>[ Close Archive ]</button>
            
            <div className={`aspect-square bg-white/5 overflow-hidden group shadow-2xl relative
                 ${selected.category === 'VISION' ? 'border-none ring-1 ring-white/10' : 'border border-white/10'}
            `}>
                {selected.category === 'VISION' && (
                     <div className="absolute inset-0 z-10 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-amber-500/10 mix-blend-overlay" />
                        <div className="absolute inset-0 spectral-bg opacity-10 blur-xl" />
                     </div>
                )}
                <img 
                  src={selected.imageUrl} 
                  className={`w-full h-full object-cover transition-all duration-1000 
                    ${selected.category === 'VISION' ? 'grayscale-[0.2] group-hover:grayscale-0' : 'grayscale-[0.5] group-hover:grayscale-0'}
                  `}
                  alt="" 
                  style={{ transform: `scale(${1 + Math.abs(mousePos.x) * 0.001})` }}
                />
            </div>

            <div className="flex flex-col gap-10">
                <div>
                    <span className="mono text-[10px] uppercase tracking-[0.4em] opacity-30 mb-4 block">Ref No. {selected.id.split('/').pop()} / V {selected.version}</span>
                    <h2 className="serif text-5xl mb-6">{selected.name}</h2>
                    <p className="mono text-sm leading-relaxed opacity-60 max-w-lg">{selected.description}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-10 border-t border-white/10">
                    <div className="flex flex-col gap-4">
                        <span className="mono text-[9px] uppercase tracking-[0.3em] opacity-30">Hardware Specs</span>
                        <div className="mono text-[10px] space-y-2">
                            <p>{selected.threeD.material}</p>
                            <p>{selected.threeD.specs}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <span className={`mono text-[9px] uppercase tracking-[0.3em] animate-pulse ${selected.category === 'VISION' ? 'text-violet-400' : 'text-white'}`}>Software Resonance</span>
                        <div className="mono text-[10px] space-y-2 opacity-80 italic">
                            <p>{selected.fiveD.resonance}</p>
                            <p>{selected.fiveD.status}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto space-y-6">
                    <button 
                      onClick={() => { addToCart(selected); setSelected(null); }} 
                      className={`w-full py-5 mono text-xs uppercase tracking-[0.4em] transition-all duration-700 font-bold
                        ${selected.category === 'VISION' 
                            ? 'spectral-bg text-black hover:opacity-80 hover:scale-[1.02]' 
                            : 'bg-white text-black hover-spectral hover:text-white'
                        }
                      `}
                    >
                      Assume Ownership
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-md bg-[#050505] border-l border-white/10 p-8 flex flex-col gap-8 animate-in slide-in-from-right duration-500">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 className="mono text-xs uppercase tracking-[0.3em]">Current Circuit</h3>
                    <button onClick={() => setIsCartOpen(false)} className={`mono text-[10px] opacity-40 hover:opacity-100 hover:text-${themeColor}-200 transition-colors`}>[ Exit ]</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-8">
                    {cart.length === 0 ? (<p className="mono text-[10px] opacity-30 text-center py-24 uppercase tracking-widest">The circuit is empty.</p>) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-6 items-center border-b border-white/5 pb-8 group">
                                <img src={item.imageUrl} className="w-16 h-16 object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                                <div className="flex-1">
                                    <h4 className={`mono text-[10px] uppercase tracking-widest mb-1 group-hover:text-${themeColor}-200 transition-colors`}>{item.name}</h4>
                                    <p className="mono text-[9px] opacity-40 uppercase">{item.formattedPrice} x {item.quantity}</p>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="mono text-[9px] opacity-20 hover:opacity-100 hover:text-red-400 transition-colors">Remove</button>
                            </div>
                        ))
                    )}
                </div>
                {cart.length > 0 && (
                    <div className="space-y-8 pt-8 border-t border-white/10">
                        <div className="flex justify-between mono text-xs uppercase tracking-widest">
                            <span className="opacity-40">Total Density</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button onClick={async () => { 
                          if (!agreedToCovenant) { alert("Acknowledge responsibility."); return; }
                          const url = await createCheckout(cart);
                          if (url) { window.location.href = url; } 
                          else { window.location.href = `https://${import.meta.env.VITE_SHOPIFY_DOMAIN || 'tonic-thought-studios-2.myshopify.com'}/cart`; }
                        }} className={`w-full py-5 mono text-xs uppercase tracking-[0.4em] transition-all duration-700 font-bold ${agreedToCovenant ? 'bg-white text-black hover-spectral hover:text-white' : 'bg-white/5 text-white/20 border border-white/5'}`}>CLOSE CIRCUIT</button>
                        <label className="flex gap-4 items-start cursor-pointer group">
                            <input type="checkbox" checked={agreedToCovenant} onChange={(e) => setAgreedToCovenant(e.target.checked)} className={`mt-1 h-3 w-3 bg-transparent border border-white/20 group-hover:border-${themeColor}-500 transition-colors`} />
                            <span className="mono text-[9px] uppercase tracking-widest opacity-60 italic group-hover:opacity-100 transition-opacity">I acknowledge responsibility for this manifestation.</span>
                        </label>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Apothecary;