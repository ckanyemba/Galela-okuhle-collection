"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const KEY = "goc-cart";

const keyOf = (i) => `${i.productId}::${i.colour || ""}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(saved)) setItems(saved);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((item, quantity = 1) => {
    setItems((prev) => {
      const k = keyOf(item);
      const found = prev.find((i) => keyOf(i) === k);
      if (found) return prev.map((i) => (keyOf(i) === k ? { ...i, quantity: Math.min(i.quantity + quantity, 20) } : i));
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const update = useCallback((item, quantity) => {
    const k = keyOf(item);
    setItems((prev) =>
      quantity <= 0 ? prev.filter((i) => keyOf(i) !== k) : prev.map((i) => (keyOf(i) === k ? { ...i, quantity: Math.min(quantity, 20) } : i))
    );
  }, []);

  const remove = useCallback((item) => setItems((prev) => prev.filter((i) => keyOf(i) !== keyOf(item))), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return { items, ready, count, subtotal, add, update, remove, clear };
  }, [items, ready, add, update, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
