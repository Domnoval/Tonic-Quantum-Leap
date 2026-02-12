/**
 * ComfyUI Service - Direct API communication with local ComfyUI instance
 * Replaces the Replicate-based api/forge.ts for local development
 * 
 * ComfyUI API: http://127.0.0.1:8188
 * Proxied via Vite dev server at /comfyui
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ForgeMode = 'reimagine' | 'style' | 'blend';
export type Intensity = 'subtle' | 'medium' | 'wild' | 'chaos';

export interface SourceImage {
  id: string;
  src: string;       // URL or blob URL
  name: string;
  type: 'void' | 'upload';
}

export interface GeneratedImage {
  id: string;
  src: string;        // full URL to the output image
  prompt: string;
  mode: ForgeMode;
  intensity: Intensity;
  sourceImages: string[];
  timestamp: number;
}

export interface GenerationRequest {
  mode: ForgeMode;
  sourceImages: SourceImage[];
  prompt: string;
  intensity: Intensity;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Base URL – routed through Vite proxy to avoid CORS issues */
const COMFY_BASE = '/comfyui';

/** Denoise strength mapping per mode × intensity */
const DENOISE_MAP: Record<ForgeMode, Record<Intensity, number>> = {
  reimagine: { subtle: 0.35, medium: 0.55, wild: 0.75, chaos: 0.85 },
  style:     { subtle: 0.30, medium: 0.40, wild: 0.50, chaos: 0.55 },
  // NOTE: Style transfer currently uses img2img with low denoise.
  // When IP-Adapter for Flux becomes available, swap to that for true style reference.
  blend:     { subtle: 0.40, medium: 0.55, wild: 0.70, chaos: 0.80 },
};

const NEGATIVE_PROMPT = 'blurry, low quality, distorted, ugly, deformed';

// Model filenames as they appear in ComfyUI's model directories
const MODELS = {
  unet: 'flux1-dev.safetensors',          // diffusion_models/
  clipL: 'clip_l.safetensors',             // clip/
  t5xxl: 't5xxl_fp8_e4m3fn.safetensors',  // clip/
  vae: 'ae.safetensors',                   // vae/
} as const;

// ---------------------------------------------------------------------------
// Workflow builders
// ---------------------------------------------------------------------------

/**
 * Build a ComfyUI workflow JSON for img2img (used by all 3 modes when source exists).
 * Node IDs are string numbers as ComfyUI expects.
 */
function buildImg2ImgWorkflow(
  imageName: string,
  positivePrompt: string,
  negativePrompt: string,
  denoise: number,
  seed?: number,
): Record<string, any> {
  const s = seed ?? Math.floor(Math.random() * 2 ** 32);

  return {
    // 1 - Load source image (must be uploaded to ComfyUI first)
    '1': {
      class_type: 'LoadImage',
      inputs: { image: imageName },
    },
    // 2 - Load UNET (Flux Dev)
    '2': {
      class_type: 'UNETLoader',
      inputs: {
        unet_name: MODELS.unet,
        weight_dtype: 'default',
      },
    },
    // 3 - Dual CLIP Loader
    '3': {
      class_type: 'DualCLIPLoader',
      inputs: {
        clip_name1: MODELS.clipL,
        clip_name2: MODELS.t5xxl,
        type: 'flux',
      },
    },
    // 4 - VAE Loader
    '4': {
      class_type: 'VAELoader',
      inputs: { vae_name: MODELS.vae },
    },
    // 5 - CLIP Text Encode (positive)
    '5': {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: positivePrompt,
        clip: ['3', 0],
      },
    },
    // 6 - CLIP Text Encode (negative)
    '6': {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: negativePrompt,
        clip: ['3', 0],
      },
    },
    // 7 - VAE Encode source image
    '7': {
      class_type: 'VAEEncode',
      inputs: {
        pixels: ['1', 0],
        vae: ['4', 0],
      },
    },
    // 8 - KSampler
    '8': {
      class_type: 'KSampler',
      inputs: {
        model: ['2', 0],
        positive: ['5', 0],
        negative: ['6', 0],
        latent_image: ['7', 0],
        seed: s,
        steps: 25,
        cfg: 3.5,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: denoise,
      },
    },
    // 9 - VAE Decode
    '9': {
      class_type: 'VAEDecode',
      inputs: {
        samples: ['8', 0],
        vae: ['4', 0],
      },
    },
    // 10 - Save Image
    '10': {
      class_type: 'SaveImage',
      inputs: {
        images: ['9', 0],
        filename_prefix: 'forge',
      },
    },
  };
}

