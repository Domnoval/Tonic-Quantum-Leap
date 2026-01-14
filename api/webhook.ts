import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createPrintfulOrder, confirmPrintfulOrder } from './printful';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-18.acacia',
});

// Stripe webhook secret - get this from Stripe Dashboard > Webhooks
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false, // Required for webhook signature verification
  },
};

async function buffer(readable: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;

    if (webhookSecret) {
      // Verify webhook signature in production
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } else {
      // In development, parse without verification
      event = JSON.parse(buf.toString()) as Stripe.Event;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.error('Payment failed:', failedPayment.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.status(200).json({ received: true });
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  console.log('Processing successful payment:', session.id);

  const {
    generationId,
    transmissionNumber,
    productType,
    imageUrl,
  } = session.metadata || {};

  if (!productType || !imageUrl || !transmissionNumber) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  // Get shipping details from session
  const shippingDetails = session.shipping_details;
  if (!shippingDetails?.address) {
    console.error('No shipping address in session:', session.id);
    return;
  }

  try {
    // Create Printful order
    const printfulOrder = await createPrintfulOrder({
      imageUrl,
      productType,
      transmissionNumber: parseInt(transmissionNumber, 10),
      generationId,
      shippingAddress: {
        name: shippingDetails.name || 'Customer',
        address1: shippingDetails.address.line1 || '',
        address2: shippingDetails.address.line2 || undefined,
        city: shippingDetails.address.city || '',
        state_code: shippingDetails.address.state || '',
        country_code: shippingDetails.address.country || 'US',
        zip: shippingDetails.address.postal_code || '',
        email: session.customer_email || '',
      },
    });

    console.log('Printful order created:', printfulOrder.result?.id);

    // Auto-confirm the order to start production
    if (printfulOrder.result?.id) {
      const confirmed = await confirmPrintfulOrder(printfulOrder.result.id);
      console.log('Printful order confirmed:', confirmed.result?.id);
    }

    // TODO: Update database with order status
    // await updatePurchaseRecord(generationId, {
    //   printful_order_id: printfulOrder.result?.id,
    //   status: 'paid',
    // });

  } catch (error) {
    console.error('Failed to create Printful order:', error);
    // TODO: Send alert/notification about failed order
    // The payment succeeded but fulfillment failed - needs manual intervention
  }
}
