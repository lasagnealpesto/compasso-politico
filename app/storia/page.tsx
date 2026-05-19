import type { Metadata } from "next";
import { getDb, type GovernoRow, type ElezioneRow, type EventoRow, type LeggeRow } from "@/lib/db";
import InfoTooltip from "@/components/ui/InfoTooltip";
import GoverniTimeline from "@/components/storia/GoverniTimeline";
import EventiTimeline from "@/components/storia/EventiTimeline";

export const metadata: Metadata = {
  title: "Storia Politica Italiana — Governi, Elezioni ed Eventi dal 2000",
  description: "La storia politica italiana dal 2000 ad oggi: tutti i governi, le elezioni, gli eventi storici e le leggi chiave. Berlusconi, Prodi, Monti, Letta, Renzi, Gentiloni, Conte, Draghi, Meloni.",
  keywords: ["storia politica italiana", "governi italiani", "elezioni politiche Italia", "Berlusconi", "Prodi", "Renzi", "Conte", "Draghi", "Meloni", "seconda repubblica"],
  openGraph: {
    title: "Storia Politica Italiana — Governi, Elezioni ed Eventi dal 2000",
    description: "Tutti i governi, le elezioni e gli eventi storici della politica italiana dal 2000 ad oggi.",
    type: "website",
    url: "/storia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Storia Politica Italiana — Governi, Elezioni ed Eventi dal 2000",
    description: "Tutti i governi e le elezioni italiane dal 2000: Berlusconi, Prodi, Monti, Renzi, Conte, Draghi, Meloni.",
  },
  alternates: { canonical: "/storia" },
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


      {/* GOVERNI — visual timeline */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold">Governi</h2>
          <InfoTooltip titolo="Governi italiani" testo="L'Italia ha avuto governi molto instabili: media di circa 1 anno per governo. Dal 2000 al 2026 sono stati 14 governi diversi." />
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Larghezza proporzionale alla durata del governo.</p>

        <GoverniTimeline governi={governi} dalInizio={dalInizio} totaleMs={totaleMs} />
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
                    <div className="font-bold">{e.anno} - {e.tipo.charAt(0).toUpperCase() + e.tipo.slice(1)}</div>
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

        <EventiTimeline eventi={eventi} categoriaColori={CATEGORIA_COLORI} />
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
