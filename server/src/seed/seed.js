/**
 * Seed the product catalogue. Upserts by slug, so it is safe to re-run:
 * existing products keep any edits made in the staff dashboard unless --reset is passed.
 *
 *   npm run seed            # add missing products only
 *   npm run seed -- --reset # overwrite seeded products with the file contents
 */
const mongoose = require("mongoose");
const connectDB = require("../db");
const Product = require("../models/Product");
const products = require("./products");

(async () => {
  const reset = process.argv.includes("--reset");
  await connectDB();
  let created = 0, updated = 0;
  for (const p of products) {
    const exists = await Product.exists({ slug: p.slug });
    if (!exists) {
      await Product.create(p);
      created++;
    } else if (reset) {
      await Product.updateOne({ slug: p.slug }, p);
      updated++;
    }
  }
  console.log(`Seed complete: ${created} created, ${updated} updated, ${products.length - created - updated} unchanged.`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
