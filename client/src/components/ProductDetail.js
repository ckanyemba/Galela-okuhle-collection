"use client";

import Link from "next/link";
import { useState } from "react";
import ProductImage from "./ProductImage";
import { WhatsAppIcon } from "./Icons";
import { useCart } from "@/context/CartContext";
import { formatRand, whatsappLink } from "@/lib/api";

export default function ProductDetail({ product }) {
  const { add } = useCart();
  const images = product.images?.length ? product.images : [{ url: null }];
  const [active, setActive] = useState(0);
  const [colour, setColour] = useState(product.colours?.length === 1 ? product.colours[0] : "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const needsColour = product.colours?.length > 1;

  function handleAdd() {
    if (needsColour && !colour) return setError("Please choose a colour");
    setError("");
    add(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url,
        colour: colour || undefined,
      },
      qty
    );
    setAdded(true);
  }

  return (
    <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
      {/* Gallery */}
      <div>
        <ProductImage
          src={images[active].url}
          alt={product.name}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="aspect-[4/5] rounded-3xl"
        />
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
            {images.map((img, i) => (
              <button
                key={img.url + i}
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-cream transition ${i === active ? "ring-caramel" : "ring-transparent hover:ring-line"}`}
                aria-label={`Image ${i + 1}`}
              >
                <ProductImage src={img.url} alt="" sizes="100px" className="aspect-square" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="md:pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel">
          {product.category === "cleaning" ? "Gosh Detergents" : "Bags"}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-espresso sm:text-5xl">{product.name}</h1>
        <p className="mt-4 font-display text-3xl font-semibold text-espresso">{formatRand(product.price)}</p>

        {product.description && <p className="mt-6 leading-relaxed text-muted">{product.description}</p>}

        {(product.dimensions || product.size) && (
          <dl className="mt-6 flex gap-8 text-sm">
            {product.dimensions && (
              <div>
                <dt className="label">Size (W × D × H)</dt>
                <dd className="text-espresso">{product.dimensions}</dd>
              </div>
            )}
            {product.size && (
              <div>
                <dt className="label">Size</dt>
                <dd className="text-espresso">{product.size}</dd>
              </div>
            )}
          </dl>
        )}

        {product.colours?.length > 0 && (
          <div className="mt-8">
            <p className="label">Colour{colour && <span className="ml-2 normal-case tracking-normal text-espresso">· {colour}</span>}</p>
            <div className="flex flex-wrap gap-2">
              {product.colours.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColour(c); setError(""); setAdded(false); }}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    colour === c ? "border-espresso bg-espresso text-linen" : "border-line bg-linen text-espresso hover:border-espresso/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-line bg-linen">
            <button className="px-4 py-3 text-lg leading-none text-espresso" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
            <span className="w-8 text-center text-sm font-medium">{qty}</span>
            <button className="px-4 py-3 text-lg leading-none text-espresso" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase">+</button>
          </div>
          <button className="btn-primary flex-1" disabled={!product.inStock} onClick={handleAdd}>
            {product.inStock ? "Add to cart" : "Sold out"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        {added && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-sage/10 px-4 py-3 text-sm text-sage">
            <span>Added to your cart.</span>
            <Link href="/cart" className="font-semibold underline">View cart →</Link>
          </div>
        )}

        <a
          href={whatsappLink(`Hi, I'm interested in the ${product.name}${colour ? ` (${colour})` : ""}.`)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sage hover:underline"
        >
          <WhatsAppIcon /> Ask about this on WhatsApp
        </a>

        {product.details?.length > 0 && (
          <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-espresso">
            {product.details.map((d) => (
              <li key={d} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-caramel" />
                {d}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
