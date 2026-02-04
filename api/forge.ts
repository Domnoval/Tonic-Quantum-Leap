import type { VercelRequest, VercelResponse } from '@vercel/node';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';

// Rate limiting - stored in memory (use Redis/KV in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const FREE_DAILY_LIMIT = 10;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

interface ForgeRequest {
  mode: 'style' | 'remix' | 'inpaint' | 'mashup';
  sourceImages: string[];
  prompt?: string;
  creativity?: number;
  chaos?: number;
  mask?: string; // Base64 encoded mask for inpaint mode
  userToken?: string; // For authenticated users with credits
}

// Model versions on Replicate - UPGRADED TO FLUX
const MODELS = {
  // FLUX Schnell - fast, high quality, ~$0.003/gen
  flux: 'black-forest-labs/flux-schnell',
  // FLUX Dev - slower but highest quality for style work
  fluxDev: 'black-forest-labs/flux-dev',
  // FLUX with image input for img2img/remix
  fluxImg2Img: 'lucataco/flux-dev-lora:a22c463f11808638ad5e2ebd582e07a469031f48dd567366fb4c6fdab91d614d',
  // SDXL Inpainting - still best for surgical edits
  sdxlInpaint: 'stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3',
  // IP-Adapter for actual style transfer (multi-image)
  ipAdapter: 'zsxkib/ip-adapter-image-faceid:96ec5fff5e97aa7cf2c5327db42a11bb066a2d05d1ea5cf82e84ca5e2cd8f2bb',
};

// Get client identifier for rate limiting
function getClientId(req: VercelRequest): string {
  return req.headers['x-forwarded-for']?.toString().split(',')[0] || 
         req.headers['x-real-ip']?.toString() || 
         'anonymous';
}

