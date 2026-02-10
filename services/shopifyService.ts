import { Artifact } from '../types';

// Replace with your actual Shopify Storefront Access Token
const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN || 'tonic-thought-studios.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN || '';

const GRAPHQL_QUERY = `
  query getProducts {
    products(first: 20) {
      nodes {
        id
        title
        description
        handle
        tags
        variants(first: 1) {
          nodes {
            id
            price {
              amount
              currencyCode
            }
          }
        }
        images(first: 3) {
          nodes {
            url
            altText
          }
        }
      }
    }
  }
`;

/**
 * Fallback Artifacts: Manifested when the Shopify Nexus is disconnected.
 * Populated with the 'Static Stack' and '333 Resonance' collection.
 */
const FALLBACK_ARTIFACTS: Artifact[] = [
  {
    variantId: 'gid://shopify/ProductVariant/fallback', id: 'gid://shopify/Product/static-monolith',
    version: '1.0.0',
    name: 'Static Monolith',
    category: 'VISION',
    price: 444.00,
    formattedPrice: '$444.00',
    // NOTE: Replace this URL with the actual hosted URL of the TV/Monitor painting
    imageUrl: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=800&q=80',
    description: 'Analog signal decay captured in acrylic. A totemic stack of CRT monitors displaying the void. The screen is broken, but the broadcast continues.',
    threeD: {
      material: 'Acrylic & Aerosol',
      specs: '24x36 Canvas'
    },
    fiveD: {
      resonance: 'Signal Interruption',
      status: 'Broadcasting'
    }
  },
  {
    variantId: 'gid://shopify/ProductVariant/fallback', id: 'gid://shopify/Product/333-resonance',
    version: '3.3.3',
    name: 'Trinity Protocol',
    category: 'ONENESS',
    price: 333.00,
    formattedPrice: '$333.00',
    // NOTE: Replace this URL with the actual hosted URL of the 333/Geometry painting
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    description: 'The 333 frequency mapped onto physical space. A navigational chart for the transition from darkness to light through the gateway of wisdom.',
    threeD: {
      material: 'Mixed Media',
      specs: '36x48 Canvas'
    },
    fiveD: {
      resonance: 'Angelic Alignment',
      status: 'Active Gateway'
    }
  },
  {
    variantId: 'gid://shopify/ProductVariant/fallback', id: 'gid://shopify/Product/tv-stack-variant-2',
    version: '1.0.1',
    name: 'Cathode Ray Shrine',
    category: 'VISION',
    price: 444.00,
    formattedPrice: '$444.00',
    imageUrl: 'https://images.unsplash.com/photo-1591293836267-965cc3123891?auto=format&fit=crop&w=800&q=80',
    description: 'A variation of the Static Monolith. Focused on the magenta interference patterns of the broken tube.',
    threeD: {
      material: 'Acrylic on Panel',
      specs: '18x24'
    },
    fiveD: {
      resonance: 'Visual Distortion',
      status: 'Charged'
    }
  },
  {
    variantId: 'gid://shopify/ProductVariant/fallback', id: 'gid://shopify/Product/333-variant-2',
    version: '3.3.4',
    name: 'Wisdom Glyph',
    category: 'ONENESS',
    price: 333.00,
    formattedPrice: '$333.00',
    imageUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=80',
    description: 'Detailed study of the upper quadrant geometry. The intersection of "Light" and "Darkness".',
    threeD: {
      material: 'Ink & Spray',
      specs: '12x12 Study'
    },
    fiveD: {
      resonance: 'Micro-Cosmic',
      status: 'Sealed'
    }
  },
  {
    variantId: 'gid://shopify/ProductVariant/fallback', id: 'gid://shopify/Product/static-variant-3',
    version: '1.0.2',
    name: 'Blue Screen Void',
    category: 'GROUNDING',
    price: 222.00,
    formattedPrice: '$222.00',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    description: 'The moment before the crash. A study in cyan and electric blue.',
    threeD: {
      material: 'Digital Print',
      specs: 'Limited Edition'
    },
    fiveD: {
      resonance: 'System Reset',
      status: 'Pending'
    }
  },
  {
    variantId: 'gid://shopify/ProductVariant/fallback', id: 'gid://shopify/Product/333-variant-3',
    version: '3.3.5',
    name: 'Pink Noise Map',
    category: 'PROTOCOL',
    price: 111.00,
    formattedPrice: '$111.00',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    description: 'The background texture of the Trinity Protocol isolated and amplified.',
    threeD: {
      material: 'Texture Study',
      specs: 'Unknown'
    },
    fiveD: {
      resonance: 'Background Radiation',
      status: 'Constant'
    }
  },
  {
    variantId: 'gid://shopify/ProductVariant/fallback', id: 'gid://shopify/Product/metatron-plate',
    version: '1.3.7',
    name: 'Metatron Density Plate',
    category: 'GROUNDING',
    price: 137.00,
    formattedPrice: '$137.00',
    imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800',
    description: 'A physical anchor for 11D consciousness. Calibrated to the inverse fine-structure constant.',
    threeD: {
      material: 'Bismuth-Infused Ceramic',
      specs: '137mm Diameter'
    },
    fiveD: {
      resonance: 'Earth-Core Synchronized',
      status: 'High Density'
    }
  },
  {
    variantId: 'gid://shopify/ProductVariant/fallback', id: 'gid://shopify/Product/vision-lens',
    version: '2.0.1',
    name: 'Visionary Lens Overlay',
    category: 'VISION',
    price: 42.00,
    formattedPrice: '$42.00',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800',
    description: 'A digital filter for your ocular interface. Shifts perception to the ultraviolet spectrum.',
    threeD: {
      material: 'Light-Matter Hybrid',
      specs: 'Weightless'
    },
    fiveD: {
      resonance: 'Third-Eye Amplified',
      status: 'Ethereal'
    }
  }
];

