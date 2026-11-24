import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, LogOut, ArrowUp, ArrowDown, Camera, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { categoriesQuery, productsQuery, type Product, type Category, type ListingType } from "@/lib/catalog";
import { brl } from "@/lib/format";
import { compressImage } from "@/lib/image";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Painel | Amora Acessórios" },
    { name: "description", content: "Gerencie produtos e categorias da Amora Acessórios." },
    { property: "og:title", content: "Painel | Amora Acessórios" },
    { property: "og:description", content: "Gerencie produtos e categorias." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Admin,
});

const field = "w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-gold";

function Admin() {
  const nav = useNavigate();
  const qc = useQueryClient();
  async function logout() {
    await qc.cancelQueries(); await supabase.auth.signOut(); nav({ to: "/login", replace: true });
  }
  return (
    <main className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-plum px-4 py-3 text-primary-foreground">
        <Link to="/" className="text-gold-gradient font-display text-xl font-semibold tracking-[0.3em]">AMORA</Link>
        <button onClick={logout} className="flex items-center gap-1.5 text-sm"><LogOut className="h-4 w-4" /> Sair</button>
      </header>
      <div className="mx-auto max-w-2xl p-4">
        <Tabs defaultValue="produtos">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
          </TabsList>
          <TabsContent value="produtos"><ProductsTab /></TabsContent>
          <TabsContent value="categorias"><CategoriesTab /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function ProductsTab() {
  const qc = useQueryClient();
  const { data: prods = [], isLoading } = useQuery(productsQuery);
  const { data: cats = [] } = useQuery(categoriesQuery);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [del, setDel] = useState<Product | null>(null);

  async function toggleStock(p: Product, v: boolean) {
    qc.setQueryData(productsQuery.queryKey, (old) => old?.map((x) => (x.id === p.id ? { ...x, in_stock: v } : x)));
    const { error } = await supabase.from("products").update({ in_stock: v }).eq("id", p.id);
    if (error) { toast.error("Erro ao atualizar"); qc.invalidateQueries({ queryKey: ["products"] }); }
  }
  async function remove() {
    if (!del) return;
    const { error } = await supabase.from("products").delete().eq("id", del.id);
    setDel(null);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Produto excluído"); qc.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <div className="mt-4">
      <button onClick={() => setEditing("new")} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold uppercase tracking-widest text-primary-foreground">
        <Plus className="h-5 w-5" /> Novo Produto
      </button>
      {isLoading ? <p className="mt-6 text-center text-muted-foreground">Carregando...</p> : (
        <ul className="mt-4 space-y-2">
          {prods.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-2">
              <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-medium">{p.name}</p>
                  {p.listing_type === "rental" && (
                    <span className="shrink-0 rounded-full border border-gold/60 bg-plum px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
                      Aluguel
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {p.promo_price != null ? <><s>{brl(p.price)}</s> {brl(p.promo_price)}</> : brl(p.price)}
                  {p.listing_type === "rental" && " / aluguel"}
                </p>
                <label className="mt-1 flex items-center gap-2 text-xs">
                  <Switch checked={p.in_stock} onCheckedChange={(v) => toggleStock(p, v)} />
                  <span className={p.in_stock ? "text-foreground" : "text-destructive"}>
                    {p.listing_type === "rental"
                      ? p.in_stock ? "Disponível" : "Indisponível"
                      : p.in_stock ? "Em estoque" : "Esgotado"}
                  </span>
                </label>
              </div>
              <button aria-label="Editar" onClick={() => setEditing(p)} className="p-2.5"><Pencil className="h-5 w-5" /></button>
              <button aria-label="Excluir" onClick={() => setDel(p)} className="p-2.5 text-destructive"><Trash2 className="h-5 w-5" /></button>
            </li>
          ))}
        </ul>
      )}
      {editing && <ProductForm product={editing === "new" ? null : editing} cats={cats} onClose={() => setEditing(null)} />}
      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>"{del?.name}" será removido da vitrine. Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function parseMoney(s: string) {
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}
const toInput = (n: number | null | undefined) => (n == null ? "" : n.toFixed(2).replace(".", ","));

function ProductForm({ product, cats, onClose }: { product: Product | null; cats: Category[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(product?.name ?? "");
  const [listingType, setListingType] = useState<ListingType>(product?.listing_type ?? "sale");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? cats[0]?.id ?? "");
  const [price, setPrice] = useState(toInput(product?.price));
  const [promo, setPromo] = useState(toInput(product?.promo_price));
  const [description, setDescription] = useState(product?.description ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onFile(f?: File) {
    if (!f) return;
    setUploading(true);
    try {
      const { blob, ext } = await compressImage(f);
      const path = `${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("product-images").upload(path, blob, { contentType: blob.type });
      if (up.error) throw up.error;
      const s = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (s.error) throw s.error;
      setImageUrl(s.data.signedUrl);
    } catch { toast.error("Falha ao enviar a foto"); }
    setUploading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = parseMoney(price);
    const pp = promo.trim() ? parseMoney(promo) : null;
    if (!name.trim() || !Number.isFinite(p) || p <= 0) { toast.error("Informe nome e preço válidos"); return; }
    if (pp != null && (!Number.isFinite(pp) || pp <= 0)) { toast.error("Preço promocional inválido"); return; }
    setSaving(true);
    const row = {
      name: name.trim(),
      listing_type: listingType,
      category_id: categoryId || null,
      price: p,
      promo_price: pp,
      description: description.trim() || null,
      featured,
      in_stock: inStock,
      image_url: imageUrl || null,
    };
    const { error } = product ? await supabase.from("products").update(row).eq("id", product.id) : await supabase.from("products").insert(row);
    setSaving(false);
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("Produto salvo"); qc.invalidateQueries({ queryKey: ["products"] }); onClose();
  }

  const isRental = listingType === "rental";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[95vh] overflow-y-auto font-sans">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{product ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>Preencha as informações da peça.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-3">
          <label className="relative flex aspect-[4/5] w-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted mx-auto">
            {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : (
              <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground"><Camera className="h-6 w-6" />{uploading ? "Enviando..." : "Adicionar foto"}</span>
            )}
            {uploading && imageUrl && <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs">Enviando...</span>}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-muted-foreground">Modalidade</span>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "sale", label: "Venda" },
                { value: "rental", label: "Aluguel" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setListingType(opt.value)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    listingType === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <input required placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} className={field} />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={field}>
            <option value="">Sem categoria</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1">
              <span className="block text-xs font-medium text-muted-foreground">
                {isRental ? "Valor do aluguel (R$)" : "Preço (R$)"}
              </span>
              <input required inputMode="decimal" placeholder={isRental ? "Valor do aluguel (R$)" : "Preço (R$)"} value={price} onChange={(e) => setPrice(e.target.value)} className={field} />
            </label>
            <label className="block space-y-1">
              <span className="block text-xs font-medium text-muted-foreground">Promoção (opcional)</span>
              <input inputMode="decimal" placeholder="Promoção (opcional)" value={promo} onChange={(e) => setPromo(e.target.value)} className={field} />
            </label>
          </div>
          <textarea placeholder="Descrição curta" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={field} />
          <label className="flex items-center justify-between rounded-lg border border-border px-3 py-3"><span>Destaque</span><Switch checked={featured} onCheckedChange={setFeatured} /></label>
          <label className="flex items-center justify-between rounded-lg border border-border px-3 py-3"><span>{isRental ? "Disponível" : "Em estoque"}</span><Switch checked={inStock} onCheckedChange={setInStock} /></label>
          <button disabled={saving || uploading} className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold uppercase tracking-widest text-primary-foreground disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CategoriesTab() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery(categoriesQuery);
  const [newName, setNewName] = useState("");
  const [edit, setEdit] = useState<{ id: string; name: string } | null>(null);
  const [del, setDel] = useState<Category | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["categories"] });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const order = (cats.at(-1)?.display_order ?? 0) + 1;
    const { error } = await supabase.from("categories").insert({ name: newName.trim(), display_order: order });
    if (error) { toast.error("Erro ao adicionar"); return; }
    setNewName(""); refresh();
  }
  async function rename() {
    if (!edit?.name.trim()) return;
    const { error } = await supabase.from("categories").update({ name: edit.name.trim() }).eq("id", edit.id);
    if (error) { toast.error("Erro ao renomear"); return; }
    setEdit(null); refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = cats[i], b = cats[i + dir];
    if (!a || !b) return;
    const ao = a.display_order === b.display_order ? b.display_order + dir : b.display_order;
    await Promise.all([
      supabase.from("categories").update({ display_order: ao }).eq("id", a.id),
      supabase.from("categories").update({ display_order: a.display_order }).eq("id", b.id),
    ]);
    refresh();
  }
  async function remove() {
    if (!del) return;
    const { error } = await supabase.from("categories").delete().eq("id", del.id);
    setDel(null);
    if (error) { toast.error("Erro ao excluir"); return; }
    refresh(); qc.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <div className="mt-4">
      <form onSubmit={add} className="flex gap-2">
        <input placeholder="Nova categoria" value={newName} onChange={(e) => setNewName(e.target.value)} className={field} />
        <button aria-label="Adicionar" className="shrink-0 rounded-lg bg-primary px-4 text-primary-foreground"><Plus className="h-5 w-5" /></button>
      </form>
      <ul className="mt-4 space-y-2">
        {cats.map((c, i) => (
          <li key={c.id} className="flex items-center gap-1 rounded-xl border border-border bg-card p-2">
            <div className="flex flex-col">
              <button aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)} className="p-1 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
              <button aria-label="Descer" disabled={i === cats.length - 1} onClick={() => move(i, 1)} className="p-1 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
            </div>
            {edit?.id === c.id ? (
              <>
                <input autoFocus value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && rename()} className={field} />
                <button aria-label="Salvar" onClick={rename} className="p-2.5 text-primary"><Check className="h-5 w-5" /></button>
              </>
            ) : (
              <>
                <span className="flex-1 px-2 font-medium">{c.name}</span>
                <button aria-label="Renomear" onClick={() => setEdit({ id: c.id, name: c.name })} className="p-2.5"><Pencil className="h-5 w-5" /></button>
              </>
            )}
            <button aria-label="Excluir" onClick={() => setDel(c)} className="p-2.5 text-destructive"><Trash2 className="h-5 w-5" /></button>
          </li>
        ))}
      </ul>
      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>Os produtos de "{del?.name}" continuam na vitrine, mas ficarão sem categoria.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
