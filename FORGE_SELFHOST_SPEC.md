# The Forge - Self-Hosted ComfyUI Architecture

## Why Self-Host?

| Approach | Cost/Gen | Quality | Control | Complexity |
|----------|----------|---------|---------|------------|
| Replicate API | ~$0.003-0.01 | Good | Limited | Low |
| **Self-Hosted ComfyUI** | ~$0.001-0.002 | **Best** | **Full** | Medium |

**Benefits:**
- Near-zero marginal cost per generation
- Full control over workflows, models, and parameters
- True multi-image IP-Adapter/ControlNet support
- Custom LoRAs for your art style
- No rate limits from providers
- Data stays on your infrastructure

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                    (Forge React Component)                       │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       VERCEL EDGE API                            │
│                     /api/forge (existing)                        │
│  - Rate limiting, auth, validation                               │
│  - Routes to GPU backend instead of Replicate                    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GPU BACKEND (RunPod/Vast.ai)                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      ComfyUI Server                          ││
│  │  - FLUX.1 Dev / Schnell                                      ││
│  │  - IP-Adapter (multi-image style)                            ││
│  │  - ControlNet (composition preservation)                     ││
│  │  - Inpainting models                                         ││
│  │  - Custom LoRAs (your art style)                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  GPU: RTX 4090 / A100 / L40S                                    │
│  Cost: ~$0.40-0.80/hr (spot), ~$0.80-1.50/hr (on-demand)       │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE R2 / S3                          │
│               (Generated image storage - cheap)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ComfyUI Workflows

### 1. Style Alchemy (IP-Adapter Multi-Ref)

```json
{
  "name": "style_alchemy",
  "nodes": [
    "LoadImage (base)",
    "LoadImage (style_ref_1)",
    "LoadImage (style_ref_2)", 
    "LoadImage (style_ref_3)",
    "IPAdapter MultiReference",
    "CLIP Text Encode (prompt)",
    "KSampler",
    "VAE Decode",
    "SaveImage"
  ],
  "key_params": {
    "ip_adapter_weight": "0.6-0.9 (from creativity slider)",
    "strength": "0.3-0.8 (from creativity slider)",
    "cfg": "7.5",
    "steps": "28"
  }
}
```

**What it does:** Extracts visual DNA from up to 3 reference images and applies it to a new generation. True style transfer, not just img2img.

### 2. Corruption/Remix (FLUX img2img)

```json
{
  "name": "corruption_remix",
  "nodes": [
    "LoadImage (source)",
    "VAE Encode",
    "FLUX.1 Model",
    "CLIP Text Encode (prompt)",
    "KSampler (denoise from creativity slider)",
    "VAE Decode",
    "SaveImage"
  ],
  "key_params": {
    "denoise": "0.4-0.95 (from creativity slider)",
    "cfg": "3.5-5.5 (from chaos slider)",
    "steps": "28"
  }
}
```

### 3. The Surgeon (Inpainting)

```json
{
  "name": "inpaint_surgeon",
  "nodes": [
    "LoadImage (source)",
    "LoadMask (from canvas)",
    "InpaintModel (SDXL or FLUX inpaint)",
    "CLIP Text Encode (prompt)",
    "KSampler",
    "VAE Decode", 
    "Composite (blend edges)",
    "SaveImage"
  ],
  "key_params": {
    "denoise": "0.85",
    "cfg": "8",
    "steps": "35"
  }
}
```

### 4. Mashup/Fusion (IP-Adapter + ControlNet)

```json
{
  "name": "mashup_fusion",
  "nodes": [
    "LoadImage (base - composition)",
    "LoadImage (style_1)",
    "LoadImage (style_2)",
    "LoadImage (style_3)",
    "ControlNet Preprocessor (depth/canny from base)",
    "IPAdapter MultiReference (from style images)",
    "ControlNet Apply (preserve composition)",
    "CLIP Text Encode (prompt)",
    "KSampler",
    "VAE Decode",
    "SaveImage"
  ],
  "key_params": {
    "ip_adapter_weight": "0.5-0.9 (from chaos slider)",
    "controlnet_strength": "0.3-0.7 (inverse of chaos)",
    "cfg": "7-10",
    "steps": "35"
  }
}
```

**This is the magic** - preserves composition from one image while blending visual style from multiple others.

---

## RunPod Setup

### 1. Create Template

```bash
# Base image with ComfyUI pre-installed
runpod/pytorch:2.1.0-py3.10-cuda12.1.0-devel-ubuntu22.04

# Or use the official ComfyUI template
```

### 2. Models to Download (one-time)

