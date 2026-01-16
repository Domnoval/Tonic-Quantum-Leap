import type { VercelRequest, VercelResponse } from '@vercel/node';

const SHOPIFY_DOMAIN = process.env.VITE_SHOPIFY_DOMAIN || 'tonic-thought-studios.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = process.env.VITE_SHOPIFY_ACCESS_TOKEN || '';

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
        images(first: 1) {
          nodes {
            url
          }
        }
      }
    }
  }
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!STOREFRONT_ACCESS_TOKEN) {
    return res.status(500).json({
      error: 'Shopify not configured',
      message: 'Add VITE_SHOPIFY_ACCESS_TOKEN to environment variables'
    });
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
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Shopify proxy error:', error);
    return res.status(500).json({
      error: 'Failed to fetch from Shopify',
      message: error.message
    });
  }
}
