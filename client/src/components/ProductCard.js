import Link from "next/link";
import ProductImage from "./ProductImage";
import { formatRand } from "@/lib/api";

export default function ProductCard({ product, priority }) {
  const extra = product.colours?.length > 1 ? `${product.colours.length} colours` : product.size || product.colours?.[0];
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative">
        <ProductImage
          src={product.images?.[0]?.url}
          alt={product.name}
          priority={priority}
          className="aspect-[4/5] rounded-2xl transition duration-500 group-hover:shadow-lg [&_img]:transition [&_img]:duration-700 group-hover:[&_img]:scale-[1.04]"
        />
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-linen/95 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3 className="truncate text-[0.95rem] font-medium text-ink group-hover:text-caramel-dark">{product.name}</h3>
          {extra && <p className="mt-0.5 text-xs text-muted">{extra}</p>}
        </div>
        <p className="shrink-0 font-display text-lg font-semibold text-espresso">{formatRand(product.price)}</p>
      </div>
    </Link>
  );
}
