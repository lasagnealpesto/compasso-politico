import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { getPartito, getEsponentiByPartito, partiti } from "@/lib/data";
import { getDb, type GovernoRow, type LeggeRow } from "@/lib/db";
import PartitoLogo from "@/components/ui/PartitoLogo";
import EsponenteAvatar from "@/components/ui/EsponenteAvatar";
import FondatoreCard from "@/components/ui/FondatoreCard";
import ProgrammaComparatore from "@/components/ui/ProgrammaComparatore";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return partiti.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const partito = getPartito(slug);
  if (!partito) return {};
  const desc = `${partito.nome} (${partito.nomeBreve}): ${partito.descrizione} Segretario: ${partito.segretario}. ${partito.parlamentari} parlamentari.`.slice(0, 160);
  const keywords = [partito.nome, partito.nomeBreve, partito.segretario, "partito politico italiano", partito.coalizione === "governo" ? "governo italiano" : "opposizione"];
  return {
    title: partito.nome,
    description: desc,
    keywords,
    openGraph: {
      title: `${partito.nome} | Compasso Politico`,
      description: desc,
      type: "website",
      url: `/partiti/${slug}`,
    },
    twitter: {
      card: "summary",
      title: `${partito.nome} — ${partito.nomeBreve}`,
      description: desc,
    },
    alternates: { canonical: `/partiti/${slug}` },
  };
}

