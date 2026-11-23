import fs from "fs";
import path from "path";
import zlib from "zlib";
import { ALL_DISCORD_BADGES } from "../src/lib/discord-badges";

// CRC32 table for PNG chunk checksums
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crc = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function hexToRgba(hex: string): [number, number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return [r, g, b, 255];
}

function createBadgePng(width: number, height: number, brandColor: string): Buffer {
  const [br, bg, bb] = hexToRgba(brandColor);
  const [bgR, bgG, bgB, bgA] = [18, 20, 26, 240]; // Dark aesthetic background

  // Raw uncompressed scanlines: each row = 1 filter byte (0) + width * 4 bytes RGBA
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Rounded rect check (radius = 5)
      const r = 5;
      const dx = Math.max(0, Math.max(r - x, x - (width - 1 - r)));
      const dy = Math.max(0, Math.max(r - y, y - (height - 1 - r)));
      const isCornerOutside = dx * dx + dy * dy > r * r;

      if (isCornerOutside) {
        // Transparent outside rounded corner
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
      } else {
        // Border or center design
        const isBorder = x === 0 || x === width - 1 || y === 0 || y === height - 1 ||
                         dx * dx + dy * dy >= (r - 1.2) * (r - 1.2);
        const inCenterGlyph = x >= 7 && x <= 16 && y >= 7 && y <= 16;

        if (inCenterGlyph) {
          // Center symbol in brand color
          rawData[pixelOffset] = br;
          rawData[pixelOffset + 1] = bg;
          rawData[pixelOffset + 2] = bb;
          rawData[pixelOffset + 3] = 255;
        } else if (isBorder) {
          // Subtle glowing border
          rawData[pixelOffset] = Math.round(br * 0.7);
          rawData[pixelOffset + 1] = Math.round(bg * 0.7);
          rawData[pixelOffset + 2] = Math.round(bb * 0.7);
          rawData[pixelOffset + 3] = 180;
        } else {
          // Dark background
          rawData[pixelOffset] = bgR;
          rawData[pixelOffset + 1] = bgG;
          rawData[pixelOffset + 2] = bgB;
          rawData[pixelOffset + 3] = bgA;
        }
      }
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression: deflate
  ihdrData[11] = 0; // Filter: standard
  ihdrData[12] = 0; // Interlace: none
  const ihdrChunk = createChunk("IHDR", ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk("IDAT", compressed);

  // IEND
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const targetDir = path.resolve(__dirname, "../public/badges");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log(`Generating badge icons in ${targetDir}...`);
for (const badge of ALL_DISCORD_BADGES) {
  const filePath = path.join(targetDir, `${badge.key}.png`);
  const pngBuffer = createBadgePng(24, 24, badge.brandColor || "#5865f2");
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`✓ Created: ${badge.key}.png (${pngBuffer.length} bytes)`);
}

console.log("All local badge icons generated successfully!");
