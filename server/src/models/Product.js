const { Schema, model, models } = require("mongoose");

const imageSchema = new Schema(
  { url: { type: String, required: true }, publicId: String },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, enum: ["bags", "cleaning"], required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    details: [String], // bullet points, e.g. "Includes zip pouch"
    colours: [String],
    dimensions: String, // e.g. "31 × 11 × 9 cm"
    size: String, // e.g. "500 ml"
    images: [imageSchema],
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = models.Product || model("Product", productSchema);
