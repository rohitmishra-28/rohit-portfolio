// Packs the Figma favicon exports (src/assets/brand/favicon-{16,32,48}.png) into
// src/app/favicon.ico. ICO files may embed PNGs directly, so no re-encoding.
// Run with `node scripts/make-favicon-ico.mjs` after replacing the PNGs.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sizes = [16, 32, 48];
const images = await Promise.all(
  sizes.map((s) => readFile(path.join(root, `src/assets/brand/favicon-${s}.png`))),
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);

let offset = 6 + 16 * sizes.length;
const entries = sizes.map((size, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0); // width
  entry.writeUInt8(size, 1); // height
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(images[i].length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += images[i].length;
  return entry;
});

await writeFile(path.join(root, "src/app/favicon.ico"), Buffer.concat([header, ...entries, ...images]));
console.log("wrote src/app/favicon.ico", sizes.join("/"));
