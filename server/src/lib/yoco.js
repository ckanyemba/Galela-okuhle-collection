const crypto = require("crypto");
const config = require("../config");

/** Create a hosted Yoco checkout and return { id, redirectUrl }. */
async function createCheckout(order) {
  const receipt = `${config.clientUrl}/order/${order._id}?token=${order.accessToken}`;
  const res = await fetch("https://payments.yoco.com/api/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.yoco.secretKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `order-${order._id}`,
    },
    body: JSON.stringify({
      amount: Math.round(order.total * 100), // cents
      currency: "ZAR",
      successUrl: `${receipt}&payment=success`,
      cancelUrl: `${receipt}&payment=cancelled`,
      failureUrl: `${receipt}&payment=failed`,
      metadata: { orderId: String(order._id), orderNumber: order.orderNumber },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.description || `Yoco checkout failed (${res.status})`);
  return { id: data.id, redirectUrl: data.redirectUrl };
}

/**
 * Verify a Yoco webhook (Standard Webhooks scheme):
 * signature = base64(HMAC-SHA256(secret, `${id}.${timestamp}.${rawBody}`)), header "v1,<sig> ...".
 */
function verifyWebhook(headers, rawBody) {
  const id = headers["webhook-id"];
  const timestamp = headers["webhook-timestamp"];
  const sigHeader = headers["webhook-signature"];
  if (!config.yoco.webhookSecret || !id || !timestamp || !sigHeader) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 5 * 60) return false;

  const secret = Buffer.from(config.yoco.webhookSecret.replace(/^whsec_/, ""), "base64");
  const expected = crypto.createHmac("sha256", secret).update(`${id}.${timestamp}.${rawBody}`).digest("base64");
  return sigHeader.split(" ").some((part) => {
    const sig = part.split(",")[1];
    return sig && sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  });
}

module.exports = { createCheckout, verifyWebhook };
