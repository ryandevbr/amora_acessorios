import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingBag, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { categoriesQuery, productsQuery, unitPrice, type Product } from "@/lib/catalog";
import { brl, whatsappLink } from "@/lib/format";
import { useCart } from "@/lib/cart";

function Price({ p, big = false }: { p: Product; big?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      {p.promo_price != null && <span className="text-xs text-muted-foreground line-through">{brl(p.price)}</span>}
      <span className={`font-semibold text-primary ${big ? "text-2xl" : "text-base"}`}>{brl(unitPrice(p))}</span>
    </div>
  );
}

function AddButton({ p, onDone }: { p: Product; onDone?: () => void }) {
  const { add } = useCart();
  if (!p.in_stock)
    return (
      <a href={whatsappLink(`Olá, Amora! A peça "${p.name}" vai voltar ao estoque?`)} target="_blank" rel="noreferrer"
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <MessageCircle className="h-4 w-4" /> Consultar
      </a>
    );
  return (
    <button onClick={() => { add({ id: p.id, name: p.name, unitPrice: unitPrice(p) }); toast.success("Adicionado à sacola"); onDone?.(); }}
      className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
      <ShoppingBag className="h-4 w-4" /> Adicionar à sacola
    </button>
  );
}

function Badges({ p }: { p: Product }) {
  return (
    <div className="absolute left-2 top-2 flex flex-col gap-1">
      {!p.in_stock && <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-background">Esgotado</span>}
      {p.promo_price != null && p.in_stock && <span className="bg-gold-gradient rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">Promoção</span>}
      {p.featured && <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">Destaque</span>}
    </div>
  );
}

export function Catalog() {
  const cats = useQuery(categoriesQuery);
  const prods = useQuery(productsQuery);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [sel, setSel] = useState<Product | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (prods.data ?? []).filter((p) => (!cat || p.category_id === cat) && (!term || p.name.toLowerCase().includes(term)));
  }, [prods.data, q, cat]);

  return (
    <section id="vitrine" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-display text-4xl md:text-5xl">Nossa vitrine</h2>
      <div className="relative mx-auto mt-8 max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar peça..."
          className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none focus:border-gold" />
      </div>
      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 sm:justify-center">
        {[{ id: null, name: "Todos" }, ...(cats.data ?? [])].map((c) => (
          <button key={c.id ?? "all"} onClick={() => setCat(c.id)}
            className={`shrink-0 rounded-full border px-5 py-2 font-display text-lg italic transition-colors ${cat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
            {c.name}
          </button>
        ))}
      </div>

      {prods.isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : list.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">Nenhuma peça encontrada.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <article key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
              <button onClick={() => setSel(p)} className="relative block aspect-[4/5] overflow-hidden bg-muted">
                {p.image_url && <img src={p.image_url} alt={p.name} loading="lazy" className={`h-full w-full object-cover ${!p.in_stock ? "opacity-60 grayscale" : ""}`} />}
                <Badges p={p} />
              </button>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <button onClick={() => setSel(p)} className="text-left font-display text-lg leading-tight">{p.name}</button>
                <div className="mt-auto"><Price p={p} /></div>
                <AddButton p={p} />
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="mx-auto mt-10 max-w-lg text-center text-muted-foreground">Viu algo no nosso Instagram? Mande a foto no WhatsApp e a gente separa pra você.</p>

      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-lg">
          {sel && (
            <>
              <div className="relative aspect-[4/5] w-full bg-muted">
                {sel.image_url && <img src={sel.image_url} alt={sel.name} className="h-full w-full object-cover" />}
                <Badges p={sel} />
              </div>
              <div className="space-y-4 p-5">
                <DialogTitle className="font-display text-3xl font-medium">{sel.name}</DialogTitle>
                <Price p={sel} big />
                <DialogDescription className="whitespace-pre-line text-sm">{sel.description}</DialogDescription>
                <AddButton p={sel} onDone={() => setSel(null)} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
