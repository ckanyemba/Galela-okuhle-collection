const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const config = require("../config");
const { requireStaff } = require("../middleware/auth");
const payfast = require("../lib/payfast");
const yoco = require("../lib/yoco");

const router = Router();
const { PAYMENT_METHODS, ORDER_STATUSES, PAYMENT_STATUSES } = Order;

const createLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

/** Payment step for online methods; returns what the client needs to send the customer to the gateway. */
async function startPayment(order) {
  if (order.paymentMethod === "payfast") {
    return { type: "form", ...payfast.buildCheckout(order) };
  }
  if (order.paymentMethod === "yoco") {
    const checkout = await yoco.createCheckout(order);
    order.paymentReference = checkout.id;
    await order.save();
    return { type: "redirect", url: checkout.redirectUrl };
  }
  return null;
}

const publicView = (o) => {
  const obj = o.toObject ? o.toObject() : o;
  delete obj.accessToken;
  delete obj.staffNotes;
  delete obj.history;
  return obj;
};

// Customer places an order (no sign-in needed).
router.post("/", createLimiter, async (req, res) => {
  const { customer = {}, fulfilment = {}, items = [], paymentMethod, notes } = req.body || {};

  if (!customer.name?.trim() || !customer.phone?.trim()) {
    return res.status(400).json({ error: "Please enter your name and phone number" });
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) return res.status(400).json({ error: "Choose a payment method" });
  if (paymentMethod === "payfast" && !config.payfast.enabled) return res.status(400).json({ error: "PayFast is not available yet" });
  if (paymentMethod === "yoco" && !config.yoco.enabled) return res.status(400).json({ error: "Card payments via Yoco are not available yet" });
  if ((paymentMethod === "payfast" || paymentMethod === "email") && !customer.email?.trim()) {
    return res.status(400).json({ error: "Please enter your email address" });
  }
  if (fulfilment.method === "delivery" && !fulfilment.address?.trim()) {
    return res.status(400).json({ error: "Please enter a delivery address" });
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ error: "Your cart is empty" });
  }

  // Prices always come from the database, never from the client.
  const ids = items.map((i) => i.productId).filter((id) => mongoose.isValidObjectId(id));
  const products = await Product.find({ _id: { $in: ids } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines = [];
  for (const i of items) {
    const p = byId.get(String(i.productId));
    if (!p) return res.status(400).json({ error: "One of the items in your cart is no longer available" });
    if (!p.inStock) return res.status(400).json({ error: `${p.name} is out of stock` });
    const quantity = Math.min(Math.max(parseInt(i.quantity, 10) || 1, 1), 20);
    const colour = p.colours?.includes(i.colour) ? i.colour : undefined;
    lines.push({ product: p._id, name: p.name, price: p.price, quantity, colour, image: p.images?.[0]?.url });
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const deliveryFee = fulfilment.method === "delivery" ? config.deliveryFee : 0;

  const order = await Order.create({
    customer: { name: customer.name, phone: customer.phone, email: customer.email || undefined },
    fulfilment: { method: fulfilment.method === "delivery" ? "delivery" : "collection", address: fulfilment.address },
    items: lines,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    paymentMethod,
    notes: notes?.slice(0, 1000),
    history: [{ by: "customer", message: `Order placed (${paymentMethod})` }],
  });

  let payment = null;
  let paymentError = null;
  try {
    payment = await startPayment(order);
  } catch (err) {
    console.error("Payment start failed", err);
    paymentError = "We couldn't connect to the payment provider. Your order is saved, so you can try paying again from your receipt.";
  }

  res.status(201).json({ order: publicView(order), token: order.accessToken, payment, paymentError });
});

// Retry an online payment from the receipt page.
router.post("/:id/pay", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Order not found" });
  const order = await Order.findById(req.params.id).select("+accessToken");
  if (!order || order.accessToken !== req.query.token) return res.status(404).json({ error: "Order not found" });
  if (order.paymentStatus === "paid") return res.status(400).json({ error: "This order is already paid" });
  try {
    res.json({ payment: await startPayment(order) });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Receipt: customer (with token) or staff.
router.get("/:id", async (req, res, next) => {
  if (req.params.id === "stats" || !mongoose.isValidObjectId(req.params.id)) return next();
  const order = await Order.findById(req.params.id).select("+accessToken");
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (req.query.token && req.query.token === order.accessToken) return res.json({ order: publicView(order) });
  // Fall through to the staff check.
  requireStaff(req, res, () => {
    const obj = order.toObject();
    delete obj.accessToken;
    res.json({ order: obj });
  });
});

// Staff: list orders.
router.get("/", requireStaff, async (req, res) => {
  const { status, payment, q } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = 25;
  const filter = {};
  if (status && ORDER_STATUSES.includes(status)) filter.status = status;
  if (payment && PAYMENT_STATUSES.includes(payment)) filter.paymentStatus = payment;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ orderNumber: rx }, { "customer.name": rx }, { "customer.phone": rx }, { "customer.email": rx }];
  }
  const [orders, total, counts] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
    Order.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  res.json({
    orders,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
    total,
    counts: Object.fromEntries(counts.map((c) => [c._id, c.n])),
  });
});

// Staff: update status / payment / notes.
router.patch("/:id", requireStaff, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  const { status, paymentStatus, staffNotes } = req.body || {};
  const by = req.staff.name || req.staff.email;

  if (status && status !== order.status) {
    if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status" });
    order.history.push({ by, message: `Status: ${order.status} → ${status}` });
    order.status = status;
  }
  if (paymentStatus && paymentStatus !== order.paymentStatus) {
    if (!PAYMENT_STATUSES.includes(paymentStatus)) return res.status(400).json({ error: "Invalid payment status" });
    order.history.push({ by, message: `Payment: ${order.paymentStatus} → ${paymentStatus}` });
    order.paymentStatus = paymentStatus;
  }
  if (typeof staffNotes === "string") order.staffNotes = staffNotes.slice(0, 2000);
  await order.save();
  res.json({ order });
});

module.exports = router;
