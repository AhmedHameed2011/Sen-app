/**
 * Sanad - Icon generator
 * Renders the Sanad brand mark to PNG at PWA-required sizes.
 *
 * Usage (once):
 *   npm install --save-dev sharp
 *   node scripts/generate-icons.js
 *
 * Output:
 *   icons/icon-180.png             (iOS apple-touch-icon)
 *   icons/icon-192.png             (PWA)
 *   icons/icon-512.png             (PWA)
 *   icons/icon-maskable-512.png    (Android adaptive, 20% safe zone)
 *
 * Committed to the repo so CI/deploys don't need to regenerate.
 */

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Missing dependency: sharp.');
  console.error('Run: npm install --save-dev sharp');
  process.exit(1);
}

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="102" fill="#0369a1"/>
  <text x="256" y="360"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
        font-size="300" font-weight="800"
        text-anchor="middle" fill="#ffffff">س</text>
</svg>`;

const TARGETS = [
  { size: 180, file: 'icons/icon-180.png' },
  { size: 192, file: 'icons/icon-192.png' },
  { size: 512, file: 'icons/icon-512.png' },
  { size: 512, file: 'icons/icon-maskable-512.png', maskable: true }
];

(async () => {
  fs.mkdirSync(path.join(__dirname, '..', 'icons'), { recursive: true });
  const svgBuf = Buffer.from(SVG);

  for (const t of TARGETS) {
    let pipeline = sharp(svgBuf).resize(t.size, t.size);

    if (t.maskable) {
      // Maskable icons: ensure critical content fits inside the 80% safe zone.
      // We shrink the glyph to ~80% and pad with the brand color.
      pipeline = sharp(svgBuf)
        .resize(Math.round(t.size * 0.8), Math.round(t.size * 0.8))
        .extend({
          top: Math.round(t.size * 0.1),
          bottom: Math.round(t.size * 0.1),
          left: Math.round(t.size * 0.1),
          right: Math.round(t.size * 0.1),
          background: '#0369a1'
        })
        .resize(t.size, t.size);
    }

    const outPath = path.join(__dirname, '..', t.file);
    await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
    console.log(`✓ ${t.file}`);
  }

  console.log('\nDone. Icons written to ./icons/');
})().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});