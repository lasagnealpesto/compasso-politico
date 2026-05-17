"use client";
import { useState } from "react";

type Persona = {
  id: string;
  nome: string;
  partito: string;
  colore: string;
  ruolo: string;
};

type RegionePunto = {
  regione: string;
  capoluogo: string;
  x: number; // in 412px space
  y: number; // in 361px space
  presidente: Persona;
  sindaco: Persona;
};

// Coordinates in 412×361 space (PNG native size)
const REGIONI: RegionePunto[] = [
  {
    regione: "Valle d'Aosta", capoluogo: "Aosta",
    x: 55, y: 42,
    presidente: { id: "renzo-testolin", nome: "Renzo Testolin", partito: "UV", colore: "#555", ruolo: "Presidente" },
    sindaco:    { id: "gianni-nuti",    nome: "Gianni Nuti",    partito: "Civica", colore: "#888", ruolo: "Sindaco" },
  },
  {
    regione: "Piemonte", capoluogo: "Torino",
    x: 82, y: 78,
    presidente: { id: "alberto-cirio",   nome: "Alberto Cirio",  partito: "FI",  colore: "#0066CC", ruolo: "Presidente" },
    sindaco:    { id: "stefano-lo-russo", nome: "Stefano Lo Russo", partito: "PD", colore: "#E5001A", ruolo: "Sindaco" },
  },
  {
    regione: "Lombardia", capoluogo: "Milano",
    x: 148, y: 58,
    presidente: { id: "attilio-fontana", nome: "Attilio Fontana", partito: "Lega", colore: "#008000", ruolo: "Presidente" },
    sindaco:    { id: "giuseppe-sala",    nome: "Giuseppe Sala",  partito: "Civica", colore: "#1a3a6b", ruolo: "Sindaco" },
  },
  {
    regione: "Trentino-Alto Adige", capoluogo: "Trento",
    x: 196, y: 33,
    presidente: { id: "maurizio-fugatti", nome: "Maurizio Fugatti", partito: "Lega", colore: "#008000", ruolo: "Presidente" },
    sindaco:    { id: "franco-ianeselli", nome: "Franco Ianeselli", partito: "Civica", colore: "#888", ruolo: "Sindaco" },
  },
  {
    regione: "Veneto", capoluogo: "Venezia",
    x: 228, y: 62,
    presidente: { id: "luca-zaia",      nome: "Luca Zaia",       partito: "Lega", colore: "#008000", ruolo: "Presidente" },
    sindaco:    { id: "luigi-brugnaro", nome: "Luigi Brugnaro",   partito: "Civica", colore: "#555", ruolo: "Sindaco" },
  },
  {
    regione: "Friuli-Venezia Giulia", capoluogo: "Trieste",
    x: 272, y: 52,
    presidente: { id: "massimiliano-fedriga", nome: "Massimiliano Fedriga", partito: "Lega", colore: "#008000", ruolo: "Presidente" },
    sindaco:    { id: "roberto-dipiazza",      nome: "Roberto Dipiazza",     partito: "FI",   colore: "#0066CC", ruolo: "Sindaco" },
  },
  {
    regione: "Liguria", capoluogo: "Genova",
    x: 108, y: 108,
    presidente: { id: "marco-bucci",  nome: "Marco Bucci",   partito: "Centrodestra", colore: "#1A3A5C", ruolo: "Presidente" },
    sindaco:    { id: "silvia-salis", nome: "Silvia Salis",  partito: "PD",           colore: "#E5001A", ruolo: "Sindaca" },
  },
  {
    regione: "Emilia-Romagna", capoluogo: "Bologna",
    x: 198, y: 98,
    presidente: { id: "michele-de-pascale", nome: "Michele de Pascale", partito: "PD", colore: "#E5001A", ruolo: "Presidente" },
    sindaco:    { id: "matteo-lepore",       nome: "Matteo Lepore",      partito: "PD", colore: "#E5001A", ruolo: "Sindaco" },
  },
  {
    regione: "Toscana", capoluogo: "Firenze",
    x: 168, y: 143,
    presidente: { id: "eugenio-giani", nome: "Eugenio Giani", partito: "PD", colore: "#E5001A", ruolo: "Presidente" },
    sindaco:    { id: "sara-funaro",   nome: "Sara Funaro",   partito: "PD", colore: "#E5001A", ruolo: "Sindaca" },
  },
  {
    regione: "Marche", capoluogo: "Ancona",
    x: 246, y: 138,
    presidente: { id: "francesco-acquaroli", nome: "Francesco Acquaroli", partito: "FdI", colore: "#1A3A5C", ruolo: "Presidente" },
    sindaco:    { id: "daniele-silvetti",      nome: "Daniele Silvetti",    partito: "FdI", colore: "#1A3A5C", ruolo: "Sindaco" },
  },
  {
    regione: "Umbria", capoluogo: "Perugia",
    x: 208, y: 158,
    presidente: { id: "donatella-tesei",    nome: "Donatella Tesei",    partito: "Lega", colore: "#008000", ruolo: "Presidente" },
    sindaco:    { id: "vittoria-ferdinandi", nome: "Vittoria Ferdinandi", partito: "Centrosinistra", colore: "#E5001A", ruolo: "Sindaca" },
  },
  {
    regione: "Lazio", capoluogo: "Roma",
    x: 202, y: 195,
    presidente: { id: "francesco-rocca",   nome: "Francesco Rocca",   partito: "FdI", colore: "#1A3A5C", ruolo: "Presidente" },
    sindaco:    { id: "roberto-gualtieri", nome: "Roberto Gualtieri", partito: "PD",  colore: "#E5001A", ruolo: "Sindaco" },
  },
  {
    regione: "Abruzzo", capoluogo: "L'Aquila",
    x: 245, y: 175,
    presidente: { id: "marco-marsilio",  nome: "Marco Marsilio",  partito: "FdI", colore: "#1A3A5C", ruolo: "Presidente" },
    sindaco:    { id: "pierluigi-biondi", nome: "Pierluigi Biondi", partito: "FdI", colore: "#1A3A5C", ruolo: "Sindaco" },
  },
  {
    regione: "Molise", capoluogo: "Campobasso",
    x: 270, y: 208,
    presidente: { id: "francesco-roberti", nome: "Francesco Roberti", partito: "FdI", colore: "#1A3A5C", ruolo: "Presidente" },
    sindaco:    { id: "aldo-de-benedictis", nome: "Aldo De Benedictis", partito: "Centrodestra", colore: "#1A3A5C", ruolo: "Sindaco" },
  },
  {
    regione: "Campania", capoluogo: "Napoli",
    x: 255, y: 232,
    presidente: { id: "vincenzo-de-luca",  nome: "Vincenzo De Luca",  partito: "PD",  colore: "#E5001A", ruolo: "Presidente" },
    sindaco:    { id: "gaetano-manfredi", nome: "Gaetano Manfredi", partito: "Civica", colore: "#888", ruolo: "Sindaco" },
  },
  {
    regione: "Puglia", capoluogo: "Bari",
    x: 322, y: 228,
    presidente: { id: "michele-emiliano", nome: "Michele Emiliano", partito: "PD",  colore: "#E5001A", ruolo: "Presidente" },
    sindaco:    { id: "vito-leccese",     nome: "Vito Leccese",     partito: "PD",  colore: "#E5001A", ruolo: "Sindaco" },
  },
  {
    regione: "Basilicata", capoluogo: "Potenza",
    x: 290, y: 255,
    presidente: { id: "vito-bardi",      nome: "Vito Bardi",      partito: "FdI", colore: "#1A3A5C", ruolo: "Presidente" },
    sindaco:    { id: "mario-guarente",  nome: "Mario Guarente",  partito: "Lega", colore: "#008000", ruolo: "Sindaco" },
  },
  {
    regione: "Calabria", capoluogo: "Catanzaro",
    x: 308, y: 308,
    presidente: { id: "roberto-occhiuto", nome: "Roberto Occhiuto", partito: "FI",  colore: "#0066CC", ruolo: "Presidente" },
    sindaco:    { id: "nicola-fiorita",    nome: "Nicola Fiorita",    partito: "Centrosinistra", colore: "#E5001A", ruolo: "Sindaco" },
  },
  {
    regione: "Sicilia", capoluogo: "Palermo",
    x: 218, y: 340,
    presidente: { id: "renato-schifani", nome: "Renato Schifani", partito: "FI",  colore: "#0066CC", ruolo: "Presidente" },
    sindaco:    { id: "roberto-lagalla", nome: "Roberto Lagalla", partito: "FI",  colore: "#0066CC", ruolo: "Sindaco" },
  },
  {
    regione: "Sardegna", capoluogo: "Cagliari",
    x: 88, y: 258,
    presidente: { id: "alessandra-todde", nome: "Alessandra Todde", partito: "M5S", colore: "#C8A800", ruolo: "Presidente" },
    sindaco:    { id: "massimo-zedda",    nome: "Massimo Zedda",    partito: "PD",  colore: "#E5001A", ruolo: "Sindaco" },
  },
];

