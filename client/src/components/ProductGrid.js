import ProductCard from "./ProductCard";

export default function ProductGrid({ products, priorityCount = 0 }) {
  if (!products.length) {
    return (
      <div className="card px-6 py-16 text-center text-muted">
        Products are loading or temporarily unavailable. Please check back shortly.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p._id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
