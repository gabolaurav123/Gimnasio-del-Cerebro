import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "public", "logos", "gdc-primary.jpg");

const symbol = await sharp(source)
  .rotate()
  .extract({ left: 280, top: 130, width: 1040, height: 920 })
  .png()
  .toBuffer();

async function render(size, paddingRatio = 0.08) {
  const padding = Math.max(1, Math.round(size * paddingRatio));
  const inner = size - padding * 2;
  const mark = await sharp(symbol)
    .resize(inner, inner, { fit: "contain", background: "#ffffff" })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: "#ffffff" } })
    .composite([{ input: mark, left: padding, top: padding }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function pngIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const directory = Buffer.alloc(images.length * 16);
  let offset = 6 + directory.length;
  images.forEach(({ size, data }, index) => {
    const row = index * 16;
    directory.writeUInt8(size === 256 ? 0 : size, row);
    directory.writeUInt8(size === 256 ? 0 : size, row + 1);
    directory.writeUInt8(0, row + 2);
    directory.writeUInt8(0, row + 3);
    directory.writeUInt16LE(1, row + 4);
    directory.writeUInt16LE(32, row + 6);
    directory.writeUInt32LE(data.length, row + 8);
    directory.writeUInt32LE(offset, row + 12);
    offset += data.length;
  });
  return Buffer.concat([header, directory, ...images.map((image) => image.data)]);
}

const sizes = await Promise.all([16, 32, 48, 180, 512].map(async (size) => ({ size, data: await render(size) })));
const bySize = new Map(sizes.map((entry) => [entry.size, entry.data]));

await Promise.all([
  writeFile(path.join(root, "public", "favicon-32.png"), bySize.get(32)),
  writeFile(path.join(root, "public", "apple-touch-icon.png"), bySize.get(180)),
  writeFile(path.join(root, "public", "favicon.png"), bySize.get(512)),
  writeFile(path.join(root, "public", "favicon.ico"), pngIco(sizes.filter((entry) => entry.size <= 48))),
  sharp(bySize.get(512)).jpeg({ quality: 94 }).toFile(path.join(root, "app", "icon.jpg")),
]);

console.log("Created GDC browser icons from the official brain symbol");
