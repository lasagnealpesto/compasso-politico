import type { Metadata } from "next";
import { getDb, type GovernoRow, type ElezioneRow, type EventoRow, type LeggeRow } from "@/lib/db";
import InfoTooltip from "@/components/ui/InfoTooltip";

export const metadata: Metadata = {
  title: "Storia Politica",
  description: "La politica italiana dal 2000 ad oggi: governi, elezioni, eventi storici e leggi chiave.",
};

const CATEGORIA_COLORI: Record<string, string> = {
  governo: "#4f6ef7",
  legge: "#16a34a",
  scandalo: "#ef4444",
  crisi: "#f59e0b",
  internazionale: "#8b5cf6",
  riforma: "#06b6d4",
  sociale: "#ec4899",
};

const COALIZIONE_COLORI: Record<string, string> = {
  "Centrodestra": "#1A3A5C",
  "Centrosinistra": "#E5001A",
  "Governo tecnico": "#666",
  "Grande coalizione": "#8b5cf6",
  "Governo del cambiamento": "#C8A800",
  "Unità nazionale": "#06b6d4",
};

function getCols(coalizione: string): string {
  for (const [key, col] of Object.entries(COALIZIONE_COLORI)) {
    if (coalizione.toLowerCase().includes(key.toLowerCase())) return col;
  }
  return "#555";
}

