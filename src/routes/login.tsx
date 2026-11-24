import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Entrar | Amora Acessórios" },
    { name: "description", content: "Acesso restrito ao painel da Amora Acessórios." },
    { property: "og:title", content: "Entrar | Amora Acessórios" },
    { property: "og:description", content: "Acesso restrito ao painel da loja." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setErr("E-mail ou senha incorretos."); return; }
    nav({ to: "/admin" });
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-plum px-5 font-sans">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl">
        <div className="flex items-center justify-center gap-2">
          <img
            src="/logo-diamante.png"
            alt="Amora Acessórios"
            className="h-10 w-10 object-contain"
          />
          <span className="font-display text-2xl font-semibold tracking-[0.3em]">AMORA</span>
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">Painel da loja</p>
        <input type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
          className="mt-8 w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-gold" />
        <input type="password" required placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
          className="mt-3 w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-gold" />
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        <button disabled={busy} className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold uppercase tracking-widest text-primary-foreground disabled:opacity-60">
          {busy ? "Entrando..." : "Entrar"}
        </button>
        <Link to="/" className="mt-5 block text-center text-xs text-muted-foreground">← Voltar à loja</Link>
      </form>
    </main>
  );
}
