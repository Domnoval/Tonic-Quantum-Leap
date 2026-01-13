# The Void Forge - System Architecture

## Overview

A generative art platform where visitors remix Tonic Thought's Void gallery images using AI, purchase prints, and optionally submit to the Hall of Transmissions for community sales with 50/50 profit split.

---

## User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                         THE FORGE                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Style Ref   │  │  Inpaint    │  │   Mashup    │  + more     │
│  │   Mode      │  │   Mode      │  │    Mode     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                          ↓                                       │
│                   [ GENERATE ]                                   │
│                          ↓                                       │
│              ┌─────────────────────┐                            │
│              │   Preview Result    │                            │
│              │   "Transmission     │                            │
│              │    #4,847"          │                            │
│              └─────────────────────┘                            │
│                          ↓                                       │
│              ┌─────────────────────┐                            │
│              │   PURCHASE PRINT    │ ←── Printful integration   │
│              │   $XX.XX            │                            │
│              └─────────────────────┘                            │
│                          ↓                                       │
│              ┌─────────────────────┐                            │
│              │ SUBMIT TO HALL? (Y) │ ←── Unlocked by purchase   │
│              │ 1 submission earned │                            │
│              └─────────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                  HALL OF TRANSMISSIONS                           │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│  │ Art │ │ Art │ │ Art │ │ Art │ │ Art │ │ Art │              │
│  │ $30 │ │ $45 │ │ $30 │ │ $60 │ │ $30 │ │ $45 │              │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘              │
│                                                                  │
│  Anyone can browse & buy → 50% to creator, 50% to Tonic        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Generation Modes

### 1. Style Alchemy
- Select 1-3 Void images as style reference
- Enter text prompt
- AI generates new image in that style
- Uses: IP-Adapter / Style embedding

### 2. Corruption/Remix
- Select 1 Void image as base
- Creativity slider (0-100%)
- Optional guiding prompt
- Uses: img2img with variable denoising

### 3. Inpainting (The Surgeon)
- Load any Void image
- Brush tool to create mask
- Prompt what fills the masked area
- Uses: Inpainting model

### 4. Erasure
- Brush to select areas
- AI removes and fills naturally
- Uses: Inpainting with empty prompt

### 5. Mashup/Blend
- Select 2-4 Void images
- AI fuses them together
- Optional prompt to guide fusion
- Uses: Multi-image conditioning

### 6. Manual Collage (No AI)
- Layer-based canvas editor
- Drag Void images as layers
- Blend modes, opacity, transforms
- Glitch effects, filters
- Pure composition tool

---

## Tech Stack

### Frontend
- React + TypeScript (existing Vite setup)
- Canvas API for editor
- Fabric.js or Konva.js for layer management
- TailwindCSS (existing)

### Backend (New)
- Node.js + Express OR Next.js API routes
- PostgreSQL (Supabase for easy setup)
- Redis for session/generation queue (optional)

### External Services
- **AI Generation**: Replicate (Flux) or Fal.ai
- **Image Storage**: Cloudinary or Supabase Storage
- **Payments**: Stripe + Stripe Connect (for payouts)
- **Print Fulfillment**: Printful API
- **Auth**: Supabase Auth or simple email magic links

---

## Database Schema

```sql
-- Users (creators who want payouts)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  stripe_connect_id VARCHAR(255),
  payout_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- All generated images (even unpurchased)
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255), -- for anonymous users

  -- Generation details
  mode VARCHAR(50) NOT NULL, -- style_alchemy, inpaint, mashup, etc.
  source_images TEXT[], -- array of void image paths used
  prompt TEXT,
  settings JSONB, -- creativity, chaos, seed, etc.

  -- Result
  result_url VARCHAR(500),
  thumbnail_url VARCHAR(500),

  -- Metadata
  transmission_number SERIAL, -- "Transmission #4,847"
  created_at TIMESTAMP DEFAULT NOW()
);

-- Purchases (unlocks Hall submission)
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  generation_id UUID REFERENCES generations(id) NOT NULL,

  -- Printful
  printful_order_id VARCHAR(255),
  product_type VARCHAR(100), -- poster, canvas, etc.

  -- Payment
  amount_cents INTEGER NOT NULL,
  stripe_payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',

  -- Hall unlock
  hall_submission_unlocked BOOLEAN DEFAULT FALSE,
  hall_submission_used BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Hall of Transmissions (approved community pieces)
CREATE TABLE hall_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  generation_id UUID REFERENCES generations(id) NOT NULL,
  purchase_id UUID REFERENCES purchases(id) NOT NULL, -- proof of purchase

  -- Display info
  title VARCHAR(200),
  description TEXT,

  -- Pricing
  price_cents INTEGER NOT NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  featured BOOLEAN DEFAULT FALSE,

  -- Stats
  view_count INTEGER DEFAULT 0,

  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sales from Hall pieces
CREATE TABLE hall_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES hall_submissions(id) NOT NULL,

  -- Buyer
  buyer_email VARCHAR(255) NOT NULL,

  -- Printful
  printful_order_id VARCHAR(255),
  product_type VARCHAR(100),

  -- Money
  total_cents INTEGER NOT NULL,
  creator_cut_cents INTEGER NOT NULL, -- 50%
  platform_cut_cents INTEGER NOT NULL, -- 50%

  stripe_payment_id VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW()
);

-- Payout tracking
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  amount_cents INTEGER NOT NULL,

  stripe_transfer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',

  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);
```

