import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPartito, getEsponentiByPartito, partiti } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return partiti.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const partito = getPartito(slug);
  if (!partito) return {};
  return {
    title: partito.nome,
    description: partito.descrizione,
  };
}

export default async function PartitoPage({ params }: Props) {
  const { slug } = await params;
  const partito = getPartito(slug);
  if (!partito) notFound();

  const esponenti = getEsponentiByPartito(partito.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        <Link href="/partiti" className="hover:underline">Partiti</Link>
        {" / "}
        <span style={{ color: "var(--foreground)" }}>{partito.nome}</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border p-8 mb-8" style={{ background: "var(--surface)", borderColor: "var(--border)", borderTopWidth: 4, borderTopColor: partito.colore }}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: partito.colore }}>
            {partito.nomeBreve.slice(0, 2)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{partito.nome}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Fondato nel {partito.fondazione} · Segretario: {partito.segretario} · {partito.parlamentari} parlamentari
            </p>
          </div>
        </div>
        <p style={{ color: "var(--muted)" }}>{partito.descrizione}</p>
      </div>

      {/* Storia */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Storia</h2>
        <div className="rounded-xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="leading-relaxed" style={{ color: "var(--muted)" }}>{partito.storia}</p>
        </div>
      </section>

      {/* Programma */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Programma politico</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partito.programma.map((tema) => (
            <div key={tema.tema} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="font-semibold mb-2" style={{ color: partito.colore }}>{tema.tema}</div>
              <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>{tema.sintesi}</p>
              <ul className="space-y-1">
                {tema.puntiChiave.map((punto) => (
                  <li key={punto} className="text-sm flex gap-2">
                    <span style={{ color: partito.colore }}>·</span>
                    <span style={{ color: "var(--foreground)" }}>{punto}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Esponenti */}
      {esponenti.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Esponenti principali</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {esponenti.map((e) => (
              <Link
                key={e.id}
                href={`/esponenti/${e.id}`}
                className="rounded-xl border p-5 flex gap-4 transition-all hover:scale-[1.01]"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: partito.colore }}>
                  {e.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-semibold">{e.nome}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{e.ruolo}</div>
                  <p className="text-xs mt-2 line-clamp-2" style={{ color: "var(--muted)" }}>{e.bio}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
