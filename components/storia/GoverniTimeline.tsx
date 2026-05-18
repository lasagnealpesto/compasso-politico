"use client";

import { useState } from "react";
import Link from "next/link";

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
  dalInizio: number;
  totaleMs: number;
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

const PARTY_DETAIL: Record<string, { nome: string; desc: string; colore: string }> = {
  "AN":             { nome: "Alleanza Nazionale",                  desc: "Destra nazionale, erede del MSI. Attivo 1995-2009, poi confluito nel PDL.",         colore: "#003087" },
  "PDL":            { nome: "Il Popolo della Libertà",             desc: "Coalizione di centrodestra guidata da Berlusconi (2009-2013).",                      colore: "#005EA5" },
  "PdL":            { nome: "Il Popolo della Libertà",             desc: "Coalizione di centrodestra guidata da Berlusconi (2009-2013).",                      colore: "#005EA5" },
  "DS":             { nome: "Democratici di Sinistra",             desc: "Centro-sinistra, erede del PCI via PDS. Fondato nel 1998, confluito nel PD nel 2007.", colore: "#C41230" },
  "Margherita":     { nome: "La Margherita",                       desc: "Centro, fondato nel 2002, confluito nel PD nel 2007.",                               colore: "#F5A623" },
  "UDC":            { nome: "Unione di Centro",                    desc: "Partito cattolico centrista, fondato nel 2002.",                                     colore: "#005EA5" },
  "RC":             { nome: "Rifondazione Comunista",              desc: "Sinistra radicale, fondata nel 1991 dopo la fine del PCI.",                          colore: "#C41230" },
  "CCD-CDU":        { nome: "CCD-CDU",                             desc: "Centro democratico cristiano e Cristiani Democratici Uniti.",                        colore: "#005EA5" },
  "SC":             { nome: "Scelta Civica",                       desc: "Partito centrista fondato da Mario Monti nel 2013.",                                 colore: "#009FD4" },
  "NCD":            { nome: "Nuovo Centrodestra",                  desc: "Scissione dal PDL guidata da Alfano (2012-2017).",                                   colore: "#0055A5" },
  "LeU":            { nome: "Liberi e Uguali",                     desc: "Coalizione di sinistra formata nel 2017 da scissioni PD.",                           colore: "#C41230" },
  "PDCI":           { nome: "Partito dei Comunisti Italiani",      desc: "Scissione di Rifondazione Comunista nel 1998.",                                      colore: "#C41230" },
  "SDI":            { nome: "Socialisti Democratici Italiani",     desc: "Partito socialdemocratico, attivo 1998-2007.",                                       colore: "#C41230" },
  "AP":             { nome: "Alternativa Popolare",                desc: "Centro, nato dal NCD di Alfano nel 2017.",                                           colore: "#0055A5" },
  "Art.1":          { nome: "Articolo Uno",                        desc: "Sinistra, scissione del PD nel 2017, poi confluita in PD.",                          colore: "#C41230" },
  "UDEUR":          { nome: "Unione Democratica per l'Europa",     desc: "Partito centrista di Clemente Mastella, attivo 1999-2013.",                          colore: "#008F55" },
  "Verdi":          { nome: "Federazione dei Verdi",               desc: "Partito ambientalista, fondato nel 1986. Confluito in AVS nel 2022.",                colore: "#008F55" },
  "Rosa nel Pugno": { nome: "La Rosa nel Pugno",                   desc: "Coalizione laica e radicale (Socialisti e Radicali), attiva 2006-2008.",             colore: "#C41230" },
  "MPA":            { nome: "Movimento per le Autonomie",          desc: "Partito autonomista siciliano fondato da Lombardo nel 2005.",                        colore: "#009FDA" },
  "Democratici":    { nome: "I Democratici",                       desc: "Partito centrista di Romano Prodi, attivo 1999-2002, poi nella Margherita.",         colore: "#E5A000" },
  "PPI":            { nome: "Partito Popolare Italiano",           desc: "Cattolici centristi, erede della DC. Attivo 1994-2002.",                             colore: "#005EA5" },
  "Nuovo PSI":      { nome: "Nuovo Partito Socialista Italiano",   desc: "Partito socialista, fondato nel 2000.",                                              colore: "#C41230" },
  "NCI":            { nome: "Nuovo Centro Italiano",               desc: "Piccolo partito centrista cattolico.",                                               colore: "#005EA5" },
};

