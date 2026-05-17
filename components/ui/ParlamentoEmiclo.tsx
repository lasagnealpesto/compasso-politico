"use client";

import { useState } from "react";
import Link from "next/link";
import type { Partito } from "@/types";
import InfoTooltip from "./InfoTooltip";

interface SeatPos {
  x: number;
  y: number;
}

function calcRowSeats(total: number, radii: number[]): number[] {
  const sumR = radii.reduce((a, b) => a + b, 0);
  const perRow: number[] = [];
  let assigned = 0;
  for (let i = 0; i < radii.length - 1; i++) {
    const n = Math.round(total * radii[i] / sumR);
    perRow.push(n);
    assigned += n;
  }
  perRow.push(total - assigned);
  return perRow;
}

function getAllPositions(radii: number[], seatsPerRow: number[], cx: number, cy: number): SeatPos[] {
  const positions: SeatPos[] = [];
  for (let row = 0; row < radii.length; row++) {
    const r = radii[row];
    const n = seatsPerRow[row];
    for (let i = 0; i < n; i++) {
      const angle = Math.PI - (Math.PI * i / Math.max(n - 1, 1));
      positions.push({
        x: cx + r * Math.cos(angle),
        y: cy - r * Math.sin(angle),
      });
    }
  }
  return positions;
}

interface PartyGroup {
  party: Partito;
  seats: SeatPos[];
}

function assignSeats(positions: SeatPos[], partiti: Partito[], getSeggi: (p: Partito) => number): PartyGroup[] {
  const sorted = [...partiti]
    .filter(p => getSeggi(p) > 0)
    .sort((a, b) => a.asseOrizzontale - b.asseOrizzontale);

  // Sort positions left to right by x
  const sortedPos = [...positions].sort((a, b) => a.x - b.x);

  let idx = 0;
  return sorted.map(party => {
    const n = getSeggi(party);
    const seats = sortedPos.slice(idx, idx + n);
    idx += n;
    return { party, seats };
  });
}

interface Props {
  partiti: Partito[];
  tipo: "camera" | "senato";
  totale: number;
  label: string;
  info: string;
}

export default function ParlamentoEmiclo({ partiti, tipo, totale, label, info }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getSeggi = (p: Partito) => tipo === "camera" ? p.seggiCamera : p.seggiSenato;

  const cx = 200;
  const cy = 205;

  const radii = tipo === "camera"
    ? [55, 78, 101, 124, 147, 170]
    : [55, 78, 101, 124, 147];

  const seatsPerRow = calcRowSeats(totale, radii);
  const allPositions = getAllPositions(radii, seatsPerRow, cx, cy);
  const partyGroups = assignSeats(allPositions, partiti, getSeggi);

  const seggiGoverno = partiti
    .filter(p => p.coalizione === "governo")
    .reduce((s, p) => s + getSeggi(p), 0);

  const hoveredParty = partyGroups.find(pg => pg.party.id === hoveredId)?.party ?? null;
  const seatR = tipo === "camera" ? 2.5 : 3.5;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-sm">{label}</span>
          <InfoTooltip titolo={label} testo={info} />
          <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>{totale} seggi totali</span>
        </div>
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          Maggioranza: <span style={{ color: "var(--success)" }}>{seggiGoverno}</span>/{totale}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 400 210"
          className="w-full"
          style={{ display: "block" }}
        >
          {partyGroups.map(({ party, seats }) => (
            <g
              key={party.id}
              style={{
                opacity: hoveredId && hoveredId !== party.id ? 0.2 : 1,
                transition: "opacity 0.12s",
                cursor: "pointer",
              }}
              onMouseEnter={() => setHoveredId(party.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {seats.map((pos, i) => (
                <circle
                  key={i}
                  cx={pos.x}
                  cy={pos.y}
                  r={seatR}
                  fill={party.colore}
                />
              ))}
            </g>
          ))}
        </svg>

        {hoveredParty && (
          <div
            className="absolute top-2 right-2 rounded-xl border flex items-center gap-3 pointer-events-none"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              padding: "10px 14px",
              minWidth: 160,
              zIndex: 10,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <div
              className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--surface-2)" }}
            >
              <img
                src={hoveredParty.logoUrl}
                alt={hoveredParty.nome}
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
            </div>
            <div>
              <div className="text-sm font-bold">{hoveredParty.nomeBreve}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{getSeggi(hoveredParty)} seggi</div>
              <div
                className="text-xs font-medium mt-0.5"
                style={{ color: hoveredParty.coalizione === "governo" ? "var(--success)" : "var(--muted)" }}
              >
                {hoveredParty.coalizione === "governo" ? "Governo" : "Opposizione"}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {partyGroups
          .slice()
          .sort((a, b) => getSeggi(b.party) - getSeggi(a.party))
          .map(({ party }) => (
            <Link
              key={party.id}
              href={`/partiti/${party.id}`}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all hover:scale-105"
              style={{ background: party.colore + "15", border: `1px solid ${party.colore}40` }}
            >
              <img
                src={party.logoUrl}
                alt={party.nomeBreve}
                style={{ width: 16, height: 16, objectFit: "contain" }}
              />
              <span className="text-xs font-medium" style={{ color: party.colore }}>{party.nomeBreve}</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>{getSeggi(party)}</span>
            </Link>
          ))}
      </div>
    </div>
  );
}
