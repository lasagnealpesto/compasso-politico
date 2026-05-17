import type { Metadata } from "next";
import Link from "next/link";
import { esponenti, partiti, getEsponentiByPartito } from "@/lib/data";
import MappaEsponenti from "@/components/mappa/MappaEsponenti";
import PartitoLogo from "@/components/ui/PartitoLogo";

export const metadata: Metadata = {
  title: "Esponenti",
  description: "I principali politici italiani con storia, governi, dichiarazioni e posizioni.",
};

export default function EsponentiPage() {
  const partitiConEsponenti = partiti.filter((p) => getEsponentiByPartito(p.id).length > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Esponenti politici</h1>
      <p className="mb-8" style={{ color: "var(--muted)" }}>
        Posizionati sulla mappa ideologica. Hover per vedere storia, governi e dichiarazioni.
      </p>

      {/* Mappa interattiva */}
      <section className="mb-14">
        <MappaEsponenti esponenti={esponenti} partiti={partiti} />
      </section>

      {/* Lista per partito */}
      <section>
        <h2 className="text-xl font-bold mb-6">Per partito</h2>
        <div className="space-y-8">
          {partitiConEsponenti.map((partito) => {
            const esp = getEsponentiByPartito(partito.id);
            return (
              <div key={partito.id}>
                {/* Header partito */}
                <Link
                  href={`/partiti/${partito.id}`}
                  className="flex items-center gap-3 mb-4 group"
                >
                  <PartitoLogo
                    nome={partito.nome}
                    nomeBreve={partito.nomeBreve}
                    colore={partito.colore}
                    logoUrl={partito.logoUrl}
                    size={40}
                    className="rounded-lg"
                  />
                  <div>
                    <div className="font-bold text-lg group-hover:underline">{partito.nome}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      Segretario: {partito.segretario} · {partito.seggiCamera + partito.seggiSenato} parlamentari
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs px-2 py-1 rounded-full text-white font-medium" style={{ background: partito.coalizione === "governo" ? "#16a34a" : "#6b6b80" }}>
                      {partito.coalizione === "governo" ? "🏛️ Governo" : "⚡ Opposizione"}
                    </span>
                  </div>
                </Link>

                {/* Griglia esponenti */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-0">
                  {esp.map((e) => {
                    const anniPolitica = new Date().getFullYear() - (e.storiaPolit[0]?.dalAnno ?? new Date().getFullYear());
                    return (
                      <Link
                        key={e.id}
                        href={`/esponenti/${e.id}`}
                        className="rounded-xl border p-4 flex gap-3 transition-all hover:scale-[1.02]"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                      >
                        {/* Avatar */}
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ background: partito.colore }}
                        >
                          {e.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm">{e.nome}</div>
                          <div className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--muted)" }}>{e.ruolo}</div>

                          {/* Mini timeline carriera */}
                          <div className="flex gap-0.5 h-1.5 rounded mt-2 overflow-hidden">
                            {e.storiaPolit.map((s, i) => {
                              const durata = (s.alAnno ?? new Date().getFullYear()) - s.dalAnno;
                              const totale = e.storiaPolit.reduce((acc, ss) => acc + ((ss.alAnno ?? new Date().getFullYear()) - ss.dalAnno), 0) || 1;
                              return (
                                <div
                                  key={i}
                                  style={{ width: `${(durata / totale) * 100}%`, background: partito.colore, opacity: 0.4 + (i / e.storiaPolit.length) * 0.6, minWidth: 3 }}
                                  title={s.partito}
                                />
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: "var(--muted)" }}>
                            <span>{anniPolitica} anni in politica</span>
                            {e.governi.length > 0 && (
                              <span>· {e.governi.length} gov{e.governi.length > 1 ? "erni" : "erno"}</span>
                            )}
                            {e.cambiRotta.length > 0 && (
                              <span className="text-yellow-500">⚡ {e.cambiRotta.length} cambio</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="mt-6 border-b" style={{ borderColor: "var(--border)" }} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
