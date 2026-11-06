const { Router } = require("express");
const Product = require("../models/Product");
const { requireStaff } = require("../middleware/auth");
const { destroyImage } = require("../lib/cloudinary");

const router = Router();

const slugify = (s) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const EDITABLE = ["name", "category", "price", "description", "details", "colours", "dimensions", "size", "images", "inStock", "featured", "sortOrder"];
const pick = (body) => Object.fromEntries(EDITABLE.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured === "true") filter.featured = true;
  const products = await Product.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();
  res.json({ products });
});

router.get("/:slug", async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).lean();
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ product });
});

router.post("/", requireStaff, async (req, res) => {
  const data = pick(req.body);
  if (!data.name || data.price === undefined || !data.category) {
    return res.status(400).json({ error: "Name, price and category are required" });
  }
  let slug = slugify(req.body.slug || data.name);
  if (await Product.exists({ slug })) slug = `${slug}-${Date.now().toString(36)}`;
  const product = await Product.create({ ...data, slug });
  res.status(201).json({ product });
});

router.put("/:id", requireStaff, async (req, res) => {
  const existing = await Product.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Product not found" });
  const data = pick(req.body);

  // Clean up Cloudinary images that were removed in the edit.
  if (data.images) {
    const kept = new Set(data.images.map((i) => i.publicId).filter(Boolean));
    await Promise.all(existing.images.filter((i) => i.publicId && !kept.has(i.publicId)).map((i) => destroyImage(i.publicId)));
  }
  existing.set(data);
  await existing.save();
  res.json({ product: existing });
});

router.delete("/:id", requireStaff, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  await Promise.all(product.images.filter((i) => i.publicId).map((i) => destroyImage(i.publicId)));
  res.json({ ok: true });
});

module.exports = router;