const LOGO_MAP: Record<string, { logoUrl: string; id: string; colore: string }> = {
  "FdI":      { logoUrl: "/loghi/fdi.svg",    id: "fdi",        colore: "#1A3A5C" },
  "Lega":     { logoUrl: "/loghi/lega.png",   id: "lega",       colore: "#008000" },
  "Lega Nord":{ logoUrl: "/loghi/lega.png",   id: "lega",       colore: "#008000" },
  "Lega Salvini Premier": { logoUrl: "/loghi/lega.png", id: "lega", colore: "#008000" },
  "FI":       { logoUrl: "/loghi/fi.png",     id: "fi",         colore: "#0066CC" },
  "Forza Italia": { logoUrl: "/loghi/fi.png", id: "fi",         colore: "#0066CC" },
  "NM":       { logoUrl: "/loghi/nm.svg",     id: "nm",         colore: "#003087" },
  "PD":       { logoUrl: "/loghi/pd.png",     id: "pd",         colore: "#E5001A" },
  "M5S":      { logoUrl: "/loghi/m5s.png",    id: "m5s",        colore: "#C8A800" },
  "MoVimento 5 Stelle": { logoUrl: "/loghi/m5s.png", id: "m5s", colore: "#C8A800" },
  "IV":       { logoUrl: "/loghi/iv.svg",     id: "italiaviva", colore: "#E91B72" },
  "Italia Viva": { logoUrl: "/loghi/iv.svg",  id: "italiaviva", colore: "#E91B72" },
  "AVS":      { logoUrl: "/loghi/avs.png",    id: "avs",        colore: "#C0001A" },
  "Az":       { logoUrl: "/loghi/azione.jpg", id: "azione",     colore: "#E05C00" },
  "Azione":   { logoUrl: "/loghi/azione.jpg", id: "azione",     colore: "#E05C00" },
};

