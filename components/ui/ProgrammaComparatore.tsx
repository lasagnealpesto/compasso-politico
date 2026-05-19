"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { ProgrammaTema, Partito } from "@/types";
import { slugify } from "@/lib/slugify";

function temaSlug(tema: string): string {
  return tema.toLowerCase().replace(/\s+/g, "-");
}

type PartitoSlim = Pick<Partito, "id" | "nome" | "nomeBreve" | "colore" | "logoUrl" | "programma">;

interface Props {
  partito: PartitoSlim;
  altriPartiti: PartitoSlim[];
}

export default function ProgrammaComparatore({ partito, altriPartiti }: Props) {
  const [confrontoId, setConfrontoId] = useState<string | null>(null);
  const confronto = confrontoId ? altriPartiti.find((p) => p.id === confrontoId) : null;

  const temiA = partito.programma;
  const temiB = confronto?.programma ?? [];
  const tuttiTemi = Array.from(new Set([...temiA.map((t) => t.tema), ...temiB.map((t) => t.tema)]));

  return (
    <div>
      {/* Header colonne */}
      <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Partito corrente — solo display */}
        <PartitoChip partito={partito} />

        {/* Selector confronto */}
        <PartitoSelector
          selected={confronto ?? null}
          options={altriPartiti}
          onSelect={(id) => setConfrontoId(id)}
        />
      </div>

      {/* Righe per tema */}
      <div className="space-y-3">
        {tuttiTemi.map((tema) => {
          const bloA = temiA.find((t) => t.tema === tema);
          const bloB = temiB.find((t) => t.tema === tema);

          return (
            <div key={tema} className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <Link
                href={`/partiti/temi/${temaSlug(tema)}`}
                className="flex items-center justify-between px-4 py-2 group hover:opacity-80 transition-opacity"
                style={{ background: "var(--surface-2, #ebebea)" }}
              >
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{tema}</span>
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--muted)" }}>Vedi tutti →</span>
              </Link>
              <div className="grid divide-x" style={{ gridTemplateColumns: confronto ? "1fr 1fr" : "1fr" }}>
                <ColonnaTema tema={bloA} colore={partito.colore} />
                {confronto && <ColonnaTema tema={bloB} colore={confronto.colore} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Chip fisso per il partito corrente */
function PartitoChip({ partito }: { partito: PartitoSlim }) {
  return (
    <div
      className="rounded-xl px-4 py-3 flex items-center gap-3"
      style={{ background: partito.colore + "15", border: `2px solid ${partito.colore}` }}
    >
      <LogoImg logoUrl={partito.logoUrl} nome={partito.nome} nomeBreve={partito.nomeBreve} colore={partito.colore} />
      <span className="font-bold text-sm leading-tight">{partito.nome}</span>
    </div>
  );
}

/* Dropdown custom con logo + nome */
function PartitoSelector({
  selected,
  options,
  onSelect,
}: {
  selected: PartitoSlim | null;
  options: PartitoSlim[];
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-xl px-4 py-3 flex items-center gap-3 text-left transition-colors"
        style={
          selected
            ? { background: selected.colore + "15", border: `2px solid ${selected.colore}` }
            : { background: "var(--surface-2, #ebebea)", border: "2px dashed var(--border)" }
        }
      >
        {selected ? (
          <>
            <LogoImg logoUrl={selected.logoUrl} nome={selected.nome} nomeBreve={selected.nomeBreve} colore={selected.colore} />
            <span className="font-bold text-sm leading-tight flex-1">{selected.nome}</span>
          </>
        ) : (
          <span className="text-sm font-semibold flex-1" style={{ color: "var(--muted)" }}>
            + Confronta con un partito
          </span>
        )}
        <span className="text-xs flex-shrink-0" style={{ color: selected ? selected.colore : "var(--muted)" }}>
          {open ? "▴" : "▾"}
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-20 top-full mt-2 left-0 right-0 rounded-xl border shadow-lg overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          {selected && (
            <button
              onClick={() => { onSelect(null); setOpen(false); }}
              className="w-full px-4 py-2.5 text-xs text-left hover:bg-red-50 transition-colors"
              style={{ color: "#ef4444", borderBottom: "1px solid var(--border)" }}
            >
              Rimuovi confronto
            </button>
          )}
          {options.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p.id); setOpen(false); }}
              className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:opacity-80"
              style={
                selected?.id === p.id
                  ? { background: p.colore + "20" }
                  : { background: "var(--surface)" }
              }
            >
              <LogoImg logoUrl={p.logoUrl} nome={p.nome} nomeBreve={p.nomeBreve} colore={p.colore} />
              <div>
                <div className="text-sm font-semibold leading-tight">{p.nome}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{p.nomeBreve}</div>
              </div>
              {selected?.id === p.id && (
                <span className="ml-auto text-xs font-bold" style={{ color: p.colore }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Logo con fallback al cerchio colorato */
function LogoImg({ logoUrl, nome, nomeBreve, colore }: { logoUrl: string; nome: string; nomeBreve: string; colore: string }) {
  const [err, setErr] = useState(false);

  if (!err && logoUrl) {
    return (
      <div
        className="flex-shrink-0 rounded-md flex items-center justify-center"
        style={{ width: 28, height: 28, background: "#fff", border: "1px solid var(--border)", padding: 2 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={nome} style={{ objectFit: "contain", width: "100%", height: "100%" }} onError={() => setErr(true)} />
      </div>
    );
  }

  return (
    <div
      className="flex-shrink-0 rounded-md flex items-center justify-center text-white font-bold"
      style={{ width: 28, height: 28, background: colore, fontSize: 9 }}
    >
      {nomeBreve.slice(0, 3)}
    </div>
  );
}

function ColonnaTema({ tema, colore }: { tema: ProgrammaTema | undefined; colore: string }) {
  if (!tema) {
    return (
      <div className="p-4 flex items-center justify-center" style={{ background: "var(--surface)" }}>
        <span className="text-xs" style={{ color: "var(--muted)" }}>Nessuna posizione dichiarata</span>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ background: "var(--surface)" }}>
      <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>{tema.sintesi}</p>
      <ul className="space-y-1">
        {tema.puntiChiave.map((punto) => (
          <li key={punto} className="text-xs flex gap-2 items-start">
            <span className="flex-shrink-0 font-bold mt-0.5" style={{ color: colore }}>·</span>
            <Link
              href={`/punti/${slugify(punto)}`}
              className="hover:underline leading-snug"
              style={{ color: "var(--foreground)" }}
            >
              {punto}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
