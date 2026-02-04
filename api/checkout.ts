import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Print product options with pricing (80% margin)
const PRINT_PRODUCTS = {
  poster_12x18: {
    name: 'Poster 12×18"',
    price: 6500, // $65.00 (cost ~$13)
    description: 'Enhanced matte paper, museum-quality',
  },
  poster_18x24: {
    name: 'Poster 18×24"',
    price: 8000, // $80.00 (cost ~$16)
    description: 'Enhanced matte paper, museum-quality',
  },
  poster_24x36: {
    name: 'Poster 24×36"',
    price: 10500, // $105.00 (cost ~$21)
    description: 'Enhanced matte paper, museum-quality',
  },
  canvas_12x12: {
    name: 'Canvas 12×12"',
    price: 12500, // $125.00 (cost ~$25)
    description: 'Gallery-wrapped, 1.5" deep frame',
  },
  canvas_16x20: {
    name: 'Canvas 16×20"',
    price: 17500, // $175.00 (cost ~$35)
    description: 'Gallery-wrapped, 1.5" deep frame',
  },
  canvas_24x30: {
    name: 'Canvas 24×30"',
    price: 27500, // $275.00 (cost ~$55)
    description: 'Gallery-wrapped, 1.5" deep frame',
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
