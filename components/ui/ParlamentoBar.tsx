import type { Partito } from "@/types";
import InfoTooltip from "./InfoTooltip";

interface Props {
  partiti: Partito[];
}

function Barra({ partiti, tipo, totale, label, info }: {
  partiti: Partito[];
  tipo: "camera" | "senato";
  totale: number;
  label: string;
  info: string;
}) {
  const seggi = partiti.map((p) => ({
    ...p,
    seggi: tipo === "camera" ? p.seggiCamera : p.seggiSenato,
  })).filter((p) => p.seggi > 0).sort((a, b) => b.seggi - a.seggi);

  const governi = seggi.filter((p) => p.coalizione === "governo");
  const opposizione = seggi.filter((p) => p.coalizione === "opposizione");
  const seggiGoverno = governi.reduce((s, p) => s + p.seggi, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-sm">{label}</span>
          <InfoTooltip titolo={label} testo={info} />
          <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>{totale} seggi totali</span>
        </div>
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          Maggioranza: <span style={{ color: "#4ade80" }}>{seggiGoverno}</span>/{totale}
        </div>
      </div>

      {/* Barra principale */}
      <div className="flex h-8 rounded-lg overflow-hidden gap-px">
        {seggi.map((p) => {
          const pct = (p.seggi / totale) * 100;
          return (
            <div
              key={p.id}
              className="relative group flex-shrink-0 transition-all"
              style={{ width: `${pct}%`, background: p.colore, minWidth: 2 }}
              title={`${p.nome}: ${p.seggi} seggi (${pct.toFixed(1)}%)`}
            >
              {pct > 6 && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {p.nomeBreve}
                </span>
              )}
              {/* Tooltip hover */}
              <div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              >
                {p.nome}: {p.seggi} ({pct.toFixed(0)}%)
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {seggi.slice(0, 6).map((p) => (
          <div key={p.id} className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
            <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: p.colore }} />
            {p.nomeBreve} {p.seggi}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ParlamentoBar({ partiti }: Props) {
  return (
    <div className="rounded-2xl border p-6 space-y-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <Barra
        partiti={partiti}
        tipo="camera"
        totale={400}
        label="Camera dei Deputati"
        info="La Camera dei Deputati è una delle due camere del Parlamento italiano. Ha 400 deputati (ridotti da 630 nel 2022). Approva le leggi insieme al Senato."
      />
      <Barra
        partiti={partiti}
        tipo="senato"
        totale={200}
        label="Senato della Repubblica"
        info="Il Senato è l'altra camera del Parlamento. Ha 200 senatori (ridotti da 315 nel 2022). Stessi poteri della Camera. Per le leggi servono entrambe le camere."
      />

      {/* Coalizioni */}
      <div>
        <div className="text-sm font-semibold mb-3">Coalizioni in Parlamento</div>
        <div className="grid grid-cols-2 gap-3">
          {(["governo", "opposizione"] as const).map((tipo) => {
            const gruppo = partiti.filter((p) => p.coalizione === tipo);
            const totCamera = gruppo.reduce((s, p) => s + p.seggiCamera, 0);
            const totSenato = gruppo.reduce((s, p) => s + p.seggiSenato, 0);
            const isGov = tipo === "governo";
            return (
              <div key={tipo} className="rounded-xl border p-4" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold">
                    {isGov ? "🏛️ Governo" : "⚡ Opposizione"}
                  </span>
                </div>
                <div className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                  Camera: <strong style={{ color: "var(--foreground)" }}>{totCamera}</strong> · Senato: <strong style={{ color: "var(--foreground)" }}>{totSenato}</strong>
                </div>
                <div className="flex flex-wrap gap-1">
                  {gruppo.map((p) => (
                    <span key={p.id} className="px-1.5 py-0.5 rounded text-white text-xs font-medium" style={{ background: p.colore }}>
                      {p.nomeBreve}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
