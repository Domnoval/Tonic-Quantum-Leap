import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    message: 'API is working!',
    time: new Date().toISOString(),
    env: {
      shopifyDomain: process.env.SHOPIFY_DOMAIN || 'not set',
      shopifyTokenExists: !!process.env.SHOPIFY_ACCESS_TOKEN,
      shopifyTokenPreview: process.env.SHOPIFY_ACCESS_TOKEN 
        ? `${process.env.SHOPIFY_ACCESS_TOKEN.slice(0, 10)}...` 
        : 'none'
    }
  });
}
