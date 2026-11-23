import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartLine } from "./format";

type Ctx = {
  lines: CartLine[]; open: boolean; setOpen: (o: boolean) => void;
  add: (l: Omit<CartLine, "qty">) => void; setQty: (id: string, q: number) => void;
  remove: (id: string) => void; clear: () => void; count: number;
};
const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem("amora-sacola"); if (s) setLines(JSON.parse(s)); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("amora-sacola", JSON.stringify(lines)); }, [lines]);
  const add: Ctx["add"] = (l) => setLines((p) => {
    const f = p.find((x) => x.id === l.id);
    return f ? p.map((x) => (x.id === l.id ? { ...x, qty: x.qty + 1 } : x)) : [...p, { ...l, qty: 1 }];
  });
  const setQty = (id: string, q: number) =>
    setLines((p) => (q <= 0 ? p.filter((x) => x.id !== id) : p.map((x) => (x.id === id ? { ...x, qty: q } : x))));
  const remove = (id: string) => setLines((p) => p.filter((x) => x.id !== id));
  return (
    <CartCtx.Provider value={{ lines, open, setOpen, add, setQty, remove, clear: () => setLines([]), count: lines.reduce((s, l) => s + l.qty, 0) }}>
      {children}
    </CartCtx.Provider>
  );
}
export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("CartProvider ausente");
  return c;
}
