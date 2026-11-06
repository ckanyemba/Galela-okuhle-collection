"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const StaffAuthContext = createContext(null);
const KEY = "goc-staff-token";

export function StaffAuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}
    if (!saved) return setLoading(false);
    api("/auth/me", { token: saved })
      .then((d) => {
        setToken(saved);
        setStaff(d.staff);
      })
      .catch(() => {
        try { localStorage.removeItem(KEY); } catch {}
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credential) => {
    const d = await api("/auth/google", { method: "POST", body: { credential } });
    try { localStorage.setItem(KEY, d.token); } catch {}
    setToken(d.token);
    setStaff(d.staff);
  }, []);

  const logout = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch {}
    setToken(null);
    setStaff(null);
  }, []);

  /** Authenticated API call; signs out automatically when the session expires. */
  const staffApi = useCallback(
    async (path, opts = {}) => {
      try {
        return await api(path, { ...opts, token });
      } catch (err) {
        if (err.status === 401 || err.status === 403) logout();
        throw err;
      }
    },
    [token, logout]
  );

  const value = useMemo(() => ({ token, staff, loading, login, logout, staffApi }), [token, staff, loading, login, logout, staffApi]);
  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
}

export const useStaff = () => useContext(StaffAuthContext);
