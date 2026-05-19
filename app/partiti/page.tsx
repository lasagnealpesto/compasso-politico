import type { Metadata } from "next";
import Link from "next/link";
import { partiti } from "@/lib/data";
import PartitoLogo from "@/components/ui/PartitoLogo";

export const metadata: Metadata = {
  title: "Partiti Politici Italiani — Programmi, Seggi e Storia",
  description: "Tutti i partiti politici italiani: Fratelli d'Italia, Partito Democratico, Movimento 5 Stelle, Lega, Forza Italia e altri. Programmi, coalizioni, seggi e storia.",
  keywords: ["partiti politici italiani", "FdI", "PD", "M5S", "Lega", "Forza Italia", "coalizioni", "governo", "opposizione"],
  openGraph: {
    title: "Partiti Politici Italiani — Programmi, Seggi e Storia",
    description: "FdI, PD, Lega, M5S, Forza Italia: programmi, coalizioni e numero di parlamentari di tutti i partiti italiani.",
    type: "website",
    url: "/partiti",
  },
  twitter: {
    card: "summary_large_image",
    title: "Partiti Politici Italiani — Programmi, Seggi e Storia",
    description: "FdI, PD, Lega, M5S, Forza Italia: programmi, coalizioni e numero di parlamentari.",
  },
  alternates: { canonical: "/partiti" },
};

function PartitoCard({ p }: { p: (typeof partiti)[0] }) {
  return (
    <Link
      href={`/partiti/${p.id}#esponenti`}
      className="card-hover rounded-xl border p-5 flex gap-4 items-start"
      style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 4, borderLeftColor: p.colore }}
    >
      <PartitoLogo nome={p.nome} nomeBreve={p.nomeBreve} colore={p.colore} logoUrl={p.logoUrl} size={48} className="flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="font-bold">{p.nome}</div>
          {p.parlamentari > 0 && (
            <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>{p.parlamentari} parlamentari</span>
          )}
        </div>
        <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--muted)" }}>{p.descrizione}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Segretario: <span style={{ color: "var(--foreground)" }}>{p.segretario}</span>
            {" · "}Fondato nel {p.fondazione}
          </div>
          <span className="text-xs font-semibold" style={{ color: p.colore }}>Esponenti →</span>
        </div>
      </div>
    </Link>
  );
}

export default function PartitiPage() {
  const governo = partiti.filter((p) => p.coalizione === "governo");
  const opposizione = partiti.filter((p) => p.coalizione === "opposizione");

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Partiti politici italiani</h1>
      <p className="mb-10" style={{ color: "var(--muted)" }}>
        Clicca su un partito per scoprire programma, storia e esponenti.
      </p>

      {/* Governo */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold">Governo</h2>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }}>
            🏛️ Al governo
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {governo.map((p) => <PartitoCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Opposizione */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold">Opposizione</h2>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            ⚡ Opposizione
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opposizione.map((p) => <PartitoCard key={p.id} p={p} />)}
        </div>
      </section>
    </div>
  );
}
