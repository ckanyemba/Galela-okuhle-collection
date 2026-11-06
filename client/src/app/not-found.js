import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <h1 className="mt-10 font-display text-5xl font-semibold text-espresso">Page not found</h1>
      <p className="mt-3 text-muted">The page you are looking for has moved or no longer exists.</p>
      <Link href="/shop" className="btn-primary mt-8">Browse the shop</Link>
    </div>
  );
}
