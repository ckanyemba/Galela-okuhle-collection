"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Logo from "@/components/Logo";
import { useStaff } from "@/context/StaffAuth";

export default function StaffLogin() {
  const { staff, login } = useStaff();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (staff) router.replace("/staff");
  }, [staff, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-8 font-display text-3xl font-semibold text-espresso">Staff login</h1>
        <p className="mt-2 text-sm text-muted">Sign in with your staff Google account to manage orders and products.</p>
        <div className="mt-8 flex justify-center">
          {process.env.GOOGLE_CLIENT_ID ? (
            <GoogleLogin
              onSuccess={async ({ credential }) => {
                setBusy(true);
                setError("");
                try {
                  await login(credential);
                } catch (e) {
                  setError(e.message);
                } finally {
                  setBusy(false);
                }
              }}
              onError={() => setError("Google sign-in was cancelled or failed")}
              shape="pill"
              text="signin_with"
            />
          ) : (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">GOOGLE_CLIENT_ID is not configured.</p>
          )}
        </div>
        {busy && <p className="mt-4 text-sm text-muted">Signing in…</p>}
        {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <Link href="/" className="mt-8 inline-block text-sm text-caramel-dark hover:underline">← Back to shop</Link>
      </div>
    </div>
  );
}
