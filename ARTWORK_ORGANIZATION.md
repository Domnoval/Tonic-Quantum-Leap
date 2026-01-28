# Artwork Organization System

*Created by Vinchi for Michael* 🔧

## Overview

Your artwork is now managed through a central `catalog.json` file. This gives you:
- **Metadata** — titles, descriptions, tags, series groupings
- **Optimized images** — thumbnails (400px) and web-optimized (1200px) versions
- **Fast loading** — WebP format with 80% quality
- **Filtering** — by series, tags, or search

---

## File Structure

```
Tonic-Quantum-Leap/
├── catalog.json              ← Master catalog (225 pieces)
├── public/
│   └── void/
│       ├── *.jpg             ← Original images
│       ├── thumbnails/       ← 400px WebP thumbnails
│       └── optimized/        ← 1200px WebP for lightbox
├── scripts/
│   ├── catalog-schema.ts     ← TypeScript type definitions
│   ├── generate-catalog.mjs  ← Scan images → create catalog
│   ├── generate-thumbnails.mjs ← Create optimized versions
│   └── catalog-editor.html   ← Visual editor (open in browser)
└── components/
    └── VoidCatalog.tsx       ← New catalog-driven gallery
```

---

## Quick Start

### 1. Edit the Catalog

**Option A: Visual Editor**
```bash
# Open in browser
start scripts/catalog-editor.html  # Windows
open scripts/catalog-editor.html   # Mac
```
- Load `catalog.json`
- Click any piece to edit
- Download updated file when done
- Replace `catalog.json` with downloaded version

**Option B: Edit JSON Directly**
- Open `catalog.json` in VS Code
- Edit titles, series, tags, etc.

### 2. Adding New Artwork

1. Drop new images in `public/void/`
2. Run: `node scripts/generate-catalog.mjs`
   - New images get added, existing entries preserved
3. Run: `node scripts/generate-thumbnails.mjs`
   - Generates thumbnails for new images
4. Edit metadata in catalog editor
5. Commit changes

### 3. Regenerate All Thumbnails

```bash
node scripts/generate-thumbnails.mjs --force
```

---

## Catalog Schema

Each piece has these fields:

```json
{
  "id": "cosmic-gate-001",
  "title": "Cosmic Gate",
  "series": "portal-studies",
  "tags": ["portal", "blue", "geometric"],
  "year": 2024,
  "medium": "digital",
  
  "files": {
    "original": "20240101_123456.jpg",
    "thumbnail": "thumbnails/20240101_123456_thumb.webp",
    "webOptimized": "optimized/20240101_123456_opt.webp"
  },
  
  "dimensions": { "width": 3000, "height": 2000 },
  "fileSize": 1234567,
  
  "forgeEnabled": true,
  "featured": false,
  "hidden": false,
  
  "description": "A portal opening into the void..."
}
```

### Series (Pre-defined)

| Key | Name | Color |
|-----|------|-------|
| `void-transmissions` | Void Transmissions | Purple |
| `portal-studies` | Portal Studies | Sky blue |
| `sacred-geometry` | Sacred Geometry | Gold |
| `glitch-artifacts` | Glitch Artifacts | Red |
| `portraits` | Portraits | Green |
| `ai-experiments` | AI Experiments | Violet |
| `photography` | Photography | Gray |
| `uncategorized` | Uncategorized | Gray |

### Tags (Categories)

- **Subject:** portal, face, figure, abstract, landscape, symbol, eye, skull, robot, animal
- **Style:** psychedelic, surreal, collage, glitch, minimal, maximal, geometric, organic
- **Color:** blue, red, gold, purple, green, pink, monochrome, neon
- **Mood:** dark, light, chaotic, calm, mysterious, intense
- **Technique:** ai-generated, hand-drawn, photography, mixed-media, digital-painting

---

## Using in Code

### Import Catalog

```tsx
import catalogData from '../catalog.json';

// Types
interface CatalogPiece {
  id: string;
  title: string;
  series: string;
  tags: string[];
  files: {
    original: string;
    thumbnail?: string;
    webOptimized?: string;
  };
  // ... etc
}

// Access pieces
const pieces = catalogData.pieces;
const featured = pieces.filter(p => p.featured);
const portals = pieces.filter(p => p.series === 'portal-studies');
```

### New VoidCatalog Component

```tsx
// Replace old Void component with catalog-driven version
import VoidCatalog from './components/VoidCatalog';

// In App.tsx
{currentView === View.Void && <VoidCatalog themeColor={themeColor} />}
```

---

## Stats

- **Total pieces:** 225
- **Needs review:** 184 (auto-detected tags only)
- **Thumbnails:** 8.5 MB
- **Optimized:** 36.3 MB
- **Format:** WebP @ 80% quality

---

## Next Steps

1. **Review pieces** — Go through catalog editor, update titles & series
2. **Feature key works** — Mark your best pieces as `featured: true`
3. **Add descriptions** — Write artist statements for key pieces
4. **Test VoidCatalog** — Switch to the new component, verify it works
5. **Connect to Forge** — The catalog tracks `forgeEnabled` for each piece

---

*The catalog is the single source of truth. Keep it updated, and everything else follows.*

🔧 Vinchi
