"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Receipt from "@/components/Receipt";
import { WhatsAppIcon } from "@/components/Icons";
import { useStaff } from "@/context/StaffAuth";
import { STATUS_LABELS, SHOP, formatDate, whatsappLink } from "@/lib/api";

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

/** Convert a local SA number (082...) to WhatsApp international format (2782...). */
const toWhatsApp = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `27${digits.slice(1)}` : digits;
};

export default function StaffOrderDetail() {
  const { id } = useParams();
  const { staffApi } = useStaff();
  const [order, setOrder] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    staffApi(`/orders/${id}`)
      .then((d) => { setOrder(d.order); setNotes(d.order.staffNotes || ""); })
      .catch((e) => setError(e.message));
  }, [id, staffApi]);

  async function save(patch) {
    setSaving(true);
    setMsg("");
    setError("");
    try {
      const d = await staffApi(`/orders/${id}`, { method: "PATCH", body: patch });
      setOrder(d.order);
      setMsg("Saved");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (error && !order) return <p className="rounded-lg bg-danger/10 px-4 py-3 text-danger">{error}</p>;
  if (!order) return <p className="py-12 text-center text-muted">Loading…</p>;

  const readyText = `Hi ${order.customer.name.split(" ")[0]}, your ${SHOP.name} order ${order.orderNumber} is ready${
    order.fulfilment?.method === "delivery" ? " and on its way" : " for collection"
  }. Thank you!`;

  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/staff" className="text-sm text-caramel-dark hover:underline">← All orders</Link>
        <div className="flex gap-2">
          <a href={whatsappLink(readyText, toWhatsApp(order.customer.phone))} target="_blank" rel="noreferrer" className="btn-outline px-4 py-2">
            <WhatsAppIcon /> WhatsApp customer
          </a>
          <button onClick={() => window.print()} className="btn-outline px-4 py-2">Print receipt</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Receipt order={order} />

        <aside className="no-print space-y-4">
          <div className="card p-5">
            <label className="label" htmlFor="status">Order status</label>
            <select id="status" className="input" value={order.status} disabled={saving} onChange={(e) => save({ status: e.target.value })}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <label className="label mt-4" htmlFor="pay">Payment status</label>
            <select id="pay" className="input capitalize" value={order.paymentStatus} disabled={saving} onChange={(e) => save({ paymentStatus: e.target.value })}>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {order.paymentReference && <p className="mt-2 break-all text-xs text-muted">Ref: {order.paymentReference}</p>}
          </div>

          <div className="card p-5">
            <label className="label" htmlFor="notes">Staff notes (private)</label>
            <textarea id="notes" className="input min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <button className="btn-primary mt-3 w-full py-2" disabled={saving || notes === (order.staffNotes || "")} onClick={() => save({ staffNotes: notes })}>
              Save notes
            </button>
          </div>

          {msg && <p className="text-center text-sm text-sage">{msg}</p>}
          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <div className="card p-5">
            <p className="label">History</p>
            <ol className="space-y-3 text-xs">
              {[...(order.history || [])].reverse().map((h, i) => (
                <li key={i}>
                  <p className="text-espresso">{h.message}</p>
                  <p className="text-muted">{h.by} · {formatDate(h.at)}</p>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
