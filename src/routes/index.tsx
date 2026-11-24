import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Clock, MessageCircle } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Catalog } from "@/components/store/Catalog";
import { CartButton, CartSheet } from "@/components/store/CartSheet";

type HeroImage = { src: string; alt: string };

const HERO_ALT_BY_FILE: Record<string, string> = {
  "hero.jpg": "Acessórios dourados e bolsas selecionadas da Amora Acessórios em Timóteo",
  "hero-2.jpg": "Semijoias e acessórios femininos em destaque na Amora Acessórios em Timóteo",
  "hero-3.jpg": "Bolsas de festa e acessórios elegantes da Amora Acessórios em Timóteo",
  "hero-4.jpg": "Coleção de joias, semijoias e bolsas da Amora Acessórios em Timóteo",
};

const discoveredHeroModules = import.meta.glob<string>(
  "../assets/hero*.{jpg,jpeg,png,webp,avif}",
  { eager: true, import: "default" },
);

const extraHeroImages: HeroImage[] = Object.entries(discoveredHeroModules)
  .map(([path, src]) => ({ file: path.split("/").pop() ?? "", src }))
  .filter(({ file }) => file !== "hero.jpg")
  .sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }))
  .map(({ file, src }, index) => ({
    src,
    alt: HERO_ALT_BY_FILE[file] ?? `Acessórios e bolsas da Amora Acessórios em Timóteo — foto ${index + 2}`,
  }));

const heroImages: HeroImage[] = [
  { src: hero, alt: HERO_ALT_BY_FILE["hero.jpg"]! },
  ...extraHeroImages,
];

const WA = "https://wa.me/5531988813158?text=" + encodeURIComponent("Olá, Amora! Vim pelo site e gostaria de saber mais sobre os acessórios.");
const MAPS = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Rua 68, 22, Olaria, Timóteo - MG");

export const Route = createFileRoute("/")({
  component: Index,
});

const hours = [
  { d: "Segunda e terça", h: "14h às 18h30" },
  { d: "Quarta a sexta", h: "9h às 18h30" },
  { d: "Sábado", h: "9h às 16h" },
];