function initials(nome: string) {
  return nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function Avatar({
  id, nome, colore, fotos, size = 28,
}: {
  id: string; nome: string; colore: string; fotos: Record<string, string>; size?: number;
}) {
  const [err, setErr] = useState(false);
  const fotoUrl = fotos[id];
  if (fotoUrl && !err) {
    return (
      <img
        src={fotoUrl}
        alt={nome}
        onError={() => setErr(true)}
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover", objectPosition: "top",
          border: `2px solid ${colore}`,
          background: "#fff",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: colore, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.32, fontWeight: 700,
        border: `2px solid ${colore}`,
        flexShrink: 0,
      }}
    >
      {initials(nome)}
    </div>
  );
}

export default function MappaItalia({ fotos }: { fotos: Record<string, string> }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const activeRegione = selected ?? hovered;
  const reg = REGIONI.find((r) => r.regione === activeRegione);

  function handleDotClick(regione: string) {
    setSelected((prev) => (prev === regione ? null : regione));
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Map container — uses PNG as background, dots positioned by % */}
      <div
        className="relative flex-shrink-0"
        style={{ width: "100%", maxWidth: 560 }}
      >
        <img
          src="/italia-map.png"
          alt="Mappa d'Italia"
          draggable={false}
          style={{ width: "100%", display: "block", userSelect: "none" }}
        />

        {REGIONI.map((r) => {
          const isActive = activeRegione === r.regione;
          const isSelected = selected === r.regione;
          return (
            <div
              key={r.regione}
              onMouseEnter={() => setHovered(r.regione)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleDotClick(r.regione)}
              style={{
                position: "absolute",
                left: `${(r.x / 412) * 100}%`,
                top: `${(r.y / 361) * 100}%`,
                transform: "translate(-50%, -50%)",
                cursor: "pointer",
                zIndex: isActive ? 20 : 10,
              }}
            >
              <div
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  border: `2px solid ${isSelected ? "var(--foreground)" : isActive ? "var(--foreground)" : r.presidente.colore}`,
                  overflow: "hidden",
                  boxShadow: isSelected
                    ? `0 0 0 3px var(--accent), 0 2px 8px rgba(0,0,0,0.25)`
                    : isActive
                    ? "0 0 0 2px var(--accent)"
                    : "0 1px 4px rgba(0,0,0,0.25)",
                  transition: "box-shadow 0.15s",
                  background: "#fff",
                }}
              >
                <Avatar id={r.presidente.id} nome={r.presidente.nome} colore={r.presidente.colore} fotos={fotos} size={26} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Info panel */}
      <div className="flex-1 min-h-0">
        {reg ? (
          <div
            className="rounded-xl border p-5 sticky top-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)", borderTopWidth: 3, borderTopColor: reg.presidente.colore }}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="font-bold text-lg">{reg.regione}</div>
              {selected && (
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontSize: 12,
                    cursor: "pointer",
                    color: "var(--muted)",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="text-xs mb-4" style={{ color: "var(--muted)" }}>
              Capoluogo: {reg.capoluogo}
              {selected && <span className="ml-2" style={{ color: "var(--accent)" }}>· fissato</span>}
            </div>

            <div className="space-y-4">
              <div>
                <div className="section-tag mb-2">Presidente di Regione</div>
                <div className="flex items-center gap-3">
                  <Avatar id={reg.presidente.id} nome={reg.presidente.nome} colore={reg.presidente.colore} fotos={fotos} size={48} />
                  <div>
                    <div className="font-semibold">{reg.presidente.nome}</div>
                    <div className="text-xs mt-0.5">
                      <span className="px-1.5 py-0.5 rounded-full" style={{ background: reg.presidente.colore + "20", color: reg.presidente.colore }}>{reg.presidente.partito}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="section-tag mb-2">Sindaco di {reg.capoluogo}</div>
                <div className="flex items-center gap-3">
                  <Avatar id={reg.sindaco.id} nome={reg.sindaco.nome} colore={reg.sindaco.colore} fotos={fotos} size={48} />
                  <div>
                    <div className="font-semibold">{reg.sindaco.nome}</div>
                    <div className="text-xs mt-0.5">
                      <span className="px-1.5 py-0.5 rounded-full" style={{ background: reg.sindaco.colore + "20", color: reg.sindaco.colore }}>{reg.sindaco.partito}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl border p-6 flex flex-col items-center justify-center text-center"
            style={{ background: "var(--surface)", borderColor: "var(--border)", minHeight: 180 }}
          >
            <div className="text-3xl mb-3">🗺️</div>
            <p className="text-sm font-medium">Clicca su una regione</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Presidente di regione + sindaco del capoluogo</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs" style={{ color: "var(--muted)" }}>
          {[
            { label: "FdI", colore: "#1A3A5C" },
            { label: "Lega", colore: "#008000" },
            { label: "FI", colore: "#0066CC" },
            { label: "PD", colore: "#E5001A" },
            { label: "M5S", colore: "#C8A800" },
            { label: "Altro", colore: "#888" },
          ].map((p) => (
            <span key={p.label} className="flex items-center gap-1">
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: p.colore }} />
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
