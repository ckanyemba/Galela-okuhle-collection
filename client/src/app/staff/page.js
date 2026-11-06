"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PaymentBadge } from "@/components/Receipt";
import { useStaff } from "@/context/StaffAuth";
import { PAYMENT_LABELS, STATUS_LABELS, formatDate, formatRand } from "@/lib/api";

const TABS = ["", "new", "confirmed", "ready", "completed", "cancelled"];

const STATUS_STYLE = {
  new: "bg-caramel text-linen",
  confirmed: "bg-espresso/10 text-espresso",
  ready: "bg-sage/15 text-sage",
  completed: "bg-muted/10 text-muted",
  cancelled: "bg-danger/10 text-danger",
};

export default function StaffOrders() {
  const { staffApi } = useStaff();
  const [status, setStatus] = useState("new");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const qs = new URLSearchParams({ page: String(page) });
    if (status) qs.set("status", status);
    if (q.trim()) qs.set("q", q.trim());
    return staffApi(`/orders?${qs}`)
      .then((d) => { setData(d); setError(""); })
      .catch((e) => setError(e.message));
  }, [staffApi, status, q, page]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  // Refresh every 30s so new orders appear without reloading.
  useEffect(() => {
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const counts = data?.counts || {};
  const all = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-espresso">Orders</h1>
          <p className="mt-1 text-sm text-muted">{counts.new ? `${counts.new} new order${counts.new > 1 ? "s" : ""} waiting` : "No new orders right now"}</p>
        </div>
        <input className="input w-full sm:max-w-xs"placeholder="Search name, phone, order no." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      </div>

      <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map((t) => (
          <button
            key={t || "all"}
            onClick={() => { setStatus(t); setPage(1); }}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${status === t ? "bg-espresso text-linen" : "border border-line bg-linen hover:border-espresso/40"}`}
          >
            {t ? STATUS_LABELS[t] : "All"} <span className="ml-1 opacity-60">{t ? counts[t] || 0 : all}</span>
          </button>
        ))}
      </div>

      {error && <p className="mt-6 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      {/* Phone & tablet: cards */}
      <ul className="mt-6 space-y-3 lg:hidden">
        {!data && <li className="card px-5 py-12 text-center text-muted">Loading…</li>}
        {data?.orders.length === 0 && <li className="card px-5 py-12 text-center text-muted">No orders here.</li>}
        {data?.orders.map((o) => (
          <li key={o._id}>
            <Link href={`/staff/orders/${o._id}`} className="card block p-4 transition active:bg-sand/40">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold text-espresso">{o.orderNumber}</p>
                  <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[o.status]}`}>{STATUS_LABELS[o.status]}</span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium">{o.customer.name}</p>
                  <p className="truncate text-xs text-muted">
                    {o.customer.phone} · {o.fulfilment?.method === "delivery" ? "Delivery" : "Collect"} · {o.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <PaymentBadge status={o.paymentStatus} />
                    <span className="text-xs text-muted">{PAYMENT_LABELS[o.paymentMethod]}</span>
                  </div>
                </div>
                <p className="shrink-0 font-display text-xl font-semibold">{formatRand(o.total)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="card mt-6 hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3 font-semibold">Order</th>
              <th className="px-3 py-3 font-semibold">Customer</th>
              <th className="px-3 py-3 font-semibold">Items</th>
              <th className="px-3 py-3 font-semibold">Payment</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {!data && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-muted">Loading…</td></tr>
            )}
            {data?.orders.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-muted">No orders here.</td></tr>
            )}
            {data?.orders.map((o) => (
              <tr key={o._id} className="border-b border-line/60 last:border-0 hover:bg-sand/40">
                <td className="px-5 py-3">
                  <Link href={`/staff/orders/${o._id}`} className="font-mono font-semibold text-espresso hover:text-caramel-dark">{o.orderNumber}</Link>
                  <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium">{o.customer.name}</p>
                  <p className="text-xs text-muted">{o.customer.phone} · {o.fulfilment?.method === "delivery" ? "Delivery" : "Collect"}</p>
                </td>
                <td className="px-3 py-3 text-muted">{o.items.reduce((s, i) => s + i.quantity, 0)} item(s)</td>
                <td className="px-3 py-3">
                  <p className="text-xs text-muted">{PAYMENT_LABELS[o.paymentMethod]}</p>
                  <PaymentBadge status={o.paymentStatus} />
                </td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                </td>
                <td className="px-5 py-3 text-right font-semibold">{formatRand(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button className="btn-outline px-4 py-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="text-muted">Page {data.page} of {data.pages}</span>
          <button className="btn-outline px-4 py-2" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
