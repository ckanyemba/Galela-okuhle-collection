import Link from "next/link";

export default function Logo({ light = false }) {
  return (
    <Link href="/" className="group inline-flex flex-col leading-none" aria-label="Galela Okuhle Collection home">
      <span className={`font-display text-2xl font-semibold tracking-tight sm:text-[1.7rem] ${light ? "text-linen" : "text-espresso"}`}>
        Galela Okuhle
      </span>
      <span className={`mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.42em] ${light ? "text-sand" : "text-caramel"}`}>
        Collection
      </span>
    </Link>
  );
}
