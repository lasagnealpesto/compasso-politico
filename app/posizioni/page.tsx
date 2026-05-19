import type { Metadata } from "next";
import Link from "next/link";
import { esponenti, getPartito } from "@/lib/data";

export const metadata: Metadata = {
  title: "Posizioni dei partiti italiani per tema | Compasso Politico",
  description:
    "Scopri le posizioni di tutti i principali politici italiani divisi per tema: immigrazione, economia, sanità, ambiente e molto altro.",
  keywords: [
    "posizioni partiti italiani",
    "politica italiana temi",
    "immigrazione economia sanità politica",
    "compasso politico",
  ],
  openGraph: {
    title: "Posizioni dei partiti italiani per tema | Compasso Politico",
    description:
      "Confronta le posizioni di destra, sinistra e centro su ogni tema politico italiano.",
    url: "/posizioni",
    siteName: "Compasso Politico",
    locale: "it_IT",
    type: "website",
  },
  alternates: { canonical: "/posizioni" },
};

function slugTema(tema: string): string {
  return tema.toLowerCase().replace(/\s+/g, "-");
}

export default function PosizioniPage() {
  // Costruisci mappa tema → { count, partiti coinvolti }
  const temiMap = new Map<string, { tema: string; count: number; partitiIds: Set<string> }>();
  for (const e of esponenti) {
    for (const pos of e.posizioniChiave) {
      const entry = temiMap.get(pos.tema) ?? { tema: pos.tema, count: 0, partitiIds: new Set() };
      entry.count++;
      entry.partitiIds.add(e.partito);
      temiMap.set(pos.tema, entry);
    }
  }

  const temi = Array.from(temiMap.values()).sort((a, b) => b.count - a.count);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs mb-6" style={{ color: "var(--muted)" }}>
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-1">/</span>
        <span>Posizioni</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Posizioni per tema</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {temi.length} temi politici. Clicca su un tema per vedere la posizione di ogni partito.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {temi.map(({ tema, count, partitiIds }) => {
          const partitiColori = Array.from(partitiIds)
            .slice(0, 4)
            .map((id) => getPartito(id)?.colore ?? "#C41230");

          return (
            <Link
              key={tema}
              href={`/posizioni/${slugTema(tema)}`}
              className="rounded-xl border p-4 hover:border-current transition-colors"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold">{tema}</span>
                <div className="flex gap-1 flex-shrink-0 mt-0.5">
                  {partitiColori.map((col, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ background: col }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                {count} {count === 1 ? "politico" : "politici"}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
