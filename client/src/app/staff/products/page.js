"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ProductImage from "@/components/ProductImage";
import { useStaff } from "@/context/StaffAuth";
import { api, formatRand } from "@/lib/api";

export default function StaffProducts() {
  const { staffApi } = useStaff();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => api("/products").then((d) => setProducts(d.products)).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  async function toggleStock(p) {
    try {
      await staffApi(`/products/${p._id}`, { method: "PUT", body: { inStock: !p.inStock } });
      setProducts((list) => list.map((x) => (x._id === p._id ? { ...x, inStock: !p.inStock } : x)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await staffApi(`/products/${p._id}`, { method: "DELETE" });
      setProducts((list) => list.filter((x) => x._id !== p._id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold text-espresso">Products</h1>
        <Link href="/staff/products/new" className="btn-primary px-5">+ Add<span className="hidden sm:inline">&nbsp;product</span></Link>
      </div>
      {error && <p className="mt-6 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}
      {/* Phone: cards */}
      <ul className="mt-6 space-y-3 md:hidden">
        {!products && <li className="card px-5 py-12 text-center text-muted">Loading…</li>}
        {products?.length === 0 && <li className="card px-5 py-12 text-center text-muted">No products yet.</li>}
        {products?.map((p) => (
          <li key={p._id} className="card flex gap-3 p-3">
            <Link href={`/staff/products/${p._id}`} className="shrink-0">
              <ProductImage src={p.images?.[0]?.url} alt="" sizes="72px" className="h-24 w-[4.5rem] rounded-lg" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/staff/products/${p._id}`} className="min-w-0 font-medium leading-snug">{p.name}</Link>
                <span className="shrink-0 font-semibold">{formatRand(p.price)}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted">
                <span className="capitalize">{p.category}</span>{p.featured ? " · Featured" : ""}{p.colours?.length ? ` · ${p.colours.length} colour${p.colours.length > 1 ? "s" : ""}` : ""}
              </p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                <button onClick={() => toggleStock(p)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${p.inStock ? "bg-sage/15 text-sage" : "bg-danger/10 text-danger"}`}>
                  {p.inStock ? "In stock" : "Sold out"}
                </button>
                <div className="flex items-center text-sm">
                  <Link href={`/staff/products/${p._id}`} className="px-2 py-1.5 text-caramel-dark">Edit</Link>
                  <button onClick={() => remove(p)} className="px-2 py-1.5 text-muted">Delete</button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet & desktop: table */}
      <div className="card mt-6 hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-3 py-3 font-semibold">Category</th>
              <th className="px-3 py-3 font-semibold">Price</th>
              <th className="px-3 py-3 font-semibold">Stock</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!products && <tr><td colSpan={5} className="px-5 py-12 text-center text-muted">Loading…</td></tr>}
            {products?.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-muted">No products yet.</td></tr>}
            {products?.map((p) => (
              <tr key={p._id} className="border-b border-line/60 last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <ProductImage src={p.images?.[0]?.url} alt="" sizes="48px" className="h-14 w-12 shrink-0 rounded-lg" />
                    <div>
                      <Link href={`/staff/products/${p._id}`} className="font-medium hover:text-caramel-dark">{p.name}</Link>
                      {p.featured && <span className="ml-2 rounded-full bg-caramel/15 px-2 py-0.5 text-[0.65rem] font-semibold text-caramel-dark">Featured</span>}
                      {p.colours?.length > 0 && <p className="text-xs text-muted">{p.colours.join(", ")}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 capitalize text-muted">{p.category}</td>
                <td className="px-3 py-3 font-semibold">{formatRand(p.price)}</td>
                <td className="px-3 py-3">
                  <button onClick={() => toggleStock(p)} className={`rounded-full px-3 py-1 text-xs font-semibold ${p.inStock ? "bg-sage/15 text-sage" : "bg-danger/10 text-danger"}`}>
                    {p.inStock ? "In stock" : "Sold out"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/staff/products/${p._id}`} className="mr-4 text-caramel-dark hover:underline">Edit</Link>
                  <button onClick={() => remove(p)} className="text-muted hover:text-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
