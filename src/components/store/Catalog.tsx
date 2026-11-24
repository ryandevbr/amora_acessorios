import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Search, ShoppingBag, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  categoriesQuery,
  productsQuery,
  unitPrice,
  type ListingType,
  type Product,
} from "@/lib/catalog";
import { brl, buildRentalMessage, todayIsoDate, whatsappLink } from "@/lib/format";
import { useCart } from "@/lib/cart";

type ListingFilter = "all" | ListingType;

const listingFilters: { value: ListingFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "sale", label: "Comprar" },
  { value: "rental", label: "Aluguel de Bolsas" },
];

function Price({ p, big = false }: { p: Product; big?: boolean }) {
  const isRental = p.listing_type === "rental";
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      {p.promo_price != null && (
        <span className="text-xs text-muted-foreground line-through">{brl(p.price)}</span>
      )}
      <span className={`font-semibold text-primary ${big ? "text-2xl" : "text-base"}`}>
        {brl(unitPrice(p))}
      </span>
      {isRental && (
        <span className={`text-muted-foreground ${big ? "text-sm" : "text-xs"}`}>/ aluguel</span>
      )}
    </div>
  );
}

function CardActionButton({
  p,
  onConsultRental,
  onDone,
}: {
  p: Product;
  onConsultRental: (p: Product) => void;
  onDone?: () => void;
}) {
  const { add } = useCart();

  if (p.listing_type === "rental") {
    if (!p.in_stock) {
      return (
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-full border border-border bg-muted px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground opacity-75"
        >
          Indisponível
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onConsultRental(p)}
        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-95"
      >
        <Calendar className="h-4 w-4" /> Consultar data
      </button>
    );
  }

  if (!p.in_stock)
    return (
      <a
        href={whatsappLink(`Olá, Amora! A peça "${p.name}" vai voltar ao estoque?`)}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        <MessageCircle className="h-4 w-4" /> Consultar
      </a>
    );
  return (
    <button
      type="button"
      onClick={() => {
        add({ id: p.id, name: p.name, unitPrice: unitPrice(p) });
        toast.success("Adicionado à sacola");
        onDone?.();
      }}
      className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground"
    >
      <ShoppingBag className="h-4 w-4" /> Adicionar à sacola
    </button>
  );
}

function RentalInquiryForm({ product }: { product: Product }) {
  const [eventDate, setEventDate] = useState("");
  const [clientName, setClientName] = useState("");
  const minDate = todayIsoDate();

  if (!product.in_stock) {
    return (
      <div className="space-y-3 pt-1">
        <p className="text-sm text-muted-foreground">
          Esta peça está indisponível para locação no momento.
        </p>
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center rounded-full border border-border bg-muted px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground opacity-75"
        >
          Indisponível
        </button>
      </div>
    );
  }

  const message = buildRentalMessage(product.name, unitPrice(product), eventDate, clientName);

  return (
    <div className="space-y-3.5 border-t border-border pt-4">
      <label className="block text-sm">
        <span className="font-medium text-foreground">Data do evento</span>
        <input
          type="date"
          min={minDate}
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none focus:border-gold sm:text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="text-muted-foreground">Seu nome (opcional)</span>
        <input
          type="text"
          placeholder="Como podemos te chamar?"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none focus:border-gold sm:text-sm"
        />
      </label>
      <p className="text-center font-display text-base italic text-muted-foreground">
        A disponibilidade é confirmada na hora pelo nosso WhatsApp.
      </p>
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noreferrer"
        className="bg-gold-gradient flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-widest text-accent-foreground transition-transform hover:scale-[1.01]"
      >
        <MessageCircle className="h-4 w-4 shrink-0" /> Consultar disponibilidade no WhatsApp
      </a>
    </div>
  );
}

