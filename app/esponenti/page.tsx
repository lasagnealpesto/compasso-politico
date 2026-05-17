import type { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { esponenti, partiti, getEsponentiByPartito } from "@/lib/data";
import PartitoLogo from "@/components/ui/PartitoLogo";
import EsponenteAvatar from "@/components/ui/EsponenteAvatar";
import MappaItalia from "@/components/ui/MappaItalia";

export const metadata: Metadata = {
  title: "Esponenti",
  description: "I principali politici italiani con storia, governi, dichiarazioni e posizioni.",
};

function loadFotos(): Record<string, string> {
  try {
    const p = path.join(process.cwd(), "data", "foto-politici.json");
    return JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, string>;
  } catch { return {}; }
}

const PARTITO_COLORI: Record<string, string> = {
  fdi: "#1A3A5C", pd: "#E5001A", m5s: "#C8A800", lega: "#008000",
  fi: "#0066CC", azione: "#E05C00", italiaviva: "#E91B72", avs: "#C0001A", nm: "#003087",
};

const MINISTRI = [
  { id: "giorgia-meloni",           nome: "Giorgia Meloni",           ruolo: "Presidente del Consiglio",           partito: "fdi" },
  { id: "matteo-salvini",           nome: "Matteo Salvini",           ruolo: "Vicepres. – Infrastrutture",         partito: "lega" },
  { id: "antonio-tajani",           nome: "Antonio Tajani",           ruolo: "Vicepres. – Esteri",                 partito: "fi" },
  { id: "giancarlo-giorgetti",      nome: "Giancarlo Giorgetti",      ruolo: "Economia e Finanze",                 partito: "lega" },
  { id: "guido-crosetto",           nome: "Guido Crosetto",           ruolo: "Difesa",                             partito: "fdi" },
  { id: "carlo-nordio",             nome: "Carlo Nordio",             ruolo: "Giustizia",                          partito: "fdi" },
  { id: "matteo-piantedosi",        nome: "Matteo Piantedosi",        ruolo: "Interno",                            partito: "fdi" },
  { id: "daniela-santanche",        nome: "Daniela Santanchè",        ruolo: "Turismo",                            partito: "fdi" },
  { id: "adolfo-urso",              nome: "Adolfo Urso",              ruolo: "Imprese e Made in Italy",            partito: "fdi" },
  { id: "gilberto-pichetto-fratin", nome: "Gilberto Pichetto Fratin", ruolo: "Ambiente e Sicurezza Energetica",    partito: "fi" },
  { id: "roberto-calderoli",        nome: "Roberto Calderoli",        ruolo: "Affari Regionali e Autonomia",       partito: "lega" },
  { id: "francesco-lollobrigida",   nome: "Francesco Lollobrigida",   ruolo: "Agricoltura e Sovranità Alimentare", partito: "fdi" },
  { id: "giuseppe-valditara",       nome: "Giuseppe Valditara",       ruolo: "Istruzione e Merito",                partito: "lega" },
  { id: "orazio-schillaci",         nome: "Orazio Schillaci",         ruolo: "Salute",                             partito: "fdi" },
  { id: "elisabetta-casellati",     nome: "Elisabetta Casellati",     ruolo: "Riforme Costituzionali",             partito: "fi" },
  { id: "nello-musumeci",           nome: "Nello Musumeci",           ruolo: "Protezione Civile e Mare",           partito: "fdi" },
  { id: "eugenia-roccella",         nome: "Eugenia Roccella",         ruolo: "Famiglia, Natalità e P.O.",          partito: "fdi" },
];

export default function EsponentiPage() {
  const fotos = loadFotos();
  const partitiConEsponenti = partiti.filter((p) => getEsponentiByPartito(p.id).length > 0);
  const partitoMap = Object.fromEntries(partiti.map((p) => [p.id, p]));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Esponenti politici</h1>
      <p className="mb-10" style={{ color: "var(--muted)" }}>
        Ministri del Governo Meloni, presidenti di regione, sindaci e tutti gli esponenti per partito.
      </p>

      {/* ── Ministri del Governo Meloni ── */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-bold">Ministri del Governo Meloni</h2>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }}>
            🏛️ In carica
          </span>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Dal 22 ottobre 2022 · Presidente del Consiglio: Giorgia Meloni</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {MINISTRI.map((m) => {
            const colore = PARTITO_COLORI[m.partito] ?? "#888";
            const esp = esponenti.find((e) => e.id === m.id);
            const card = (
              <div
                className="card-hover rounded-xl border p-4 flex flex-col items-center text-center"
                style={{ background: "var(--surface)", borderColor: "var(--border)", borderTopWidth: 3, borderTopColor: colore }}
              >
                <EsponenteAvatar nome={m.nome} colore={colore} fotoUrl={fotos[m.id] ?? ""} size={56} />
                <div className="mt-2 font-semibold text-xs leading-tight">{m.nome}</div>
                <div className="text-xs mt-1 leading-tight" style={{ color: "var(--muted)" }}>{m.ruolo}</div>
                {partitoMap[m.partito] && (
                  <div className="mt-2 w-6 h-6 rounded overflow-hidden flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                    <img
                      src={partitoMap[m.partito].logoUrl}
                      alt={partitoMap[m.partito].nomeBreve}
                      style={{ width: 22, height: 22, objectFit: "contain" }}
                    />
                  </div>
                )}
              </div>
            );
            return esp ? (
              <Link key={m.id} href={`/esponenti/${m.id}`}>{card}</Link>
            ) : (
              <div key={m.id}>{card}</div>
            );
          })}
        </div>
      </section>

      {/* ── Mappa d'Italia ── */}
      <section className="mb-14">
        <h2 className="text-xl font-bold mb-2">Mappa politica dell'Italia</h2>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          Presidenti di regione e sindaci dei capoluoghi regionali. Clicca su una regione per vedere i dettagli.
        </p>
        <MappaItalia fotos={fotos} />
      </section>

      {/* ── Per partito ── */}
      <section>
        <h2 className="text-xl font-bold mb-6">Per partito</h2>
        <div className="space-y-8">
          {partitiConEsponenti.map((partito) => {
            const esp = getEsponentiByPartito(partito.id);
            return (
              <div key={partito.id}>
                <Link href={`/partiti/${partito.id}`} className="flex items-center gap-3 mb-4 group">
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
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={
                        partito.coalizione === "governo"
                          ? { background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }
                          : { background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }
                      }
                    >
                      {partito.coalizione === "governo" ? "🏛️ Governo" : "⚡ Opposizione"}
                    </span>
                  </div>
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {esp.map((e) => {
                    const anniPolitica = new Date().getFullYear() - (e.storiaPolit[0]?.dalAnno ?? new Date().getFullYear());
                    return (
                      <Link
                        key={e.id}
                        href={`/esponenti/${e.id}`}
                        className="card-hover rounded-xl border p-4 flex gap-3"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                      >
                        <EsponenteAvatar nome={e.nome} colore={partito.colore} fotoUrl={fotos[e.id] ?? ""} size={48} />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm">{e.nome}</div>
                          <div className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--muted)" }}>{e.ruolo}</div>
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
                            {e.governi.length > 0 && <span>· {e.governi.length} gov{e.governi.length > 1 ? "erni" : "erno"}</span>}
                            {e.cambiRotta.length > 0 && <span className="text-yellow-500">⚡ {e.cambiRotta.length} cambio</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 border-b" style={{ borderColor: "var(--border)" }} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
