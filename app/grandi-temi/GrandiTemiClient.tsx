"use client";

import { useState } from "react";
import Link from "next/link";
import type { Partito } from "@/types";
import PartitoLogo from "@/components/ui/PartitoLogo";

const TEMI = [
  { icona: "🏠", label: "Economia",      slug: "economia" },
  { icona: "🌍", label: "Immigrazione",  slug: "immigrazione" },
  { icona: "⚖️", label: "Giustizia",    slug: "giustizia" },
  { icona: "🌿", label: "Ambiente",      slug: "ambiente" },
  { icona: "🌐", label: "Esteri",        slug: "esteri" },
  { icona: "👨‍👩‍👧", label: "Welfare",   slug: "welfare" },
  { icona: "🔨", label: "Lavoro",        slug: "lavoro" },
  { icona: "🏳️", label: "Diritti",      slug: "diritti" },
  { icona: "🛡️", label: "Sicurezza",    slug: "sicurezza" },
];

interface Props {
  partiti: Partito[];
}

export default function GrandiTemiClient({ partiti }: Props) {
  const [temaAttivo, setTemaAttivo] = useState("Economia");

  const temaInfo = TEMI.find((t) => t.label === temaAttivo);

  // Partiti che hanno il tema nel programma
  const partitiConTema = partiti
    .map((p) => ({
      partito: p,
      pos: p.programma?.find((pr) => pr.tema.toLowerCase() === temaAttivo.toLowerCase()),
    }))
    .filter((x) => x.pos);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">I Grandi Temi</h1>
        <p style={{ color: "var(--muted)" }}>
          Le posizioni dei partiti italiani sui temi che contano davvero.
        </p>
      </div>

      {/* Grid temi */}
      <section className="mb-14">
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {TEMI.map(({ icona, label, slug }) => (
            <Link
              key={slug}
              href={`/partiti/temi/${slug}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
            >
              <span className="text-2xl">{icona}</span>
              <span className="text-xs font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Confrontatore */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold">Confronta i partiti</h2>
          <span className="text-sm" style={{ color: "var(--muted)" }}>— seleziona un tema</span>
        </div>

        {/* Pills selezione tema */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TEMI.map(({ label, icona }) => (
            <button
              key={label}
              onClick={() => setTemaAttivo(label)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                border: "1.5px solid",
                borderColor: temaAttivo === label ? "var(--accent)" : "var(--border)",
                background: temaAttivo === label ? "var(--accent)" : "transparent",
                color: temaAttivo === label ? "#fff" : "var(--foreground)",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>{icona}</span> {label}
            </button>
          ))}
        </div>

        {/* Griglia posizioni partiti */}
        {partitiConTema.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Nessuna posizione disponibile per questo tema.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partitiConTema.map(({ partito: p, pos }) => (
              <Link
                key={p.id}
                href={`/partiti/${p.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="rounded-xl border h-full p-5 transition-all"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    borderTopWidth: 3,
                    borderTopColor: p.colore,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                >
                  {/* Header partito */}
                  <div className="flex items-center gap-3 mb-4">
                    <PartitoLogo
                      nome={p.nome}
                      nomeBreve={p.nomeBreve}
                      colore={p.colore}
                      logoUrl={p.logoUrl}
                      size={36}
                      className="rounded-md flex-shrink-0"
                    />
                    <div>
                      <div className="font-bold text-sm">{p.nomeBreve}</div>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={p.coalizione === "governo"
                          ? { background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontSize: 10 }
                          : { background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)", fontSize: 10 }}
                      >
                        {p.coalizione === "governo" ? "Governo" : "Opposizione"}
                      </span>
                    </div>
                  </div>

                  {/* Sintesi */}
                  <p className="text-sm mb-3 leading-relaxed" style={{ color: "var(--muted)" }}>
                    {pos!.sintesi}
                  </p>

                  {/* Punti chiave */}
                  <ul className="space-y-1.5">
                    {pos!.puntiChiave.slice(0, 3).map((punto, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--foreground)" }}>
                        <span className="flex-shrink-0 mt-0.5" style={{ color: p.colore }}>▸</span>
                        {punto}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
