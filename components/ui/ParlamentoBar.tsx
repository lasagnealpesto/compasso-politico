import type { Partito } from "@/types";
import ParlamentoEmiclo from "./ParlamentoEmiclo";

interface Props {
  partiti: Partito[];
}

export default function ParlamentoBar({ partiti }: Props) {
  return (
    <div className="rounded-2xl border p-6 space-y-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <ParlamentoEmiclo
        partiti={partiti}
        tipo="camera"
        totale={400}
        label="Camera dei Deputati"
        info="La Camera dei Deputati e una delle due camere del Parlamento italiano. Ha 400 deputati (ridotti da 630 nel 2022). Approva le leggi insieme al Senato."
      />
      <ParlamentoEmiclo
        partiti={partiti}
        tipo="senato"
        totale={200}
        label="Senato della Repubblica"
        info="Il Senato e l'altra camera del Parlamento. Ha 200 senatori (ridotti da 315 nel 2022). Stessi poteri della Camera. Per le leggi servono entrambe le camere."
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
                <div className="flex flex-wrap gap-1.5">
                  {gruppo.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                      style={{ background: p.colore + "20", border: `1px solid ${p.colore}50` }}
                      title={p.nome}
                    >
                      <img
                        src={p.logoUrl}
                        alt={p.nomeBreve}
                        style={{ width: 16, height: 16, objectFit: "contain" }}
                      />
                      <span className="text-xs font-medium" style={{ color: p.colore }}>{p.nomeBreve}</span>
                    </div>
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
