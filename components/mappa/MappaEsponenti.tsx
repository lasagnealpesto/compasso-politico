"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Esponente, Partito } from "@/types";

interface Props {
  esponenti: Esponente[];
  partiti: Partito[];
  fotos: Record<string, string>;
}

interface HoverState {
  esponente: Esponente;
  partito: Partito | undefined;
  x: number;
  y: number;
}

function Avatar({ id, nome, colore, fotoUrl, size = 52 }: { id: string; nome: string; colore: string; fotoUrl: string; size?: number }) {
  const [err, setErr] = useState(false);
  const initials = nome.split(" ").map((n) => n[0]).slice(0, 2).join("");

  if (fotoUrl && !err) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fotoUrl}
        alt={nome}
        width={size}
        height={size}
        onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", objectPosition: "top", border: `2px solid ${colore}` }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colore, border: `2px solid ${colore}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.28 }}>
      {initials}
    </div>
  );
}

export default function MappaEsponenti({ esponenti, partiti, fotos }: Props) {
  const router = useRouter();
  const [hover, setHover] = useState<HoverState | null>(null);

  const toX = (v: number) => ((v + 1) / 2) * 100;
  const toY = (v: number) => ((v + 1) / 2) * 100;

  return (
    <div className="relative">
      <div
        className="relative rounded-2xl border overflow-visible"
        style={{ background: "var(--surface)", borderColor: "var(--border)", height: 560 }}
      >
        {/* Etichette assi */}
        <div className="absolute top-1/2 left-3 -translate-y-1/2 -rotate-90 text-xs font-semibold tracking-wider uppercase pointer-events-none" style={{ color: "var(--muted)", fontSize: 10 }}>Conservatore</div>
        <div className="absolute top-1/2 right-3 -translate-y-1/2 rotate-90 text-xs font-semibold tracking-wider uppercase pointer-events-none" style={{ color: "var(--muted)", fontSize: 10 }}>Liberale</div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-semibold pointer-events-none" style={{ color: "var(--muted)", fontSize: 10 }}>← Sinistra · · · Destra →</div>

        {/* Quadranti */}
        <div className="absolute pointer-events-none" style={{ inset: "8% 6%", opacity: 0.05 }}>
          <div className="w-full h-full grid grid-cols-2 grid-rows-2">
            <div style={{ background: "#ef4444" }} className="rounded-tl-xl" />
            <div style={{ background: "#3b82f6" }} className="rounded-tr-xl" />
            <div style={{ background: "#f97316" }} className="rounded-bl-xl" />
            <div style={{ background: "#6366f1" }} className="rounded-br-xl" />
          </div>
        </div>

        {/* Assi */}
        <div className="absolute pointer-events-none" style={{ top: "50%", left: "6%", right: "6%", height: 1, background: "var(--border)" }} />
        <div className="absolute pointer-events-none" style={{ left: "50%", top: "8%", bottom: "8%", width: 1, background: "var(--border)" }} />

        {/* Etichette quadranti */}
        <div className="absolute pointer-events-none text-xs font-medium" style={{ top: "10%", left: "8%", color: "var(--muted)", opacity: 0.6, fontSize: 10 }}>Sin. Conservatore</div>
        <div className="absolute pointer-events-none text-xs font-medium" style={{ top: "10%", right: "8%", color: "var(--muted)", opacity: 0.6, fontSize: 10 }}>Des. Conservatore</div>
        <div className="absolute pointer-events-none text-xs font-medium" style={{ bottom: "10%", left: "8%", color: "var(--muted)", opacity: 0.6, fontSize: 10 }}>Sin. Liberale</div>
        <div className="absolute pointer-events-none text-xs font-medium" style={{ bottom: "10%", right: "8%", color: "var(--muted)", opacity: 0.6, fontSize: 10 }}>Des. Liberale</div>

        {/* Politici */}
        <div className="absolute" style={{ inset: "8% 6%" }}>
          {esponenti.map((e) => {
            const partito = partiti.find((p) => p.id === e.partito);
            const x = toX(e.asseOrizzontale);
            const y = toY(e.asseVerticale);
            const fotoUrl = fotos[e.id] ?? "";

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
                <div className="flex flex-col items-center gap-0.5 group-hover:scale-110 transition-transform">
                  <Avatar id={e.id} nome={e.nome} colore={partito?.colore ?? "#666"} fotoUrl={fotoUrl} size={52} />
                  <span
                    className="text-xs font-semibold whitespace-nowrap px-1 rounded"
                    style={{ color: "var(--foreground)", background: "rgba(245,242,236,0.9)", fontSize: 9, maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {e.nome.split(" ").slice(-1)[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hover card */}
      {hover && <HoverCard hover={hover} fotos={fotos} />}
    </div>
  );
}

function HoverCard({ hover, fotos }: { hover: HoverState; fotos: Record<string, string> }) {
  const { esponente: e, partito } = hover;
  const anni = e.storiaPolit[0]?.dalAnno ? new Date().getFullYear() - e.storiaPolit[0].dalAnno : 0;
  const fotoUrl = fotos[e.id] ?? "";

  const cardLeft = Math.min(hover.x + 60, window.innerWidth - 310);
  const cardTop = Math.min(hover.y - 10, window.innerHeight - 430);

  return (
    <div
      className="fixed z-50 w-76 rounded-2xl shadow-2xl pointer-events-none"
      style={{ top: cardTop, left: cardLeft, background: "var(--surface)", border: "1px solid var(--border)", width: 290, borderTop: `3px solid ${partito?.colore ?? "#666"}` }}
    >
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <Avatar id={e.id} nome={e.nome} colore={partito?.colore ?? "#666"} fotoUrl={fotoUrl} size={44} />
          <div>
            <div className="font-bold text-sm">{e.nome}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>{e.ruolo}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {partito && <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ background: partito.colore }}>{partito.nome}</span>}
          {anni > 0 && <span className="text-xs" style={{ color: "var(--muted)" }}>{anni} anni in politica</span>}
        </div>
      </div>

      {e.governi.length > 0 && (
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="text-xs font-bold mb-1.5 tracking-wider" style={{ color: "var(--muted)" }}>GOVERNI</div>
          {e.governi.slice(0, 3).map((g, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span style={{ color: "var(--foreground)" }}>{g.nome}</span>
              <span style={{ color: "var(--muted)" }}>{g.anni}</span>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="text-xs font-bold mb-2 tracking-wider" style={{ color: "var(--muted)" }}>CARRIERA</div>
        <div className="flex gap-0.5 h-4 rounded overflow-hidden">
          {e.storiaPolit.map((s, i) => {
            const durata = (s.alAnno ?? new Date().getFullYear()) - s.dalAnno;
            const totale = e.storiaPolit.reduce((acc, ss) => acc + ((ss.alAnno ?? new Date().getFullYear()) - ss.dalAnno), 0) || 1;
            return (
              <div key={i} style={{ width: `${(durata / totale) * 100}%`, background: partito?.colore ?? "#666", opacity: 0.4 + (i / e.storiaPolit.length) * 0.6, minWidth: 4 }} title={`${s.partito}`} />
            );
          })}
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: "var(--muted)" }}>
          <span>{e.storiaPolit[0]?.dalAnno}</span>
          <span>oggi</span>
        </div>
      </div>

      {e.cambiRotta.length > 0 && (
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="text-xs font-bold mb-1" style={{ color: "#f59e0b" }}>⚡ CAMBIO DI ROTTA</div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>{e.cambiRotta[0].descrizione}</p>
        </div>
      )}

      {e.dichiarazioni.length > 0 && (
        <div className="px-4 py-3">
          <div className="text-xs font-bold mb-1 tracking-wider" style={{ color: "var(--muted)" }}>💬 DICHIARAZIONE</div>
          <p className="text-xs italic">&ldquo;{e.dichiarazioni[0].testo}&rdquo;</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{e.dichiarazioni[0].anno}</p>
        </div>
      )}
    </div>
  );
}