---

## API Endpoints

### Generation
```
POST /api/forge/generate
  body: { mode, sourceImages[], prompt, settings }
  returns: { generationId, resultUrl, transmissionNumber }

GET /api/forge/generations/:id
  returns: { generation details }

GET /api/void/images
  returns: { images[] } -- all available Void images for remixing
```

### Purchase
```
POST /api/purchase/create-checkout
  body: { generationId, productType }
  returns: { stripeCheckoutUrl }

POST /api/purchase/webhook (Stripe webhook)
  handles: payment confirmation, Printful order creation

GET /api/purchase/:id/status
  returns: { status, printfulStatus, hallUnlocked }
```

### Hall of Transmissions
```
GET /api/hall
  returns: { submissions[] } -- public gallery

POST /api/hall/submit
  body: { generationId, purchaseId, title, description, priceCents }
  requires: auth + valid purchase

GET /api/hall/:id
  returns: { submission details }

POST /api/hall/:id/purchase
  body: { email, productType }
  returns: { stripeCheckoutUrl }
```

### User/Auth
```
POST /api/auth/magic-link
  body: { email }
  sends magic link email

GET /api/auth/verify?token=xxx
  verifies and creates session

GET /api/user/profile
  returns: { user, earnings, submissions }

POST /api/user/connect-stripe
  initiates Stripe Connect onboarding
```

---

## Printful Integration

### Product Types (example)
- Poster 12x18" - $15 base
- Poster 18x24" - $20 base
- Canvas 16x20" - $45 base
- Canvas 24x36" - $75 base

### Markup Strategy
- Base cost + 100% markup = Sale price
- Example: $15 poster → $30 sale price
- Hall sales: $30 → $15 to creator, $15 to platform
  - Platform covers Printful base cost from their cut

### API Flow
1. User purchases → Stripe payment
2. Webhook confirms payment
3. Server calls Printful API to create order
4. Printful prints & ships directly to customer
5. Track order status via Printful webhooks

---

## AI Generation Integration

### Recommended: Replicate API

```javascript
// Style Alchemy example
const output = await replicate.run(
  "lucataco/flux-dev-lora:xxx", // or IP-Adapter model
  {
    input: {
      prompt: userPrompt,
      image: voidImageUrl, // style reference
      style_strength: 0.8,
      num_outputs: 1,
    }
  }
);

// Inpainting example
const output = await replicate.run(
  "stability-ai/stable-diffusion-inpainting:xxx",
  {
    input: {
      prompt: userPrompt,
      image: baseImageUrl,
      mask: userMaskDataUrl,
    }
  }
);
```

### Cost Estimation
- ~$0.005 per generation average
- Budget $0.05 per user session (10 generations)
- Could limit free generations, charge for more

---

## MVP Phases

### Phase 1: The Forge (Proof of Concept)
- [ ] Canvas UI with Void image browser
- [ ] 1-2 generation modes working
- [ ] Save/preview results
- [ ] No purchase yet, just generation

### Phase 2: Purchase Flow
- [ ] Stripe checkout integration
- [ ] Printful order creation
- [ ] Basic user accounts (email)
- [ ] Purchase confirmation

### Phase 3: Hall of Transmissions
- [ ] Submission flow
- [ ] Public gallery
- [ ] Hall purchases
- [ ] Profit split tracking

### Phase 4: Payouts
- [ ] Stripe Connect integration
- [ ] Creator dashboards
- [ ] Automated payouts

### Phase 5: Polish
- [ ] Hidden dimensions / easter eggs
- [ ] Advanced generation modes
- [ ] Mobile optimization
- [ ] Analytics

---

## Security Considerations

- Rate limit generation API (prevent abuse)
- Validate image sources (only allow Void images)
- NSFW filtering on AI outputs
- Watermark previews until purchase?
- Signed URLs for generated images

---

## Open Questions

1. Approval workflow - auto-approve Hall submissions or manual review?
2. Minimum/maximum pricing for Hall pieces?
3. How long to keep unpurchased generations? (storage costs)
4. Allow anonymous generation or require email upfront?
5. Generation limits per session/day?

---

## Next Steps

1. Set up Supabase project (DB + Auth + Storage)
2. Get Replicate API key
3. Build Forge UI component
4. Integrate first generation mode
5. Test end-to-end generation flow
