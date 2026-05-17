import Link from "next/link";
import { partiti } from "@/lib/data";
import ParlamentoBar from "@/components/ui/ParlamentoBar";
import PartitoLogo from "@/components/ui/PartitoLogo";
import InfoTooltip from "@/components/ui/InfoTooltip";

const GOVERNO = {
  nome: "Governo Meloni",
  premier: "Giorgia Meloni",
  dal: "22 ottobre 2022",
  partiti: ["fdi", "lega", "fi", "nm"],
};

const TEMI_PRINCIPALI = [
  { icona: "🏠", label: "Economia" },
  { icona: "🌍", label: "Immigrazione" },
  { icona: "⚖️", label: "Giustizia" },
  { icona: "🌿", label: "Ambiente" },
  { icona: "🌐", label: "Esteri" },
  { icona: "👨‍👩‍👧", label: "Welfare" },
];

export default function HomePage() {
  const partitiGoverno = GOVERNO.partiti.map((id) => partiti.find((p) => p.id === id)!).filter(Boolean);
  const seggiGoverno = partitiGoverno.reduce((s, p) => s + p.seggiCamera + p.seggiSenato, 0);
  const totaleSeggi = 600;
  const pctGoverno = Math.round((seggiGoverno / totaleSeggi) * 100);

  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
          La politica italiana<br />
          <span style={{ color: "var(--accent)" }}>spiegata bene.</span>
        </h1>
        <p className="text-lg max-w-lg mx-auto mb-8" style={{ color: "var(--muted)" }}>
          Partiti, esponenti, programmi e notizie quotidiane in un solo posto.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/partiti" className="px-6 py-3 rounded-lg font-semibold text-sm text-white" style={{ background: "var(--accent)" }}>
            Mappa partiti
          </Link>
          <Link href="/esponenti" className="px-6 py-3 rounded-lg font-semibold text-sm border" style={{ border: "1px solid var(--border)", color: "var(--foreground)" }}>
            Chi è chi →
          </Link>
          <Link href="/oggi" className="px-6 py-3 rounded-lg font-semibold text-sm border" style={{ border: "1px solid var(--border)", color: "var(--foreground)" }}>
            Notizie di oggi →
          </Link>
        </div>
      </section>

      {/* Chi governa + Parlamento */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Card governo */}
          <div className="lg:col-span-2 rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
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

            {/* Barra maggioranza */}
            <div className="mb-1 flex justify-between text-xs" style={{ color: "var(--muted)" }}>
              <span>Seggi in parlamento</span>
              <span style={{ color: "#4ade80" }}>{seggiGoverno}/{totaleSeggi} ({pctGoverno}%)</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pctGoverno}%`, background: "linear-gradient(90deg, #1A3A5C, #4ade80)" }} />
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
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {TEMI_PRINCIPALI.map(({ icona, label }) => (
            <Link
              key={label}
              href={`/partiti?tema=${label.toLowerCase()}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-105 text-center"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <span className="text-2xl">{icona}</span>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
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
              href={`/partiti/${p.id}`}
              className="p-4 rounded-xl border flex items-center gap-3 transition-all hover:scale-[1.02]"
              style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 3, borderLeftColor: p.colore }}
            >
              <PartitoLogo nome={p.nome} nomeBreve={p.nomeBreve} colore={p.colore} logoUrl={p.logoUrl} size={36} className="rounded-md flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{p.nome}</div>
                <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{p.segretario}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium" style={{ background: p.coalizione === "governo" ? "#16a34a" : "#6b6b80", fontSize: 10 }}>
                    {p.coalizione === "governo" ? "Governo" : "Opposizione"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
