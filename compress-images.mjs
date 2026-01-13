import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, basename } from 'path';

const SOURCE_DIR = './void pics/Tonic Quantum Photos-1-001/Tonic Quantum Photos';
const DEST_DIR = './public/void';
const MAX_SIZE = 1200;
const QUALITY = 80;

async function compressImages() {
  await mkdir(DEST_DIR, { recursive: true });

  const files = await readdir(SOURCE_DIR);
  let totalBefore = 0;
  let totalAfter = 0;
  let processed = 0;
  let skipped = 0;

  for (const file of files) {
    const sourcePath = join(SOURCE_DIR, file);
    const ext = file.toLowerCase().split('.').pop();

    // Skip non-image files
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      console.log(`Skipping: ${file} (unsupported format)`);
      skipped++;
      continue;
    }

    // Output as .jpg
    const outputName = file.replace(/\.(png|webp)$/i, '.jpg');
    const destPath = join(DEST_DIR, outputName);

    try {
      const beforeStats = await stat(sourcePath);
      totalBefore += beforeStats.size;

      const image = sharp(sourcePath);
      const metadata = await image.metadata();

      // Resize if larger than MAX_SIZE
      let pipeline = image;
      if (metadata.width > MAX_SIZE || metadata.height > MAX_SIZE) {
        pipeline = image.resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true });
      }

      // Output as optimized JPEG
      await pipeline
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(destPath);

      const afterStats = await stat(destPath);
      totalAfter += afterStats.size;
      processed++;

      const saved = ((beforeStats.size - afterStats.size) / beforeStats.size * 100).toFixed(1);
      console.log(`${file}: ${(beforeStats.size/1024/1024).toFixed(2)}MB -> ${(afterStats.size/1024/1024).toFixed(2)}MB (${saved}% saved)`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
      skipped++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Processed: ${processed} files`);
  console.log(`Skipped: ${skipped} files`);
  console.log(`Before: ${(totalBefore/1024/1024).toFixed(2)}MB`);
  console.log(`After: ${(totalAfter/1024/1024).toFixed(2)}MB`);
  console.log(`Saved: ${((totalBefore-totalAfter)/1024/1024).toFixed(2)}MB (${((totalBefore-totalAfter)/totalBefore*100).toFixed(1)}%)`);
}

compressImages().catch(console.error);
