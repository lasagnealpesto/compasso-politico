import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEsponente, getPartito, esponenti } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return esponenti.map((e) => ({ slug: e.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const esp = getEsponente(slug);
  if (!esp) return {};
  return {
    title: esp.nome,
    description: esp.bio.slice(0, 160),
  };
}

export default async function EsponentePage({ params }: Props) {
  const { slug } = await params;
  const esp = getEsponente(slug);
  if (!esp) notFound();

  const partito = getPartito(esp.partito);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        <Link href="/esponenti" className="hover:underline">Esponenti</Link>
        {" / "}
        <span style={{ color: "var(--foreground)" }}>{esp.nome}</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border p-8 mb-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-start gap-5 mb-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
            style={{ background: partito?.colore ?? "#666" }}
          >
            {esp.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{esp.nome}</h1>
            <p className="mt-1" style={{ color: "var(--muted)" }}>{esp.ruolo}</p>
            {partito && (
              <Link
                href={`/partiti/${partito.id}`}
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ background: partito.colore }}
              >
                {partito.nome}
              </Link>
            )}
          </div>
        </div>
        <p className="leading-relaxed" style={{ color: "var(--muted)" }}>{esp.bio}</p>

        {esp.wikipedia && (
          <a
            href={esp.wikipedia}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm"
            style={{ color: "var(--accent)" }}
          >
            Leggi su Wikipedia →
          </a>
        )}
      </div>

      {/* Timeline storia politica */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-6">Storia politica</h2>
        <div className="relative pl-6">
          {/* Linea verticale */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5" style={{ background: "var(--border)" }} />

          {esp.storiaPolit.map((s, i) => (
            <div key={i} className="relative mb-6 last:mb-0">
              {/* Punto sulla linea */}
              <div
                className="absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2"
                style={{ background: partito?.colore ?? "var(--accent)", borderColor: "var(--background)" }}
              />
              <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="font-semibold">{s.partito}</div>
                <div className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{s.ruolo}</div>
                <div className="text-xs mt-2 font-mono" style={{ color: "var(--muted)" }}>
                  {s.dalAnno} — {s.alAnno ?? "oggi"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Posizioni chiave */}
      {esp.posizioniChiave.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Posizioni chiave</h2>
          <div className="space-y-3">
            {esp.posizioniChiave.map((pos) => (
              <div key={pos.tema} className="rounded-xl border p-4 flex gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="text-sm font-semibold min-w-[90px]" style={{ color: partito?.colore ?? "var(--accent)" }}>
                  {pos.tema}
                </div>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{pos.posizione}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
