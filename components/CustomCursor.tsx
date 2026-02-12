import React, { useEffect, useState, useCallback } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isGalleryHover, setIsGalleryHover] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

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

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [mousePosition, isTouchDevice]);

  // Mouse move tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  // Hover detection for interactive elements
  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.tagName === 'BUTTON' || 
                         target.tagName === 'A' || 
                         target.closest('button') ||
                         target.closest('a') ||
                         target.classList.contains('gallery-piece');

    const isGallery = target.closest('.gallery-piece') !== null;
    
    setIsHovering(isInteractive);
    setIsGalleryHover(isGallery);
  }, []);

  const handleMouseOut = useCallback(() => {
    setIsHovering(false);
    setIsGalleryHover(false);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.body.classList.add('custom-cursor');

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.body.classList.remove('custom-cursor');
    };
  }, [handleMouseMove, handleMouseOver, handleMouseOut, isTouchDevice]);

  if (isTouchDevice) {
    return null;
  }

  return (
    <>
      {/* Small gold dot - follows cursor exactly */}
      <div 
        className="fixed pointer-events-none z-[9999] w-2 h-2 rounded-full transition-opacity duration-300"
        style={{
          backgroundColor: '#C9A84C',
          left: mousePosition.x - 4,
          top: mousePosition.y - 4,
          opacity: 0.8,
        }}
      />
      
      {/* Large circle - follows with easing */}
      <div 
        className={`fixed pointer-events-none z-[9998] rounded-full border border-[#C9A84C] transition-all duration-300 ease-out ${isGalleryHover ? 'mix-blend-difference' : ''}`}
        style={{
          width: isHovering ? '80px' : '40px',
          height: isHovering ? '80px' : '40px',
          left: cursorPosition.x - (isHovering ? 40 : 20),
          top: cursorPosition.y - (isHovering ? 40 : 20),
          backgroundColor: 'rgba(201, 168, 76, 0.1)',
          opacity: 0.6,
        }}
      />
    </>
  );
};

export default CustomCursor;