/**
 * Build a text-to-image workflow (no source image).
 * Uses EmptyLatentImage at 1024×1024.
 */
function buildTxt2ImgWorkflow(
  positivePrompt: string,
  negativePrompt: string,
  seed?: number,
): Record<string, any> {
  const s = seed ?? Math.floor(Math.random() * 2 ** 32);

  return {
    '1': {
      class_type: 'UNETLoader',
      inputs: {
        unet_name: MODELS.unet,
        weight_dtype: 'default',
      },
    },
    '2': {
      class_type: 'DualCLIPLoader',
      inputs: {
        clip_name1: MODELS.clipL,
        clip_name2: MODELS.t5xxl,
        type: 'flux',
      },
    },
    '3': {
      class_type: 'VAELoader',
      inputs: { vae_name: MODELS.vae },
    },
    '4': {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: positivePrompt,
        clip: ['2', 0],
      },
    },
    '5': {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: negativePrompt,
        clip: ['2', 0],
      },
    },
    '6': {
      class_type: 'EmptyLatentImage',
      inputs: { width: 1024, height: 1024, batch_size: 1 },
    },
    '7': {
      class_type: 'KSampler',
      inputs: {
        model: ['1', 0],
        positive: ['4', 0],
        negative: ['5', 0],
        latent_image: ['6', 0],
        seed: s,
        steps: 25,
        cfg: 3.5,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1.0,
      },
    },
    '8': {
      class_type: 'VAEDecode',
      inputs: {
        samples: ['7', 0],
        vae: ['3', 0],
      },
    },
    '9': {
      class_type: 'SaveImage',
      inputs: {
        images: ['8', 0],
        filename_prefix: 'forge',
      },
    },
  };
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

/**
 * Upload an image to ComfyUI so it can be referenced in workflows.
 * Returns the filename ComfyUI assigned.
 */
