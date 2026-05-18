import Link from "next/link";
import { partiti } from "@/lib/data";
import { getDb, type EventoRow } from "@/lib/db";
import ParlamentoBar from "@/components/ui/ParlamentoBar";
import PartitoLogo from "@/components/ui/PartitoLogo";
import InfoTooltip from "@/components/ui/InfoTooltip";
import TemiGrid from "@/components/ui/TemiGrid";
import NewsletterForm from "@/components/ui/NewsletterForm";

const GOVERNO = {
  nome: "Governo Meloni",
  premier: "Giorgia Meloni",
  dal: "22 ottobre 2022",
  partiti: ["fdi", "lega", "fi", "nm"],
};

const MINISTRI = [
  { nome: "Giorgia Meloni", ruolo: "Presidente del Consiglio", partitoId: "fdi" },
  { nome: "Antonio Tajani", ruolo: "Vice PM - Esteri", partitoId: "fi" },
  { nome: "Matteo Salvini", ruolo: "Vice PM - Infrastrutture", partitoId: "lega" },
  { nome: "Giancarlo Giorgetti", ruolo: "Economia", partitoId: "lega" },
  { nome: "Guido Crosetto", ruolo: "Difesa", partitoId: "fdi" },
  { nome: "Francesco Lollobrigida", ruolo: "Agricoltura", partitoId: "fdi" },
];

const CATEGORIA_COLORI: Record<string, string> = {
  governo: "#4f6ef7",
  legge: "#16a34a",
  scandalo: "#ef4444",
  crisi: "#f59e0b",
  internazionale: "#8b5cf6",
  riforma: "#06b6d4",
  sociale: "#ec4899",
};

