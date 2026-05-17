import type { Metadata } from "next";
import Link from "next/link";
import { esponenti, getPartito } from "@/lib/data";

export const metadata: Metadata = {
  title: "Esponenti",
  description: "I principali esponenti della politica italiana con bio, storia politica e posizioni.",
};

export default function EsponentiPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Esponenti politici</h1>
      <p className="mb-10" style={{ color: "var(--muted)" }}>
        Profili dei principali politici italiani con storia, bio e posizioni chiave.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {esponenti.map((e) => {
          const partito = getPartito(e.partito);
          return (
            <Link
              key={e.id}
              href={`/esponenti/${e.id}`}
              className="rounded-xl border p-5 flex gap-4 transition-all hover:scale-[1.01]"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm"
                style={{ background: partito?.colore ?? "#666" }}
              >
                {e.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{e.nome}</div>
                <div className="text-xs mt-0.5 flex items-center gap-1.5">
                  {partito && (
                    <span className="px-1.5 py-0.5 rounded text-white text-xs font-medium" style={{ background: partito.colore }}>
                      {partito.nomeBreve}
                    </span>
                  )}
                  <span className="truncate" style={{ color: "var(--muted)" }}>{e.ruolo}</span>
                </div>
                <p className="text-xs mt-2 line-clamp-2" style={{ color: "var(--muted)" }}>{e.bio}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
