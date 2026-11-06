"use client";

import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/context/CartContext";
import { formatRand } from "@/lib/api";

export default function CartPage() {
  const { items, ready, subtotal, update, remove } = useCart();

  if (!ready) return <div className="mx-auto max-w-4xl px-4 py-24" />;

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold text-espresso">Your cart is empty</h1>
        <p className="mt-3 text-muted">Find something you love and it will show up here.</p>
        <Link href="/shop" className="btn-primary mt-8">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
      <h1 className="font-display text-5xl font-semibold text-espresso">Your cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={`${item.productId}-${item.colour}`} className="flex gap-4 py-5">
              <Link href={`/product/${item.slug}`} className="shrink-0">
                <ProductImage src={item.image} alt={item.name} sizes="96px" className="h-28 w-24 rounded-xl" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/product/${item.slug}`} className="font-medium text-ink hover:text-caramel-dark">{item.name}</Link>
                    {item.colour && <p className="mt-0.5 text-sm text-muted">Colour: {item.colour}</p>}
                  </div>
                  <p className="shrink-0 font-display text-lg font-semibold">{formatRand(item.price * item.quantity)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-line bg-linen text-sm">
                    <button className="px-3 py-1.5" onClick={() => update(item, item.quantity - 1)} aria-label="Decrease">−</button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button className="px-3 py-1.5" onClick={() => update(item, item.quantity + 1)} aria-label="Increase">+</button>
                  </div>
                  <button className="text-xs font-medium text-muted underline hover:text-danger" onClick={() => remove(item)}>Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="card h-fit p-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold">{formatRand(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-muted">Delivery or collection is chosen at checkout.</p>
          <Link href="/checkout" className="btn-primary mt-6 w-full">Checkout</Link>
          <Link href="/shop" className="mt-3 block text-center text-sm text-caramel-dark hover:underline">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
