"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProductImage from "@/components/ProductImage";
import { useStaff } from "@/context/StaffAuth";
import { api } from "@/lib/api";

const EMPTY = {
  name: "", category: "bags", price: "", size: "", dimensions: "", description: "",
  details: "", colours: "", images: [], inStock: true, featured: false, sortOrder: 0,
};

const toForm = (p) => ({
  ...EMPTY,
  ...p,
  price: String(p.price ?? ""),
  details: (p.details || []).join("\n"),
  colours: (p.colours || []).join(", "),
  size: p.size || "",
  dimensions: p.dimensions || "",
});

export default function ProductEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const router = useRouter();
  const { staffApi } = useStaff();
  const fileRef = useRef(null);

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return;
    api("/products")
      .then(({ products }) => {
        const p = products.find((x) => x._id === id);
        if (!p) throw new Error("Product not found");
        setForm(toForm(p));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function upload(e) {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      const { images } = await staffApi("/uploads", { method: "POST", body: fd });
      setForm((f) => ({ ...f, images: [...f.images, ...images] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const moveImage = (i, dir) =>
    setForm((f) => {
      const imgs = [...f.images];
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return f;
      [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
      return { ...f, images: imgs };
    });

  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      size: form.size.trim() || undefined,
      dimensions: form.dimensions.trim() || undefined,
      description: form.description.trim(),
      details: form.details.split("\n").map((s) => s.trim()).filter(Boolean),
      colours: form.colours.split(",").map((s) => s.trim()).filter(Boolean),
      images: form.images,
      inStock: form.inStock,
      featured: form.featured,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (isNew) await staffApi("/products", { method: "POST", body });
      else await staffApi(`/products/${id}`, { method: "PUT", body });
      router.push("/staff/products");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) return <p className="py-12 text-center text-muted">Loading…</p>;

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl">
      <Link href="/staff/products" className="text-sm text-caramel-dark hover:underline">← Products</Link>
      <h1 className="mt-3 font-display text-4xl font-semibold text-espresso">{isNew ? "Add product" : "Edit product"}</h1>

      <div className="card mt-6 grid gap-5 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">Name</label>
          <input id="name" className="input" required value={form.name} onChange={set("name")} />
        </div>
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" className="input" value={form.category} onChange={set("category")}>
            <option value="bags">Bags</option>
            <option value="cleaning">Cleaning</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="price">Price (R)</label>
          <input id="price" className="input" required type="number" min="0" step="1" value={form.price} onChange={set("price")} />
        </div>
        <div>
          <label className="label" htmlFor="dimensions">Dimensions (bags)</label>
          <input id="dimensions" className="input" placeholder="24 × 8 × 17 cm" value={form.dimensions} onChange={set("dimensions")} />
        </div>
        <div>
          <label className="label" htmlFor="size">Size (cleaning)</label>
          <input id="size" className="input" placeholder="500 ml" value={form.size} onChange={set("size")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="colours">Colours (comma separated)</label>
          <input id="colours" className="input" placeholder="Black, Tan, Cream" value={form.colours} onChange={set("colours")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" className="input min-h-28" value={form.description} onChange={set("description")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="details">Key features (one per line)</label>
          <textarea id="details" className="input min-h-28" value={form.details} onChange={set("details")} />
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.inStock} onChange={set("inStock")} className="h-4 w-4 accent-caramel" /> In stock</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={set("featured")} className="h-4 w-4 accent-caramel" /> Featured on home page</label>
          <label className="flex items-center gap-2 text-sm">
            Sort order
            <input type="number" className="input w-20 py-1.5" value={form.sortOrder} onChange={set("sortOrder")} />
          </label>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="label mb-0">Images (first image is the main photo)</p>
          <button type="button" className="btn-outline px-4 py-2" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? "Uploading…" : "Upload images"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={upload} />
        </div>
        {form.images.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No images yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5">
            {form.images.map((img, i) => (
              <div key={img.url + i} className="group relative">
                <ProductImage src={img.url} alt="" sizes="120px" className={`aspect-[4/5] rounded-xl ${i === 0 ? "ring-2 ring-caramel" : ""}`} />
                {/* Always visible on touch screens; revealed on hover where a mouse is available. */}
                <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1 transition [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                  <button type="button" onClick={() => moveImage(i, -1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-linen/95 text-sm shadow" aria-label="Move left">←</button>
                  <button type="button" onClick={() => removeImage(i)} className="flex h-8 w-8 items-center justify-center rounded-full bg-linen/95 text-sm text-danger shadow" aria-label="Remove">✕</button>
                  <button type="button" onClick={() => moveImage(i, 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-linen/95 text-sm shadow" aria-label="Move right">→</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-6 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <Link href="/staff/products" className="btn-outline">Cancel</Link>
        <button type="submit" className="btn-primary" disabled={saving || uploading}>{saving ? "Saving…" : "Save product"}</button>
      </div>
    </form>
  );
}