function WaButton({
  label = "Chamar no WhatsApp",
  light = false,
  className = "",
}: {
  label?: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <a href={WA} target="_blank" rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-widest transition-transform hover:scale-[1.03] ${light ? "bg-gold-gradient text-accent-foreground" : "bg-primary text-primary-foreground"} ${className}`}>
      <MessageCircle aria-hidden="true" className="h-5 w-5 shrink-0" /> {label}
    </a>
  );
}

function HeroSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [resetTick, setResetTick] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroImages.length);
    }, 4500);

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) window.clearInterval(intervalId);
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      window.clearInterval(intervalId);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, [resetTick]);

  function handleSelect(index: number) {
    setActiveIndex(index);
    setResetTick((tick) => tick + 1);
  }

  return (
    <div className="relative w-full">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-t-full bg-[radial-gradient(circle_at_50%_28%,oklch(0.76_0.09_80/0.14),transparent_68%)] blur-2xl"
      />
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-t-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
        {heroImages.map((img, i) => {
          const active = i === activeIndex;
          return (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              width={1024}
              height={1536}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={i === 0 ? "high" : undefined}
              aria-hidden={!active}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                active ? "z-10 opacity-100" : "z-0 opacity-0"
              }`}
            />
          );
        })}

        {/* Vinheta radial suave nas bordas usando o tom plum do projeto */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_52%,oklch(0.27_0.05_340/0.62)_100%)]"
        />

        {/* Degradê de fusão na base para integrar a foto ao fundo vinho */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[34%] bg-linear-to-t from-plum via-plum/30 to-transparent"
        />

        {heroImages.length > 1 && (
          <div
            className="absolute inset-x-0 bottom-4 z-30 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Fotos em destaque"
          >
            {heroImages.map((img, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={img.src}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Ver foto ${i + 1} de ${heroImages.length}`}
                  onClick={() => handleSelect(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    active
                      ? "w-5 bg-gold shadow-xs"
                      : "w-2 bg-primary-foreground/50 hover:bg-primary-foreground/85"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Index() {
  return (
    <main className="font-sans">
      <section className="relative overflow-hidden bg-plum text-primary-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-10 md:grid-cols-2 md:py-24">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo-diamante.png"
                alt="Amora Acessórios - Timóteo MG"
                decoding="async"
                className="h-25 w-25 object-contain"
              />
              <span className="text-gold-gradient font-display text-3xl font-semibold tracking-[0.3em]">AMORA</span>
            </div>
            <h1 className="mt-12 font-display text-5xl leading-[1.05] md:text-7xl">
              Acessórios que <em className="text-gold-gradient">brilham</em> com você
            </h1>
            <p className="mt-6 max-w-md text-primary-foreground/75">
              Pulseiras, anéis, colares e bolsas escolhidos a dedo para completar o seu estilo. Em Timóteo - MG.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
              <WaButton light className="w-full sm:w-auto" />
              <div className="grid grid-cols-2 gap-3 sm:contents">
                <a
                  href="#vitrine"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-gold/50 px-3 py-3.5 text-xs font-semibold uppercase tracking-wider text-gold transition-colors hover:border-gold hover:bg-gold/10 sm:px-7 sm:py-4 sm:text-sm sm:tracking-widest"
                >
                  Ver vitrine
                </a>
                <a
                  href="#onde-estamos"
                  className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-gold/50 px-3 py-3.5 text-xs font-semibold uppercase tracking-wider text-gold transition-colors hover:border-gold hover:bg-gold/10 sm:gap-2 sm:px-7 sm:py-4 sm:text-sm sm:tracking-widest"
                >
                  <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                  Onde estamos
                </a>
              </div>
            </div>
          </div>
          <HeroSlideshow />
        </div>
      </section>

      <Catalog />

      <section id="onde-estamos" className="scroll-mt-16 bg-secondary">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-2">
          <div className="rounded-2xl bg-plum p-10 text-primary-foreground">
            <MapPin aria-hidden="true" className="h-8 w-8 text-gold" />
            <h2 className="mt-4 font-display text-5xl text-gold-gradient">Onde estamos</h2>
            <p className="mt-6 text-lg">Rua 68, nº 22<br />Olaria, Timóteo – MG</p>
            <a href={MAPS} target="_blank" rel="noreferrer" className="mt-8 inline-block border-b border-gold pb-1 text-sm uppercase tracking-widest text-gold">Abrir no mapa</a>
          </div>
          <div className="rounded-2xl bg-card p-10">
            <Clock aria-hidden="true" className="h-8 w-8 text-gold" />
            <h2 className="mt-4 font-display text-5xl italic">Nosso horário</h2>
            <ul className="mt-6 divide-y divide-border">
              {hours.map((x) => (
                <li key={x.d} className="flex justify-between py-4">
                  <span className="font-display text-xl italic">{x.d}</span>
                  <span className="text-muted-foreground">{x.h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="font-display text-4xl md:text-5xl">Fale com a gente</h2>
        <p className="mt-4 text-muted-foreground">(31) 98881-3158</p>
        <div className="mt-8"><WaButton /></div>
      </section>

      <footer className="bg-plum px-6 py-8 text-xs uppercase tracking-widest text-primary-foreground/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-4 md:grid-cols-3">
          {/* Canto esquerdo: sua assinatura */}
          <a
            href="https://instagram.com/ryan.devbr"
            target="_blank"
            rel="noopener noreferrer"
            className="order-2 justify-self-start text-[10px] opacity-50 transition-opacity hover:opacity-100 md:order-1"
          >
            Feito por{" "}
            <span className="font-medium text-primary-foreground underline decoration-primary-foreground/30 underline-offset-4">
              @ryan.devbr
            </span>
          </a>

          {/* Centro: dados da loja e acesso admin */}
          <div className="order-1 text-center md:order-2">
            <p>© {new Date().getFullYear()} Amora Acessórios · Timóteo – MG</p>
            <Link
              to="/admin"
              className="mt-3 inline-block text-[10px] opacity-40 transition-opacity hover:opacity-80"
            >
              Área da loja
            </Link>
          </div>

          {/* Coluna direita vazia para manter o centro alinhado no desktop */}
          <div className="hidden md:order-3 md:block" />
        </div>
      </footer>

      <a href={WA} target="_blank" rel="noreferrer" aria-label="WhatsApp"
        className="bg-gold-gradient fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-accent-foreground shadow-xl">
        <MessageCircle aria-hidden="true" className="h-6 w-6" />
      </a>
      <CartButton />
      <CartSheet />
    </main>
  );
}
