import type { VercelRequest, VercelResponse } from '@vercel/node';

// Server-side env vars (check both with and without VITE_ prefix for flexibility)
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN || process.env.VITE_SHOPIFY_DOMAIN || 'tonic-thought-studios-2.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || process.env.VITE_SHOPIFY_ACCESS_TOKEN || '';

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

  const debugInfo = {
    domain: SHOPIFY_DOMAIN,
    tokenExists: !!STOREFRONT_ACCESS_TOKEN,
    tokenLength: STOREFRONT_ACCESS_TOKEN?.length || 0,
    tokenPreview: STOREFRONT_ACCESS_TOKEN ? `${STOREFRONT_ACCESS_TOKEN.slice(0, 4)}...` : 'none'
  };

  console.log('Shopify API called:', debugInfo);

  if (!STOREFRONT_ACCESS_TOKEN) {
    return res.status(500).json({
      error: 'Shopify not configured',
      message: 'Add SHOPIFY_ACCESS_TOKEN to environment variables',
      debug: debugInfo
    });
  }

  try {
    console.log('Fetching from Shopify...');
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: GRAPHQL_QUERY }),
    });

    console.log('Shopify response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        error: 'Shopify API error',
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        debug: debugInfo
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Shopify proxy error:', error);
    return res.status(500).json({
      error: 'Failed to fetch from Shopify',
      message: error.message,
      stack: error.stack,
      debug: debugInfo
    });
  }
}
