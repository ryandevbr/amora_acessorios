import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { brl, buildOrderMessage, cartTotal, whatsappLink, type Delivery } from "@/lib/format";

export function CartButton() {
  const { count, setOpen } = useCart();
  if (count === 0) return null;
  return (
    <button onClick={() => setOpen(true)} aria-label="Abrir sacola"
      className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
      <ShoppingBag aria-hidden="true" className="h-6 w-6" />
      <span className="bg-gold-gradient absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-bold text-accent-foreground">{count}</span>
    </button>
  );
}

export function CartSheet() {
  const { lines, open, setOpen, setQty, remove } = useCart();
  const [name, setName] = useState("");
  const [delivery, setDelivery] = useState<Delivery>("retirada");
  const total = cartTotal(lines);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 font-sans sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="font-display text-3xl font-medium">Sua sacola</SheetTitle>
          <SheetDescription>Revise e finalize pelo WhatsApp.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-5">
          {lines.length === 0 ? <p className="text-center text-muted-foreground">Sua sacola está vazia.</p> : (
            <ul className="divide-y divide-border">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-4">
                  <div className="flex-1">
                    <p className="font-display text-lg leading-tight">{l.name}</p>
                    <p className="text-sm text-muted-foreground">{brl(l.unitPrice)}</p>
                  </div>
                  <div className="flex items-center rounded-full border border-border">
                    <button aria-label="Diminuir" onClick={() => setQty(l.id, l.qty - 1)} className="p-2"><Minus aria-hidden="true" className="h-4 w-4" /></button>
                    <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                    <button aria-label="Aumentar" onClick={() => setQty(l.id, l.qty + 1)} className="p-2"><Plus aria-hidden="true" className="h-4 w-4" /></button>
                  </div>
                  <button aria-label="Remover" onClick={() => remove(l.id)} className="p-2 text-muted-foreground"><Trash2 aria-hidden="true" className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
          {lines.length > 0 && (
            <div className="mt-6 space-y-4">
              <label className="block text-sm">
                <span className="text-muted-foreground">Seu nome (opcional)</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 outline-none focus:border-gold" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["retirada", "entrega"] as const).map((d) => (
                  <button key={d} onClick={() => setDelivery(d)}
                    className={`rounded-lg border px-3 py-3 text-sm font-medium ${delivery === d ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                    {d === "retirada" ? "Retirar na loja" : "Entrega"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {lines.length > 0 && (
          <div className="border-t border-border p-5">
            <div className="mb-4 flex justify-between text-lg"><span>Subtotal</span><span className="font-semibold">{brl(total)}</span></div>
            <a href={whatsappLink(buildOrderMessage(lines, delivery, name))} target="_blank" rel="noreferrer"
              className="bg-gold-gradient flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-widest text-accent-foreground">
              <MessageCircle aria-hidden="true" className="h-5 w-5" /> Finalizar pedido no WhatsApp
            </a>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