async function uploadImage(imageUrl: string, filename: string): Promise<string> {
  // Fetch the image bytes from the local dev server (or blob URL)
  const imgResponse = await fetch(imageUrl);
  if (!imgResponse.ok) throw new Error(`Failed to fetch source image (${imgResponse.status}): ${imageUrl}`);
  const arrayBuffer = await imgResponse.arrayBuffer();

  // Determine MIME type from the response or filename
  const contentType = imgResponse.headers.get('content-type') || 
    (filename.endsWith('.png') ? 'image/png' : 'image/jpeg');
  
  // Ensure we have a proper image extension on the filename
  const ext = contentType.includes('png') ? '.png' : '.jpg';
  const uploadName = filename.endsWith(ext) ? filename : filename.replace(/\.[^.]+$/, ext);

  const blob = new Blob([arrayBuffer], { type: contentType });
  const formData = new FormData();
  formData.append('image', blob, uploadName);
  formData.append('overwrite', 'true');

  const res = await fetch(`${COMFY_BASE}/upload/image`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '(no response body)');
    throw new Error(`ComfyUI upload failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  // ComfyUI returns { name, subfolder, type }
  return data.name as string;
}

/** Queue a workflow prompt and return the prompt_id */
async function queuePrompt(workflow: Record<string, any>): Promise<string> {
  const res = await fetch(`${COMFY_BASE}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ComfyUI prompt queue failed: ${text}`);
  }

  const data = await res.json();
  return data.prompt_id as string;
}

/** Poll history until the prompt completes. Returns output image info. */
async function pollHistory(
  promptId: string,
  onProgress?: (elapsed: number) => void,
  maxWaitMs = 300_000,
): Promise<{ filename: string; subfolder: string; type: string }[]> {
  const start = Date.now();
  const interval = 1500; // poll every 1.5s

  while (Date.now() - start < maxWaitMs) {
    onProgress?.(Math.round((Date.now() - start) / 1000));

    const res = await fetch(`${COMFY_BASE}/history/${promptId}`);
    if (!res.ok) {
      await sleep(interval);
      continue;
    }

    const history = await res.json();
    const entry = history[promptId];

    if (!entry) {
      await sleep(interval);
      continue;
    }

    // Check if there's an error
    if (entry.status?.status_str === 'error') {
      throw new Error('ComfyUI generation failed – check the ComfyUI console for details');
    }

    // Look for output images in any node
    if (entry.outputs) {
      for (const nodeId of Object.keys(entry.outputs)) {
        const nodeOut = entry.outputs[nodeId];
        if (nodeOut.images && nodeOut.images.length > 0) {
          return nodeOut.images;
        }
      }
    }

    await sleep(interval);
  }

  throw new Error('Generation timed out (5 min)');
}

/** Build a full URL to view a ComfyUI output image (via proxy) */
function buildImageUrl(img: { filename: string; subfolder: string; type: string }): string {
  const params = new URLSearchParams({
    filename: img.filename,
    subfolder: img.subfolder || '',
    type: img.type || 'output',
  });
  return `${COMFY_BASE}/view?${params.toString()}`;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check if ComfyUI is reachable.
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${COMFY_BASE}/system_stats`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Generate an image through the Forge.
 * 
 * @param request  - generation parameters
 * @param onProgress - optional callback receiving elapsed seconds
 * @returns GeneratedImage with a URL to the result
 */
export async function generate(
  request: GenerationRequest,
  onProgress?: (elapsed: number) => void,
): Promise<GeneratedImage> {
  const { mode, sourceImages, prompt, intensity } = request;
  const denoise = DENOISE_MAP[mode][intensity];

  let workflow: Record<string, any>;

  if (sourceImages.length === 0) {
    // Text-to-image fallback
    workflow = buildTxt2ImgWorkflow(prompt || 'abstract digital art', NEGATIVE_PROMPT);
  } else {
    // Upload the primary source image to ComfyUI
    const primarySrc = sourceImages[0];
    const uploadFilename = `forge_source_${Date.now()}.png`;
    const comfyFilename = await uploadImage(primarySrc.src, uploadFilename);

    // Build prompt text
    let fullPrompt = prompt || '';

    if (mode === 'blend' && sourceImages.length > 1) {
      // For blend mode, append descriptions of additional images to the prompt
      // (since we can only use one image as the img2img base)
      const extras = sourceImages.slice(1).map(s => s.name).join(', ');
      fullPrompt = `${fullPrompt}. Blend with elements from: ${extras}`.trim();
    }

    if (!fullPrompt) {
      fullPrompt = mode === 'reimagine'
        ? 'reimagined version of this artwork, enhanced detail'
        : mode === 'style'
        ? 'new artwork inspired by this style'
        : 'blended fusion of multiple artworks';
    }

    workflow = buildImg2ImgWorkflow(comfyFilename, fullPrompt, NEGATIVE_PROMPT, denoise);
  }

  // Queue and wait
  const promptId = await queuePrompt(workflow);
  const outputImages = await pollHistory(promptId, onProgress);

  if (outputImages.length === 0) {
    throw new Error('No output images received');
  }

  const resultUrl = buildImageUrl(outputImages[0]);

  return {
    id: promptId,
    src: resultUrl,
    prompt: request.prompt,
    mode: request.mode,
    intensity: request.intensity,
    sourceImages: sourceImages.map(s => s.src),
    timestamp: Date.now(),
  };
}
