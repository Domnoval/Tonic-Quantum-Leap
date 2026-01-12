import React from 'react';

export const COLORS = {
  void: '#050505',
  source: '#F5F5F5',
};

export const SACRED_GEOMETRY = {
  flowerOfLife: (
    <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none opacity-20">
      <circle cx="50" cy="50" r="10" />
      <circle cx="50" cy="40" r="10" />
      <circle cx="50" cy="60" r="10" />
      <circle cx="41.3" cy="45" r="10" />
      <circle cx="58.7" cy="45" r="10" />
      <circle cx="41.3" cy="55" r="10" />
      <circle cx="58.7" cy="55" r="10" />
      <circle cx="50" cy="30" r="10" />
      <circle cx="50" cy="70" r="10" />
      <circle cx="32.7" cy="40" r="10" />
      <circle cx="67.3" cy="40" r="10" />
      <circle cx="32.7" cy="60" r="10" />
      <circle cx="67.3" cy="60" r="10" />
    </svg>
  ),
  metatron: (
    <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none opacity-20">
      <circle cx="50" cy="50" r="10" />
      <path d="M50 30 L67.3 40 L67.3 60 L50 70 L32.7 60 L32.7 40 Z" />
      <path d="M50 10 L84.6 30 L84.6 70 L50 90 L15.4 70 L15.4 30 Z" />
      <line x1="50" y1="10" x2="50" y2="90" />
      <line x1="15.4" y1="30" x2="84.6" y2="70" />
      <line x1="15.4" y1="70" x2="84.6" y2="30" />
    </svg>
  ),
  masterSigil: (
    <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="1.5">
      {/* 1. The Axis (The One) - Connecting Void to Source */}
      <line x1="50" y1="5" x2="50" y2="95" />
      
      {/* 2. The Fire Triangle (The Three / Leo) - Upward striving */}
      <path d="M50 20 L25 75 L75 75 Z" strokeLinejoin="round" />
      
      {/* 3. The Receiving Vessel (Cancer / Kabbalah) - The Lunar Cup */}
      <path d="M20 40 Q50 90 80 40" strokeLinecap="round" />
      
      {/* 4. The Solar Halo (Leo) - Incomplete orbit */}
      <path d="M50 10 A 40 40 0 1 1 49.9 10" strokeDasharray="4 4" opacity="0.5" />
      
      {/* 5. The Seven Nodes (137 = 1, 3, 7) */}
      <circle cx="50" cy="20" r="1.5" fill="currentColor" />
      <circle cx="50" cy="50" r="1.5" fill="currentColor" />
      <circle cx="50" cy="75" r="1.5" fill="currentColor" />
      <circle cx="37.5" cy="47.5" r="1" fill="currentColor" opacity="0.6"/>
      <circle cx="62.5" cy="47.5" r="1" fill="currentColor" opacity="0.6"/>
      <circle cx="33" cy="62" r="1" fill="currentColor" opacity="0.6"/>
      <circle cx="67" cy="62" r="1" fill="currentColor" opacity="0.6"/>
    </svg>
  )
};