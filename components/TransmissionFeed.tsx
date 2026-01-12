import React, { useEffect, useState, useRef } from 'react';
import { TransmissionPacket, ThemeColor } from '../types';
import { generateTransmission } from '../services/geminiService';

const TransmissionFeed: React.FC<{ themeColor: ThemeColor }> = ({ themeColor }) => {
  const [packets, setPackets] = useState<TransmissionPacket[]>([]);
  const [loading, setLoading] = useState(true);
  const [zOffset, setZOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initPackets = async () => {
      // Fetching multiple transmissions to fill the quantum space
      const transmissions = await Promise.all([
        generateTransmission(),
        generateTransmission(),
        generateTransmission(),
        generateTransmission(),
        generateTransmission()
      ]);
      
      const staticAssets = [
        'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1200',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200',
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200'
      ];

      const newPackets: TransmissionPacket[] = transmissions.map((content, idx) => ({
        id: `tx-${idx}`,
        type: idx % 2 === 0 ? 'SEED' : 'LOGIC',
        timestamp: `${10 + idx}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        content,
        imageUrl: staticAssets[idx % staticAssets.length],
        meta: `Oscillation: ${137 + idx}.036`
      }));

      setPackets(newPackets);
      setLoading(false);
    };
    initPackets();
  }, []);

  useEffect(() => {
    // Lock body scroll for immersive 3D experience
    document.body.style.overflow = 'hidden';

    const handleWheel = (e: WheelEvent) => {
      // Adjust Z-offset based on scroll direction
      // Positive deltaY = scroll down = move deeper (decrease Z)
      setZOffset(prev => prev - e.deltaY * 1.5);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center mono opacity-40 animate-pulse uppercase tracking-[0.5em]">
        Initializing Quantum Stream...
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden quantum-field"
      style={{ perspective: '1200px' }}
    >
      {/* Background Gradients for Depth Perception */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] animate-pulse-slow" 
          style={{ background: 'radial-gradient(circle at center, rgba(var(--theme-rgb), 0.05) 0%, transparent 70%)' }}
        />
      </div>

      <div 
        className="relative w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
        style={{ 
          transform: `translateZ(${zOffset}px)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {packets.map((packet, idx) => {
          // Space packets out significantly on the Z-axis
          const baseZ = idx * -1500;
          const currentItemZ = baseZ + zOffset;
          
          // Calculate opacity based on proximity to the "camera" (Z = 0)
          // Fade in as it approaches, fade out as it passes
          let opacity = 1;
          if (currentItemZ > 200) opacity = Math.max(0, 1 - (currentItemZ - 200) / 400);
          if (currentItemZ < -2500) opacity = Math.max(0, 1 - (Math.abs(currentItemZ) - 2500) / 1000);

          // Asymmetric lateral positioning
          const xPos = idx % 2 === 0 ? '-25%' : '25%';
          const yPos = idx % 3 === 0 ? '-15%' : idx % 3 === 1 ? '15%' : '0%';
          
          // Slight random rotation for "floating" effect
          const rotX = Math.sin(idx + zOffset * 0.001) * 5;
          const rotY = Math.cos(idx + zOffset * 0.001) * 5;

          return (
            <div 
              key={packet.id}
              className="absolute w-[90vw] md:w-[600px] pointer-events-auto transition-opacity duration-700"
              style={{
                transform: `translate3d(${xPos}, ${yPos}, ${baseZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                opacity: opacity,
                transformStyle: 'preserve-3d',
                zIndex: packets.length - idx,
                display: opacity === 0 ? 'none' : 'block'
              }}
            >
              <div className="flex flex-col gap-6 group">
                {/* Protocol Header */}
                <div className="flex items-center gap-4 opacity-40 mono text-[9px] tracking-widest uppercase">
                  <span className="spectral-bg px-2 py-0.5 text-black font-black">PKT_{idx}</span>
                  <span>{packet.timestamp}</span>
                  <div className="flex-1 h-px bg-white/10" />
                  <span>{packet.type}</span>
                </div>

                {/* Media Monolith */}
                <div className={`relative border border-white/5 bg-black/40 backdrop-blur-sm p-1 group-hover:border-${themeColor}-400/40 transition-all duration-700 shadow-2xl`}>
                  {packet.imageUrl && (
                    <div className="relative aspect-video overflow-hidden grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000">
                      <img 
                        src={packet.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                  )}
                  
                  <div className="p-8">
                    <p className="serif text-xl md:text-3xl leading-snug text-white/90 group-hover:text-white transition-colors">
                      {packet.content}
                    </p>
                    
                    {packet.meta && (
                      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="mono text-[8px] uppercase tracking-[0.4em] opacity-30">{packet.meta}</span>
                        <div 
                           className={`w-1.5 h-1.5 rounded-full bg-${themeColor}-400 animate-pulse`} 
                           style={{ boxShadow: `0 0 10px rgba(var(--theme-rgb), 0.5)` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Quantum Drift Secondary Layer */}
                  <div 
                    className={`absolute -inset-4 border border-${themeColor}-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none`}
                    style={{ transform: 'translateZ(-20px)' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation HUD Overlay */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none">
        <div className="mono text-[8px] uppercase tracking-[0.5em] opacity-20">Navigation_Z_Depth: {Math.floor(Math.abs(zOffset))} units</div>
        <div className="w-48 h-0.5 bg-white/5 overflow-hidden">
          <div 
            className={`h-full bg-${themeColor}-400 transition-all duration-300`} 
            style={{ width: `${Math.min(100, (Math.abs(zOffset) / (packets.length * 1500)) * 100)}%` }} 
          />
        </div>
      </div>

      {/* Aesthetic Particle Field (Simulated with random absolute divs) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `translateZ(${Math.random() * -10000}px)`,
              opacity: Math.random() * 0.5
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TransmissionFeed;