const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const payfast = require("../lib/payfast");
const yoco = require("../lib/yoco");

const router = express.Router();

async function markPaid(order, by, reference) {
  if (order.paymentStatus === "paid") return;
  order.paymentStatus = "paid";
  if (reference) order.paymentReference = reference;
  if (order.status === "new") order.status = "confirmed";
  order.history.push({ by, message: "Payment received" });
  await order.save();
}

// PayFast ITN (server-to-server). Always answer 200 so PayFast stops retrying once we've handled it.
router.post("/payfast/notify", express.urlencoded({ extended: false }), async (req, res) => {
  res.sendStatus(200);
  try {
    const body = req.body || {};
    if (!(await payfast.verifyNotification(body))) return console.warn("PayFast ITN failed verification");
    if (!mongoose.isValidObjectId(body.m_payment_id)) return;
    const order = await Order.findById(body.m_payment_id);
    if (!order) return;
    if (Math.abs(Number(body.amount_gross) - order.total) > 0.01) {
      order.history.push({ by: "payfast", message: `Amount mismatch: received R${body.amount_gross}` });
      return order.save();
    }
    if (body.payment_status === "COMPLETE") await markPaid(order, "payfast", body.pf_payment_id);
    else if (body.payment_status === "CANCELLED") {
      order.paymentStatus = "failed";
      order.history.push({ by: "payfast", message: "Payment cancelled" });
      await order.save();
    }
  } catch (err) {
    console.error("PayFast ITN error", err);
  }
});

// Yoco webhook. Needs the raw body for signature verification.
router.post("/yoco/webhook", express.raw({ type: "*/*" }), async (req, res) => {
  const raw = req.body.toString("utf8");
  if (!yoco.verifyWebhook(req.headers, raw)) return res.sendStatus(401);
  res.sendStatus(200);
  try {
    const event = JSON.parse(raw);
    const checkoutId = event.payload?.metadata?.checkoutId;
    if (event.type !== "payment.succeeded" || !checkoutId) return;
    const order = await Order.findOne({ paymentReference: checkoutId });
    if (!order) return;
    if (Number(event.payload.amount) !== Math.round(order.total * 100)) {
      order.history.push({ by: "yoco", message: `Amount mismatch: received ${event.payload.amount} cents` });
      return order.save();
    }
    await markPaid(order, "yoco", checkoutId);
  } catch (err) {
    console.error("Yoco webhook error", err);
  }
});

module.exports = router;
