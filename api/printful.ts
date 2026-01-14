import type { VercelRequest, VercelResponse } from '@vercel/node';

const PRINTFUL_API_URL = 'https://api.printful.com';

// Printful product variant IDs for different print sizes
// These map to actual Printful catalog variants
const PRODUCT_VARIANTS = {
  // Enhanced Matte Paper Posters
  poster_12x18: 1, // Placeholder - need to get actual variant ID
  poster_18x24: 2,
  poster_24x36: 3,
  // Canvas prints
  canvas_12x12: 4,
  canvas_16x20: 5,
  canvas_24x30: 6,
};

// For now, we'll use Printful's poster product (ID: 1) with mockup generator
// Real implementation would use specific variant IDs from Printful catalog

interface PrintfulOrderRequest {
  imageUrl: string;
  productType: string;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state_code: string;
    country_code: string;
    zip: string;
    email: string;
    phone?: string;
  };
  transmissionNumber: number;
  generationId?: string;
}

async function printfulRequest(endpoint: string, method: string, body?: any) {
  const response = await fetch(`${PRINTFUL_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || data.message || 'Printful API error');
  }

  return data;
}

export async function createPrintfulOrder(orderData: PrintfulOrderRequest) {
  const { imageUrl, productType, shippingAddress, transmissionNumber } = orderData;

  // Map our product types to Printful variants
  // Using Enhanced Matte Paper Poster for posters, Canvas for canvas
  // These are example variant IDs - need to be updated with real ones from Printful catalog
  const variantMap: Record<string, { variant_id: number; name: string }> = {
    poster_12x18: { variant_id: 9933, name: 'Poster 12×18' },  // Enhanced Matte Paper Poster
    poster_18x24: { variant_id: 9934, name: 'Poster 18×24' },
    poster_24x36: { variant_id: 9936, name: 'Poster 24×36' },
    canvas_12x12: { variant_id: 5765, name: 'Canvas 12×12' },  // Canvas print
    canvas_16x20: { variant_id: 5766, name: 'Canvas 16×20' },
    canvas_24x30: { variant_id: 5768, name: 'Canvas 24×30' },
  };

  const variant = variantMap[productType];
  if (!variant) {
    throw new Error(`Unknown product type: ${productType}`);
  }

  const orderPayload = {
    recipient: {
      name: shippingAddress.name,
      address1: shippingAddress.address1,
      address2: shippingAddress.address2 || '',
      city: shippingAddress.city,
      state_code: shippingAddress.state_code,
      country_code: shippingAddress.country_code,
      zip: shippingAddress.zip,
      email: shippingAddress.email,
      phone: shippingAddress.phone || '',
    },
    items: [
      {
        variant_id: variant.variant_id,
        quantity: 1,
        name: `Transmission #${transmissionNumber} - ${variant.name}`,
        files: [
          {
            type: 'default',
            url: imageUrl,
          },
        ],
      },
    ],
    retail_costs: {
      currency: 'USD',
    },
  };

  // Create the order (draft by default)
  const result = await printfulRequest('/orders', 'POST', orderPayload);
  return result;
}

export async function confirmPrintfulOrder(orderId: string | number) {
  // Confirm the order to start production
  const result = await printfulRequest(`/orders/${orderId}/confirm`, 'POST');
  return result;
}

export async function getOrderStatus(orderId: string | number) {
  const result = await printfulRequest(`/orders/${orderId}`, 'GET');
  return result;
}

// API endpoint handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Create new order
      const orderData = req.body as PrintfulOrderRequest;
      const result = await createPrintfulOrder(orderData);
      return res.status(200).json(result);
    }

    if (req.method === 'GET') {
      // Get order status
      const { orderId } = req.query;
      if (!orderId || typeof orderId !== 'string') {
        return res.status(400).json({ error: 'Missing orderId' });
      }
      const result = await getOrderStatus(orderId);
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Printful API error:', error);
    return res.status(500).json({
      error: 'Printful API error',
      message: error.message,
    });
  }
}
