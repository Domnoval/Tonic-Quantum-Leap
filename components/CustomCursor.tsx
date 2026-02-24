import React, { useEffect, useState, useCallback, useRef } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [chargeLevel, setChargeLevel] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const chargeRef = useRef(0);
  const pressStartRef = useRef(0);
  const chargeAnimRef = useRef<number>(0);

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

  // Smooth cursor following with lerp
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setCursorPosition(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.15,
        y: prev.y + (mousePosition.y - prev.y) * 0.15
      }));
      animationId = requestAnimationFrame(animate);
    };
    if (!isTouchDevice) {
      animationId = requestAnimationFrame(animate);
    }
    return () => { if (animationId) cancelAnimationFrame(animationId); };
  }, [mousePosition, isTouchDevice]);

  // Charge animation loop
  useEffect(() => {
    const animateCharge = () => {
      if (isPressed) {
        const elapsed = Date.now() - pressStartRef.current;
        const newCharge = Math.min(elapsed / 1500, 1); // Full charge in 1.5s
        chargeRef.current = newCharge;
        setChargeLevel(newCharge);
      } else if (chargeRef.current > 0) {
        chargeRef.current = Math.max(chargeRef.current - 0.05, 0);
        setChargeLevel(chargeRef.current);
      }
      chargeAnimRef.current = requestAnimationFrame(animateCharge);
    };
    chargeAnimRef.current = requestAnimationFrame(animateCharge);
    return () => cancelAnimationFrame(chargeAnimRef.current);
  }, [isPressed]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
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

  const handleMouseOut = useCallback(() => {
    setIsHovering(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
    pressStartRef.current = Date.now();
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

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

  // Charge glow properties
  const glowSize = 40 + chargeLevel * 60;
  const glowOpacity = 0.05 + chargeLevel * 0.25;
  const ankhScale = isHovering ? 1.3 : (1 + chargeLevel * 0.4);
  const ankhGlow = chargeLevel > 0 ? `drop-shadow(0 0 ${4 + chargeLevel * 20}px rgba(201,168,76,${0.4 + chargeLevel * 0.6}))` : 'none';

  return (
    <>
      {/* Ankh cursor — SVG following mouse */}
      <div 
        className="fixed pointer-events-none z-[9999] transition-transform duration-150"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 16,
          transform: `scale(${ankhScale})`,
          filter: ankhGlow,
        }}
      >
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ankh shape */}
          <ellipse cx="12" cy="8" rx="5.5" ry="6.5" stroke="#C9A84C" strokeWidth="2" fill="none" />
          <line x1="12" y1="14.5" x2="12" y2="30" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="20" x2="18" y2="20" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Charge ring — grows and glows as you hold */}
      <div 
        className="fixed pointer-events-none z-[9998] rounded-full transition-all duration-100"
        style={{
          width: glowSize,
          height: glowSize,
          left: cursorPosition.x - glowSize / 2,
          top: cursorPosition.y - glowSize / 2,
          border: `1px solid rgba(201,168,76,${0.15 + chargeLevel * 0.5})`,
          backgroundColor: `rgba(201,168,76,${glowOpacity})`,
          boxShadow: chargeLevel > 0.3
            ? `0 0 ${chargeLevel * 30}px rgba(201,168,76,${chargeLevel * 0.3}), inset 0 0 ${chargeLevel * 15}px rgba(201,168,76,${chargeLevel * 0.15})`
            : 'none',
        }}
      />

      {/* Charge progress ring */}
      {chargeLevel > 0.05 && (
        <svg
          className="fixed pointer-events-none z-[9997]"
          width="60"
          height="60"
          style={{
            left: cursorPosition.x - 30,
            top: cursorPosition.y - 30,
          }}
        >
          <circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke="rgba(201,168,76,0.1)"
            strokeWidth="1"
          />
          <circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={`${chargeLevel * 163.4} 163.4`}
            transform="rotate(-90 30 30)"
            style={{
              filter: chargeLevel > 0.5 ? `drop-shadow(0 0 4px rgba(201,168,76,0.8))` : 'none',
              transition: 'stroke-dasharray 0.1s linear',
            }}
          />
        </svg>
      )}
    </>
  );
};

export default CustomCursor;
