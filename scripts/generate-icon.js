import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, '..', 'build');
const svgPath = path.join(buildDir, 'icon.svg');
const icoPath = path.join(buildDir, 'icon.ico');

const sizes = [16, 32, 48, 64, 128, 256];

async function createIcon() {
  if (!fs.existsSync(svgPath)) {
    console.error('Error: icon.svg not found at', svgPath);
    process.exit(1);
  }
  
  console.log('Using icon.svg...');
  const svgBuffer = fs.readFileSync(svgPath);
  
  const pngBuffers = [];
  for (const size of sizes) {
    console.log(`  Processing ${size}x${size}...`);
    
    const png = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
    
    pngBuffers.push(png);
  }
  
  console.log('Creating ICO...');
  const icoBuffer = await pngToIco(pngBuffers);
  fs.writeFileSync(icoPath, icoBuffer);
  console.log('✓ ICO file created:', icoPath);
  console.log('ICO size:', icoBuffer.length, 'bytes');
}

createIcon().catch(console.error);