import type { VercelRequest, VercelResponse } from '@vercel/node';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';

interface ForgeRequest {
  mode: 'style' | 'remix' | 'inpaint' | 'mashup';
  sourceImages: string[];
  prompt?: string;
  creativity?: number;
  chaos?: number;
  mask?: string; // Base64 encoded mask for inpaint mode
}

// Model versions on Replicate
const MODELS = {
  // Flux Schnell for fast generation
  flux: 'black-forest-labs/flux-schnell',
  // Stable Diffusion for img2img and inpainting
  sdxl: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  // IP-Adapter for style reference
  ipAdapter: 'lucataco/ip-adapter-faceid-sdxl:87e62271a0f014d34e93a1c8e1d978f8adb01ae22eab36cdce79620a86da9f8f',
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

  if (!REPLICATE_API_TOKEN) {
    return res.status(500).json({
      error: 'Forge offline - API token not configured',
      message: 'Add REPLICATE_API_TOKEN to environment variables'
    });
  }

  try {
    const { mode, sourceImages, prompt, creativity = 50, chaos = 30, mask }: ForgeRequest = req.body;

    if (!sourceImages || sourceImages.length === 0) {
      return res.status(400).json({ error: 'Source images required' });
    }

    let prediction;

    switch (mode) {
      case 'style':
        // Style transfer using IP-Adapter or img2img with style reference
        prediction = await runReplicate({
          version: MODELS.flux,
          input: {
            prompt: prompt || 'A surreal digital artwork in the style of the reference',
            go_fast: true,
            guidance: 3.5 + (creativity / 100) * 3, // 3.5-6.5 based on creativity
            num_outputs: 1,
            aspect_ratio: '1:1',
            output_format: 'webp',
            output_quality: 90,
            num_inference_steps: 4,
          }
        });
        break;

      case 'remix':
        // img2img transformation
        prediction = await runReplicate({
          version: MODELS.sdxl,
          input: {
            image: sourceImages[0],
            prompt: prompt || 'A surreal transformation of this image, psychedelic digital art',
            negative_prompt: 'blurry, low quality, distorted',
            prompt_strength: creativity / 100, // How much to deviate from original
            num_inference_steps: 30,
            guidance_scale: 7.5 + (chaos / 100) * 5,
            scheduler: 'K_EULER',
          }
        });
        break;

      case 'inpaint':
        // Inpainting with mask
        if (!mask) {
          return res.status(400).json({ error: 'Mask required for inpaint mode' });
        }
        prediction = await runReplicate({
          version: MODELS.sdxl,
          input: {
            image: sourceImages[0],
            mask: mask,
            prompt: prompt || 'seamless fill, matching style',
            negative_prompt: 'blurry, low quality, obvious edit',
            prompt_strength: 0.8,
            num_inference_steps: 30,
            guidance_scale: 7.5,
          }
        });
        break;

      case 'mashup':
        // Multi-image fusion - use first as base with style from others
        const mashupPrompt = `${prompt || 'A fusion of these images'}, surreal blend, digital art mashup`;
        prediction = await runReplicate({
          version: MODELS.flux,
          input: {
            prompt: mashupPrompt,
            go_fast: true,
            guidance: 4 + (chaos / 100) * 4,
            num_outputs: 1,
            aspect_ratio: '1:1',
            output_format: 'webp',
            output_quality: 90,
            num_inference_steps: 4,
          }
        });
        break;

      default:
        return res.status(400).json({ error: 'Invalid mode' });
    }

    // Return the result
    return res.status(200).json({
      success: true,
      transmissionNumber: Date.now() % 100000,
      resultUrl: prediction.output?.[0] || prediction.output,
      mode,
      sourceImages: sourceImages.length,
    });

  } catch (error: any) {
    console.error('Forge error:', error);
    return res.status(500).json({
      error: 'Transmission failed',
      message: error.message || 'Unknown error in the Forge'
    });
  }
}

async function runReplicate(params: { version: string; input: Record<string, any> }) {
  // Start the prediction
  const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait', // Wait for the result synchronously (up to 60s)
    },
    body: JSON.stringify({
      version: params.version.includes(':')
        ? params.version.split(':')[1]
        : undefined,
      model: params.version.includes(':')
        ? undefined
        : params.version,
      input: params.input,
    }),
  });

  if (!startResponse.ok) {
    const errorData = await startResponse.json();
    throw new Error(errorData.detail || 'Failed to start generation');
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