// Check rate limit
function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientId);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(clientId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: FREE_DAILY_LIMIT - 1, resetIn: RATE_LIMIT_WINDOW };
  }
  
  if (record.count >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: record.resetAt - now };
  }
  
  record.count++;
  return { allowed: true, remaining: FREE_DAILY_LIMIT - record.count, resetIn: record.resetAt - now };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!REPLICATE_API_TOKEN) {
    return res.status(500).json({
      error: 'Forge offline - API token not configured',
      message: 'Add REPLICATE_API_TOKEN to environment variables'
    });
  }

  // Rate limiting check
  const clientId = getClientId(req);
  const rateLimit = checkRateLimit(clientId);
  
  res.setHeader('X-RateLimit-Limit', FREE_DAILY_LIMIT.toString());
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimit.resetIn / 1000).toString());
  
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Daily limit reached',
      message: `You've used all ${FREE_DAILY_LIMIT} free transmissions today. Resets in ${Math.ceil(rateLimit.resetIn / 3600000)} hours.`,
      resetIn: rateLimit.resetIn,
      upgradeUrl: '/apothecary?credits=true' // Link to buy credits
    });
  }

  try {
    const { mode, sourceImages, prompt, creativity = 50, chaos = 30, mask, userToken }: ForgeRequest = req.body;

    if (!sourceImages || sourceImages.length === 0) {
      return res.status(400).json({ error: 'Source images required' });
    }

    let prediction;
    const startTime = Date.now();

    switch (mode) {
      case 'style':
        // Style Alchemy - Use IP-Adapter for true style extraction
        // Falls back to FLUX img2img if only one source
        if (sourceImages.length >= 2) {
          // Multi-image style reference with IP-Adapter
          prediction = await runReplicate({
            version: MODELS.ipAdapter,
            input: {
              image: sourceImages[0],
              ip_adapter_image: sourceImages.slice(0, 3), // Up to 3 style refs
              prompt: prompt || 'A stunning artwork blending the visual essence of the reference images, masterful composition',
              negative_prompt: 'blurry, low quality, distorted, ugly, deformed',
              ip_adapter_weight: 0.6 + (creativity / 100) * 0.3, // 0.6-0.9: style influence
              num_inference_steps: 30,
              guidance_scale: 7.5,
            }
          });
        } else {
          // Single image style - use FLUX img2img
          prediction = await runReplicate({
            version: MODELS.fluxImg2Img,
            input: {
              image: sourceImages[0],
              prompt: prompt || 'A stunning reimagination maintaining the artistic essence and style, masterful digital art',
              strength: 0.3 + (creativity / 100) * 0.5, // 0.3-0.8: lower = more original
              num_inference_steps: 28,
              guidance_scale: 3.5,
            }
          });
        }
        break;

      case 'remix':
        // Corruption/Remix - FLUX img2img for high quality transformation
        prediction = await runReplicate({
          version: MODELS.fluxImg2Img,
          input: {
            image: sourceImages[0],
            prompt: prompt || 'A surreal psychedelic transformation, dreamlike mutation, artistic evolution',
            strength: 0.4 + (creativity / 100) * 0.55, // 0.4-0.95: creativity controls deviation
            num_inference_steps: 28,
            guidance_scale: 3.5 + (chaos / 100) * 2, // 3.5-5.5 based on chaos
          }
        });
        break;

      case 'inpaint':
        // The Surgeon - SDXL inpainting (still the best for surgical edits)
        if (!mask) {
          return res.status(400).json({ error: 'Mask required for inpaint mode' });
        }
        prediction = await runReplicate({
          version: MODELS.sdxlInpaint,
          input: {
            image: sourceImages[0],
            mask: mask,
            prompt: prompt || 'seamless continuation, matching style and lighting perfectly',
            negative_prompt: 'blurry, low quality, obvious edit, mismatched, artifact',
            prompt_strength: 0.85,
            num_inference_steps: 35,
            guidance_scale: 8,
          }
        });
        break;

      case 'mashup':
        // Fusion - Multi-image blend using IP-Adapter or sequential FLUX
        if (sourceImages.length >= 2) {
          // Use IP-Adapter for true multi-image fusion
          prediction = await runReplicate({
            version: MODELS.ipAdapter,
            input: {
              image: sourceImages[0],
              ip_adapter_image: sourceImages.slice(1, 4), // Blend images 2-4
              prompt: `${prompt || 'A surreal fusion of multiple artworks'}, dreamlike blend, cohesive masterpiece, unified composition`,
              negative_prompt: 'blurry, low quality, incoherent, messy, disconnected',
              ip_adapter_weight: 0.5 + (chaos / 100) * 0.4, // 0.5-0.9: chaos controls blend intensity
              num_inference_steps: 35,
              guidance_scale: 7 + (chaos / 100) * 3,
            }
          });
        } else {
          // Fallback for single image
          prediction = await runReplicate({
            version: MODELS.fluxImg2Img,
            input: {
              image: sourceImages[0],
              prompt: prompt || 'A surreal artistic fusion, dreamlike transformation',
              strength: 0.6,
              num_inference_steps: 28,
            }
          });
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid mode' });
    }

    const generationTime = Date.now() - startTime;

    // Return the result
    return res.status(200).json({
      success: true,
      transmissionNumber: Date.now() % 100000,
      resultUrl: prediction.output?.[0] || prediction.output,
      mode,
      sourceImages: sourceImages.length,
      generationTime,
      remaining: rateLimit.remaining,
      limit: FREE_DAILY_LIMIT,
    });

  } catch (error: any) {
    console.error('Forge error:', error);
    return res.status(500).json({
      error: 'Transmission failed',
      message: error.message || 'Unknown error in the Forge',
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

async function runReplicate(params: { version: string; input: Record<string, any> }) {
  // Determine if this is a model name (owner/name) or a versioned model (owner/name:version)
  const hasVersion = params.version.includes(':');
  const [modelPath, versionId] = hasVersion
    ? params.version.split(':')
    : [params.version, null];

  // Use the models endpoint for official models, predictions endpoint for versioned
  const endpoint = hasVersion
    ? 'https://api.replicate.com/v1/predictions'
    : `https://api.replicate.com/v1/models/${modelPath}/predictions`;

  const body = hasVersion
    ? { version: versionId, input: params.input }
    : { input: params.input };

  const startResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait', // Wait for the result synchronously (up to 60s)
    },
    body: JSON.stringify(body),
  });

  if (!startResponse.ok) {
    const errorData = await startResponse.json();
    console.error('Replicate API error:', JSON.stringify(errorData));
    throw new Error(errorData.detail || errorData.error || `Replicate error: ${startResponse.status}`);
  }

  const prediction = await startResponse.json();

  // If the prediction is still processing, poll for completion
  if (prediction.status === 'processing' || prediction.status === 'starting') {
    return await pollForCompletion(prediction.id);
  }

  if (prediction.status === 'failed') {
    throw new Error(prediction.error || 'Generation failed');
  }

  return prediction;
}

async function pollForCompletion(predictionId: string, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      },
    });

    const prediction = await response.json();

    if (prediction.status === 'succeeded') {
      return prediction;
    }

    if (prediction.status === 'failed') {
      throw new Error(prediction.error || 'Generation failed');
    }
  }

  throw new Error('Generation timed out');
}
