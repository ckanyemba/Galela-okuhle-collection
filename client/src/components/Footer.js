import Link from "next/link";
import Logo from "./Logo";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "./Icons";
import { SHOP, whatsappLink } from "@/lib/api";

export default function Footer() {
  return (
    <footer className="no-print mt-24 bg-espresso text-sand">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <Logo light variant="stacked" className="h-auto w-48" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand/75">
            Beautiful bags and home cleaning products, picked with care. Pay by card, Instant EFT or cash, or order on WhatsApp.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-linen">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-linen" href="/shop?category=bags">Bags</Link></li>
            <li><Link className="hover:text-linen" href="/shop?category=cleaning">Cleaning products</Link></li>
            <li><Link className="hover:text-linen" href="/cart">Your cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-linen">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a className="inline-flex items-center gap-2.5 hover:text-linen" href={whatsappLink("Hi, I have a question about your products.")} target="_blank" rel="noreferrer">
                <WhatsAppIcon /> WhatsApp {SHOP.phone}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2.5 hover:text-linen" href={`tel:+${SHOP.whatsapp}`}>
                <PhoneIcon /> {SHOP.phone}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2.5 hover:text-linen" href={`mailto:${SHOP.email}`}>
                <MailIcon /> {SHOP.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-sand/60 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} {SHOP.name}</p>
          <Link href="/staff/login" className="hover:text-linen">Staff login</Link>
        </div>
      </div>
    </footer>
  );
}