export const fetchShopifyArtifacts = async (): Promise<Artifact[]> => {
  // 1. Check if token is still a placeholder to avoid useless network calls
  if (STOREFRONT_ACCESS_TOKEN === 'your-access-token-here') {
    // console.warn("Shopify Nexus: Credentials unset. Manifesting fallback protocols.");
    return FALLBACK_ARTIFACTS;
  }

  try {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: GRAPHQL_QUERY }),
    });

    if (!response.ok) {
      throw new Error(`Shopify Network response was not ok: ${response.statusText}`);
    }

    const json = await response.json();

    // Check for GraphQL errors
    if (json.errors) {
      console.error("Shopify GraphQL Errors:", json.errors);
      return FALLBACK_ARTIFACTS;
    }

    const products = json.data?.products?.nodes;
    if (!products || products.length === 0) {
      return FALLBACK_ARTIFACTS;
    }

    return products.map((product: any): Artifact => {
      const price = parseFloat(product.variants.nodes[0]?.price.amount || "0");
      const currency = product.variants.nodes[0]?.price.currencyCode || "USD";

      const categoryTag = product.tags.find((t: string) =>
        ['GROUNDING', 'VISION', 'ONENESS', 'PROTOCOL'].includes(t.toUpperCase())
      ) || 'PROTOCOL';

      const versionTag = product.tags.find((t: string) => t.startsWith('v')) || '1.3.7';

      return {
        id: product.id,
        variantId: product.variants.nodes[0]?.id || product.id,
        version: versionTag.replace('v', ''),
        name: product.title,
        category: categoryTag.toUpperCase() as any,
        price: price,
        formattedPrice: `${currency === 'USD' ? '$' : ''}${price.toFixed(2)}`,
        imageUrl: product.images.nodes[0]?.url || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800',
        description: product.description,
        threeD: {
          material: 'Density Packets',
          specs: 'Calibrated per order'
        },
        fiveD: {
          resonance: 'Synchronized with Shopify Storefront',
          status: 'Available for manifestation'
        }
      };
    });
  } catch (error) {
    console.error("Shopify Nexus: Link failed. Initiating Ethereal Essentialism fallback.", error);
    // Return themed fallback data so the site is never empty
    return FALLBACK_ARTIFACTS;
  }
};
