import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { partiti } from "@/lib/data";
import { slugify } from "@/lib/slugify";
import PartitoLogo from "@/components/ui/PartitoLogo";
import type { Partito, ProgrammaTema } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

type Occorrenza = {
  partito: Partito;
  programma: ProgrammaTema;
  punto: string;
};

function buildIndex(): Map<string, Occorrenza[]> {
  const map = new Map<string, Occorrenza[]>();
  for (const p of partiti) {
    for (const pr of p.programma) {
      for (const punto of pr.puntiChiave) {
        const slug = slugify(punto);
        if (!map.has(slug)) map.set(slug, []);
        map.get(slug)!.push({ partito: p, programma: pr, punto });
      }
    }
  }
  return map;
}

export async function generateStaticParams() {
  const index = buildIndex();
  return Array.from(index.keys()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const index = buildIndex();
  const occorrenze = index.get(slug);
  if (!occorrenze?.length) return {};
  const punto = occorrenze[0].punto;
  const tema = occorrenze[0].programma.tema;
  const partiti_nomi = occorrenze.map((o) => o.partito.nomeBreve).join(", ");
  return {
    title: `${punto} | Compasso Politico`,
    description: `La proposta "${punto}" su ${tema}. Partiti favorevoli: ${partiti_nomi}. Scopri posizioni e confronti.`,
  };
}

export default async function PuntoPage({ params }: Props) {
  const { slug } = await params;
  const index = buildIndex();
  const occorrenze = index.get(slug);
  if (!occorrenze?.length) notFound();

  const { punto } = occorrenze[0];
  const temaLabel = occorrenze[0].programma.tema;
  const temaSlug = temaLabel.toLowerCase().replace(/\s+/g, "-");

  // Altri partiti con posizione sullo stesso tema, che NON propongono questo punto
  const partitiConTema = partiti
    .map((p) => {
      const pr = p.programma.find((pr) => pr.tema.toLowerCase() === temaLabel.toLowerCase());
      if (!pr) return null;
      const giaPresente = occorrenze.some((o) => o.partito.id === p.id);
      if (giaPresente) return null;
      return { partito: p, programma: pr };
    })
    .filter(Boolean) as { partito: Partito; programma: ProgrammaTema }[];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="text-sm mb-8 flex items-center gap-1.5 flex-wrap" style={{ color: "var(--muted)" }}>
        <Link href="/partiti" className="hover:underline">Partiti</Link>
        <span>/</span>
        <Link href={`/partiti/temi/${temaSlug}`} className="hover:underline">{temaLabel}</Link>
        <span>/</span>
        <span style={{ color: "var(--foreground)" }}>{punto}</span>
      </div>

      {/* Tag tema */}
      <Link
        href={`/partiti/temi/${temaSlug}`}
        className="inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4 hover:opacity-80 transition-opacity"
        style={{ background: "var(--surface-2, #ebebea)", color: "var(--muted)" }}
      >
        {temaLabel}
      </Link>

      {/* Titolo */}
      <h1 className="text-3xl font-bold mb-8 leading-tight">{punto}</h1>

      {/* Chi lo propone */}
      <section className="mb-10">
        <div className="section-tag mb-5">
          {occorrenze.length === 1 ? "Chi lo propone" : `${occorrenze.length} partiti lo propongono`}
        </div>
        <div className="space-y-4">
          {occorrenze.map(({ partito, programma }) => (
            <div
              key={partito.id}
              className="rounded-xl border p-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 4, borderLeftColor: partito.colore }}
            >
              <Link href={`/partiti/${partito.id}`} className="flex items-center gap-3 mb-4 group">
                <PartitoLogo nome={partito.nome} nomeBreve={partito.nomeBreve} colore={partito.colore} logoUrl={partito.logoUrl} size={40} />
                <div>
                  <div className="font-bold group-hover:underline">{partito.nome}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {partito.segretario} · {partito.coalizione === "governo" ? "Al governo" : "Opposizione"}
                  </div>
                </div>
                {programma.stance && (
                  <span
                    className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
                    style={
                      programma.stance === "pro"
                        ? { background: "#dcfce7", color: "#15803d" }
                        : { background: "#fee2e2", color: "#dc2626" }
                    }
                  >
                    {programma.stance === "pro" ? "✓ Favorevole" : "✗ Contrario"}
                  </span>
                )}
              </Link>

              {/* Contesto: altri punti dello stesso tema */}
              <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>{programma.sintesi}</p>
              <ul className="space-y-1.5">
                {programma.puntiChiave.map((p) => (
                  <li key={p} className="text-sm flex gap-2 items-start">
                    <span
                      className="flex-shrink-0 font-bold mt-0.5"
                      style={{ color: p === punto ? partito.colore : "var(--muted)" }}
                    >
                      {p === punto ? "▶" : "·"}
                    </span>
                    {p === punto ? (
                      <span className="font-semibold" style={{ color: "var(--foreground)" }}>{p}</span>
                    ) : (
                      <Link
                        href={`/punti/${slugify(p)}`}
                        className="hover:underline"
                        style={{ color: "var(--muted)" }}
                      >
                        {p}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Cosa dicono gli altri partiti sullo stesso tema */}
      {partitiConTema.length > 0 && (
        <section className="mb-10">
          <div className="section-tag mb-5">
            Altri partiti su{" "}
            <Link href={`/partiti/temi/${temaSlug}`} className="hover:underline" style={{ color: "var(--accent)" }}>
              {temaLabel}
            </Link>
          </div>
          <div className="space-y-3">
            {partitiConTema.map(({ partito, programma }) => (
              <div
                key={partito.id}
                className="rounded-xl border p-4"
                style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 3, borderLeftColor: partito.colore }}
              >
                <Link href={`/partiti/${partito.id}`} className="flex items-center gap-2 mb-2 group">
                  <PartitoLogo nome={partito.nome} nomeBreve={partito.nomeBreve} colore={partito.colore} logoUrl={partito.logoUrl} size={28} />
                  <span className="font-semibold text-sm group-hover:underline">{partito.nome}</span>
                  {programma.stance && (
                    <span
                      className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                      style={
                        programma.stance === "pro"
                          ? { background: "#dcfce7", color: "#15803d" }
                          : { background: "#fee2e2", color: "#dc2626" }
                      }
                    >
                      {programma.stance === "pro" ? "✓ Favorevole" : "✗ Contrario"}
                    </span>
                  )}
                </Link>
                <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>{programma.sintesi}</p>
                <ul className="space-y-1">
                  {programma.puntiChiave.map((p) => (
                    <li key={p} className="text-xs flex gap-2">
                      <span style={{ color: partito.colore }}>·</span>
                      <Link href={`/punti/${slugify(p)}`} className="hover:underline" style={{ color: "var(--muted)" }}>
                        {p}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Partiti senza posizione su questo tema */}
      {(() => {
        const senza = partiti.filter(
          (p) => !p.programma.some((pr) => pr.tema.toLowerCase() === temaLabel.toLowerCase())
        );
        if (!senza.length) return null;
        return (
          <section>
            <div className="section-tag mb-4">Nessuna posizione dichiarata su {temaLabel}</div>
            <div className="flex flex-wrap gap-2">
              {senza.map((p) => (
                <Link
                  key={p.id}
                  href={`/partiti/${p.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border hover:opacity-80 transition-opacity"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <PartitoLogo nome={p.nome} nomeBreve={p.nomeBreve} colore={p.colore} logoUrl={p.logoUrl} size={22} />
                  <span className="text-xs font-semibold">{p.nomeBreve}</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
