import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");
const logoPath = join(__dirname, "..", "public", "images", "logo.png");
const logo = readFileSync(logoPath);

const sizes = [
  { name: "porteria-192.png", size: 192 },
  { name: "porteria-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(logo).resize(size, size).png().toFile(join(iconsDir, name));
  console.log(`Generated ${name} (${size}x${size})`);
}

// Maskable: icon with safe zone padding (80% of canvas)
const maskableSize = 512;
const innerSize = Math.round(maskableSize * 0.8);
const offset = Math.round((maskableSize - innerSize) / 2);
const inner = await sharp(logo).resize(innerSize, innerSize).png().toBuffer();
await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: inner, left: offset, top: offset }])
  .png()
  .toFile(join(iconsDir, "porteria-maskable-512.png"));
console.log("Generated porteria-maskable-512.png (512x512)");
