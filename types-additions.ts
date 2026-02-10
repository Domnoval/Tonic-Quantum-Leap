/**
 * Types Additions for Featured Redesign
 * 
 * Add these values to the existing View enum in types.ts:
 * 
 *   Featured = 'FEATURED',
 *   About = 'ABOUT',
 * 
 * The full enum should become:
 */

// View enum with new values:
export enum View {
  Origin = 'ORIGIN',
  Transmission = 'TRANSMISSION',
  Apothecary = 'APOTHECARY',
  Architect = 'ARCHITECT',
  Index = 'INDEX',
  Void = 'VOID',
  Forge = 'FORGE',
  Featured = 'FEATURED',   // NEW
  About = 'ABOUT',         // NEW
}

// Interface for featured art pieces (used by FeaturedCollection)
export interface FeaturedPiece {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  description: string;
  medium: string;
}