```
models/
├── checkpoints/
│   ├── flux1-dev.safetensors (~12GB)
│   └── flux1-schnell.safetensors (~12GB)
├── clip/
│   ├── clip_l.safetensors
│   └── t5xxl_fp16.safetensors
├── vae/
│   └── ae.safetensors
├── ipadapter/
│   ├── ip-adapter-plus_sdxl_vit-h.safetensors
│   └── ip-adapter-faceid-plusv2_sdxl.safetensors
├── controlnet/
│   ├── controlnet-depth-sdxl-1.0.safetensors
│   └── controlnet-canny-sdxl-1.0.safetensors
└── loras/
    └── tonic_style_v1.safetensors (train on your art!)
```

### 3. API Wrapper

Create a simple FastAPI wrapper around ComfyUI:

```python
# forge_api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import json
import uuid
import boto3  # For R2/S3 upload

app = FastAPI()

class ForgeRequest(BaseModel):
    mode: str  # style, remix, inpaint, mashup
    source_images: list[str]  # Base64 or URLs
    prompt: str = ""
    creativity: int = 50
    chaos: int = 30
    mask: str = None

WORKFLOWS = {
    "style": "workflows/style_alchemy.json",
    "remix": "workflows/corruption_remix.json",
    "inpaint": "workflows/inpaint_surgeon.json",
    "mashup": "workflows/mashup_fusion.json",
}

@app.post("/forge")
async def forge(req: ForgeRequest):
    workflow_path = WORKFLOWS.get(req.mode)
    if not workflow_path:
        raise HTTPException(400, "Invalid mode")
    
    # Load and customize workflow
    with open(workflow_path) as f:
        workflow = json.load(f)
    
    # Inject images and parameters
    workflow = inject_params(workflow, req)
    
    # Queue in ComfyUI
    result = await queue_and_wait(workflow)
    
    # Upload to R2/S3
    image_url = upload_to_storage(result["image_path"])
    
    return {
        "success": True,
        "resultUrl": image_url,
        "transmissionNumber": uuid.uuid4().hex[:8]
    }
```

### 4. Network Configuration

```
ComfyUI Server: localhost:8188
FastAPI Wrapper: 0.0.0.0:8000 (exposed via RunPod)

Vercel API → RunPod Serverless Endpoint / Persistent Pod
```

---

## Cost Analysis

### RunPod Spot Instance (RTX 4090)

- **Hourly cost:** ~$0.40-0.50/hr
- **Gen time:** ~10-15 seconds per image
- **Gens per hour:** ~240-360
- **Cost per gen:** ~$0.001-0.002

### If running 24/7:

- **Daily cost:** ~$10-12
- **Gens supported:** ~8,600/day
- **Break-even vs Replicate:** ~1,200 gens/day

### Serverless Option (scale to zero):

- RunPod Serverless: Pay only when generating
- Cold start: ~30s (pre-warm with cron)
- Cost: ~$0.003-0.005/gen (still cheaper than Replicate)

---

## Implementation Phases

### Phase 1: Immediate (Done ✓)
- [x] Upgrade to FLUX models on Replicate
- [x] Add rate limiting (10 free/day)
- [x] UI feedback for limits

### Phase 2: Short Term (1-2 weeks)
- [ ] Add credits system (Stripe integration exists)
- [ ] Persistent rate limits via Supabase
- [ ] User accounts for credit balance

### Phase 3: Self-Host (2-4 weeks)
- [ ] Set up RunPod template with ComfyUI
- [ ] Download and configure models
- [ ] Build FastAPI wrapper
- [ ] Create ComfyUI workflows for each mode
- [ ] Switch Vercel API to use RunPod backend
- [ ] Add fallback to Replicate if RunPod down

### Phase 4: Custom Model Training
- [ ] Collect your best Void pieces
- [ ] Train LoRA on your art style
- [ ] Add "Tonic Style" mode that generates in YOUR aesthetic

---

## Security Considerations

1. **API Key Protection**
   - RunPod endpoint behind auth
   - Rotate keys regularly

2. **Input Validation**
   - Max image size (5MB)
   - Max images per request (4)
   - Sanitize prompts

3. **Rate Limiting** (already implemented)
   - IP-based for anonymous
   - Account-based for registered

4. **Cost Controls**
   - Max concurrent generations
   - Daily spend cap alerts
   - Auto-pause if budget exceeded

---

## Next Steps

1. **Test current FLUX upgrade** - verify quality improvement
2. **Set up Supabase tables** for persistent rate limits + credits
3. **Create RunPod account** and test ComfyUI template
4. **Build one workflow** (start with remix - simplest)
5. **Benchmark** cost vs quality vs Replicate

---

## Resources

- [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI)
- [RunPod Docs](https://docs.runpod.io/)
- [IP-Adapter ComfyUI](https://github.com/cubiq/ComfyUI_IPAdapter_plus)
- [FLUX in ComfyUI](https://comfyanonymous.github.io/ComfyUI_examples/flux/)
- [LoRA Training](https://github.com/kohya-ss/sd-scripts)
