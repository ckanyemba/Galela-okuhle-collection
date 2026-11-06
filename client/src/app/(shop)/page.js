import Link from "next/link";
import Image from "next/image";
import ProductGrid from "@/components/ProductGrid";
import { CardIcon, CashIcon, MailIcon, WhatsAppIcon } from "@/components/Icons";
import { getProducts } from "@/lib/api";

const CATEGORIES = [
  { href: "/shop?category=bags", title: "Bags", sub: "Totes, shoulder bags & handbags", img: "/products/structured-shoulder.jpg" },
  { href: "/shop?category=cleaning", title: "Cleaning", sub: "Gosh Detergents for every room", img: "/products/cleaning-set-2.jpg" },
];

const WAYS_TO_PAY = [
  { icon: CardIcon, title: "Pay online", text: "Card or Instant EFT via PayFast or Yoco." },
  { icon: WhatsAppIcon, title: "WhatsApp", text: "Send your order straight to our WhatsApp." },
  { icon: MailIcon, title: "Email", text: "Prefer email? We will confirm by reply." },
  { icon: CashIcon, title: "Cash", text: "Pay cash when you collect or on delivery." },
];

export default async function Home() {
  const featured = await getProducts({ featured: "true" });

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-2 md:pt-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-caramel">New season · Bags & home</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.02] text-espresso sm:text-6xl lg:text-7xl">
            Carry something <em className="font-medium text-caramel">beautiful.</em>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            Totes, shoulder bags and handbags from R270, plus Gosh cleaning products for your home. Order online and pay by
            card, EFT or cash.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop?category=bags" className="btn-primary">Shop bags</Link>
            <Link href="/shop?category=cleaning" className="btn-outline">Cleaning products</Link>
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl shadow-espresso/10">
            <Image src="/products/tan-tote-5.jpg" alt="Tan tote bag" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-4 hidden w-40 overflow-hidden rounded-2xl border-4 border-cream shadow-lg sm:block md:-left-10">
            <div className="relative aspect-square">
              <Image src="/products/woven-flower-handbag.jpg" alt="Woven handbags" fill sizes="160px" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <Link key={c.title} href={c.href} className="group relative block aspect-[16/10] overflow-hidden rounded-3xl">
              <Image src={c.img} alt={c.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent" />
              <div className="absolute bottom-0 p-6 text-linen">
                <h2 className="font-display text-4xl font-semibold">{c.title}</h2>
                <p className="mt-1 text-sm text-linen/85">{c.sub} →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-4xl font-semibold text-espresso">Customer favourites</h2>
          <Link href="/shop" className="text-sm font-medium text-caramel-dark hover:underline">View all</Link>
        </div>
        <ProductGrid products={featured.slice(0, 8)} />
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="card grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-4">
          {WAYS_TO_PAY.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand text-caramel-dark"><Icon /></span>
              <div>
                <h3 className="font-medium text-espresso">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