function Badges({ p }: { p: Product }) {
  const isRental = p.listing_type === "rental";
  return (
    <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
      {isRental && (
        <span className="rounded-full border border-gold/60 bg-plum/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold shadow-sm">
          Aluguel
        </span>
      )}
      {!p.in_stock && (
        <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-background">
          {isRental ? "Indisponível" : "Esgotado"}
        </span>
      )}
      {p.promo_price != null && p.in_stock && (
        <span className="bg-gold-gradient rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
          Promoção
        </span>
      )}
      {p.featured && (
        <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          Destaque
        </span>
      )}
    </div>
  );
}

export function Catalog() {
  const cats = useQuery(categoriesQuery);
  const prods = useQuery(productsQuery);
  const [q, setQ] = useState("");
  const [listingFilter, setListingFilter] = useState<ListingFilter>("all");
  const [cat, setCat] = useState<string | null>(null);
  const [sel, setSel] = useState<Product | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (prods.data ?? []).filter(
      (p) =>
        (listingFilter === "all" || p.listing_type === listingFilter) &&
        (!cat || p.category_id === cat) &&
        (!term || p.name.toLowerCase().includes(term)),
    );
  }, [prods.data, q, cat, listingFilter]);

  return (
    <section id="vitrine" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-display text-4xl md:text-5xl">Nossa vitrine</h2>

      <div className="mt-7 flex justify-center">
        <div
          role="tablist"
          aria-label="Filtrar por modalidade"
          className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-border bg-card p-1 shadow-xs"
        >
          {listingFilters.map((f) => {
            const active = listingFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setListingFilter(f.value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors sm:px-5 ${
                  active
                    ? "bg-plum text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mx-auto mt-6 max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar peça..."
          className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none focus:border-gold"
        />
      </div>
      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 sm:justify-center">
        {[{ id: null, name: "Todos" }, ...(cats.data ?? [])].map((c) => (
          <button
            key={c.id ?? "all"}
            type="button"
            onClick={() => setCat(c.id)}
            className={`shrink-0 rounded-full border px-5 py-2 font-display text-lg italic transition-colors ${cat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {prods.isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-4/5 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">Nenhuma peça encontrada.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              <button
                type="button"
                onClick={() => setSel(p)}
                className="relative block aspect-4/5 overflow-hidden bg-muted"
              >
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    loading="lazy"
                    className={`h-full w-full object-cover ${!p.in_stock ? "opacity-60 grayscale" : ""}`}
                  />
                )}
                <Badges p={p} />
              </button>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <button
                  type="button"
                  onClick={() => setSel(p)}
                  className="text-left font-display text-lg leading-tight"
                >
                  {p.name}
                </button>
                <div className="mt-auto">
                  <Price p={p} />
                </div>
                <CardActionButton p={p} onConsultRental={setSel} />
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="mx-auto mt-10 max-w-lg text-center text-muted-foreground">
        Viu algo no nosso Instagram? Mande a foto no WhatsApp e a gente separa pra você.
      </p>

      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          {sel && (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="flex flex-col">
                <div className="relative h-64 w-full shrink-0 overflow-hidden bg-muted sm:h-80">
                  {sel.image_url && (
                    <img
                      src={sel.image_url}
                      alt={sel.name}
                      className="block h-full w-full object-cover"
                    />
                  )}
                  <Badges p={sel} />
                </div>
                <div className="relative z-10 flex shrink-0 flex-col gap-4 p-5 pb-7">
                  <DialogTitle className="font-display text-3xl font-medium">
                    {sel.name}
                  </DialogTitle>
                  <Price p={sel} big />
                  {sel.description ? (
                    <DialogDescription className="whitespace-pre-line text-sm">
                      {sel.description}
                    </DialogDescription>
                  ) : (
                    <DialogDescription className="sr-only">
                      Detalhes de {sel.name}
                    </DialogDescription>
                  )}
                  {sel.listing_type === "rental" ? (
                    <RentalInquiryForm key={sel.id} product={sel} />
                  ) : (
                    <CardActionButton
                      p={sel}
                      onConsultRental={setSel}
                      onDone={() => setSel(null)}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