function PartyBadge({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const [open, setOpen] = useState(false);
  const info = LOGO_MAP[name];
  const detail = PARTY_DETAIL[name];
  const imgSize = size === "sm" ? 16 : 20;

  if (info) {
    return (
      <Link
        href={`/partiti/${info.id}`}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all hover:scale-105"
        style={{ background: info.colore + "15", borderColor: info.colore + "40" }}
      >
        <img src={info.logoUrl} alt={name} style={{ width: imgSize, height: imgSize, objectFit: "contain" }} />
        <span className="text-xs font-medium" style={{ color: info.colore }}>{name}</span>
      </Link>
    );
  }

  const colore = detail?.colore ?? "#888";
  return (
    <div className="relative">
      <button
        className="px-2 py-1 rounded-lg text-xs transition-all hover:scale-105 cursor-default"
        style={{ background: colore + "18", border: `1px solid ${colore}40`, color: colore }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        {name}
      </button>
      {open && detail && (
        <div
          className="absolute z-50 bottom-full left-0 mb-1 rounded-lg border p-2.5 text-left pointer-events-none"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", minWidth: 180, maxWidth: 260 }}
        >
          <div className="font-bold text-xs mb-1" style={{ color: colore }}>{detail.nome}</div>
          <div className="text-xs leading-snug" style={{ color: "var(--muted)" }}>{detail.desc}</div>
        </div>
      )}
    </div>
  );
}

function GovernoModal({ governo, onClose }: { governo: GovernoRow; onClose: () => void }) {
  const col = getCols(governo.coalizione);
  const partitiList = JSON.parse(governo.partiti) as string[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl border max-w-lg w-full max-h-[85vh] overflow-y-auto"
        style={{ background: "var(--surface)", borderColor: "var(--border)", borderTopWidth: 4, borderTopColor: col }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: col }}>{governo.coalizione}</div>
              <h2 className="text-2xl font-bold">{governo.nome}</h2>
              <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>Premier: {governo.premier}</div>
            </div>
            <button
              onClick={onClose}
              className="text-2xl leading-none flex-shrink-0 mt-1"
              style={{ color: "var(--muted)" }}
              aria-label="Chiudi"
            >
              ×
            </button>
          </div>

          {/* Date e durata */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface-2)" }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--muted)" }}>Inizio</div>
              <div className="text-xs font-bold">{formatData(governo.dal)}</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface-2)" }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--muted)" }}>Fine</div>
              <div className="text-xs font-bold">{governo.al ? formatData(governo.al) : "in carica"}</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface-2)" }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--muted)" }}>Durata</div>
              <div className="text-xs font-bold" style={{ color: col }}>{governo.durata_giorni ?? "-"} giorni</div>
            </div>
          </div>

          {/* Partiti */}
          <div className="mb-4">
            <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--muted)" }}>Partiti</div>
            <div className="flex flex-wrap gap-2">
              {partitiList.map((p) => <PartyBadge key={p} name={p} />)}
            </div>
          </div>

          {governo.note && (
            <div className="mb-4">
              <div className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "var(--muted)" }}>Note</div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{governo.note}</p>
            </div>
          )}

          {governo.motivo_fine && (
            <div className="px-3 py-2 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
              Fine: {governo.motivo_fine}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GoverniTimeline({ governi, dalInizio, totaleMs }: Props) {
  const [selected, setSelected] = useState<GovernoRow | null>(null);
  const [hovered, setHovered] = useState<GovernoRow | null>(null);

  const withWidths = governi.map((g) => {
    const dal = new Date(g.dal).getTime();
    const al = g.al ? new Date(g.al).getTime() : Date.now();
    const pct = Math.max(((al - dal) / totaleMs) * 100, 0.8);
    return { ...g, pct };
  });

  // Left offset for each governo
  let cumulative = 0;
  const withLeft = withWidths.map((g) => {
    const left = cumulative;
    cumulative += g.pct;
    return { ...g, left };
  });

  return (
    <>
      {/* Wrapper relativo: contiene labels + barra + floating preview */}
      <div className="relative">

        {/* Nomi governi sopra la barra — staggered in 2 rows */}
        <div className="relative overflow-hidden" style={{ height: 44, marginBottom: 2 }}>
          {withLeft.map((g, i) => {
            const col = getCols(g.coalizione);
            const isTop = i % 2 === 0;
            const surname = g.premier.split(" ").pop() ?? g.premier;
            return (
              <div
                key={g.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${g.left + g.pct / 2}%`,
                  transform: "translateX(-50%)",
                  top: isTop ? 0 : 22,
                  maxWidth: `${Math.max(g.pct, 4)}%`,
                  zIndex: hovered?.id === g.id ? 20 : 10,
                }}
              >
                <span
                  className="font-semibold truncate w-full text-center"
                  style={{ fontSize: 10, color: col, lineHeight: 1.2 }}
                >
                  {surname}
                </span>
                <div style={{ width: 1, height: 10, background: col + "60", flexShrink: 0 }} />
              </div>
            );
          })}
        </div>

        {/* Timeline barra */}
        <div className="rounded-xl overflow-hidden border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex h-10">
            {withLeft.map((g) => {
              const col = getCols(g.coalizione);
              const isHov = hovered?.id === g.id;
              return (
                <div
                  key={g.id}
                  className="relative flex-shrink-0 flex items-center justify-center cursor-pointer transition-all"
                  style={{
                    width: `${g.pct}%`,
                    background: isHov ? col + "dd" : col,
                    borderRight: "1px solid rgba(255,255,255,0.15)",
                    filter: isHov ? "brightness(1.15)" : "none",
                  }}
                  onClick={() => setSelected(g)}
                  onMouseEnter={() => setHovered(g)}
                  onMouseLeave={() => setHovered(null)}
                  title={g.nome}
                >
                  {g.pct > 7 && (
                    <span className="text-white font-bold truncate px-1 select-none" style={{ fontSize: 10 }}>
                      {g.premier.split(" ").pop()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Anno labels */}
          <div className="relative overflow-hidden" style={{ background: "var(--surface-2)", height: 22 }}>
            {[2000, 2004, 2008, 2012, 2016, 2020, 2024, 2026].map((anno) => {
              const pct = Math.min(Math.max(((new Date(`${anno}-01-01`).getTime() - dalInizio) / totaleMs) * 100, 0), 99);
              return (
                <span
                  key={anno}
                  className="absolute text-xs"
                  style={{ left: `${pct}%`, color: "var(--muted)", fontSize: 10, top: 4, transform: "translateX(-50%)", whiteSpace: "nowrap" }}
                >
                  {anno}
                </span>
              );
            })}
          </div>
        </div>

        {/* Floating preview — fuori dal overflow-hidden, overlay sulla lista */}
        {hovered && (
          <div
            className="absolute right-0 z-30 rounded-xl border p-4 flex items-start gap-4 pointer-events-none"
            style={{
              top: "calc(100% + 4px)",
              width: "min(420px, 100%)",
              background: "var(--surface)",
              borderColor: "var(--border)",
              borderLeftWidth: 3,
              borderLeftColor: getCols(hovered.coalizione),
              boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{hovered.nome}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{hovered.coalizione}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {(JSON.parse(hovered.partiti) as string[]).slice(0, 6).map((p) => {
                  const info = LOGO_MAP[p];
                  return info ? (
                    <img key={p} src={info.logoUrl} alt={p} title={p} style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 3 }} />
                  ) : (
                    <span key={p} className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: (PARTY_DETAIL[p]?.colore ?? "#888") + "20", color: PARTY_DETAIL[p]?.colore ?? "var(--muted)" }}>{p}</span>
                  );
                })}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs" style={{ color: "var(--muted)" }}>{formatData(hovered.dal)}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{hovered.al ? formatData(hovered.al) : "in carica"}</div>
              <div className="text-xs font-bold mt-1" style={{ color: getCols(hovered.coalizione) }}>{hovered.durata_giorni} giorni</div>
            </div>
          </div>
        )}

      </div>{/* fine wrapper relativo */}

      {/* Lista governi — rimane ferma, il preview flotta sopra */}
      <div className="space-y-3 mt-4">
        {governi.map((g) => {
          const col = getCols(g.coalizione);
          const partitiList = JSON.parse(g.partiti) as string[];
          return (
            <button
              key={g.id}
              onClick={() => setSelected(g)}
              className="w-full text-left rounded-xl border p-5 transition-all hover:shadow-md hover:scale-[1.005] cursor-pointer"
              style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 4, borderLeftColor: col }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{g.nome}</div>
                  <div className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{g.coalizione}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {partitiList.slice(0, 8).map((p) => <PartyBadge key={p} name={p} size="sm" />)}
                  </div>
                  {g.note && <p className="text-xs mt-2 line-clamp-2" style={{ color: "var(--muted)" }}>{g.note}</p>}
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
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <GovernoModal governo={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
