import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple email notification using Resend (or fallback to webhook)
// Set RESEND_API_KEY and NOTIFY_EMAIL in Vercel env vars

interface PurchaseRequest {
  productType: string;
  productName: string;
  price: number;
  imageUrl: string;
  transmissionNumber: number;
  customerEmail?: string;
  customerName?: string;
  timestamp: string;
}

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
      productName,
      price,
      imageUrl,
      transmissionNumber,
      customerEmail,
      customerName,
    } = req.body;

    const purchaseRequest: PurchaseRequest = {
      productType,
      productName,
      price,
      imageUrl,
      transmissionNumber,
      customerEmail,
      customerName,
      timestamp: new Date().toISOString(),
    };

    const notifyEmail = process.env.NOTIFY_EMAIL || 'hello@tonicthoughtstudios.com';
    const resendKey = process.env.RESEND_API_KEY;

    // If Resend is configured, send email
    if (resendKey) {
      const emailHtml = `
        <div style="font-family: monospace; background: #0a0a0a; color: #fff; padding: 40px; max-width: 600px;">
          <div style="border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="font-family: Georgia, serif; font-style: italic; font-weight: normal; margin: 0; font-size: 28px;">
              ≡ƒÄ¿ New Purchase Request
            </h1>
            <p style="color: #f59e0b; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px;">
              Someone wants to buy your art
            </p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <img src="${imageUrl}" alt="Transmission #${transmissionNumber}" 
                 style="width: 100%; max-width: 400px; border: 1px solid #333;" />
          </div>
          
          <table style="width: 100%; font-size: 13px; color: #ccc;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Transmission</td>
              <td style="padding: 8px 0; text-align: right; color: #f59e0b;">#${transmissionNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Product</td>
              <td style="padding: 8px 0; text-align: right;">${productName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Price</td>
              <td style="padding: 8px 0; text-align: right; color: #22c55e; font-weight: bold;">$${(price / 100).toFixed(0)}</td>
            </tr>
            ${customerEmail ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Customer Email</td>
              <td style="padding: 8px 0; text-align: right;">${customerEmail}</td>
            </tr>
            ` : ''}
            ${customerName ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Customer Name</td>
              <td style="padding: 8px 0; text-align: right;">${customerName}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #666;">Time</td>
              <td style="padding: 8px 0; text-align: right; font-size: 11px;">${purchaseRequest.timestamp}</td>
            </tr>
          </table>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
            <p style="font-size: 11px; color: #666; margin: 0;">
              This person tried to purchase while checkout was in preview mode.
              <br/>Reach out to them directly to complete the sale.
            </p>
          </div>
        </div>
      `;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '137 Studio <noreply@tonicthoughtstudios.com>',
          to: [notifyEmail],
          subject: `≡ƒÆ░ Purchase Request: Transmission #${transmissionNumber} - $${(price / 100).toFixed(0)}`,
          html: emailHtml,
        }),
      });

      console.log('Email sent via Resend');
    } else {
      // Fallback: log to console (visible in Vercel logs)
      console.log('=== PURCHASE REQUEST ===');
      console.log(JSON.stringify(purchaseRequest, null, 2));
      console.log('========================');
    }

    return res.status(200).json({
      success: true,
      message: 'The artist has been notified of your interest.',
      reference: `TTS-${transmissionNumber}-${Date.now().toString(36).toUpperCase()}`,
    });
  } catch (error: any) {
    console.error('Notify error:', error);
    return res.status(500).json({
      error: 'Failed to send notification',
      message: error.message,
    });
  }
}
