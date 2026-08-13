// scripts/generate-icons.js
// Run: node scripts/generate-icons.js
// Requires: npm install --save-dev sharp

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons')

// Simple SVG house icon as fallback if no source image exists
const HOUSE_SVG = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#1B873F"/>
  <g transform="translate(106, 100)" fill="none" stroke="white" stroke-width="22" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 160 L150 30 L288 160"/>
    <path d="M42 160 L42 280 L258 280 L258 160"/>
    <path d="M120 280 L120 200 L180 200 L180 280"/>
    <rect x="60" y="190" width="40" height="40"/>
    <rect x="200" y="190" width="40" height="40"/>
  </g>
</svg>
`

async function generateIcons() {
  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true })
  }

  // Check for source image
  const sourcePath = path.join(__dirname, '..', 'public', 'logo-source.png')
  let inputBuffer

  if (fs.existsSync(sourcePath)) {
    console.log('📷 Using custom logo from public/logo-source.png')
    inputBuffer = fs.readFileSync(sourcePath)
  } else {
    console.log('🏠 No logo-source.png found — using default house icon')
    inputBuffer = Buffer.from(HOUSE_SVG)
  }

  for (const size of SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}.png`)
    await sharp(inputBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 27, g: 135, b: 63, alpha: 0 } })
      .png()
      .toFile(outputPath)
    console.log(`  ✅ icon-${size}.png`)
  }

  console.log('\n🎉 All icons generated in public/icons/')
  console.log('💡 Tip: Replace public/logo-source.png with your custom logo and re-run')
}

generateIcons().catch(console.error)
