import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { getEsponente, getPartito, esponenti } from "@/lib/data";
import PartitoLogo from "@/components/ui/PartitoLogo";

function loadFotos(): Record<string, string> {
  try {
    const p = path.join(process.cwd(), "data", "foto-politici.json");
    return JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, string>;
  } catch { return {}; }
}

interface Props {
  params: Promise<{ slug: string }>;
}

const PARTITO_LOGO_MAP: Record<string, { logoUrl: string; colore: string }> = {
  "Fratelli d'Italia":         { logoUrl: "/loghi/fdi.svg",    colore: "#1A3A5C" },
  "Partito Democratico":       { logoUrl: "/loghi/pd.png",     colore: "#C8001E" },
  "MoVimento 5 Stelle":        { logoUrl: "/loghi/m5s.png",    colore: "#C8A800" },
  "Movimento 5 Stelle":        { logoUrl: "/loghi/m5s.png",    colore: "#C8A800" },
  "Lega":                      { logoUrl: "/loghi/lega.png",   colore: "#009A3E" },
  "Lega Nord":                 { logoUrl: "/loghi/lega.png",   colore: "#009A3E" },
  "Lega Salvini Premier":      { logoUrl: "/loghi/lega.png",   colore: "#009A3E" },
  "Forza Italia":              { logoUrl: "/loghi/fi.png",     colore: "#0066CC" },
  "Azione":                    { logoUrl: "/loghi/azione.jpg", colore: "#E05C00" },
  "Italia Viva":               { logoUrl: "/loghi/iv.svg",     colore: "#E91B72" },
  "Alleanza Verdi e Sinistra": { logoUrl: "/loghi/avs.png",    colore: "#6AB04C" },
  "Noi Moderati":              { logoUrl: "/loghi/nm.svg",     colore: "#003087" },
  "Ora!":                      { logoUrl: "/loghi/ora.svg",    colore: "#C9A000" },
};

