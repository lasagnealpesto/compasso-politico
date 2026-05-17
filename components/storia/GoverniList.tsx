"use client";

import Link from "next/link";
import { useState } from "react";

interface GovernoRow {
  id: number;
  nome: string;
  premier: string;
  coalizione: string;
  partiti: string;
  dal: string;
  al: string | null;
  motivo_fine: string | null;
  note: string | null;
  durata_giorni: number | null;
}

interface Props {
  governi: GovernoRow[];
}

const COALIZIONE_COLORI: Record<string, string> = {
  "Centrodestra": "#1A3A5C",
  "Centrosinistra": "#E5001A",
  "Governo tecnico": "#666",
  "Grande coalizione": "#8b5cf6",
  "Governo del cambiamento": "#C8A800",
  "Unita nazionale": "#06b6d4",
};

function getCols(coalizione: string): string {
  for (const [key, col] of Object.entries(COALIZIONE_COLORI)) {
    if (coalizione.toLowerCase().includes(key.toLowerCase())) return col;
  }
  return "#555";
}

function formatData(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

const LOGO_MAP: Record<string, { logoUrl: string; id: string; colore: string }> = {
  "FdI":      { logoUrl: "/loghi/fdi.svg",    id: "fdi",        colore: "#1A3A5C" },
  "Fratelli d'Italia": { logoUrl: "/loghi/fdi.svg", id: "fdi",  colore: "#1A3A5C" },
  "Lega":     { logoUrl: "/loghi/lega.png",   id: "lega",       colore: "#008000" },
  "Lega Nord":{ logoUrl: "/loghi/lega.png",   id: "lega",       colore: "#008000" },
  "Lega Salvini Premier": { logoUrl: "/loghi/lega.png", id: "lega", colore: "#008000" },
  "FI":       { logoUrl: "/loghi/fi.png",     id: "fi",         colore: "#0066CC" },
  "Forza Italia": { logoUrl: "/loghi/fi.png", id: "fi",         colore: "#0066CC" },
  "NM":       { logoUrl: "/loghi/nm.svg",     id: "nm",         colore: "#003087" },
  "Noi Moderati": { logoUrl: "/loghi/nm.svg", id: "nm",         colore: "#003087" },
  "PD":       { logoUrl: "/loghi/pd.png",     id: "pd",         colore: "#E5001A" },
  "Partito Democratico": { logoUrl: "/loghi/pd.png", id: "pd",  colore: "#E5001A" },
  "M5S":      { logoUrl: "/loghi/m5s.png",    id: "m5s",        colore: "#C8A800" },
  "MoVimento 5 Stelle": { logoUrl: "/loghi/m5s.png", id: "m5s", colore: "#C8A800" },
  "Movimento 5 Stelle": { logoUrl: "/loghi/m5s.png", id: "m5s", colore: "#C8A800" },
  "IV":       { logoUrl: "/loghi/iv.svg",     id: "italiaviva", colore: "#E91B72" },
  "Italia Viva": { logoUrl: "/loghi/iv.svg",  id: "italiaviva", colore: "#E91B72" },
  "AVS":      { logoUrl: "/loghi/avs.png",    id: "avs",        colore: "#C0001A" },
  "Alleanza Verdi e Sinistra": { logoUrl: "/loghi/avs.png", id: "avs", colore: "#C0001A" },
  "Az":       { logoUrl: "/loghi/azione.jpg", id: "azione",     colore: "#E05C00" },
  "Azione":   { logoUrl: "/loghi/azione.jpg", id: "azione",     colore: "#E05C00" },
};

function PartitoTag({ nome }: { nome: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const info = LOGO_MAP[nome];

  if (!info) {
    return (
      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
        {nome}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded transition-all hover:scale-110"
        style={{ background: info.colore + "18", border: `1px solid ${info.colore}40` }}
      >
        <img src={info.logoUrl} alt={nome} style={{ width: 18, height: 18, objectFit: "contain", borderRadius: 3 }} />
        <span className="text-xs font-medium" style={{ color: info.colore }}>{nome}</span>
      </button>

      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 mb-2 rounded-xl border flex flex-col items-center gap-2 z-30"
          style={{
            transform: "translateX(-50%)",
            background: "var(--surface)",
            borderColor: "var(--border)",
            padding: "12px 16px",
            minWidth: 120,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            pointerEvents: "none",
          }}
        >
          <img src={info.logoUrl} alt={nome} style={{ width: 40, height: 40, objectFit: "contain" }} />
          <span className="text-xs font-semibold text-center">{nome}</span>
          <Link
            href={`/partiti/${info.id}`}
            className="text-xs px-2 py-0.5 rounded font-medium"
            style={{ background: "var(--accent)", color: "#fff", pointerEvents: "auto" }}
          >
            Vedi partito →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function GoverniList({ governi }: Props) {
  return (
    <div className="space-y-3">
      {governi.map((g) => {
        const col = getCols(g.coalizione);
        const partitiList = JSON.parse(g.partiti) as string[];
        return (
          <div key={g.id} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 4, borderLeftColor: col }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-bold">{g.nome}</div>
                <div className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{g.coalizione}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {partitiList.slice(0, 8).map((p) => (
                    <PartitoTag key={p} nome={p} />
                  ))}
                </div>
                {g.note && <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>{g.note}</p>}
                {g.motivo_fine && (
                  <div className="mt-2 text-xs px-2 py-1 rounded-md inline-block" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                    Fine: {g.motivo_fine}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-mono">{formatData(g.dal)}</div>
                <div className="text-sm font-mono" style={{ color: "var(--muted)" }}>{g.al ? formatData(g.al) : "oggi"}</div>
                {g.durata_giorni && (
                  <div className="text-xs mt-1 font-bold" style={{ color: col }}>{g.durata_giorni} giorni</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
