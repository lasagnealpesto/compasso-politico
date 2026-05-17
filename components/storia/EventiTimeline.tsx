"use client";

import { useState } from "react";

interface EventoRow {
  id: number;
  anno: number;
  data: string;
  titolo: string;
  descrizione: string;
  categoria: string;
  partiti_coinvolti: string | null;
  impatto: string;
}

interface Props {
  eventi: EventoRow[];
  categoriaColori: Record<string, string>;
}

export default function EventiTimeline({ eventi, categoriaColori }: Props) {
  const [selected, setSelected] = useState<EventoRow | null>(null);

  const anni = [...new Set(eventi.map((e) => e.anno))].sort();

  return (
    <>
      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ background: "var(--border)" }} />
        <div className="pl-12 space-y-0">
          {anni.map((anno) => {
            const eventiAnno = eventi.filter((e) => e.anno === anno);
            return (
              <div key={anno} className="relative mb-8">
                {/* Anno marker — solo testo, nessun numerino */}
                <div
                  className="absolute -left-8 top-0 flex items-center justify-center text-xs font-bold text-white z-10"
                  style={{
                    background: "var(--accent)",
                    borderRadius: "9999px",
                    width: 32,
                    height: 32,
                    fontSize: 11,
                  }}
                >
                  {String(anno).slice(2)}
                </div>
                <div className="text-sm font-bold mb-3" style={{ color: "var(--accent)" }}>{anno}</div>

                <div className="space-y-3">
                  {eventiAnno.map((ev) => {
                    const col = categoriaColori[ev.categoria] ?? "#666";
                    const coinvolti = ev.partiti_coinvolti ? JSON.parse(ev.partiti_coinvolti) as string[] : [];
                    return (
                      <button
                        key={ev.id}
                        onClick={() => setSelected(ev)}
                        className="w-full text-left rounded-xl border p-4 transition-all hover:shadow-md hover:scale-[1.01]"
                        style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 3, borderLeftColor: col, cursor: "pointer" }}
                      >
                        <div className="flex items-start gap-2 mb-1.5">
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: col + "25", color: col }}>
                            {ev.categoria}
                          </span>
                          {ev.impatto === "alto" && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#f59e0b20", color: "#f59e0b" }}>alto impatto</span>
                          )}
                        </div>
                        <div className="font-semibold text-sm mb-1">{ev.titolo}</div>
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--muted)" }}>{ev.descrizione}</p>
                        {coinvolti.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {coinvolti.slice(0, 3).map((p) => (
                              <span key={p} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>{p}</span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal overlay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="rounded-2xl border max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: (categoriaColori[selected.categoria] ?? "#666") + "25",
                    color: categoriaColori[selected.categoria] ?? "#666",
                  }}
                >
                  {selected.categoria}
                </span>
                {selected.impatto === "alto" && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#f59e0b20", color: "#f59e0b" }}>
                    alto impatto
                  </span>
                )}
                <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>{selected.anno}</span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-xl leading-none flex-shrink-0"
                style={{ color: "var(--muted)" }}
                aria-label="Chiudi"
              >
                ×
              </button>
            </div>

            <h2 className="text-xl font-bold mb-3">{selected.titolo}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{selected.descrizione}</p>

            {selected.partiti_coinvolti && JSON.parse(selected.partiti_coinvolti).length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Partiti coinvolti
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(JSON.parse(selected.partiti_coinvolti) as string[]).map((p) => (
                    <span key={p} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "var(--surface-2)", color: "var(--foreground)" }}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
