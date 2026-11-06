import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductGrid from "@/components/ProductGrid";
import { getProduct, getProducts } from "@/lib/api";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return product ? { title: product.name, description: product.description } : { title: "Product not found" };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = (await getProducts({ category: product.category })).filter((p) => p._id !== product._id).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <nav className="mb-6 text-xs text-muted">
        <Link href="/shop" className="hover:text-espresso">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop?category=${product.category}`} className="capitalize hover:text-espresso">{product.category}</Link>
      </nav>
      <ProductDetail product={product} />
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-display text-3xl font-semibold text-espresso">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
