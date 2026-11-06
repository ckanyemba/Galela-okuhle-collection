const crypto = require("crypto");
const config = require("../config");

const host = () => (config.payfast.sandbox ? "https://sandbox.payfast.co.za" : "https://www.payfast.co.za");

// PayFast signs with PHP urlencode() semantics: spaces as "+", uppercase hex, and !'()*~ escaped.
const phpEncode = (v) =>
  encodeURIComponent(String(v).trim())
    .replace(/[!'()*~]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, "+");

function paramString(fields) {
  return Object.entries(fields)
    .filter(([k, v]) => k !== "signature" && v !== undefined && v !== null && String(v) !== "")
    .map(([k, v]) => `${k}=${phpEncode(v)}`)
    .join("&");
}

function sign(fields) {
  let str = paramString(fields);
  if (config.payfast.passphrase) str += `&passphrase=${phpEncode(config.payfast.passphrase)}`;
  return crypto.createHash("md5").update(str).digest("hex");
}

/** Build the auto-submitting form payload for an order. Field order matters for the signature. */
function buildCheckout(order) {
  const [first, ...rest] = order.customer.name.split(" ");
  const token = order.accessToken;
  const receipt = `${config.clientUrl}/order/${order._id}?token=${token}`;
  const fields = {
    merchant_id: config.payfast.merchantId,
    merchant_key: config.payfast.merchantKey,
    return_url: `${receipt}&payment=success`,
    cancel_url: `${receipt}&payment=cancelled`,
    notify_url: `${config.serverUrl}/api/payments/payfast/notify`,
    name_first: first,
    name_last: rest.join(" ") || undefined,
    email_address: order.customer.email || undefined,
    m_payment_id: String(order._id),
    amount: order.total.toFixed(2),
    item_name: `${config.shop.name} order ${order.orderNumber}`,
  };
  fields.signature = sign(fields);
  return { action: `${host()}/eng/process`, fields };
}

/** Verify an ITN post: signature, then confirm with PayFast's validate endpoint. */
async function verifyNotification(body) {
  if (!body.signature || sign(body) !== body.signature) return false;
  try {
    const res = await fetch(`${host()}/eng/query/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: paramString(body),
    });
    return (await res.text()).trim() === "VALID";
  } catch (err) {
    console.error("PayFast validate call failed", err.message);
    return false;
  }
}

module.exports = { buildCheckout, verifyNotification };
