import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { esponenti, getEsponente, getPartito } from "@/lib/data";

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
  params: Promise<{ slug: string; tema: string }>;
}

export async function generateStaticParams() {
  const params: { slug: string; tema: string }[] = [];
  for (const e of esponenti) {
    for (const pos of e.posizioniChiave) {
      params.push({ slug: e.id, tema: slugTema(pos.tema) });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, tema: temaSlug } = await params;
  const esp = getEsponente(slug);
  if (!esp) return {};

  const temaLabel = temaFromSlug(temaSlug);
  const pos = esp.posizioniChiave.find((p) => slugTema(p.tema) === temaSlug);
  if (!pos) return {};

  const partito = getPartito(esp.partito);
  const title = `${esp.nome} su ${temaLabel} | Compasso Politico`;
  const description = `${esp.nome} (${partito?.nome ?? esp.partito}): posizione su ${temaLabel}. ${pos.posizione}`.slice(0, 160);

  return {
    title,
    description,
    keywords: [esp.nome, temaLabel, partito?.nome ?? "", "posizione politica", "Italia"],
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/esponenti/${slug}/posizioni/${temaSlug}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: { canonical: `/esponenti/${slug}/posizioni/${temaSlug}` },
  };
}

export default async function EsponentePosizionePage({ params }: Props) {
  const { slug, tema: temaSlug } = await params;
  const esp = getEsponente(slug);
  if (!esp) notFound();

  const temaLabel = temaFromSlug(temaSlug);
  const pos = esp.posizioniChiave.find((p) => slugTema(p.tema) === temaSlug);
  if (!pos) notFound();

  const partito = getPartito(esp.partito);
  const col = partito?.colore ?? "#C41230";

  const fotos = loadFotos();
  const fotoUrl = fotos[esp.id] ?? null;

  // Dichiarazioni che menzionano il tema (match parziale sul contesto)
  const dichiarazioniTema = esp.dichiarazioni.filter((d) =>
    d.contesto.toLowerCase().includes(temaLabel.toLowerCase()) ||
    d.testo.toLowerCase().includes(temaLabel.toLowerCase())
  );

  // Altri politici con posizione sullo stesso tema
  const altriSuStessoTema = esponenti
    .filter((e) => e.id !== esp.id)
    .flatMap((e) => {
      const p = e.posizioniChiave.find((pk) => slugTema(pk.tema) === temaSlug);
      return p ? [{ esponente: e, posizione: p.posizione }] : [];
    });

  // Altri temi dello stesso politico
  const altriTemi = esp.posizioniChiave.filter((p) => slugTema(p.tema) !== temaSlug);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: esp.nome,
    jobTitle: esp.ruolo,
    memberOf: partito ? { "@type": "Organization", name: partito.nome } : undefined,
    url: `https://compassopolitico.it/esponenti/${slug}`,
    description: `Posizione di ${esp.nome} su ${temaLabel}: ${pos.posizione}`,
    knowsAbout: esp.posizioniChiave.map((p) => p.tema),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <nav className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          <Link href="/esponenti" className="hover:underline">Esponenti</Link>
          {" / "}
          <Link href={`/esponenti/${slug}`} className="hover:underline">{esp.nome}</Link>
          {" / "}
          <span style={{ color: "var(--foreground)" }}>{temaLabel}</span>
        </nav>

        {/* Header politico */}
        <div className="rounded-2xl border p-6 mb-6" style={{ background: "var(--surface)", borderColor: "var(--border)", borderTopWidth: 4, borderTopColor: col }}>
          <div className="flex items-center gap-4">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={esp.nome}
                className="w-14 h-14 rounded-xl flex-shrink-0"
                style={{ objectFit: "cover", objectPosition: "top", border: `2px solid ${col}` }}
              />
            ) : (
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: col }}>
                {esp.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
            )}
            <div>
              <Link href={`/esponenti/${slug}`} className="text-xl font-bold hover:underline">
                {esp.nome}
              </Link>
              <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{esp.ruolo}</p>
              {partito && (
                <Link href={`/partiti/${partito.id}`} className="text-xs font-medium hover:underline" style={{ color: col }}>
                  {partito.nome}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Posizione principale */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: col, color: "#fff" }}
            >
              {temaLabel}
            </span>
            <h1 className="text-2xl font-bold">
              {esp.nome.split(" ")[0]} su {temaLabel}
            </h1>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 4, borderLeftColor: col }}>
            <p className="text-base leading-relaxed">{pos.posizione}</p>
          </div>
        </section>

        {/* Dichiarazioni sul tema */}
        {dichiarazioniTema.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4">Dichiarazioni su {temaLabel}</h2>
            <div className="space-y-3">
              {dichiarazioniTema.map((d, i) => (
                <div key={i} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 3, borderLeftColor: col }}>
                  <p className="italic text-sm mb-2">&ldquo;{d.testo}&rdquo;</p>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{d.contesto} — {d.anno}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Altri temi dello stesso politico */}
        {altriTemi.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4">Altre posizioni di {esp.nome.split(" ")[0]}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {altriTemi.map((p) => (
                <Link
                  key={p.tema}
                  href={`/esponenti/${slug}/posizioni/${slugTema(p.tema)}`}
                  className="rounded-xl border p-4 hover:border-current transition-colors"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: col }}>
                    {p.tema}
                  </div>
                  <p className="text-xs line-clamp-2" style={{ color: "var(--muted)" }}>
                    {p.posizione}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Altri politici sullo stesso tema */}
        {altriSuStessoTema.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-1">Chi altri ha una posizione su {temaLabel}</h2>
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
              Confronta le posizioni degli altri esponenti sullo stesso tema.
            </p>
            <div className="space-y-3">
              {altriSuStessoTema.map(({ esponente: e, posizione }) => {
                const pAltro = getPartito(e.partito);
                const colAltro = pAltro?.colore ?? "#666";
                const fotoAltro = fotos[e.id] ?? null;
                return (
                  <Link
                    key={e.id}
                    href={`/esponenti/${e.id}/posizioni/${temaSlug}`}
                    className="rounded-xl border p-4 flex items-start gap-3 hover:border-current transition-colors block"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    {fotoAltro ? (
                      <img
                        src={fotoAltro}
                        alt={e.nome}
                        className="w-10 h-10 rounded-lg flex-shrink-0"
                        style={{ objectFit: "cover", objectPosition: "top", border: `2px solid ${colAltro}` }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: colAltro }}>
                        {e.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{e.nome}</span>
                        {pAltro && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: colAltro + "20", color: colAltro }}>
                            {pAltro.nomeBreve}
                          </span>
                        )}
                      </div>
                      <p className="text-xs line-clamp-2" style={{ color: "var(--muted)" }}>{posizione}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA profilo completo */}
        <div className="rounded-2xl border p-6 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
            Vuoi sapere tutto su {esp.nome}? Carriera, governi, dichiarazioni e fact-check.
          </p>
          <Link
            href={`/esponenti/${slug}`}
            className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: col }}
          >
            Profilo completo di {esp.nome.split(" ")[0]}
          </Link>
        </div>

      </div>
    </>
  );
}
