import React, { useEffect, useState, useCallback, useRef } from 'react';

// Chakra colors from root to crown
const CHAKRAS = [
  { color: '#FF0000', y: 0.0, name: 'Root' },       // Red
  { color: '#FF7700', y: 0.143, name: 'Sacral' },    // Orange
  { color: '#FFDD00', y: 0.286, name: 'Solar' },     // Yellow
  { color: '#00CC44', y: 0.429, name: 'Heart' },     // Green
  { color: '#00BBFF', y: 0.571, name: 'Throat' },    // Blue
  { color: '#4400FF', y: 0.714, name: 'Third Eye' }, // Indigo
  { color: '#AA00FF', y: 0.857, name: 'Crown' },     // Violet
  { color: '#FFFFFF', y: 1.0, name: 'Source' },       // White/God consciousness
];

interface MousePosition { x: number; y: number; }

const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Idle / kundalini state
  const [idleTime, setIdleTime] = useState(0);
  const [kundaliniPhase, setKundaliniPhase] = useState(0); // 0-1 rising, 1-2 explosion, 2-3 return
  const [currentChakra, setCurrentChakra] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number; angle: number; speed: number; color: string; life: number}>>([]);

  const lastMoveRef = useRef(Date.now());
  const animRef = useRef<number>(0);
  const particleIdRef = useRef(0);

  // Check for touch device
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(hover: none)').matches
      );
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Main animation loop
  useEffect(() => {
    const animate = () => {
      // Smooth cursor follow
      setCursorPosition(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.15,
        y: prev.y + (mousePosition.y - prev.y) * 0.15
      }));

      // Idle detection
      const timeSinceMove = Date.now() - lastMoveRef.current;
      const idleSec = timeSinceMove / 1000;
      setIdleTime(idleSec);

      // Kundalini activation after 2 seconds idle
      if (idleSec > 2) {
        const kundaliniTime = idleSec - 2;
        const cycleTime = 8; // Full cycle in 8 seconds
        const phase = (kundaliniTime % cycleTime) / cycleTime;

        if (phase < 0.5) {
          // Rising phase — energy climbing through chakras
          const riseProgress = phase / 0.5; // 0-1
          const chakraIndex = Math.min(Math.floor(riseProgress * 8), 7);
          setCurrentChakra(chakraIndex);
          setKundaliniPhase(riseProgress);
          setIsExploding(false);
        } else if (phase < 0.65) {
          // Explosion phase — crown/god consciousness burst
          setCurrentChakra(7);
          setKundaliniPhase(1);
          setIsExploding(true);

          // Spawn particles
          if (Math.random() < 0.4) {
            const newParticles = Array.from({ length: 3 }, () => ({
              id: particleIdRef.current++,
              angle: Math.random() * Math.PI * 2,
              speed: 1 + Math.random() * 3,
              color: CHAKRAS[Math.floor(Math.random() * CHAKRAS.length)].color,
              life: 1.0,
            }));
            setParticles(prev => [...prev.slice(-30), ...newParticles]);
          }
        } else {
          // Return phase — energy descends back, settles
          const returnProgress = (phase - 0.65) / 0.35;
          const descendChakra = Math.max(0, 7 - Math.floor(returnProgress * 8));
          setCurrentChakra(descendChakra);
          setKundaliniPhase(1 - returnProgress);
          setIsExploding(false);
        }
      } else {
        setKundaliniPhase(0);
        setCurrentChakra(0);
        setIsExploding(false);
      }

      // Decay particles
      setParticles(prev =>
        prev
          .map(p => ({ ...p, life: p.life - 0.02 }))
          .filter(p => p.life > 0)
      );

      animRef.current = requestAnimationFrame(animate);
    };

    if (!isTouchDevice) {
      animRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [mousePosition, isTouchDevice]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    lastMoveRef.current = Date.now();
  }, []);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.tagName === 'BUTTON' ||
                         target.tagName === 'A' ||
                         target.closest('button') ||
                         target.closest('a') ||
                         target.classList.contains('gallery-piece');
    setIsHovering(!!isInteractive);
  }, []);

  const handleMouseOut = useCallback(() => setIsHovering(false), []);
  const handleMouseDown = useCallback(() => { setIsPressed(true); lastMoveRef.current = Date.now(); }, []);
  const handleMouseUp = useCallback(() => setIsPressed(false), []);

  useEffect(() => {
    if (isTouchDevice) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.classList.add('custom-cursor');
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('custom-cursor');
    };
  }, [handleMouseMove, handleMouseOver, handleMouseOut, handleMouseDown, handleMouseUp, isTouchDevice]);

  if (isTouchDevice) return null;

  const isIdle = idleTime > 2;
  const activeChakra = CHAKRAS[currentChakra] || CHAKRAS[0];
  const ankhColor = isIdle ? activeChakra.color : '#C9A84C';
  const ankhScale = isHovering ? 1.3 : isExploding ? (1.5 + Math.sin(Date.now() * 0.02) * 0.3) : (1 + kundaliniPhase * 0.3);
  
  const glowIntensity = isExploding ? 30 : (kundaliniPhase * 15);
  const ankhGlow = isIdle
    ? `drop-shadow(0 0 ${glowIntensity}px ${activeChakra.color})`
    : isPressed ? `drop-shadow(0 0 8px rgba(201,168,76,0.6))` : 'none';

  // Chakra energy trail (vertical dots along the ankh's staff)
  const chakraTrail = isIdle ? CHAKRAS.slice(0, currentChakra + 1) : [];

  return (
    <>
      {/* Energy particles — explosion phase */}
      {particles.map(p => {
        const dist = (1 - p.life) * 80 * p.speed;
        const px = mousePosition.x + Math.cos(p.angle) * dist;
        const py = mousePosition.y + Math.sin(p.angle) * dist;
        return (
          <div
            key={p.id}
            className="fixed pointer-events-none z-[9996] rounded-full"
            style={{
              left: px - 2,
              top: py - 2,
              width: 4 * p.life,
              height: 4 * p.life,
              backgroundColor: p.color,
              opacity: p.life * 0.8,
              boxShadow: `0 0 ${6 * p.life}px ${p.color}`,
            }}
          />
        );
      })}

      {/* Kundalini energy column — rising dots when idle */}
      {chakraTrail.map((chakra, i) => {
        const yOff = 30 - (i * 8); // Rising from below ankh
        const pulse = Math.sin(Date.now() * 0.005 + i * 0.5) * 0.3 + 0.7;
        return (
          <div
            key={`chakra-${i}`}
            className="fixed pointer-events-none z-[9997] rounded-full"
            style={{
              left: mousePosition.x - 3,
              top: mousePosition.y + yOff,
              width: 6,
              height: 6,
              backgroundColor: chakra.color,
              opacity: pulse * (i === currentChakra ? 1 : 0.4),
              boxShadow: i === currentChakra ? `0 0 12px ${chakra.color}` : 'none',
              transition: 'opacity 0.2s',
            }}
          />
        );
      })}

      {/* Ankh cursor */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 16,
          transform: `scale(${ankhScale})`,
          filter: ankhGlow,
          transition: 'transform 0.15s ease-out, filter 0.3s ease-out',
        }}
      >
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="8" rx="5.5" ry="6.5" stroke={ankhColor} strokeWidth="2" fill="none" style={{ transition: 'stroke 0.3s' }} />
          <line x1="12" y1="14.5" x2="12" y2="30" stroke={ankhColor} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke 0.3s' }} />
          <line x1="6" y1="20" x2="18" y2="20" stroke={ankhColor} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke 0.3s' }} />
        </svg>
      </div>

      {/* Outer aura ring */}
      <div
        className="fixed pointer-events-none z-[9998] rounded-full"
        style={{
          width: isExploding ? 100 : (40 + kundaliniPhase * 30),
          height: isExploding ? 100 : (40 + kundaliniPhase * 30),
          left: cursorPosition.x - (isExploding ? 50 : (20 + kundaliniPhase * 15)),
          top: cursorPosition.y - (isExploding ? 50 : (20 + kundaliniPhase * 15)),
          border: `1px solid ${isIdle ? activeChakra.color : 'rgba(201,168,76,0.15)'}`,
          backgroundColor: isExploding
            ? `rgba(255,255,255,0.05)`
            : `rgba(201,168,76,${0.03 + kundaliniPhase * 0.05})`,
          boxShadow: isExploding
            ? `0 0 40px ${activeChakra.color}, 0 0 80px rgba(255,255,255,0.1)`
            : isIdle
            ? `0 0 ${kundaliniPhase * 20}px ${activeChakra.color}`
            : 'none',
          transition: 'width 0.3s, height 0.3s, left 0.3s, top 0.3s, border-color 0.3s, box-shadow 0.3s',
        }}
      />
    </>
  );
};

export default CustomCursor;
