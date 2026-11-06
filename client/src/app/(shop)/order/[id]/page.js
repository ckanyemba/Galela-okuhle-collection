"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import Receipt from "@/components/Receipt";
import { MailIcon, WhatsAppIcon } from "@/components/Icons";
import { api, mailtoLink, orderMessage, SHOP, whatsappLink } from "@/lib/api";
import { submitForm } from "@/lib/submitForm";

function OrderView() {
  const { id } = useParams();
  const params = useSearchParams();
  const token = params.get("token");
  const paymentParam = params.get("payment");
  const isNew = params.get("new") === "1";

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  const load = useCallback(
    () =>
      api(`/orders/${id}?token=${encodeURIComponent(token || "")}`)
        .then((d) => setOrder(d.order))
        .catch((e) => setError(e.message)),
    [id, token]
  );

  useEffect(() => {
    load();
  }, [load]);

  // After returning from a payment gateway, the webhook may land a few seconds later.
  useEffect(() => {
    if (paymentParam !== "success" || order?.paymentStatus !== "pending") return;
    const t = setInterval(load, 4000);
    const stop = setTimeout(() => clearInterval(t), 60000);
    return () => { clearInterval(t); clearTimeout(stop); };
  }, [paymentParam, order?.paymentStatus, load]);

  async function payNow() {
    setPaying(true);
    try {
      const { payment } = await api(`/orders/${id}/pay?token=${encodeURIComponent(token)}`, { method: "POST" });
      if (payment?.type === "form") submitForm(payment.action, payment.fields);
      else if (payment?.type === "redirect") window.location.href = payment.url;
    } catch (e) {
      setError(e.message);
      setPaying(false);
    }
  }

  if (error && !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold">Order not found</h1>
        <p className="mt-3 text-muted">Check the link, or contact us on WhatsApp at {SHOP.phone}.</p>
        <Link href="/" className="btn-primary mt-8">Back to shop</Link>
      </div>
    );
  }
  if (!order) return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted">Loading your receipt…</div>;

  const receiptUrl = typeof window !== "undefined" ? window.location.href.split("&")[0] : "";
  const message = orderMessage(order, receiptUrl);
  const online = order.paymentMethod === "payfast" || order.paymentMethod === "yoco";
  const unpaid = order.paymentStatus !== "paid" && order.status !== "cancelled";

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
      <div className="no-print mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-caramel">
          {order.paymentStatus === "paid" ? "Payment received" : "Order received"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-espresso sm:text-5xl">
          {order.paymentStatus === "paid" ? "Thank you for your order!" : isNew || paymentParam ? "Thank you!" : "Your order"}
        </h1>
        <p className="mt-3 text-muted">Keep this page. It is your receipt. Your order number is <strong className="font-mono text-espresso">{order.orderNumber}</strong>.</p>
      </div>

      {/* Next-step call to action per payment method */}
      <div className="no-print mb-6 space-y-3">
        {paymentParam === "success" && order.paymentStatus === "pending" && (
          <Notice tone="info">We&apos;re confirming your payment with the bank. This page updates automatically.</Notice>
        )}
        {(paymentParam === "cancelled" || paymentParam === "failed") && unpaid && (
          <Notice tone="warn">Your payment didn&apos;t go through. Your order is saved, so you can try again below.</Notice>
        )}
        {paymentParam === "error" && (
          <Notice tone="warn">We couldn&apos;t reach the payment provider. Your order is saved, so you can try paying again below.</Notice>
        )}
        {error && <Notice tone="warn">{error}</Notice>}

        {online && unpaid && (
          <button onClick={payNow} disabled={paying} className="btn-accent w-full">
            {paying ? "Redirecting…" : `Pay now with ${order.paymentMethod === "payfast" ? "PayFast" : "Yoco"}`}
          </button>
        )}
        {order.paymentMethod === "whatsapp" && unpaid && (
          <div className="card p-5 text-center">
            <p className="text-sm text-muted">Last step: send your order to us on WhatsApp so we can confirm it and share payment details.</p>
            <a href={whatsappLink(message)} target="_blank" rel="noreferrer" className="btn mt-4 w-full bg-[#25D366] text-white hover:bg-[#1ebe5b]">
              <WhatsAppIcon /> Send order on WhatsApp
            </a>
          </div>
        )}
        {order.paymentMethod === "email" && unpaid && (
          <div className="card p-5 text-center">
            <p className="text-sm text-muted">Last step: email your order to us and we&apos;ll reply to confirm.</p>
            <a href={mailtoLink(`Order ${order.orderNumber}`, message)} className="btn-primary mt-4 w-full">
              <MailIcon /> Email my order
            </a>
          </div>
        )}
        {order.paymentMethod === "cash" && unpaid && (
          <Notice tone="info">
            Please pay cash on {order.fulfilment?.method === "delivery" ? "delivery" : "collection"}. We&apos;ll WhatsApp you on {order.customer.phone} when your order is ready.
          </Notice>
        )}
      </div>

      <Receipt order={order} />

      <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={() => window.print()} className="btn-outline">Print / save PDF</button>
        <Link href="/shop" className="btn-outline">Continue shopping</Link>
      </div>
      <p className="no-print mt-6 text-center text-xs text-muted">
        Questions? WhatsApp us on{" "}
        <a className="underline" href={whatsappLink(`Hi, I have a question about order ${order.orderNumber}.`)} target="_blank" rel="noreferrer">{SHOP.phone}</a>.
      </p>
    </div>
  );
}

function Notice({ tone, children }) {
  const style = tone === "warn" ? "bg-danger/10 text-danger" : "bg-sage/10 text-sage";
  return <p className={`rounded-xl px-4 py-3 text-center text-sm ${style}`}>{children}</p>;
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="py-24" />}>
      <OrderView />
    </Suspense>
  );
}
