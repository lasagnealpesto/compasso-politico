import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { esponenti, getPartito } from "@/lib/data";

function loadFotos(): Record<string, string> {
  try {
    const p = path.join(process.cwd(), "data", "foto-politici.json");
    return JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, string>;
  } catch { return {}; }
}

function slugTema(tema: string): string {
  return tema.toLowerCase().replace(/\s+/g, "-");
}

function temaFromSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  params: Promise<{ tema: string }>;
}

export async function generateStaticParams() {
  const temi = new Set<string>();
  for (const e of esponenti) {
    for (const pos of e.posizioniChiave) {
      temi.add(slugTema(pos.tema));
    }
  }
  return Array.from(temi).map((tema) => ({ tema }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tema: temaSlug } = await params;
  const temaLabel = temaFromSlug(temaSlug);
  const count = esponenti.filter((e) =>
    e.posizioniChiave.some((p) => slugTema(p.tema) === temaSlug)
  ).length;
  if (count === 0) return {};

  const title = `${temaLabel}: posizioni dei partiti italiani | Compasso Politico`;
  const description = `Scopri le posizioni di ${count} politici italiani su ${temaLabel}. Confronta destra, sinistra e centro su questo tema.`;

  return {
    title,
    description,
    keywords: [
      temaLabel,
      `${temaLabel} partiti italiani`,
      `${temaLabel} politica italiana`,
      `posizioni politiche ${temaLabel}`,
      "compasso politico",
    ],
    openGraph: {
      title,
      description,
      url: `/posizioni/${temaSlug}`,
      siteName: "Compasso Politico",
      locale: "it_IT",
      type: "website",
    },
    alternates: {
      canonical: `/posizioni/${temaSlug}`,
    },
  };
}

export default async function PosizioneTemaPage({ params }: Props) {
  const { tema: temaSlug } = await params;
  const temaLabel = temaFromSlug(temaSlug);
  const fotos = loadFotos();

  const esponentiConTema = esponenti
    .filter((e) => e.posizioniChiave.some((p) => slugTema(p.tema) === temaSlug))
    .map((e) => ({
      ...e,
      posizione: e.posizioniChiave.find((p) => slugTema(p.tema) === temaSlug)!,
    }));

  if (esponentiConTema.length === 0) notFound();

  // Tutti gli altri temi (per nav interna)
  const altriTemi = Array.from(
    new Set(
      esponenti.flatMap((e) => e.posizioniChiave.map((p) => p.tema))
    )
  )
    .filter((t) => slugTema(t) !== temaSlug)
    .sort();

  // Raggruppa per partito
  const perPartito = new Map<string, typeof esponentiConTema>();
  for (const e of esponentiConTema) {
    const arr = perPartito.get(e.partito) ?? [];
    arr.push(e);
    perPartito.set(e.partito, arr);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${temaLabel}: posizioni dei partiti italiani`,
    description: `Posizioni di ${esponentiConTema.length} politici italiani su ${temaLabel}`,
    url: `https://compassopolitico.it/posizioni/${temaSlug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://compassopolitico.it" },
        { "@type": "ListItem", position: 2, name: "Posizioni", item: "https://compassopolitico.it/posizioni" },
        { "@type": "ListItem", position: 3, name: temaLabel },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs mb-6" style={{ color: "var(--muted)" }}>
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-1">/</span>
          <Link href="/posizioni" className="hover:underline">Posizioni</Link>
          <span className="mx-1">/</span>
          <span>{temaLabel}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Tema
          </div>
          <h1 className="text-3xl font-bold mb-2">{temaLabel}</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {esponentiConTema.length} politici italiani hanno una posizione su questo tema.
          </p>
        </header>

        {/* Politici per partito */}
        {Array.from(perPartito.entries()).map(([partitoId, lista]) => {
          const partito = getPartito(partitoId);
          const col = partito?.colore ?? "#C41230";
          return (
            <section key={partitoId} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: col }} />
                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: col }}>
                  {partito?.nome ?? partitoId.toUpperCase()}
                </h2>
              </div>
              <div className="space-y-3">
                {lista.map((e) => {
                  const foto = fotos[e.id] ?? fotos[e.nome] ?? null;
                  return (
                    <Link
                      key={e.id}
                      href={`/esponenti/${e.id}/posizioni/${temaSlug}`}
                      className="flex items-start gap-4 rounded-xl border p-4 hover:border-current transition-colors block"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                      {foto ? (
                        <img
                          src={foto}
                          alt={e.nome}
                          width={48}
                          height={48}
                          className="rounded-full object-cover flex-shrink-0"
                          style={{ width: 48, height: 48 }}
                        />
                      ) : (
                        <div
                          className="rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                          style={{
                            width: 48,
                            height: 48,
                            background: col + "22",
                            color: col,
                          }}
                        >
                          {e.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{e.nome}</div>
                        <div className="text-xs mb-2" style={{ color: "var(--muted)" }}>{e.ruolo}</div>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>{e.posizione.posizione}</p>
                      </div>
                      <div className="text-xs flex-shrink-0 self-center" style={{ color: col }}>
                        Dettagli →
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Altri temi */}
        <section className="mt-12 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "var(--muted)" }}>
            ALTRI TEMI
          </h2>
          <div className="flex flex-wrap gap-2">
            {altriTemi.map((t) => (
              <Link
                key={t}
                href={`/posizioni/${slugTema(t)}`}
                className="text-xs px-3 py-1.5 rounded-full border hover:border-current transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                {t}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
