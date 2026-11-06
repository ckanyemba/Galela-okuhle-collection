/**
 * One-off image prep: crops supplier code/size labels off catalogue photos,
 * paints out the Chinese colour captions, and compresses everything into
 * client/public/products so the seed data can reference them.
 *
 * Usage: node scripts/process-images.js <source-folder>
 */
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const SRC = process.argv[2];
if (!SRC) {
  console.error("Usage: node scripts/process-images.js <source-folder>");
  process.exit(1);
}
const OUT = path.resolve(__dirname, "../../client/public/products");
fs.mkdirSync(OUT, { recursive: true });

// Fill rectangles with a smooth harmonic interpolation of their borders.
// Works well for plain backgrounds (white shelving behind captions).
async function inpaint(input, rects) {
  const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true });
  const { width, channels } = info;
  for (const r of rects) {
    const { x0, y0, x1, y1 } = r;
    const w = x1 - x0, h = y1 - y0;
    for (let c = 0; c < channels; c++) {
      const px = (x, y) => data[(y * width + x) * channels + c];
      // Initial guess: blend of horizontal + vertical linear interpolation.
      const grid = new Float32Array((w + 2) * (h + 2));
      const G = (x, y) => y * (w + 2) + x;
      for (let y = 0; y < h + 2; y++)
        for (let x = 0; x < w + 2; x++) {
          const ax = x0 - 1 + x, ay = y0 - 1 + y;
          if (x === 0 || y === 0 || x === w + 1 || y === h + 1) grid[G(x, y)] = px(ax, ay);
          else {
            const tx = x / (w + 1), ty = y / (h + 1);
            const hv = px(x0 - 1, ay) * (1 - tx) + px(x1, ay) * tx;
            const vv = px(ax, y0 - 1) * (1 - ty) + px(ax, y1) * ty;
            grid[G(x, y)] = (hv + vv) / 2;
          }
        }
      for (let it = 0; it < 400; it++)
        for (let y = 1; y <= h; y++)
          for (let x = 1; x <= w; x++)
            grid[G(x, y)] = (grid[G(x - 1, y)] + grid[G(x + 1, y)] + grid[G(x, y - 1)] + grid[G(x, y + 1)]) / 4;
      for (let y = 1; y <= h; y++)
        for (let x = 1; x <= w; x++)
          data[((y0 - 1 + y) * width + (x0 - 1 + x)) * channels + c] = Math.round(grid[G(x, y)]);
    }
  }
  return sharp(data, { raw: info });
}

const save = (img, name) =>
  img.resize({ width: 1000, height: 1400, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, name));

const src = (n) => path.join(SRC, `${n}.jpg`);

// Phone photos: just resize/compress.
const plain = {
  1: "acid-flush.jpg", 2: "pot-shiner.jpg", 3: "cleaning-set-1.jpg", 4: "cockroach-killer.jpg",
  5: "oven-cleaner.jpg", 6: "power-clean.jpg", 7: "cleaning-set-2.jpg",
  8: "tan-tote-1.jpg", 9: "tan-tote-2.jpg", 10: "tan-tote-3.jpg", 11: "tan-tote-4.jpg",
  12: "tan-tote-5.jpg", 13: "tan-tote-6.jpg",
  14: "taupe-tote-1.jpg", 15: "taupe-tote-2.jpg", 16: "taupe-tote-3.jpg", 17: "taupe-tote-4.jpg",
  18: "taupe-tote-5.jpg", 19: "taupe-tote-6.jpg",
  20: "croc-handbag-1.jpg", 21: "croc-handbag-2.jpg", 24: "croc-handbag-3.jpg",
  22: "cream-tote-3.jpg", 23: "cream-tote-4.jpg", 26: "cream-tote-1.jpg", 30: "cream-tote-2.jpg",
  25: "burgundy-tote-3.jpg", 27: "burgundy-tote-4.jpg", 28: "burgundy-tote-1.jpg", 29: "burgundy-tote-2.jpg",
  31: "tote-shelf.jpg",
};

// Supplier photos: crop off the code/size label at the top.
const crops = {
  33: { file: "felt-hobo.jpg", top: 205 },
  34: { file: "structured-shoulder.jpg", top: 250 },
  35: { file: "woven-flower-handbag.jpg", top: 330 },
  36: { file: "tweed-flower-handbag.jpg", top: 260 },
};

(async () => {
  for (const [n, file] of Object.entries(plain)) {
    await save(sharp(src(n)).rotate(), file);
    console.log("ok", file);
  }
  for (const [n, { file, top }] of Object.entries(crops)) {
    const m = await sharp(src(n)).metadata();
    await save(sharp(src(n)).extract({ left: 0, top, width: m.width, height: m.height - top }), file);
    console.log("ok", file);
  }
  // 32: remove Chinese colour captions, then crop the code/size header.
  const captions = [
    { x0: 345, y0: 870, x1: 465, y1: 950 },
    { x0: 740, y0: 870, x1: 865, y1: 950 },
    { x0: 155, y0: 1295, x1: 295, y1: 1375 },
    { x0: 525, y0: 1295, x1: 705, y1: 1372 },
    { x0: 935, y0: 1290, x1: 1060, y1: 1370 },
  ];
  const cleaned = await (await inpaint(src(32), captions)).jpeg({ quality: 95 }).toBuffer();
  await save(sharp(cleaned).extract({ left: 0, top: 415, width: 1200, height: 1185 }), "suede-shoulder.jpg");
  console.log("ok suede-shoulder.jpg");
})();
