import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pngToIco from 'png-to-ico';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 64, 128, 256];
const buildDir = path.join(__dirname, '..', 'build');
const pngPath = path.join(buildDir, 'icon.png');
const icoPath = path.join(buildDir, 'icon.ico');

async function createDefaultIcon() {
  console.log('Creating default icon...');
  
  const svg = `
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#5b8def;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#9366c9;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="40" fill="url(#grad)"/>
      <text x="128" y="160" font-family="Arial" font-size="120" font-weight="bold" fill="white" text-anchor="middle">G</text>
    </svg>
  `;
  
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function createIco() {
  let sourcePng;
  
  if (!fs.existsSync(pngPath)) {
    console.log('No icon.png found, creating default icon...');
    sourcePng = await createDefaultIcon();
  } else {
    try {
      await sharp(pngPath).metadata();
      sourcePng = fs.readFileSync(pngPath);
      console.log('Using existing icon.png...');
    } catch (err) {
      console.log('icon.png is invalid, creating default icon...');
      sourcePng = await createDefaultIcon();
    }
  }

  console.log('Generating ICO file using png-to-ico...');
  
  try {
    const icoBuffer = await pngToIco(sourcePng);
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('✓ ICO file created successfully at build/icon.ico');
    console.log(`  Size: ${icoBuffer.length} bytes`);
  } catch (error) {
    console.error('Error creating ICO:', error);
    throw error;
  }
}

createIco().catch(console.error);
