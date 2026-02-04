import type { VercelRequest, VercelResponse } from '@vercel/node';

// Server-side env vars
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN || 'tonic-thought-studios-2.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || '';

// Detect token type (Admin API tokens start with 'shpat_')
const isAdminToken = ACCESS_TOKEN.startsWith('shpat_');

// Admin API uses a different GraphQL query structure
const ADMIN_GRAPHQL_QUERY = `
  query getProducts {
    products(first: 20) {
      edges {
        node {
          id
          title
          description
          handle
          tags
          variants(first: 1) {
            edges {
              node {
                id
                price
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
        }
      }
    }
  }
`;

// Storefront API query (uses 'nodes' instead of 'edges')
const STOREFRONT_GRAPHQL_QUERY = `
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

// Transform Admin API response to match Storefront format
function transformAdminResponse(data: any) {
  if (!data?.data?.products?.edges) return data;
  
  return {
    data: {
      products: {
        nodes: data.data.products.edges.map((edge: any) => {
          const product = edge.node;
          return {
            id: product.id,
            title: product.title,
            description: product.description,
            handle: product.handle,
            tags: product.tags,
            variants: {
              nodes: product.variants.edges.map((ve: any) => ({
                id: ve.node.id,
                price: {
                  amount: ve.node.price,
                  currencyCode: 'USD'
                }
              }))
            },
            images: {
              nodes: product.images.edges.map((ie: any) => ({
                url: ie.node.url
              }))
            }
          };
        })
      }
    }
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Debug mode - return config info
  if (req.query.debug === 'true') {
    return res.status(200).json({
      domain: SHOPIFY_DOMAIN,
      tokenExists: !!ACCESS_TOKEN,
      tokenType: isAdminToken ? 'Admin API' : 'Storefront API',
      tokenPreview: ACCESS_TOKEN ? `${ACCESS_TOKEN.slice(0, 10)}...${ACCESS_TOKEN.slice(-4)}` : 'none',
      tokenLength: ACCESS_TOKEN?.length || 0
    });
  }

  if (!ACCESS_TOKEN) {
    return res.status(200).json({
      error: 'Shopify not configured',
      message: 'Add SHOPIFY_ACCESS_TOKEN to environment variables'
    });
  }

  try {
    // Use different endpoint and headers based on token type
    const endpoint = isAdminToken
      ? `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`
      : `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (isAdminToken) {
      headers['X-Shopify-Access-Token'] = ACCESS_TOKEN;
    } else {
      headers['X-Shopify-Storefront-Access-Token'] = ACCESS_TOKEN;
    }

    const query = isAdminToken ? ADMIN_GRAPHQL_QUERY : STOREFRONT_GRAPHQL_QUERY;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(200).json({
        error: 'Shopify API error',
        status: response.status,
        statusText: response.statusText,
        body: errorText.slice(0, 500),
        endpoint,
        tokenType: isAdminToken ? 'Admin' : 'Storefront'
      });
    }

    let data = await response.json();
    
    // Check for GraphQL errors
    if (data.errors) {
      return res.status(200).json({
        error: 'GraphQL errors',
        errors: data.errors,
        endpoint,
        tokenType: isAdminToken ? 'Admin' : 'Storefront'
      });
    }
    
    // Transform Admin API response to match expected format
    if (isAdminToken && data.data?.products?.edges) {
      data = transformAdminResponse(data);
    }
    
    return res.status(200).json(data);

  } catch (error: any) {
    return res.status(200).json({
      error: 'Exception occurred',
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    });
  }
}
