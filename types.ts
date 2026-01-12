
export enum View {
  Origin = 'ORIGIN',
  Transmission = 'TRANSMISSION',
  Apothecary = 'APOTHECARY',
  Architect = 'ARCHITECT',
  Index = 'INDEX',
  Void = 'VOID',
}

export type ThemeColor = 'sky' | 'violet' | 'amber';

export interface Artifact {
  id: string;
  version: string;
  name: string;
  category: 'GROUNDING' | 'VISION' | 'ONENESS' | 'PROTOCOL';
  price: number;
  formattedPrice: string;
  threeD: {
    material: string;
    specs: string;
  };
  fiveD: {
    resonance: string;
    status: string;
  };
  description: string;
  imageUrl: string;
}

export interface CartItem extends Artifact {
  quantity: number;
}

export interface TransmissionPacket {
  id: string;
  type: 'SEED' | 'LOGIC' | 'ARTIFACT';
  timestamp: string;
  content: string;
  imageUrl?: string;
  meta?: string;
}