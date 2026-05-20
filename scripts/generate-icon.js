import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 64, 128, 256];
const buildDir = path.join(__dirname, '..', 'build');
const pngPath = path.join(buildDir, 'icon.png');
const icoPath = path.join(buildDir, 'icon.ico');

// 创建一个简单的渐变色图标
async function createDefaultIcon() {
  console.log('Creating default icon...');
  
  // 创建一个 256x256 的渐变蓝色图标
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
    // 检查文件是否有效
    try {
      await sharp(pngPath).metadata();
      sourcePng = fs.readFileSync(pngPath);
      console.log('Using existing icon.png...');
    } catch (err) {
      console.log('icon.png is invalid, creating default icon...');
      sourcePng = await createDefaultIcon();
    }
  }

  console.log('Generating ICO file...');
  
  const pngBuffers = [];
  
  for (const size of sizes) {
    const pngBuffer = await sharp(sourcePng)
      .resize(size, size)
      .png()
      .toBuffer();
    pngBuffers.push({ size, buffer: pngBuffer });
  }
  
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = numImages * dirEntrySize;
  let dataOffset = headerSize + dirSize;
  
  const totalSize = headerSize + dirSize + pngBuffers.reduce((sum, p) => sum + p.buffer.length, 0);
  const icoBuffer = Buffer.alloc(totalSize);
  
  // ICO header
  icoBuffer.writeUInt16LE(0, 0); // Reserved
  icoBuffer.writeUInt16LE(1, 2); // Type: 1 = ICO
  icoBuffer.writeUInt16LE(numImages, 4); // Number of images
  
  // Directory entries
  let offset = headerSize;
  for (const { size, buffer } of pngBuffers) {
    icoBuffer.writeUInt8(size >= 256 ? 0 : size, offset); // Width (0 means 256)
    icoBuffer.writeUInt8(size >= 256 ? 0 : size, offset + 1); // Height (0 means 256)
    icoBuffer.writeUInt8(0, offset + 2); // Color palette
    icoBuffer.writeUInt8(0, offset + 3); // Reserved
    icoBuffer.writeUInt16LE(1, offset + 4); // Color planes
    icoBuffer.writeUInt16LE(32, offset + 6); // Bits per pixel
    icoBuffer.writeUInt32LE(buffer.length, offset + 8); // Size of image data
    icoBuffer.writeUInt32LE(dataOffset, offset + 12); // Offset of image data
    dataOffset += buffer.length;
    offset += dirEntrySize;
  }
  
  // Image data
  for (const { buffer } of pngBuffers) {
    buffer.copy(icoBuffer, dataOffset);
    dataOffset += buffer.length;
  }
  
  fs.writeFileSync(icoPath, icoBuffer);
  console.log('✓ ICO file created successfully at build/icon.ico');
}

createIco().catch(console.error);