import type { Metadata } from "next";
import Link from "next/link";
import { partiti } from "@/lib/data";
import PartitoLogo from "@/components/ui/PartitoLogo";
import TemiFiltri from "@/components/ui/TemiFiltri";

const TEMI_META: Record<string, { label: string; icona: string; descrizione: string }> = {
  economia:     { label: "Economia", icona: "🏠", descrizione: "Tasse, lavoro, crescita, debito pubblico e welfare." },
  immigrazione: { label: "Immigrazione", icona: "🌍", descrizione: "Flussi migratori, integrazione, asilo e sicurezza delle frontiere." },
  giustizia:    { label: "Giustizia", icona: "⚖️", descrizione: "Riforma della magistratura, durata dei processi e garanzie." },
  ambiente:     { label: "Ambiente", icona: "🌿", descrizione: "Transizione energetica, clima, rinnovabili e green economy." },
  esteri:       { label: "Esteri", icona: "🌐", descrizione: "Europa, NATO, Ucraina e politica internazionale dell'Italia." },
  welfare:      { label: "Welfare", icona: "👨‍👩‍👧", descrizione: "Sanità, pensioni, reddito e protezione sociale." },
  lavoro:       { label: "Lavoro", icona: "🔨", descrizione: "Salario minimo, contratti, precarietà e mercato del lavoro." },
  diritti:      { label: "Diritti", icona: "🏳️", descrizione: "Diritti civili, cittadinanza, parità di genere e inclusione." },
  sicurezza:    { label: "Sicurezza", icona: "🛡️", descrizione: "Ordine pubblico, criminalità e forze dell'ordine." },
};

const TUTTI_TEMI = Object.keys(TEMI_META);

interface Props {
  params: Promise<{ tema: string }>;
}

export async function generateStaticParams() {
  return TUTTI_TEMI.map((tema) => ({ tema }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tema } = await params;
  const meta = TEMI_META[tema.toLowerCase()];
  if (!meta) return {};
  return {
    title: `${meta.label} — Posizioni dei partiti`,
    description: meta.descrizione,
  };
}

export default async function TemaPage({ params }: Props) {
  const { tema } = await params;
  const meta = TEMI_META[tema.toLowerCase()];
  if (!meta) return <div className="max-w-4xl mx-auto px-4 py-12">Tema non trovato.</div>;

  // trova partiti con posizione su questo tema
  const partitiConTema = partiti
    .map((p) => {
      const match = p.programma.find((pr) => pr.tema.toLowerCase() === meta.label.toLowerCase());
      return match ? { partito: p, programma: match } : null;
    })
    .filter(Boolean) as { partito: (typeof partiti)[0]; programma: { tema: string; sintesi: string; puntiChiave: string[] } }[];

  const governo = partitiConTema.filter((x) => x.partito.coalizione === "governo");
  const opposizione = partitiConTema.filter((x) => x.partito.coalizione === "opposizione");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        <Link href="/partiti" className="hover:underline">Partiti</Link>
        {" / "}
        <Link href="/partiti" className="hover:underline">Temi</Link>
        {" / "}
        <span style={{ color: "var(--foreground)" }}>{meta.label}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="text-5xl mb-3">{meta.icona}</div>
        <h1 className="text-3xl font-bold mb-2">{meta.label}</h1>
        <p style={{ color: "var(--muted)" }}>{meta.descrizione}</p>
      </div>

      <hr className="divider-editorial mb-8" />

      {/* Navigazione temi — filtri cliccabili */}
      <TemiFiltri
        attivo={tema.toLowerCase()}
        temi={TUTTI_TEMI.map((t) => ({ slug: t, icona: TEMI_META[t].icona, label: TEMI_META[t].label }))}
      />

      {partitiConTema.length === 0 && (
        <p style={{ color: "var(--muted)" }}>Nessun partito ha una posizione documentata su questo tema.</p>
      )}

      {/* Governo */}
      {governo.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="section-tag">Coalizione di Governo</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }}>🏛️ Al governo</span>
          </div>
          <div className="space-y-4">
            {governo.map(({ partito, programma }) => (
              <PartitoTemaCard key={partito.id} partito={partito} programma={programma} />
            ))}
          </div>
        </section>
      )}

      {/* Opposizione */}
      {opposizione.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="section-tag">Opposizione</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>⚡ Opposizione</span>
          </div>
          <div className="space-y-4">
            {opposizione.map(({ partito, programma }) => (
              <PartitoTemaCard key={partito.id} partito={partito} programma={programma} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PartitoTemaCard({ partito, programma }: { partito: (typeof partiti)[0]; programma: { tema: string; sintesi: string; puntiChiave: string[] } }) {
  return (
    <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 4, borderLeftColor: partito.colore }}>
      <Link href={`/partiti/${partito.id}`} className="flex items-center gap-3 mb-3 group">
        <PartitoLogo nome={partito.nome} nomeBreve={partito.nomeBreve} colore={partito.colore} logoUrl={partito.logoUrl} size={36} />
        <div>
          <div className="font-bold group-hover:underline">{partito.nome}</div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>{partito.segretario}</div>
        </div>
      </Link>
      <p className="text-sm mb-3" style={{ color: "var(--foreground)" }}>{programma.sintesi}</p>
      <ul className="space-y-1">
        {programma.puntiChiave.map((punto) => (
          <li key={punto} className="text-sm flex gap-2">
            <span style={{ color: partito.colore, fontWeight: 700 }}>·</span>
            <span style={{ color: "var(--muted)" }}>{punto}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
