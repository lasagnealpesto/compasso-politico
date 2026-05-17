import type { Metadata } from "next";
import Link from "next/link";
import { partiti } from "@/lib/data";
import MappaPolitica from "@/components/mappa/MappaPolitica";

export const metadata: Metadata = {
  title: "Partiti",
  description: "Tutti i partiti politici italiani con programmi, storia e mappa ideologica.",
};

export default function PartitiPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Partiti politici italiani</h1>
      <p className="mb-10" style={{ color: "var(--muted)" }}>
        Clicca su un partito nella mappa o nella lista per scoprire programma, storia e esponenti.
      </p>

      {/* Mappa assi ideologici */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold mb-4">Mappa ideologica</h2>
        <MappaPolitica partiti={partiti} />
      </section>

      {/* Lista completa */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Tutti i partiti</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partiti.map((p) => (
            <Link
              key={p.id}
              href={`/partiti/${p.id}`}
              className="p-5 rounded-xl border transition-all hover:scale-[1.01]"
              style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 4, borderLeftColor: p.colore }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-bold">{p.nome}</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                    {p.nomeBreve}
                  </span>
                </div>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{p.parlamentari} parlamentari</span>
              </div>
              <p className="text-sm line-clamp-2" style={{ color: "var(--muted)" }}>{p.descrizione}</p>
              <div className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
                Segretario: <span style={{ color: "var(--foreground)" }}>{p.segretario}</span>
                {" · "}Fondato nel {p.fondazione}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