export default function HomePage() {
  const db = getDb();
  const eventiRecenti = db
    .prepare("SELECT * FROM eventi WHERE impatto = 'alto' ORDER BY data DESC LIMIT 4")
    .all() as EventoRow[];

  const partitiGoverno = GOVERNO.partiti.map((id) => partiti.find((p) => p.id === id)!).filter(Boolean);
  const seggiGoverno = partitiGoverno.reduce((s, p) => s + p.seggiCamera + p.seggiSenato, 0);
  const totaleSeggi = 600;
  const pctGoverno = Math.round((seggiGoverno / totaleSeggi) * 100);

  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section
        style={{
          minHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Warm radial glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 70% 50% at 50% 45%, rgba(196,18,48,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <h1
          className="hero-title font-bold leading-tight mb-5"
          style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)", maxWidth: 820 }}
        >
          La politica italiana<br />
          <span style={{ color: "var(--accent)" }}>spiegata bene.</span>
        </h1>

        <p className="hero-sub" style={{ color: "var(--muted)", maxWidth: 480, fontSize: 16, lineHeight: 1.65, marginBottom: 32 }}>
          Partiti, esponenti, governi e storia dal 2000 ad oggi. In un solo posto, senza ideologia.
        </p>

        <div className="hero-ctas">
          <NewsletterForm />
        </div>

        {/* Scroll indicator */}
        <div
          className="hero-scroll"
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            color: "var(--muted)",
            fontSize: 13,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            opacity: 0.6,
          }}
        >
          <span>scorri</span>
          <span style={{ fontSize: 18 }}>↓</span>
        </div>
      </section>

      {/* Chi governa + Parlamento */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Card governo */}
          <div className="card-hover lg:col-span-2 rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base font-semibold">🏛️ Chi governa l&apos;Italia?</span>
              <InfoTooltip
                titolo="Governo italiano"
                testo="Il governo italiano è guidato dal Presidente del Consiglio dei Ministri, nominato dal Presidente della Repubblica. Il governo deve avere la fiducia di Camera e Senato."
              />
            </div>

            <div className="text-xl font-bold mb-1">{GOVERNO.nome}</div>
            <div className="text-sm mb-4" style={{ color: "var(--muted)" }}>Dal {GOVERNO.dal} · Premier: {GOVERNO.premier}</div>

            {/* Loghi partiti di governo */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              {partitiGoverno.map((p) => (
                <Link key={p.id} href={`/partiti/${p.id}`} className="flex items-center gap-1.5 group">
                  <PartitoLogo nome={p.nome} nomeBreve={p.nomeBreve} colore={p.colore} logoUrl={p.logoUrl} size={32} className="rounded-md" />
                  <span className="text-xs group-hover:underline" style={{ color: "var(--muted)" }}>{p.nomeBreve}</span>
                </Link>
              ))}
            </div>

            {/* Ministri chiave */}
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Il governo attuale</div>
              <div className="space-y-1.5">
                {MINISTRI.map((m) => {
                  const p = partiti.find((x) => x.id === m.partitoId);
                  return (
                    <div key={m.nome} className="flex items-center gap-2">
                      {p && (
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.colore }} />
                      )}
                      <span className="text-xs font-medium">{m.nome}</span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>{m.ruolo}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Barra maggioranza */}
            <div className="mb-1 flex justify-between text-xs" style={{ color: "var(--muted)" }}>
              <span>Seggi in parlamento</span>
              <span style={{ color: "var(--success)" }}>{seggiGoverno}/{totaleSeggi} ({pctGoverno}%)</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pctGoverno}%`, background: "var(--accent)" }} />
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Maggioranza: serve 50%+1 ({Math.ceil(totaleSeggi / 2) + 1} seggi)
            </div>
          </div>

          {/* Parlamento */}
          <div className="lg:col-span-3">
            <ParlamentoBar partiti={partiti} />
          </div>
        </div>
      </section>

      {/* Temi principali — cosa pensano i partiti */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold">I grandi temi</h2>
          <InfoTooltip titolo="I temi" testo="Per ogni tema puoi vedere la posizione di ciascun partito nella pagina dedicata al partito." />
        </div>
        <TemiGrid />
      </section>

      {/* Partiti con logo */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Tutti i partiti</h2>
          <Link href="/partiti" className="text-sm" style={{ color: "var(--accent)" }}>Vedi mappa →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {partiti.map((p) => (
            <Link
              key={p.id}
              href={`/partiti/${p.id}#esponenti`}
              className="card-hover p-4 rounded-xl border flex items-center gap-3"
              style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 3, borderLeftColor: p.colore }}
            >
              <PartitoLogo nome={p.nome} nomeBreve={p.nomeBreve} colore={p.colore} logoUrl={p.logoUrl} size={36} className="rounded-md flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm truncate">{p.nome}</div>
                <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{p.segretario}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={p.coalizione === "governo" ? { background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontSize: 10 } : { background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)", fontSize: 10 }}>
                    {p.coalizione === "governo" ? "Governo" : "Opposizione"}
                  </span>
                  <span className="text-xs font-medium" style={{ color: p.colore, fontSize: 10 }}>esponenti →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Cronaca — eventi storici recenti dal DB */}
      {eventiRecenti.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="section-tag mb-1">Cronaca politica</div>
              <h2 className="text-xl font-bold">Momenti chiave della storia recente</h2>
            </div>
            <Link href="/storia" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
              Tutta la storia →
            </Link>
          </div>
          <hr className="divider-editorial" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {eventiRecenti.map((ev) => {
              const col = CATEGORIA_COLORI[ev.categoria] ?? "#666";
              return (
                <div
                  key={ev.id}
                  className="card-hover rounded-xl border p-5"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 3, borderLeftColor: col }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: col + "20", color: col }}>
                      {ev.categoria}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{ev.anno}</span>
                  </div>
                  <div className="font-semibold text-sm mb-1">{ev.titolo}</div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{ev.descrizione}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA Newsletter */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-2xl p-8 md:p-12 text-center border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-2xl font-bold mb-3">Resta informato — gratis</h2>
          <p className="mb-6" style={{ color: "var(--muted)" }}>
            Ogni mattina: le 3 notizie di politica italiana da sapere.
          </p>
          <Link href="/newsletter" className="inline-block px-8 py-3 rounded-lg font-semibold text-white" style={{ background: "var(--accent)" }}>
            Iscriviti →
          </Link>
        </div>
      </section>
    </div>
  );
}
