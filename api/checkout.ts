import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-18.acacia',
});

// Print product options with pricing
const PRINT_PRODUCTS = {
  poster_12x18: {
    name: 'Poster 12×18"',
    price: 2900, // $29.00
    description: 'Premium matte poster print',
  },
  poster_18x24: {
    name: 'Poster 18×24"',
    price: 3900, // $39.00
    description: 'Premium matte poster print',
  },
  poster_24x36: {
    name: 'Poster 24×36"',
    price: 4900, // $49.00
    description: 'Premium matte poster print',
  },
  canvas_12x12: {
    name: 'Canvas 12×12"',
    price: 5900, // $59.00
    description: 'Gallery-wrapped canvas',
  },
  canvas_16x20: {
    name: 'Canvas 16×20"',
    price: 7900, // $79.00
    description: 'Gallery-wrapped canvas',
  },
  canvas_24x30: {
    name: 'Canvas 24×30"',
    price: 9900, // $99.00
    description: 'Gallery-wrapped canvas',
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      productType,
      imageUrl,
      generationId,
      transmissionNumber,
      customerEmail,
      successUrl,
      cancelUrl,
    } = req.body;

    // Validate product type
    if (!productType || !PRINT_PRODUCTS[productType as keyof typeof PRINT_PRODUCTS]) {
      return res.status(400).json({ error: 'Invalid product type' });
    }

    const product = PRINT_PRODUCTS[productType as keyof typeof PRINT_PRODUCTS];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Transmission #${transmissionNumber} - ${product.name}`,
              description: product.description,
              images: imageUrl ? [imageUrl] : [],
              metadata: {
                generationId,
                transmissionNumber: String(transmissionNumber),
                productType,
              },
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${req.headers.origin}/forge?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin}/forge?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        generationId,
        transmissionNumber: String(transmissionNumber),
        productType,
        imageUrl,
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'BE', 'AT', 'CH'],
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
}

// Export product list for frontend
export { PRINT_PRODUCTS };