export default async function PartitoPage({ params }: Props) {
  const { slug } = await params;
  const partito = getPartito(slug);
  if (!partito) notFound();

  const esponenti = getEsponentiByPartito(partito.id);

  let fotos: Record<string, string> = {};
  try { fotos = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "foto-politici.json"), "utf8")); } catch {}

  const db = getDb();
  const tuttiGoverni = db.prepare("SELECT * FROM governi ORDER BY dal ASC").all() as GovernoRow[];
  const governiPartito = tuttiGoverni.filter((g) => {
    try {
      const lista = JSON.parse(g.partiti) as string[];
      return lista.some((nome) => nome.toLowerCase().includes(partito.nomeBreve.toLowerCase()) || partito.nome.toLowerCase().includes(nome.toLowerCase()));
    } catch { return false; }
  });
  const nomeiGoverni = governiPartito.map((g) => g.nome);
  const leggiPartito = nomeiGoverni.length > 0
    ? (db.prepare(`SELECT * FROM leggi WHERE governo IN (${nomeiGoverni.map(() => "?").join(",")}) ORDER BY anno ASC`).all(...nomeiGoverni) as LeggeRow[])
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        <Link href="/partiti" className="hover:underline">Partiti</Link>
        {" / "}
        <span style={{ color: "var(--foreground)" }}>{partito.nome}</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border p-8 mb-8" style={{ background: "var(--surface)", borderColor: "var(--border)", borderTopWidth: 4, borderTopColor: partito.colore }}>
        <div className="flex items-start gap-4 mb-4">
          <PartitoLogo nome={partito.nome} nomeBreve={partito.nomeBreve} colore={partito.colore} logoUrl={partito.logoUrl} size={64} />
          <div>
            <h1 className="text-3xl font-bold">{partito.nome}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Fondato nel {partito.fondazione} · Segretario: {partito.segretario} · {partito.parlamentari} parlamentari
            </p>
          </div>
        </div>
        <p style={{ color: "var(--muted)" }}>{partito.descrizione}</p>
      </div>

      {/* Storia — fondatori + timeline */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-6">Storia</h2>

        {/* Fondatori */}
        {partito.fondatori.length > 0 && (
          <div className="mb-8">
            <div className="section-tag mb-3">Fondatori</div>
            <div className="flex flex-wrap gap-4">
              {partito.fondatori.map((f) => (
                <FondatoreCard key={f.nome} fondatore={f} colore={partito.colore} fotos={fotos} />
              ))}
            </div>
          </div>
        )}

        {/* Timeline milestones */}
        {partito.milestones.length > 0 && (
          <div>
            <div className="section-tag mb-4">Nascita e storia del partito</div>
            <div className="relative pl-8">
              {/* Linea verticale */}
              <div className="absolute left-3 top-2 bottom-2 w-0.5" style={{ background: partito.colore, opacity: 0.3 }} />

              <div className="space-y-0">
                {partito.milestones.map((m, i) => {
                  const tipoIcon: Record<string, string> = {
                    fondazione: "🌱", elezione: "🗳️", governo: "🏛️",
                    scissione: "✂️", leader: "👤", altro: "📌",
                  };
                  const isLast = i === partito.milestones.length - 1;
                  return (
                    <div key={i} className="relative flex gap-4 pb-6">
                      {/* Dot */}
                      <div
                        className="absolute -left-5 top-1 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                        style={{ background: partito.colore, border: "2px solid var(--surface)" }}
                      />
                      <div className="flex-1 rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold" style={{ color: partito.colore }}>{m.anno}</span>
                          <span className="text-xs">{tipoIcon[m.tipo]}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>{m.tipo}</span>
                        </div>
                        <p className="text-sm mb-2" style={{ color: "var(--foreground)" }}>{m.evento}</p>
                        {m.fonteUrl && (
                          <a
                            href={m.fonteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs hover:underline"
                            style={{ color: "var(--accent)" }}
                          >
                            📰 {m.fonteLabel}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Programma */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Programma politico</h2>
        <ProgrammaComparatore
          partito={{ id: partito.id, nome: partito.nome, nomeBreve: partito.nomeBreve, colore: partito.colore, programma: partito.programma }}
          altriPartiti={partiti
            .filter((p) => p.id !== partito.id)
            .map((p) => ({ id: p.id, nome: p.nome, nomeBreve: p.nomeBreve, colore: p.colore, programma: p.programma }))}
        />
      </section>

      {/* Governi */}
      {governiPartito.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-1">Governi a cui ha partecipato</h2>
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>{governiPartito.length} governi dal 2000 ad oggi</p>
          <div className="space-y-2">
            {governiPartito.map((g) => (
              <div key={g.id} className="rounded-xl border p-4 flex items-start justify-between gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 3, borderLeftColor: partito.colore }}>
                <div>
                  <div className="font-semibold text-sm">{g.nome}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{g.premier} · {g.coalizione}</div>
                  {g.motivo_fine && (
                    <div className="mt-1 text-xs px-2 py-0.5 rounded inline-block" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                      Fine: {g.motivo_fine}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>
                  <div>{new Date(g.dal).getFullYear()} — {g.al ? new Date(g.al).getFullYear() : "oggi"}</div>
                  {g.durata_giorni && <div className="font-bold mt-0.5" style={{ color: partito.colore }}>{g.durata_giorni} giorni</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Leggi storiche */}
      {leggiPartito.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-1">Leggi storiche approvate</h2>
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Principali leggi approvate durante i governi di questo partito</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {leggiPartito.map((l) => (
              <div key={l.id} className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-semibold text-sm">{l.nome}</div>
                  <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>{l.anno}</span>
                </div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{l.descrizione}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Esponenti */}
      {esponenti.length > 0 && (
        <section id="esponenti">
          <h2 className="text-xl font-bold mb-4">Esponenti principali</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {esponenti.map((e) => (
              <Link
                key={e.id}
                href={`/esponenti/${e.id}`}
                className="rounded-xl border p-5 flex gap-4 transition-all hover:scale-[1.01]"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <EsponenteAvatar nome={e.nome} colore={partito.colore} fotoUrl={fotos[e.id] ?? ""} size={48} />
                <div>
                  <div className="font-semibold">{e.nome}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{e.ruolo}</div>
                  <p className="text-xs mt-2 line-clamp-2" style={{ color: "var(--muted)" }}>{e.bio}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
