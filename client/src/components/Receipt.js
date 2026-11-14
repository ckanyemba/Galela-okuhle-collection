import { PAYMENT_LABELS, SHOP, STATUS_LABELS, formatDate, formatRand } from "@/lib/api";

const PAYMENT_STATUS_STYLE = {
  paid: "bg-sage/15 text-sage",
  pending: "bg-caramel/15 text-caramel-dark",
  failed: "bg-danger/10 text-danger",
  refunded: "bg-muted/15 text-muted",
};

export function PaymentBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${PAYMENT_STATUS_STYLE[status] || ""}`}>
      {status === "pending" ? "Awaiting payment" : status}
    </span>
  );
}

export default function Receipt({ order }) {
  return (
    <article className="card overflow-hidden print:border-0">
      <header className="flex flex-col gap-4 border-b border-dashed sm:flex-row sm:items-start sm:justify-between border-line bg-sand/40 px-6 py-6 sm:px-8">
        <div>
          <p className="font-display text-2xl font-semibold text-espresso">{SHOP.name}</p>
          <p className="mt-1 text-xs text-muted">{SHOP.phone} · {SHOP.email}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Order receipt</p>
          <p className="mt-1 font-mono text-lg font-semibold text-espresso">{order.orderNumber}</p>
          <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
        </div>
      </header>

      <div className="grid gap-6 px-6 py-6 text-sm sm:grid-cols-3 sm:px-8">
        <div>
          <p className="label">Customer</p>
          <p className="font-medium">{order.customer.name}</p>
          <p className="text-muted">{order.customer.phone}</p>
          {order.customer.email && <p className="text-muted">{order.customer.email}</p>}
        </div>
        <div>
          <p className="label">{order.fulfilment?.method === "delivery" ? "Delivery" : "Collection"}</p>
          {order.fulfilment?.method === "delivery" ? (
            <p className="whitespace-pre-line text-muted">{order.fulfilment.address}</p>
          ) : (
            <p className="text-muted">Collect from {SHOP.name}</p>
          )}
        </div>
        <div>
          <p className="label">Payment</p>
          <p className="font-medium">{PAYMENT_LABELS[order.paymentMethod]}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <PaymentBadge status={order.paymentStatus} />
            <span className="text-xs text-muted">Order: {STATUS_LABELS[order.status]}</span>
          </div>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-line text-left text-xs uppercase tracking-wider text-muted">
            <th className="px-6 py-2.5 font-semibold sm:px-8">Item</th>
            <th className="px-2 py-2.5 text-center font-semibold">Qty</th>
            <th className="hidden px-2 py-2.5 text-right font-semibold sm:table-cell">Price</th>
            <th className="px-6 py-2.5 text-right font-semibold sm:px-8">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i, idx) => (
            <tr key={idx} className="border-b border-line/60">
              <td className="px-6 py-3 sm:px-8">
                <p className="font-medium">{i.name}</p>
                {i.colour && <p className="text-xs text-muted">Colour: {i.colour}</p>}
              </td>
              <td className="px-2 py-3 text-center">{i.quantity}</td>
              <td className="hidden px-2 py-3 text-right sm:table-cell">{formatRand(i.price)}</td>
              <td className="px-6 py-3 text-right sm:px-8">{formatRand(i.price * i.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ml-auto max-w-xs space-y-1.5 px-6 py-5 text-sm sm:px-8">
        <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatRand(order.subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt className="text-muted">{order.fulfilment?.method === "delivery" ? "Delivery" : "Collection"}</dt>
          <dd>{order.deliveryFee ? formatRand(order.deliveryFee) : order.fulfilment?.method === "delivery" ? "TBC" : "Free"}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd className="font-display text-xl">{formatRand(order.total)}</dd>
        </div>
      </dl>

      {order.notes && (
        <div className="border-t border-dashed border-line px-6 py-4 text-sm sm:px-8">
          <p className="label">Notes</p>
          <p className="whitespace-pre-line text-muted">{order.notes}</p>
        </div>
      )}
    </article>
  );
}
