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

const FALLBACK_ARTIFACTS: Artifact[] = [];

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
