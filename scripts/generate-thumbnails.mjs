#!/usr/bin/env node
/**
 * Generate Thumbnails from Catalog
 * 
 * Reads catalog.json and generates optimized images:
 * - thumbnails/ (400px) - For gallery grid
 * - optimized/ (1200px) - For lightbox/detail view
 * 
 * Usage: node scripts/generate-thumbnails.mjs
 * 
 * Options:
 *   --force    Regenerate all thumbnails (ignores existing)
 *   --only=id  Only process specific piece by ID
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const VOID_DIR = path.join(ROOT, 'public', 'void');
const THUMB_DIR = path.join(ROOT, 'public', 'void', 'thumbnails');
const OPT_DIR = path.join(ROOT, 'public', 'void', 'optimized');
const CATALOG_PATH = path.join(ROOT, 'catalog.json');

// Settings
const THUMBNAIL_SIZE = 400;
const OPTIMIZED_SIZE = 1200;
const QUALITY = 80;

// Parse args
const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY = args.find(a => a.startsWith('--only='))?.split('=')[1];

async function generateThumbnails() {
  console.log('\\n🔧 Generating thumbnails...\\n');
  
  // Load catalog
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error('❌ Catalog not found. Run generate-catalog.mjs first.');
    process.exit(1);
  }
  
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  console.log(`📋 Loaded ${catalog.pieces.length} pieces from catalog\\n`);
  
  // Create output directories
  if (!fs.existsSync(THUMB_DIR)) {
    fs.mkdirSync(THUMB_DIR, { recursive: true });
    console.log('📁 Created thumbnails directory');
  }
  if (!fs.existsSync(OPT_DIR)) {
    fs.mkdirSync(OPT_DIR, { recursive: true });
    console.log('📁 Created optimized directory');
  }
  
  // Filter pieces if --only specified
  let pieces = catalog.pieces;
  if (ONLY) {
    pieces = pieces.filter(p => p.id === ONLY);
    if (pieces.length === 0) {
      console.error(`❌ No piece found with ID: ${ONLY}`);
      process.exit(1);
    }
  }
  
  // Process each piece
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  let updatedPieces = [];
  
  for (const piece of catalog.pieces) {
    const original = piece.files.original;
    const sourcePath = path.join(VOID_DIR, original);
    
    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️  Source not found: ${original}`);
      errors++;
      updatedPieces.push(piece);
      continue;
    }
    
    // Generate output filenames
    const ext = path.extname(original);
    const base = path.basename(original, ext);
    const thumbName = `${base}_thumb.webp`;
    const optName = `${base}_opt.webp`;
    const thumbPath = path.join(THUMB_DIR, thumbName);
    const optPath = path.join(OPT_DIR, optName);
    
    // Skip if already exists (unless --force)
    const thumbExists = fs.existsSync(thumbPath);
    const optExists = fs.existsSync(optPath);
    
    if (!FORCE && thumbExists && optExists && !ONLY) {
      skipped++;
      updatedPieces.push({
        ...piece,
        files: {
          ...piece.files,
          thumbnail: `thumbnails/${thumbName}`,
          webOptimized: `optimized/${optName}`
        }
      });
      continue;
    }
    
    try {
      // Get image metadata
      const metadata = await sharp(sourcePath).metadata();
      
      // Generate thumbnail (400px, maintain aspect ratio)
      if (FORCE || !thumbExists) {
        await sharp(sourcePath)
          .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: QUALITY })
          .toFile(thumbPath);
      }
      
      // Generate optimized (1200px max dimension)
      if (FORCE || !optExists) {
        await sharp(sourcePath)
          .resize(OPTIMIZED_SIZE, OPTIMIZED_SIZE, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: QUALITY })
          .toFile(optPath);
      }
      
      // Update piece with file paths and dimensions
      updatedPieces.push({
        ...piece,
        files: {
          ...piece.files,
          thumbnail: `thumbnails/${thumbName}`,
          webOptimized: `optimized/${optName}`
        },
        dimensions: {
          width: metadata.width,
          height: metadata.height
        },
        fileSize: (await fs.promises.stat(sourcePath)).size
      });
      
      processed++;
      process.stdout.write(`\\r   Processing: ${processed + skipped}/${pieces.length}`);
      
    } catch (err) {
      console.log(`\\n❌ Error processing ${original}: ${err.message}`);
      errors++;
      updatedPieces.push(piece);
    }
  }
  
  console.log('\\n');
  
  // Update catalog with new file paths
  const updatedCatalog = {
    ...catalog,
    lastUpdated: new Date().toISOString(),
    pieces: updatedPieces
  };
  
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(updatedCatalog, null, 2));
  
  console.log('✅ Thumbnail generation complete!\\n');
  console.log(`   ✓ Processed: ${processed}`);
  console.log(`   ⏭ Skipped (existing): ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📋 Catalog updated\\n`);
  
  // Calculate size savings
  if (processed > 0) {
    const thumbStats = await getDirSize(THUMB_DIR);
    const optStats = await getDirSize(OPT_DIR);
    console.log(`📊 Generated files:`);
    console.log(`   Thumbnails: ${formatSize(thumbStats.size)} (${thumbStats.count} files)`);
    console.log(`   Optimized: ${formatSize(optStats.size)} (${optStats.count} files)`);
  }
  
  console.log('');
}

async function getDirSize(dir) {
  const files = fs.readdirSync(dir);
  let size = 0;
  let count = 0;
  
  for (const file of files) {
    const stat = await fs.promises.stat(path.join(dir, file));
    if (stat.isFile()) {
      size += stat.size;
      count++;
    }
  }
  
  return { size, count };
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

generateThumbnails().catch(console.error);
