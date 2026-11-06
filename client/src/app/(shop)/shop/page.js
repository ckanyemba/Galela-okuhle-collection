import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/api";

const TABS = [
  { key: "", label: "All" },
  { key: "bags", label: "Bags" },
  { key: "cleaning", label: "Cleaning" },
];

const TITLES = {
  "": { title: "Shop all", sub: "Bags and home cleaning products" },
  bags: { title: "Bags", sub: "Totes, shoulder bags and handbags, from R270" },
  cleaning: { title: "Cleaning", sub: "Gosh Detergents for kitchen, bathroom and drains" },
};

export async function generateMetadata({ searchParams }) {
  const { category = "" } = await searchParams;
  return { title: TITLES[category]?.title || "Shop" };
}

export default async function ShopPage({ searchParams }) {
  const { category = "" } = await searchParams;
  const cat = TITLES[category] ? category : "";
  const products = await getProducts(cat ? { category: cat } : {});

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <h1 className="font-display text-5xl font-semibold text-espresso">{TITLES[cat].title}</h1>
      <p className="mt-2 text-muted">{TITLES[cat].sub}</p>
      <div className="mb-8 mt-6 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/shop?category=${t.key}` : "/shop"}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              t.key === cat ? "bg-espresso text-linen" : "border border-line bg-linen text-espresso hover:border-espresso/40"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <ProductGrid products={products} priorityCount={4} />
    </div>
  );
}
