const crypto = require("crypto");
const { Schema, model, models } = require("mongoose");

const PAYMENT_METHODS = ["payfast", "yoco", "whatsapp", "email", "cash"];
const ORDER_STATUSES = ["new", "confirmed", "ready", "completed", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const itemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: String,
    price: Number,
    quantity: { type: Number, min: 1 },
    colour: String,
    image: String,
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true },
    accessToken: { type: String, select: false },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    fulfilment: {
      method: { type: String, enum: ["collection", "delivery"], default: "collection" },
      address: String,
    },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    subtotal: Number,
    deliveryFee: { type: Number, default: 0 },
    total: Number,
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
    paymentReference: String,
    status: { type: String, enum: ORDER_STATUSES, default: "new" },
    notes: String,
    staffNotes: String,
    history: [
      {
        at: { type: Date, default: Date.now },
        by: String,
        message: String,
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

orderSchema.pre("validate", function () {
  if (!this.orderNumber) {
    const d = new Date();
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    this.orderNumber = `GOC-${ymd}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
  }
  if (!this.accessToken) this.accessToken = crypto.randomBytes(16).toString("hex");
});

module.exports = models.Order || model("Order", orderSchema);
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
