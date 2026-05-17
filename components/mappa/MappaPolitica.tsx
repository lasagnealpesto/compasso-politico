"use client";

import { useRouter } from "next/navigation";
import type { Partito } from "@/types";

interface Props {
  partiti: Partito[];
}

export default function MappaPolitica({ partiti }: Props) {
  const router = useRouter();

  // Converte il valore -1/+1 in percentuale 0-100 per il posizionamento SVG
  const toX = (v: number) => ((v + 1) / 2) * 100;
  const toY = (v: number) => ((v + 1) / 2) * 100; // conservatore in alto = Y bassa

  return (
    <div
      className="relative w-full rounded-2xl border overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)", paddingBottom: "60%" }}
    >
      <div className="absolute inset-0 p-6">
        {/* Etichette assi */}
        <div className="absolute top-1/2 left-3 -translate-y-1/2 -rotate-90 text-xs font-medium" style={{ color: "var(--muted)" }}>
          Conservatore
        </div>
        <div className="absolute top-1/2 right-3 -translate-y-1/2 rotate-90 text-xs font-medium" style={{ color: "var(--muted)" }}>
          Liberale
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-medium" style={{ color: "var(--muted)" }}>
          ← Sinistra · · · Destra →
        </div>

        {/* Quadranti */}
        <div className="absolute inset-8 grid grid-cols-2 grid-rows-2" style={{ opacity: 0.07 }}>
          <div style={{ background: "#ef4444" }} className="rounded-tl-lg" />
          <div style={{ background: "#3b82f6" }} className="rounded-tr-lg" />
          <div style={{ background: "#f97316" }} className="rounded-bl-lg" />
          <div style={{ background: "#6366f1" }} className="rounded-br-lg" />
        </div>

        {/* Assi centrali */}
        <div className="absolute inset-8">
          <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: "var(--border)" }} />
          <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: "var(--border)" }} />
        </div>

        {/* Partiti posizionati */}
        <div className="absolute inset-8">
          {partiti.map((p) => {
            const x = toX(p.asseOrizzontale);
            const y = toY(p.asseVerticale);

            return (
              <button
                key={p.id}
                onClick={() => router.push(`/partiti/${p.id}`)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}
                title={p.nome}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 transition-all group-hover:scale-125 group-hover:z-10"
                  style={{ background: p.colore, borderColor: "rgba(255,255,255,0.3)" }}
                >
                  {p.nomeBreve.slice(0, 3)}
                </div>
                <div
                  className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                >
                  {p.nome}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