export async function generateStaticParams() {
  return esponenti.map((e) => ({ slug: e.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const esp = getEsponente(slug);
  if (!esp) return {};
  const partito = getPartito(esp.partito);
  const partitoLabel = partito ? ` · ${partito.nome}` : "";
  const desc = `${esp.ruolo}${partitoLabel}. ${esp.bio}`.slice(0, 160);
  const anni = new Date().getFullYear() - (esp.storiaPolit[0]?.dalAnno ?? new Date().getFullYear());
  const keywords = [esp.nome, esp.ruolo, partito?.nome ?? "", "politico italiano", `${anni} anni in politica`].filter(Boolean);
  return {
    title: esp.nome,
    description: desc,
    keywords,
    openGraph: {
      title: `${esp.nome}${partitoLabel} | Compasso Politico`,
      description: desc,
      type: "profile",
      url: `/esponenti/${slug}`,
    },
    twitter: {
      card: "summary",
      title: `${esp.nome} — ${esp.ruolo}`,
      description: desc,
    },
    alternates: { canonical: `/esponenti/${slug}` },
  };
}

export default async function EsponentePage({ params }: Props) {
  const { slug } = await params;
  const esp = getEsponente(slug);
  if (!esp) notFound();

  const fotos = loadFotos();
  const fotoUrl = fotos[esp.id] ?? null;

  const partito = getPartito(esp.partito);
  const col = partito?.colore ?? "#666";
  const anniPolitica = new Date().getFullYear() - (esp.storiaPolit[0]?.dalAnno ?? new Date().getFullYear());
  const totaleAnni = esp.storiaPolit.reduce((acc, s) => acc + ((s.alAnno ?? new Date().getFullYear()) - s.dalAnno), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Breadcrumb */}
      <div className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        <Link href="/esponenti" className="hover:underline">Esponenti</Link>
        {" / "}
        <span style={{ color: "var(--foreground)" }}>{esp.nome}</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border p-6 mb-8" style={{ background: "var(--surface)", borderColor: "var(--border)", borderTopWidth: 4, borderTopColor: col }}>
        <div className="flex items-start gap-4 mb-4">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={esp.nome}
              className="w-20 h-20 rounded-2xl flex-shrink-0"
              style={{ objectFit: "cover", objectPosition: "top", border: `3px solid ${col}` }}
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0" style={{ background: col }}>
              {esp.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{esp.nome}</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{esp.ruolo}</p>
            {partito && (
              <div className="flex items-center gap-2 mt-2">
                <PartitoLogo nome={partito.nome} nomeBreve={partito.nomeBreve} colore={partito.colore} logoUrl={partito.logoUrl} size={22} className="rounded" />
                <Link href={`/partiti/${partito.id}`} className="text-sm font-medium hover:underline" style={{ color: col }}>{partito.nome}</Link>
              </div>
            )}
          </div>
        </div>

        {/* Stat rapide */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { v: anniPolitica, label: "anni in politica" },
            { v: esp.governi.length, label: esp.governi.length === 1 ? "governo" : "governi" },
            { v: esp.storiaPolit.length, label: esp.storiaPolit.length === 1 ? "partito" : "partiti" },
          ].map(({ v, label }) => (
            <div key={label} className="text-center p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
              <div className="text-2xl font-bold" style={{ color: col }}>{v}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{label}</div>
            </div>
          ))}
        </div>

        <p className="mt-4 leading-relaxed text-sm" style={{ color: "var(--muted)" }}>{esp.bio}</p>

        {esp.wikipedia && (
          <a href={esp.wikipedia} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm" style={{ color: "var(--accent)" }}>
            Wikipedia →
          </a>
        )}
      </div>

      {/* Timeline carriera — barra orizzontale */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-5">Carriera politica</h2>

        {/* Barra colori proporzionale agli anni */}
        <div className="rounded-xl overflow-hidden mb-2" style={{ height: 32 }}>
          <div className="flex h-full">
            {esp.storiaPolit.map((s, i) => {
              const durata = (s.alAnno ?? new Date().getFullYear()) - s.dalAnno;
              const pct = totaleAnni ? (durata / totaleAnni) * 100 : 100 / esp.storiaPolit.length;
              const opacity = 0.35 + (i / (esp.storiaPolit.length || 1)) * 0.65;
              const logoInfo = PARTITO_LOGO_MAP[s.partito];
              const bgColor = logoInfo?.colore ?? col;
              return (
                <div
                  key={i}
                  className="relative group flex items-center justify-center"
                  style={{ width: `${pct}%`, background: bgColor, opacity: logoInfo ? 0.85 + (i / (esp.storiaPolit.length || 1)) * 0.15 : opacity, minWidth: 6 }}
                  title={`${s.partito}: ${s.dalAnno}–${s.alAnno ?? "oggi"}`}
                >
                  {pct > 16 && logoInfo ? (
                    <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 4, padding: 2, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoInfo.logoUrl} alt={s.partito} style={{ width: 16, height: 16, objectFit: "contain" }} />
                    </div>
                  ) : pct > 10 ? (
                    <span style={{ fontSize: 9, color: "white", fontWeight: 700 }}>{s.dalAnno}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legenda anni */}
        <div className="flex justify-between text-xs mb-6" style={{ color: "var(--muted)" }}>
          <span>{esp.storiaPolit[0]?.dalAnno}</span>
          <span>oggi ({new Date().getFullYear()})</span>
        </div>

        {/* Dettaglio: barre anni per partito */}
        <div className="rounded-xl border p-5 mb-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-sm font-semibold mb-4">Anni per partito</div>
          <div className="space-y-3">
            {esp.storiaPolit.map((s, i) => {
              const durata = (s.alAnno ?? new Date().getFullYear()) - s.dalAnno;
              const pct = totaleAnni ? (durata / totaleAnni) * 100 : 100;
              const opacity = 0.35 + (i / (esp.storiaPolit.length || 1)) * 0.65;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1" style={{ color: "var(--muted)" }}>
                    <div className="flex items-center gap-1.5">
                      {PARTITO_LOGO_MAP[s.partito] && (
                        <div style={{ width: 20, height: 20, background: "#fff", border: "1px solid var(--border)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", padding: 2, flexShrink: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={PARTITO_LOGO_MAP[s.partito].logoUrl} alt={s.partito} style={{ width: 14, height: 14, objectFit: "contain" }} />
                        </div>
                      )}
                      <span className="font-medium" style={{ color: "var(--foreground)" }}>{s.partito}</span>
                    </div>
                    <span>{s.dalAnno}–{s.alAnno ?? "oggi"} ({durata} {durata === 1 ? "anno" : "anni"})</span>
                  </div>
                  <div className="h-4 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: col, opacity }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline verticale dettagliata */}
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-0.5" style={{ background: "var(--border)" }} />
          {esp.storiaPolit.map((s, i) => (
            <div key={i} className="relative mb-5 last:mb-0">
              <div className="absolute -left-4 top-2 w-3 h-3 rounded-full border-2" style={{ background: col, borderColor: "var(--background)" }} />
              <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {PARTITO_LOGO_MAP[s.partito] && (
                      <div style={{ width: 30, height: 30, background: "#fff", border: "1px solid var(--border)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", padding: 3, flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={PARTITO_LOGO_MAP[s.partito].logoUrl} alt={s.partito} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm">{s.partito}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{s.ruolo}</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono flex-shrink-0" style={{ color: "var(--muted)" }}>
                    {s.dalAnno}–{s.alAnno ?? "oggi"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Governi */}
      {esp.governi.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Governi</h2>
          <div className="space-y-3">
            {esp.governi.map((g, i) => (
              <div key={i} className="rounded-xl border p-4 flex items-center justify-between" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div>
                  <div className="font-semibold text-sm">{g.nome}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{g.ruolo}</div>
                </div>
                <div className="text-xs px-2 py-1 rounded-lg" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>{g.anni}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Posizioni chiave */}
      {esp.posizioniChiave.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Posizioni chiave</h2>
          <div className="space-y-2">
            {esp.posizioniChiave.map((pos) => {
              const temaSlug = pos.tema.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  key={pos.tema}
                  href={`/esponenti/${esp.id}/posizioni/${temaSlug}`}
                  className="rounded-xl border p-4 flex gap-4 hover:border-current transition-colors block"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div className="text-sm font-semibold min-w-[90px]" style={{ color: col }}>{pos.tema}</div>
                  <p className="text-sm flex-1" style={{ color: "var(--muted)" }}>{pos.posizione}</p>
                  <div className="text-xs flex-shrink-0 self-center" style={{ color: col }}>Approfondisci →</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Dichiarazioni notevoli */}
      {esp.dichiarazioni.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">💬 Dichiarazioni notevoli</h2>
          <div className="space-y-3">
            {esp.dichiarazioni.map((d, i) => (
              <div key={i} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 3, borderLeftColor: col }}>
                <p className="italic text-sm mb-2">&ldquo;{d.testo}&rdquo;</p>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{d.contesto} — {d.anno}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cambi di rotta */}
      {esp.cambiRotta.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">⚡ Cambi di rotta</h2>
          <div className="space-y-3">
            {esp.cambiRotta.map((c, i) => (
              <div key={i} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "#f59e0b", borderLeftWidth: 3 }}>
                <div className="font-semibold text-sm mb-3">{c.descrizione}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-3" style={{ background: "var(--surface-2)" }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: "#f87171" }}>Prima ({c.anno - 1 || "prima"})</div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>{c.prima}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: "var(--surface-2)" }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: "var(--success)" }}>Dopo ({c.anno}+)</div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>{c.dopo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Falsità e debunk */}
      {esp.falsita.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">🔍 Fact-check</h2>
          <div className="space-y-3">
            {esp.falsita.map((f, i) => (
              <div key={i} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "#ef4444", borderLeftWidth: 3 }}>
                <div className="text-xs font-semibold mb-1" style={{ color: "#f87171" }}>❌ AFFERMAZIONE</div>
                <p className="text-sm italic mb-3">&ldquo;{f.affermazione}&rdquo;</p>
                <div className="text-xs font-semibold mb-1" style={{ color: "var(--success)" }}>✅ DEBUNK</div>
                <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>{f.debunk}</p>
                <div className="text-xs" style={{ color: "var(--muted)" }}>Fonte: {f.fonte}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
