"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Logo from "@/components/Logo";
import { StaffAuthProvider, useStaff } from "@/context/StaffAuth";

const NAV = [
  { href: "/staff", label: "Orders" },
  { href: "/staff/products", label: "Products" },
];

function Shell({ children }) {
  const { staff, loading, logout } = useStaff();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/staff/login";

  useEffect(() => {
    if (!loading && !staff && !isLogin) router.replace("/staff/login");
  }, [loading, staff, isLogin, router]);

  if (isLogin) return children;
  if (loading || !staff) return <div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>;

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-line bg-linen">
        {/* Phone: logo + account on top, nav below. Tablet/desktop: one row. */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:h-16 sm:flex-nowrap sm:py-0 sm:px-6">
          <div className="shrink-0 whitespace-nowrap">
            <Logo />
          </div>
          <nav className="order-3 flex w-full gap-1 sm:order-none sm:mr-auto sm:w-auto">
            {NAV.map((n) => {
              const active = n.href === "/staff" ? pathname === "/staff" || pathname.startsWith("/staff/orders") : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-medium sm:flex-none ${active ? "bg-espresso text-linen" : "text-espresso hover:bg-sand"}`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-3 text-sm">
            <Link href="/" className="hidden py-2 text-muted hover:text-espresso md:inline">View shop ↗</Link>
            {staff.picture && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={staff.picture} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
            )}
            <button onClick={logout} className="whitespace-nowrap py-2 text-muted hover:text-danger">Sign out</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

export default function StaffLayout({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID || ""}>
      <StaffAuthProvider>
        <Shell>{children}</Shell>
      </StaffAuthProvider>
    </GoogleOAuthProvider>
  );
}
