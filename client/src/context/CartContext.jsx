import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext();
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ec_cart")) || []; } catch { return []; }
  });
  useEffect(() => localStorage.setItem("ec_cart", JSON.stringify(items)), [items]);

  // item = { product, name, image, price, stock, qty }
  const add = (p, qty = 1) =>
    setItems((cur) => {
      const found = cur.find((i) => i.product === p.id);
      if (found) return cur.map((i) => (i.product === p.id ? { ...i, qty: Math.min(i.qty + qty, p.stock), stock: p.stock } : i));
      return [...cur, { product: p.id, name: p.name, image: p.image, price: p.price, stock: p.stock, qty: Math.min(qty, p.stock) }];
    });
  const setQty = (id, qty) =>
    setItems((cur) => cur.map((i) => (i.product === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i)));
  const remove = (id) => setItems((cur) => cur.filter((i) => i.product !== id));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return <Ctx.Provider value={{ items, add, setQty, remove, clear, count, total }}>{children}</Ctx.Provider>;
}
