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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="flex gap-1">
              {NAV.map((n) => {
                const active = n.href === "/staff" ? pathname === "/staff" || pathname.startsWith("/staff/orders") : pathname.startsWith(n.href);
                return (
                  <Link key={n.href} href={n.href} className={`rounded-full px-4 py-1.5 text-sm font-medium ${active ? "bg-espresso text-linen" : "text-espresso hover:bg-sand"}`}>
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="hidden text-muted hover:text-espresso sm:inline">View shop ↗</Link>
            {staff.picture && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={staff.picture} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
            )}
            <button onClick={logout} className="text-muted hover:text-danger">Sign out</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export default function StaffLayout({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <StaffAuthProvider>
        <Shell>{children}</Shell>
      </StaffAuthProvider>
    </GoogleOAuthProvider>
  );
}