function formatData(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

export default function StoriaPage() {
  const db = getDb();

  const governi = db.prepare("SELECT * FROM governi ORDER BY dal ASC").all() as GovernoRow[];
  const elezioni = db.prepare("SELECT * FROM elezioni ORDER BY data ASC").all() as ElezioneRow[];
  const eventi = db.prepare("SELECT * FROM eventi ORDER BY data ASC").all() as EventoRow[];
  const leggi = db.prepare("SELECT * FROM leggi ORDER BY anno ASC").all() as LeggeRow[];

  // Anni unici per il filtro
  const anni = [...new Set(eventi.map((e) => e.anno))].sort();

  // Durata totale per scala
  const dalInizio = new Date("2000-01-01").getTime();
  const adOggi = Date.now();
  const totaleMs = adOggi - dalInizio;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Storia politica italiana</h1>
      <p className="mb-10" style={{ color: "var(--muted)" }}>
        Dal 2000 ad oggi: 14 governi, 12 elezioni, 49 eventi storici, 15 leggi chiave.
      </p>

      {/* Stat header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        {[
          { n: governi.length, label: "Governi", icon: "🏛️" },
          { n: elezioni.length, label: "Elezioni", icon: "🗳️" },
          { n: eventi.length, label: "Eventi chiave", icon: "📌" },
          { n: leggi.length, label: "Leggi storiche", icon: "📜" },
        ].map(({ n, label, icon }) => (
          <div key={label} className="rounded-xl border p-4 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{n}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* GOVERNI — visual timeline */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold">Governi</h2>
          <InfoTooltip titolo="Governi italiani" testo="L'Italia ha avuto governi molto instabili: media di circa 1 anno per governo. Dal 2000 al 2026 sono stati 14 governi diversi." />
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Larghezza proporzionale alla durata del governo.</p>

        {/* Timeline barra */}
        <div className="rounded-xl overflow-hidden border mb-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex h-12">
            {governi.map((g) => {
              const dal = new Date(g.dal).getTime();
              const al = g.al ? new Date(g.al).getTime() : Date.now();
              const pct = ((al - dal) / totaleMs) * 100;
              const col = getCols(g.coalizione);
              return (
                <div
                  key={g.id}
                  className="relative group flex-shrink-0 flex items-center justify-center border-r border-white/10 overflow-hidden"
                  style={{ width: `${Math.max(pct, 1)}%`, background: col }}
                  title={`${g.nome} (${g.durata_giorni} giorni)`}
                >
                  {pct > 6 && (
                    <span className="text-white font-bold text-xs px-1 truncate" style={{ fontSize: 10 }}>
                      {g.premier.split(" ").pop()}
                    </span>
                  )}
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
                    style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                  >
                    {g.nome} · {g.durata_giorni} giorni
                  </div>
                </div>
              );
            })}
          </div>
          {/* Etichette anni */}
          <div className="flex px-2 py-1" style={{ background: "var(--surface-2)" }}>
            {[2000, 2004, 2008, 2012, 2016, 2020, 2024, 2026].map((anno) => {
              const pct = ((new Date(`${anno}-01-01`).getTime() - dalInizio) / totaleMs) * 100;
              return (
                <div key={anno} className="absolute text-xs" style={{ left: `${pct}%`, color: "var(--muted)", fontSize: 10 }}>
                  {anno}
                </div>
              );
            })}
            <span className="text-xs" style={{ color: "var(--muted)", fontSize: 10 }}>2000 ──────────────────────── 2026</span>
          </div>
        </div>

        {/* Lista governi */}
        <div className="space-y-3">
          {governi.map((g) => {
            const col = getCols(g.coalizione);
            const partiti = JSON.parse(g.partiti) as string[];
            return (
              <div key={g.id} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 4, borderLeftColor: col }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-bold">{g.nome}</div>
                    <div className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{g.coalizione}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {partiti.slice(0, 6).map((p) => (
                        <span key={p} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>{p}</span>
                      ))}
                    </div>
                    {g.note && <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>{g.note}</p>}
                    {g.motivo_fine && (
                      <div className="mt-2 text-xs px-2 py-1 rounded-md inline-block" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                        Fine: {g.motivo_fine}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-mono">{formatData(g.dal)}</div>
                    <div className="text-sm font-mono" style={{ color: "var(--muted)" }}>{g.al ? formatData(g.al) : "oggi"}</div>
                    <div className="text-xs mt-1 font-bold" style={{ color: col }}>{g.durata_giorni} giorni</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ELEZIONI */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold">Elezioni</h2>
          <InfoTooltip titolo="Elezioni italiane" testo="In Italia si vota per le politiche (Camera + Senato), le europee, le regionali e talvolta referendum." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {elezioni.map((e) => {
            const risultati = JSON.parse(e.risultati) as { partito: string; percentuale: number; seggi: number | null }[];
            const max = Math.max(...risultati.map((r) => r.percentuale));
            return (
              <div key={e.id} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold">{e.anno} — {e.tipo.charAt(0).toUpperCase() + e.tipo.slice(1)}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{formatData(e.data)} {e.affluenza && `· Affluenza: ${e.affluenza}%`}</div>
                  </div>
                </div>
                <div className="text-xs font-semibold mb-3 px-2 py-1 rounded" style={{ background: "var(--accent)", color: "#fff", display: "inline-block" }}>
                  🏆 {e.vincitore}
                </div>

                {/* Barre risultati */}
                <div className="space-y-1.5 mt-3">
                  {risultati.slice(0, 5).map((r) => (
                    <div key={r.partito}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span style={{ color: "var(--foreground)" }}>{r.partito}</span>
                        <span style={{ color: "var(--muted)" }}>{r.percentuale}%{r.seggi ? ` · ${r.seggi} seggi` : ""}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                        <div className="h-full rounded-full" style={{ width: `${(r.percentuale / max) * 100}%`, background: "var(--accent)", opacity: 0.5 + (r.percentuale / max) * 0.5 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {e.note && <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>{e.note}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* EVENTI — cronologia */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold">Cronologia eventi</h2>
        </div>

        {/* Legenda categorie */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(CATEGORIA_COLORI).map(([cat, col]) => (
            <span key={cat} className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: col + "30", color: col, border: `1px solid ${col}50` }}>
              {cat}
            </span>
          ))}
        </div>

        {/* Timeline verticale per anno */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ background: "var(--border)" }} />
          <div className="pl-12 space-y-0">
            {anni.map((anno) => {
              const eventiAnno = eventi.filter((e) => e.anno === anno);
              return (
                <div key={anno} className="relative mb-8">
                  {/* Anno marker */}
                  <div className="absolute -left-8 top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white z-10" style={{ background: "var(--accent)" }}>
                    {anno.toString().slice(2)}
                  </div>
                  <div className="text-sm font-bold mb-3" style={{ color: "var(--accent)" }}>{anno}</div>

                  <div className="space-y-3">
                    {eventiAnno.map((ev) => {
                      const col = CATEGORIA_COLORI[ev.categoria] ?? "#666";
                      const coinvolti = ev.partiti_coinvolti ? JSON.parse(ev.partiti_coinvolti) as string[] : [];
                      return (
                        <div key={ev.id} className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 3, borderLeftColor: col }}>
                          <div className="flex items-start gap-2 mb-1.5">
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: col + "25", color: col }}>
                              {ev.categoria}
                            </span>
                            {ev.impatto === "alto" && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#f59e0b20", color: "#f59e0b" }}>⚡ alto impatto</span>
                            )}
                          </div>
                          <div className="font-semibold text-sm mb-1">{ev.titolo}</div>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{ev.descrizione}</p>
                          {coinvolti.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {coinvolti.slice(0, 3).map((p) => (
                                <span key={p} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>{p}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LEGGI */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold">Leggi storiche</h2>
          <InfoTooltip titolo="Leggi storiche" testo="Le leggi che hanno cambiato la vita degli italiani dal 2000 ad oggi." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leggi.map((l) => (
            <div key={l.id} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-semibold text-sm">{l.nome}</div>
                <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>{l.anno}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: CATEGORIA_COLORI[l.categoria] + "25", color: CATEGORIA_COLORI[l.categoria] ?? "var(--muted)" }}>{l.categoria}</span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>Gov. {l.governo}</span>
              </div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{l.descrizione}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
