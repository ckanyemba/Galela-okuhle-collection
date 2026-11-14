"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { BagIcon, CloseIcon, MenuIcon } from "./Icons";
import { useCart } from "@/context/CartContext";

const NAV = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=bags", label: "Bags" },
  { href: "/shop?category=cleaning", label: "Cleaning" },
];

export default function Header() {
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/80 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6">
        <button className="-ml-2 p-2 text-espresso md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
        <Logo priority />
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="py-2 text-sm font-medium text-espresso/80 transition hover:text-caramel-dark">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/cart" className="relative -mr-2 p-2 text-espresso" aria-label={`Cart, ${count} items`}>
          <BagIcon />
          {ready && count > 0 && (
            <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-caramel px-1 text-[0.65rem] font-bold text-linen">
              {count}
            </span>
          )}
        </Link>
      </div>
      {open && (
        <nav className="border-t border-line bg-cream px-4 py-3 md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="block py-3 text-base font-medium text-espresso">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
