"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductImage from "@/components/ProductImage";
import { CardIcon, CashIcon, MailIcon, WhatsAppIcon } from "@/components/Icons";
import { useCart } from "@/context/CartContext";
import { api, formatRand } from "@/lib/api";
import { submitForm } from "@/lib/submitForm";
import { rememberOrder } from "@/lib/orders";

const METHODS = [
  { key: "payfast", icon: CardIcon, title: "Pay online with PayFast", text: "Card, Instant EFT, SnapScan and more" },
  { key: "yoco", icon: CardIcon, title: "Pay by card with Yoco", text: "Visa, Mastercard, Apple Pay and Google Pay" },
  { key: "whatsapp", icon: WhatsAppIcon, title: "Order via WhatsApp", text: "Send your order to us on WhatsApp and we will confirm payment details" },
  { key: "email", icon: MailIcon, title: "Order via email", text: "Email your order and we will reply to confirm" },
  { key: "cash", icon: CashIcon, title: "Pay cash", text: "Pay when you collect or when your order is delivered" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, ready, subtotal, clear } = useCart();
  const [cfg, setCfg] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", method: "collection", address: "", notes: "", payment: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/config")
      .then(setCfg)
      .catch(() => setCfg({ deliveryFee: 0, payments: { whatsapp: true, email: true, cash: true } }));
  }, []);

  const available = METHODS.filter((m) => cfg?.payments?.[m.key]);
  const deliveryFee = form.method === "delivery" ? cfg?.deliveryFee || 0 : 0;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const emailRequired = form.payment === "payfast" || form.payment === "email";

  async function placeOrder(e) {
    e.preventDefault();
    setError("");
    if (!form.payment) return setError("Please choose how you would like to pay");
    setBusy(true);
    try {
      const { order, token, payment, paymentError } = await api("/orders", {
        method: "POST",
        body: {
          customer: { name: form.name, phone: form.phone, email: form.email },
          fulfilment: { method: form.method, address: form.address },
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, colour: i.colour })),
          paymentMethod: form.payment,
          notes: form.notes,
        },
      });
      rememberOrder(order, token);
      clear();
      const receipt = `/order/${order._id}?token=${token}`;
      if (payment?.type === "form") return submitForm(payment.action, payment.fields);
      if (payment?.type === "redirect") return void (window.location.href = payment.url);
      router.push(paymentError ? `${receipt}&payment=error` : `${receipt}&new=1`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (ready && !items.length && !busy) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold text-espresso">Nothing to check out</h1>
        <Link href="/shop" className="btn-primary mt-8">Go shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
      <h1 className="font-display text-5xl font-semibold text-espresso">Checkout</h1>
      <form onSubmit={placeOrder} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <section className="card p-6">
            <h2 className="mb-5 font-display text-2xl font-semibold">Your details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="name">Full name</label>
                <input id="name" className="input" required value={form.name} onChange={set("name")} autoComplete="name" />
              </div>
              <div>
                <label className="label" htmlFor="phone">Cellphone</label>
                <input id="phone" className="input" required type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="082 000 0000" />
              </div>
              <div>
                <label className="label" htmlFor="email">Email {emailRequired ? "" : "(optional)"}</label>
                <input id="email" className="input" type="email" required={emailRequired} value={form.email} onChange={set("email")} autoComplete="email" />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="mb-5 font-display text-2xl font-semibold">Collection or delivery</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "collection", title: "Collect", text: "We will WhatsApp you when it's ready" },
                { key: "delivery", title: "Delivery", text: cfg?.deliveryFee ? `${formatRand(cfg.deliveryFee)} delivery fee` : "Delivery cost confirmed with you" },
              ].map((o) => (
                <label key={o.key} className={`cursor-pointer rounded-xl border p-4 transition ${form.method === o.key ? "border-caramel bg-caramel/5 ring-2 ring-caramel/20" : "border-line hover:border-espresso/30"}`}>
                  <input type="radio" name="method" value={o.key} checked={form.method === o.key} onChange={set("method")} className="sr-only" />
                  <span className="block font-medium">{o.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">{o.text}</span>
                </label>
              ))}
            </div>
            {form.method === "delivery" && (
              <div className="mt-4">
                <label className="label" htmlFor="address">Delivery address</label>
                <textarea id="address" className="input min-h-24" required value={form.address} onChange={set("address")} autoComplete="street-address" />
              </div>
            )}
            <div className="mt-4">
              <label className="label" htmlFor="notes">Order notes (optional)</label>
              <textarea id="notes" className="input min-h-20" value={form.notes} onChange={set("notes")} placeholder="Anything we should know?" />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="mb-5 font-display text-2xl font-semibold">Payment</h2>
            {!cfg ? (
              <p className="text-sm text-muted">Loading payment options…</p>
            ) : (
              <div className="space-y-3">
                {available.map(({ key, icon: Icon, title, text }) => (
                  <label key={key} className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${form.payment === key ? "border-caramel bg-caramel/5 ring-2 ring-caramel/20" : "border-line hover:border-espresso/30"}`}>
                    <input type="radio" name="payment" value={key} checked={form.payment === key} onChange={set("payment")} className="sr-only" />
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${form.payment === key ? "bg-caramel text-linen" : "bg-sand text-caramel-dark"}`}><Icon /></span>
                    <span>
                      <span className="block font-medium">{title}</span>
                      <span className="mt-0.5 block text-xs text-muted">{text}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={`${i.productId}-${i.colour}`} className="flex gap-3 text-sm">
                <ProductImage src={i.image} alt={i.name} sizes="56px" className="h-16 w-14 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{i.name}</p>
                  <p className="text-xs text-muted">{i.colour ? `${i.colour} · ` : ""}Qty {i.quantity}</p>
                </div>
                <span className="shrink-0">{formatRand(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatRand(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">{form.method === "delivery" ? "Delivery" : "Collection"}</dt><dd>{deliveryFee ? formatRand(deliveryFee) : form.method === "delivery" ? "To be confirmed" : "Free"}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>Total</dt><dd className="font-display text-xl">{formatRand(subtotal + deliveryFee)}</dd></div>
          </dl>
          {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <button type="submit" className="btn-primary mt-5 w-full" disabled={busy || !items.length}>
            {busy ? "Placing order…" : form.payment === "payfast" || form.payment === "yoco" ? "Place order & pay" : "Place order"}
          </button>
          <p className="mt-3 text-center text-xs text-muted">You will get a receipt with your order number.</p>
        </aside>
      </form>
    </div>
  );
}
