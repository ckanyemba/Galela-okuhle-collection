// Keep a short list of the customer's recent orders on this device so they can find receipts again.
const KEY = "goc-orders";

export function rememberOrder(order, token) {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]").filter((o) => o.id !== order._id);
    list.unshift({ id: order._id, token, number: order.orderNumber, total: order.total, at: order.createdAt });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 10)));
  } catch {}
}

export function recentOrders() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
