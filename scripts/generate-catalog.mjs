#!/usr/bin/env node
/**
 * Generate Catalog from Void Images
 * 
 * Scans /public/void/ and creates an initial catalog.json
 * with placeholders for you to fill in.
 * 
 * Usage: node scripts/generate-catalog.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const VOID_DIR = path.join(ROOT, 'public', 'void');
const CATALOG_PATH = path.join(ROOT, 'catalog.json');

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Try to extract year from filename
function extractYear(filename) {
  // Pattern: YYYYMMDD at start of filename
  const match = filename.match(/^(\d{4})/);
  if (match) {
    const year = parseInt(match[1]);
    if (year >= 2000 && year <= 2030) return year;
  }
  
  // Pattern: YYYY anywhere in filename
  const yearMatch = filename.match(/20\d{2}/);
  if (yearMatch) {
    return parseInt(yearMatch[0]);
  }
  
  return new Date().getFullYear();
}

// Generate a slug from filename
function generateSlug(filename) {
  const base = path.basename(filename, path.extname(filename));
  return base
    .toLowerCase()
    .replace(/[~_]/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

// Generate a title from filename
function generateTitle(filename) {
  const base = path.basename(filename, path.extname(filename));
  
  // Clean up common patterns
  let title = base
    .replace(/^\d{8}_\d{6}/, '') // Remove timestamp prefix
    .replace(/^IMG[-_]/, '')
    .replace(/^Screenshot[-_ ]/, 'Screenshot ')
    .replace(/^PSX[-_]/, '')
    .replace(/~\d+$/, '') // Remove ~2, ~3 suffixes
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // If empty after cleanup, use original
  if (!title) title = base;
  
  // Capitalize words
  return title.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Guess initial tags based on filename
function guessTags(filename) {
  const lower = filename.toLowerCase();
  const tags = [];
  
  // Check for common patterns
  if (lower.includes('portrait') || lower.includes('face')) tags.push('face');
  if (lower.includes('robot')) tags.push('robot');
  if (lower.includes('neon')) tags.push('neon');
  if (lower.includes('glitch')) tags.push('glitch');
  if (lower.includes('collage')) tags.push('collage');
  if (lower.includes('painting')) tags.push('digital-painting');
  if (lower.includes('screenshot')) tags.push('digital-painting');
  if (lower.includes('abstract')) tags.push('abstract');
  if (lower.includes('geometry') || lower.includes('geometric')) tags.push('geometric');
  if (lower.includes('floral') || lower.includes('flower')) tags.push('organic');
  if (lower.includes('madness')) tags.push('chaotic');
  if (lower.includes('moon')) tags.push('symbol');
  if (lower.includes('rabbit')) tags.push('animal');
  if (lower.includes('dog')) tags.push('animal');
  if (lower.includes('scary') || lower.includes('horror')) tags.push('dark');
  
  // Check for AI generation markers
  if (lower.includes('domnoval_') || lower.includes('progress_image')) {
    tags.push('ai-generated');
  }
  
  // If no tags found, mark as needing review
  if (tags.length === 0) tags.push('needs-review');
  
  return tags;
}

// Main function
async function generateCatalog() {
  console.log('\\n🔧 Scanning Void directory...\\n');
  
  // Check if void directory exists
  if (!fs.existsSync(VOID_DIR)) {
    console.error('❌ Void directory not found:', VOID_DIR);
    process.exit(1);
  }
  
  // Get all image files
  const files = fs.readdirSync(VOID_DIR)
    .filter(file => IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .sort();
  
  console.log(`📁 Found ${files.length} images\\n`);
  
  // Load existing catalog if it exists
  let existingPieces = {};
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
      existing.pieces.forEach(p => {
        existingPieces[p.files.original] = p;
      });
      console.log(`📋 Loaded ${Object.keys(existingPieces).length} existing catalog entries\\n`);
    } catch (e) {
      console.log('⚠️  Could not parse existing catalog, starting fresh\\n');
    }
  }
  
  // Generate pieces
  const now = new Date().toISOString();
  const pieces = files.map((filename, index) => {
    // If already cataloged, preserve existing data
    if (existingPieces[filename]) {
      return {
        ...existingPieces[filename],
        updatedAt: now
      };
    }
    
    // New piece - generate placeholder data
    const id = generateSlug(filename);
    const year = extractYear(filename);
    const title = generateTitle(filename);
    const tags = guessTags(filename);
    
    return {
      id: `${id}-${String(index + 1).padStart(3, '0')}`,
      title: title || `Untitled ${index + 1}`,
      series: 'uncategorized',
      tags,
      year,
      medium: tags.includes('ai-generated') ? 'ai-assisted' : 'digital',
      
      files: {
        original: filename,
        thumbnail: null,
        webOptimized: null,
        forgeAsset: null,
        printReady: null
      },
      
      dimensions: null,
      fileSize: null,
      dominantColors: null,
      
      forgeEnabled: true,
      forgeWeight: 5,
      
      shopifyProductId: null,
      printfulTemplateId: null,
      
      featured: false,
      hidden: false,
      nsfw: false,
      
      createdAt: `${year}-01-01T00:00:00.000Z`,
      catalogedAt: now,
      updatedAt: now,
      
      description: null,
      notes: 'AUTO-GENERATED - Please review and update'
    };
  });
  
  // Count stats
  const newPieces = pieces.filter(p => p.notes?.includes('AUTO-GENERATED'));
  const existingCount = pieces.length - newPieces.length;
  
  // Build catalog
  const catalog = {
    version: '1.0.0',
    lastUpdated: now,
    totalPieces: pieces.length,
    
    series: {
      'void-transmissions': {
        name: 'Void Transmissions',
        description: 'Raw signals from the void',
        color: '#a78bfa'
      },
      'portal-studies': {
        name: 'Portal Studies',
        description: 'Explorations of dimensional gateways',
        color: '#38bdf8'
      },
      'sacred-geometry': {
        name: 'Sacred Geometry',
        description: 'Mathematical patterns of creation',
        color: '#fbbf24'
      },
      'glitch-artifacts': {
        name: 'Glitch Artifacts',
        description: 'Digital decay and corruption aesthetics',
        color: '#f43f5e'
      },
      'portraits': {
        name: 'Portraits',
        description: 'Faces from other dimensions',
        color: '#10b981'
      },
      'ai-experiments': {
        name: 'AI Experiments',
        description: 'Collaborations with machine intelligence',
        color: '#8b5cf6'
      },
      'photography': {
        name: 'Photography',
        description: 'Captured moments',
        color: '#64748b'
      },
      'uncategorized': {
        name: 'Uncategorized',
        description: 'Awaiting classification',
        color: '#6b7280'
      }
    },
    
    tags: {
      // Auto-detected tags
      'needs-review': { name: 'Needs Review', category: 'mood' },
      
      // Subjects
      'portal': { name: 'Portal', category: 'subject' },
      'face': { name: 'Face', category: 'subject' },
      'figure': { name: 'Figure', category: 'subject' },
      'abstract': { name: 'Abstract', category: 'subject' },
      'landscape': { name: 'Landscape', category: 'subject' },
      'symbol': { name: 'Symbol', category: 'subject' },
      'eye': { name: 'Eye', category: 'subject' },
      'skull': { name: 'Skull', category: 'subject' },
      'robot': { name: 'Robot', category: 'subject' },
      'animal': { name: 'Animal', category: 'subject' },
      
      // Styles
      'psychedelic': { name: 'Psychedelic', category: 'style' },
      'surreal': { name: 'Surreal', category: 'style' },
      'collage': { name: 'Collage', category: 'style' },
      'glitch': { name: 'Glitch', category: 'style' },
      'minimal': { name: 'Minimal', category: 'style' },
      'maximal': { name: 'Maximal', category: 'style' },
      'geometric': { name: 'Geometric', category: 'style' },
      'organic': { name: 'Organic', category: 'style' },
      
      // Colors
      'blue': { name: 'Blue', category: 'color' },
      'red': { name: 'Red', category: 'color' },
      'gold': { name: 'Gold', category: 'color' },
      'purple': { name: 'Purple', category: 'color' },
      'green': { name: 'Green', category: 'color' },
      'pink': { name: 'Pink', category: 'color' },
      'monochrome': { name: 'Monochrome', category: 'color' },
      'neon': { name: 'Neon', category: 'color' },
      
      // Moods
      'dark': { name: 'Dark', category: 'mood' },
      'light': { name: 'Light', category: 'mood' },
      'chaotic': { name: 'Chaotic', category: 'mood' },
      'calm': { name: 'Calm', category: 'mood' },
      'mysterious': { name: 'Mysterious', category: 'mood' },
      'intense': { name: 'Intense', category: 'mood' },
      
      // Techniques
      'ai-generated': { name: 'AI Generated', category: 'technique' },
      'hand-drawn': { name: 'Hand Drawn', category: 'technique' },
      'photography': { name: 'Photography', category: 'technique' },
      'mixed-media': { name: 'Mixed Media', category: 'technique' },
      'digital-painting': { name: 'Digital Painting', category: 'technique' },
    },
    
    pieces
  };
  
  // Write catalog
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  
  console.log('✅ Catalog generated!\\n');
  console.log(`   📊 Total pieces: ${pieces.length}`);
  console.log(`   🆕 New entries: ${newPieces.length}`);
  console.log(`   📋 Preserved: ${existingCount}`);
  console.log(`   📍 Location: ${CATALOG_PATH}\\n`);
  
  // Show summary of auto-detected tags
  const tagCounts = {};
  pieces.forEach(p => {
    p.tags.forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  
  console.log('📌 Tag Distribution:');
  Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([tag, count]) => {
      console.log(`   ${tag}: ${count}`);
    });
  
  console.log('\\n🔧 Next steps:');
  console.log('   1. Review catalog.json and update titles/descriptions');
  console.log('   2. Assign series to each piece');
  console.log('   3. Add/remove tags as needed');
  console.log('   4. Run generate-thumbnails.mjs to create optimized images');
  console.log('');
}

generateCatalog().catch(console.error);
