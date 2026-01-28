/**
 * Artwork Catalog Schema
 * The single source of truth for all Void artwork
 * 
 * This schema defines how each piece is cataloged.
 * The catalog.json file uses this structure.
 */

export interface ArtworkPiece {
  // === IDENTITY ===
  id: string;                    // Unique slug: "cosmic-gate-001"
  title: string;                 // Human name: "Cosmic Gate"
  
  // === CLASSIFICATION ===
  series?: string;               // Group: "Portal Studies", "Void Transmissions"
  tags: string[];                // Searchable: ["portal", "geometry", "blue", "abstract"]
  year: number;                  // Creation year
  medium?: string;               // "digital", "mixed-media", "photography", "ai-assisted"
  
  // === FILES ===
  files: {
    original: string;            // Original filename in void/
    thumbnail?: string;          // Generated 400px thumbnail
    webOptimized?: string;       // Generated 1200px for gallery
    forgeAsset?: string;         // PNG with transparency for Forge
    printReady?: string;         // High-res for Printful
  };
  
  // === METADATA ===
  dimensions?: {
    width: number;
    height: number;
  };
  fileSize?: number;             // Bytes
  dominantColors?: string[];     // Extracted hex colors
  
  // === FORGE SETTINGS ===
  forgeEnabled: boolean;         // Available in The Forge?
  forgeWeight?: number;          // 1-10, how prominently featured in Forge picker
  
  // === COMMERCE ===
  shopifyProductId?: string;     // If linked to Shopify product
  printfulTemplateId?: string;   // If has Printful template
  
  // === DISPLAY ===
  featured: boolean;             // Show prominently
  hidden: boolean;               // Hide from public gallery
  nsfw: boolean;                 // Content warning
  
  // === TIMESTAMPS ===
  createdAt: string;             // ISO date of artwork creation
  catalogedAt: string;           // ISO date added to catalog
  updatedAt: string;             // ISO date last modified
  
  // === NOTES ===
  description?: string;          // Artist statement / description
  notes?: string;                // Private notes (not shown publicly)
}

export interface ArtworkCatalog {
  version: string;               // Schema version
  lastUpdated: string;           // ISO date
  totalPieces: number;
  
  // Series definitions
  series: {
    [key: string]: {
      name: string;
      description?: string;
      color?: string;            // Theme color for series
    };
  };
  
  // Tag definitions (for consistent tagging)
  tags: {
    [key: string]: {
      name: string;
      category: 'subject' | 'style' | 'color' | 'mood' | 'technique';
    };
  };
  
  // The actual artwork
  pieces: ArtworkPiece[];
}

// Example catalog structure
export const EXAMPLE_CATALOG: ArtworkCatalog = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  totalPieces: 0,
  
  series: {
    "void-transmissions": {
      name: "Void Transmissions",
      description: "Raw signals from the void",
      color: "#a78bfa"
    },
    "portal-studies": {
      name: "Portal Studies", 
      description: "Explorations of dimensional gateways",
      color: "#38bdf8"
    },
    "sacred-geometry": {
      name: "Sacred Geometry",
      description: "Mathematical patterns of creation",
      color: "#fbbf24"
    },
    "glitch-artifacts": {
      name: "Glitch Artifacts",
      description: "Digital decay and corruption aesthetics",
      color: "#f43f5e"
    },
    "portraits": {
      name: "Portraits",
      description: "Faces from other dimensions",
      color: "#10b981"
    },
    "uncategorized": {
      name: "Uncategorized",
      description: "Awaiting classification",
      color: "#6b7280"
    }
  },
  
  tags: {
    // Subjects
    "portal": { name: "Portal", category: "subject" },
    "face": { name: "Face", category: "subject" },
    "figure": { name: "Figure", category: "subject" },
    "abstract": { name: "Abstract", category: "subject" },
    "landscape": { name: "Landscape", category: "subject" },
    "symbol": { name: "Symbol", category: "subject" },
    "eye": { name: "Eye", category: "subject" },
    "skull": { name: "Skull", category: "subject" },
    "robot": { name: "Robot", category: "subject" },
    "animal": { name: "Animal", category: "subject" },
    
    // Styles
    "psychedelic": { name: "Psychedelic", category: "style" },
    "surreal": { name: "Surreal", category: "style" },
    "collage": { name: "Collage", category: "style" },
    "glitch": { name: "Glitch", category: "style" },
    "minimal": { name: "Minimal", category: "style" },
    "maximal": { name: "Maximal", category: "style" },
    "geometric": { name: "Geometric", category: "style" },
    "organic": { name: "Organic", category: "style" },
    
    // Colors
    "blue": { name: "Blue", category: "color" },
    "red": { name: "Red", category: "color" },
    "gold": { name: "Gold", category: "color" },
    "purple": { name: "Purple", category: "color" },
    "green": { name: "Green", category: "color" },
    "pink": { name: "Pink", category: "color" },
    "monochrome": { name: "Monochrome", category: "color" },
    "neon": { name: "Neon", category: "color" },
    
    // Moods
    "dark": { name: "Dark", category: "mood" },
    "light": { name: "Light", category: "mood" },
    "chaotic": { name: "Chaotic", category: "mood" },
    "calm": { name: "Calm", category: "mood" },
    "mysterious": { name: "Mysterious", category: "mood" },
    "intense": { name: "Intense", category: "mood" },
    
    // Techniques
    "ai-generated": { name: "AI Generated", category: "technique" },
    "hand-drawn": { name: "Hand Drawn", category: "technique" },
    "photography": { name: "Photography", category: "technique" },
    "mixed-media": { name: "Mixed Media", category: "technique" },
    "digital-painting": { name: "Digital Painting", category: "technique" },
  },
  
  pieces: []
};
