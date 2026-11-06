export const API_URL = (process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");

export const SHOP = {
  name: "Galela Okuhle Collection",
  whatsapp: "27820743413",
  phone: "082 074 3413",
  email: "mahlabs22@gmail.com",
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/** JSON fetch against the Express API. Pass `token` for staff routes. */
export async function api(path, { token, body, headers, ...opts } = {}) {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const res = await fetch(`${API_URL}/api${path}`, {
    ...opts,
    headers: {
      ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  return data;
}

/** Server-side product fetch with ISR; returns [] if the API is unreachable so pages still render. */
export async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  try {
    const res = await fetch(`${API_URL}/api/products${qs ? `?${qs}` : ""}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()).products;
  } catch {
    return [];
  }
}

export async function getProduct(slug) {
  try {
    const res = await fetch(`${API_URL}/api/products/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).product;
  } catch {
    return null;
  }
}

export const formatRand = (n) =>
  "R" + Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }).replace(/ /g, " ");

export const formatDate = (d) =>
  new Date(d).toLocaleString("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const PAYMENT_LABELS = {
  payfast: "PayFast (card / Instant EFT)",
  yoco: "Card (Yoco)",
  whatsapp: "Order via WhatsApp",
  email: "Order via email",
  cash: "Cash",
};

export const STATUS_LABELS = {
  new: "New",
  confirmed: "Confirmed",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function orderMessage(order, receiptUrl) {
  const lines = order.items.map(
    (i) => `• ${i.quantity} × ${i.name}${i.colour ? ` (${i.colour})` : ""}: ${formatRand(i.price * i.quantity)}`
  );
  const how =
    order.fulfilment?.method === "delivery" ? `Delivery to: ${order.fulfilment.address}` : "Collection";
  return [
    `Hi ${SHOP.name}, I'd like to confirm my order ${order.orderNumber}:`,
    "",
    ...lines,
    "",
    `Total: ${formatRand(order.total)}`,
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    how,
    order.notes ? `Notes: ${order.notes}` : null,
    "",
    `Receipt: ${receiptUrl}`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export const whatsappLink = (text, number = SHOP.whatsapp) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const mailtoLink = (subject, body, to = SHOP.email) =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
