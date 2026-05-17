"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Esponente, Partito } from "@/types";

interface Props {
  esponenti: Esponente[];
  partiti: Partito[];
}

interface HoverState {
  esponente: Esponente;
  partito: Partito | undefined;
  x: number;
  y: number;
}

export default function MappaEsponenti({ esponenti, partiti }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState<HoverState | null>(null);

  const toX = (v: number) => ((v + 1) / 2) * 100;
  const toY = (v: number) => ((v + 1) / 2) * 100;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setDragging(true);
    setStartPos({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  }, [translate]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setTranslate({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  }, [dragging, startPos]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  const zoom = (delta: number) => {
    setScale((s) => Math.min(3, Math.max(0.5, s + delta)));
  };

  const reset = () => { setTranslate({ x: 0, y: 0 }); setScale(1); };

  return (
    <div className="relative">
      {/* Controlli */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
        <button onClick={() => zoom(0.25)} className="w-8 h-8 rounded-lg font-bold text-lg flex items-center justify-center" style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>+</button>
        <button onClick={() => zoom(-0.25)} className="w-8 h-8 rounded-lg font-bold text-lg flex items-center justify-center" style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}>−</button>
        <button onClick={reset} className="w-8 h-8 rounded-lg text-xs flex items-center justify-center" style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>⌂</button>
      </div>

      {/* Hint */}
      <div className="absolute top-3 left-3 z-20 text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.6)", color: "var(--muted)" }}>
        Trascina per navigare · Scroll per zoom
      </div>

      {/* Container mappa */}
      <div
        ref={containerRef}
        className="relative rounded-2xl border overflow-hidden select-none"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          height: 520,
          cursor: dragging ? "grabbing" : "grab",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={(e) => { e.preventDefault(); zoom(e.deltaY < 0 ? 0.15 : -0.15); }}
      >
        {/* Inner trasformabile */}
        <div
          className="absolute inset-0"
          style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, transformOrigin: "center", transition: dragging ? "none" : "transform 0.1s" }}
        >
          {/* Etichette assi */}
          <div className="absolute top-1/2 left-2 -translate-y-1/2 -rotate-90 text-xs font-semibold tracking-wider uppercase" style={{ color: "var(--muted)", fontSize: 10 }}>Conservatore</div>
          <div className="absolute top-1/2 right-2 -translate-y-1/2 rotate-90 text-xs font-semibold tracking-wider uppercase" style={{ color: "var(--muted)", fontSize: 10 }}>Liberale</div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-semibold tracking-wider uppercase" style={{ color: "var(--muted)", fontSize: 10 }}>Sinistra ← · → Destra</div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-semibold" style={{ color: "var(--muted)", fontSize: 10 }}>Conservatore</div>

          {/* Quadranti colorati */}
          <div className="absolute" style={{ inset: "10% 6% 10% 6%", opacity: 0.06 }}>
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              <div style={{ background: "#ef4444" }} className="rounded-tl-xl" />
              <div style={{ background: "#3b82f6" }} className="rounded-tr-xl" />
              <div style={{ background: "#f97316" }} className="rounded-bl-xl" />
              <div style={{ background: "#6366f1" }} className="rounded-br-xl" />
            </div>
          </div>

          {/* Asse X */}
          <div className="absolute" style={{ top: "50%", left: "6%", right: "6%", height: 1, background: "var(--border)" }} />
          {/* Asse Y */}
          <div className="absolute" style={{ left: "50%", top: "10%", bottom: "10%", width: 1, background: "var(--border)" }} />

          {/* Esponenti */}
          <div className="absolute" style={{ inset: "10% 6%" }}>
            {esponenti.map((e) => {
              const partito = partiti.find((p) => p.id === e.partito);
              const x = toX(e.asseOrizzontale);
              const y = toY(e.asseVerticale);

              return (
                <button
                  key={e.id}
                  className="absolute group"
                  style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)", zIndex: hover?.esponente.id === e.id ? 30 : 10 }}
                  onMouseEnter={(ev) => {
                    const rect = ev.currentTarget.getBoundingClientRect();
                    setHover({ esponente: e, partito, x: rect.left, y: rect.top });
                  }}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => router.push(`/esponenti/${e.id}`)}
                >
                  {/* Avatar circolare */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 transition-all group-hover:scale-125 shadow-lg"
                    style={{ background: partito?.colore ?? "#666", borderColor: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  >
                    {e.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  {/* Label nome */}
                  <div
                    className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                  >
                    {e.nome.split(" ").slice(-1)[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hover card — fixed, fuori dal container trasformabile */}
      {hover && (
        <HoverCard hover={hover} />
      )}
    </div>
  );
}

function HoverCard({ hover }: { hover: HoverState }) {
  const { esponente: e, partito } = hover;
  const anni = e.storiaPolit[e.storiaPolit.length - 1]?.dalAnno
    ? new Date().getFullYear() - e.storiaPolit[0].dalAnno
    : 0;

  return (
    <div
      className="fixed z-50 w-72 rounded-2xl shadow-2xl pointer-events-none"
      style={{
        top: Math.min(hover.y - 10, window.innerHeight - 420),
        left: hover.x + 55,
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: "var(--border)", borderTopWidth: 3, borderTopColor: partito?.colore ?? "#666", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: partito?.colore ?? "#666" }}>
            {e.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="font-bold text-sm">{e.nome}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>{e.ruolo}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {partito && (
            <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ background: partito.colore }}>
              {partito.nome}
            </span>
          )}
          {anni > 0 && (
            <span className="text-xs" style={{ color: "var(--muted)" }}>{anni} anni in politica</span>
          )}
        </div>
      </div>

      {/* Governi */}
      {e.governi.length > 0 && (
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>GOVERNI</div>
          <div className="space-y-1">
            {e.governi.slice(0, 3).map((g, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--foreground)" }}>{g.nome}</span>
                <span style={{ color: "var(--muted)" }}>{g.anni}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partiti — mini timeline */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>CARRIERA POLITICA</div>
        <div className="flex gap-0.5 h-4 rounded overflow-hidden">
          {e.storiaPolit.map((s, i) => {
            const durata = (s.alAnno ?? new Date().getFullYear()) - s.dalAnno;
            const totale = e.storiaPolit.reduce((acc, ss) => acc + ((ss.alAnno ?? new Date().getFullYear()) - ss.dalAnno), 0) || 1;
            const width = (durata / totale) * 100;
            const col = partito?.colore ?? "#666";
            const opacity = 0.4 + (i / e.storiaPolit.length) * 0.6;
            return (
              <div
                key={i}
                style={{ width: `${width}%`, background: col, opacity, minWidth: 4 }}
                title={`${s.partito} (${s.dalAnno}–${s.alAnno ?? "oggi"})`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs mt-1" style={{ color: "var(--muted)" }}>
          <span>{e.storiaPolit[0]?.dalAnno}</span>
          <span>oggi</span>
        </div>
      </div>

      {/* Cambio rotta / cambi notevoli */}
      {e.cambiRotta.length > 0 && (
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="text-xs font-semibold mb-1.5" style={{ color: "#f59e0b" }}>⚡ CAMBI DI ROTTA</div>
          {e.cambiRotta.slice(0, 1).map((c, i) => (
            <p key={i} className="text-xs" style={{ color: "var(--muted)" }}>{c.descrizione}</p>
          ))}
        </div>
      )}

      {/* Dichiarazione */}
      {e.dichiarazioni.length > 0 && (
        <div className="px-4 py-3">
          <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>💬 DICHIARAZIONE</div>
          <p className="text-xs italic" style={{ color: "var(--foreground)" }}>&ldquo;{e.dichiarazioni[0].testo}&rdquo;</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{e.dichiarazioni[0].anno}</p>
        </div>
      )}
    </div>
  );
}
