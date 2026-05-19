import type { Metadata } from "next";
import Link from "next/link";
import { partiti } from "@/lib/data";
import { slugify } from "@/lib/slugify";
import PartitoLogo from "@/components/ui/PartitoLogo";
import TemiFiltri from "@/components/ui/TemiFiltri";
import type { ProgrammaTema } from "@/types";

const TEMI_META: Record<string, { label: string; icona: string; descrizione: string; proposizione?: string }> = {
  economia:     { label: "Economia", icona: "🏠", descrizione: "Tasse, lavoro, crescita, debito pubblico e welfare.", proposizione: "Riduzione delle tasse e liberalizzazioni" },
  immigrazione: { label: "Immigrazione", icona: "🌍", descrizione: "Flussi migratori, integrazione, asilo e sicurezza delle frontiere.", proposizione: "Controllo dei flussi e politiche di rimpatrio" },
  giustizia:    { label: "Giustizia", icona: "⚖️", descrizione: "Riforma della magistratura, durata dei processi e garanzie.", proposizione: "Riforma della magistratura e separazione delle carriere" },
  ambiente:     { label: "Ambiente", icona: "🌿", descrizione: "Transizione energetica, clima, rinnovabili e green economy.", proposizione: "Transizione ecologica accelerata e stop ai fossili" },
  esteri:       { label: "Esteri", icona: "🌐", descrizione: "Europa, NATO, Ucraina e politica internazionale dell'Italia.", proposizione: "Atlantismo e supporto all'Ucraina" },
  welfare:      { label: "Welfare", icona: "👨‍👩‍👧", descrizione: "Sanità, pensioni, reddito e protezione sociale.", proposizione: "Difesa del welfare universale pubblico" },
  lavoro:       { label: "Lavoro", icona: "🔨", descrizione: "Salario minimo, contratti, precarietà e mercato del lavoro.", proposizione: "Salario minimo legale e tutele lavorative" },
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

  const partitiConTema = partiti
    .map((p) => {
      const match = p.programma.find((pr) => pr.tema.toLowerCase() === meta.label.toLowerCase());
      return match ? { partito: p, programma: match } : null;
    })
    .filter(Boolean) as { partito: (typeof partiti)[0]; programma: ProgrammaTema }[];

  const pro = partitiConTema.filter((x) => x.programma.stance === "pro");
  const contro = partitiConTema.filter((x) => x.programma.stance === "contro");
  const altriPartiti = partitiConTema.filter((x) => !x.programma.stance);
  const haStance = pro.length > 0 || contro.length > 0;

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

      {/* Scheda pro/contro */}
      {haStance && meta.proposizione && (
        <div className="rounded-2xl border mb-8 overflow-hidden" style={{ borderColor: "var(--border)" }}>
          {/* Intestazione proposta */}
          <div className="px-5 py-4 border-b" style={{ background: "var(--surface-2, #ebebea)", borderColor: "var(--border)" }}>
            <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--muted)" }}>Proposta di riferimento</div>
            <div className="font-bold text-base">{meta.proposizione}</div>
          </div>

          {/* Due colonne pro/contro */}
          <div className="grid grid-cols-2 divide-x">
            {/* Pro */}
            <div className="p-5" style={{ background: "var(--surface)" }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-bold px-2.5 py-1 rounded-full" style={{ background: "#dcfce7", color: "#15803d" }}>
                  ✓ Favorevoli
                </span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{pro.length} {pro.length === 1 ? "partito" : "partiti"}</span>
              </div>
              {pro.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--muted)" }}>Nessun partito</p>
              ) : (
                <div className="space-y-2">
                  {pro.map(({ partito }) => (
                    <Link
                      key={partito.id}
                      href={`/partiti/${partito.id}`}
                      className="flex items-center gap-2 group"
                    >
                      <PartitoLogo nome={partito.nome} nomeBreve={partito.nomeBreve} colore={partito.colore} logoUrl={partito.logoUrl} size={28} />
                      <span className="text-sm font-semibold group-hover:underline">{partito.nome}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Contro */}
            <div className="p-5" style={{ background: "var(--surface)" }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-bold px-2.5 py-1 rounded-full" style={{ background: "#fee2e2", color: "#dc2626" }}>
                  ✗ Contrari
                </span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{contro.length} {contro.length === 1 ? "partito" : "partiti"}</span>
              </div>
              {contro.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--muted)" }}>Nessun partito</p>
              ) : (
                <div className="space-y-2">
                  {contro.map(({ partito }) => (
                    <Link
                      key={partito.id}
                      href={`/partiti/${partito.id}`}
                      className="flex items-center gap-2 group"
                    >
                      <PartitoLogo nome={partito.nome} nomeBreve={partito.nomeBreve} colore={partito.colore} logoUrl={partito.logoUrl} size={28} />
                      <span className="text-sm font-semibold group-hover:underline">{partito.nome}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <hr className="divider-editorial mb-8" />

      {/* Navigazione temi */}
      <TemiFiltri
        attivo={tema.toLowerCase()}
        temi={TUTTI_TEMI.map((t) => ({ slug: t, icona: TEMI_META[t].icona, label: TEMI_META[t].label }))}
      />

      {partitiConTema.length === 0 && (
        <p style={{ color: "var(--muted)" }}>Nessun partito ha una posizione documentata su questo tema.</p>
      )}

      {/* Tutte le posizioni */}
      {partitiConTema.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4">Posizioni di tutti i partiti</h2>
          <div className="space-y-4">
            {partitiConTema.map(({ partito, programma }) => (
              <PartitoTemaCard key={partito.id} partito={partito} programma={programma} />
            ))}
          </div>
        </section>
      )}

      {/* Partiti senza posizione */}
      {altriPartiti.length > 0 && haStance && (
        <section className="mt-8">
          <h2 className="text-lg font-bold mb-4">Posizione non classificata</h2>
          <div className="space-y-4">
            {altriPartiti.map(({ partito, programma }) => (
              <PartitoTemaCard key={partito.id} partito={partito} programma={programma} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PartitoTemaCard({ partito, programma }: { partito: (typeof partiti)[0]; programma: ProgrammaTema }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 4, borderLeftColor: partito.colore }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link href={`/partiti/${partito.id}`} className="flex items-center gap-3 group">
          <PartitoLogo nome={partito.nome} nomeBreve={partito.nomeBreve} colore={partito.colore} logoUrl={partito.logoUrl} size={36} />
          <div>
            <div className="font-bold group-hover:underline">{partito.nome}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>{partito.segretario}</div>
          </div>
        </Link>
        {programma.stance && (
          <span
            className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
            style={
              programma.stance === "pro"
                ? { background: "#dcfce7", color: "#15803d" }
                : { background: "#fee2e2", color: "#dc2626" }
            }
          >
            {programma.stance === "pro" ? "✓ Favorevole" : "✗ Contrario"}
          </span>
        )}
      </div>
      <p className="text-sm mb-3" style={{ color: "var(--foreground)" }}>{programma.sintesi}</p>
      <ul className="space-y-1">
        {programma.puntiChiave.map((punto) => (
          <li key={punto} className="text-sm flex gap-2 items-start">
            <span className="flex-shrink-0 mt-0.5" style={{ color: partito.colore, fontWeight: 700 }}>·</span>
            <Link
              href={`/punti/${slugify(punto)}`}
              className="hover:underline"
              style={{ color: "var(--muted)" }}
            >
              {punto}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
