import type { Metadata } from "next";
import { readdir, readFile } from "fs/promises";
import path from "path";
import type { DailyContent } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getDailyContent();
  if (!content) {
    return {
      title: "Oggi in Politica",
      description: "Le 3 notizie di politica italiana più importanti di oggi, spiegate in modo chiaro. Aggiornato ogni mattina alle 7.",
      alternates: { canonical: "/oggi" },
    };
  }
  const data = new Date(content.data + "T12:00:00Z").toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Rome",
  });
  const titoli = content.top3.map((n) => n.titolo).join("; ");
  const desc = `Politica italiana ${data}: ${titoli}.`.slice(0, 160);
  return {
    title: `Oggi in Politica — ${data}`,
    description: desc,
    keywords: ["notizie politica oggi", "politica italiana oggi", data],
    openGraph: {
      title: `Oggi in Politica — ${data} | Compasso Politico`,
      description: desc,
      type: "article",
      url: "/oggi",
    },
    twitter: {
      card: "summary_large_image",
      title: `Oggi in Politica — ${data}`,
      description: desc,
    },
    alternates: { canonical: "/oggi" },
  };
}

async function getDailyContent(): Promise<DailyContent | null> {
  try {
    const dir = path.join(process.cwd(), "data", "daily");
    const files = await readdir(dir);
    const sorted = files.filter((f) => f.endsWith(".json")).sort().reverse();
    if (!sorted.length) return null;
    const raw = await readFile(path.join(dir, sorted[0]), "utf-8");
    return JSON.parse(raw) as DailyContent;
  } catch {
    return null;
  }
}

export default async function OggiPage() {
  const content = await getDailyContent();
  const oggi = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (!content) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">📰</div>
        <h1 className="text-3xl font-bold mb-4">Oggi in Politica</h1>
        <p style={{ color: "var(--muted)" }}>
          Il recap giornaliero è in arrivo. L&apos;automazione si attiva ogni mattina alle 7:00.
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          Data di oggi: {oggi}
        </p>
      </div>
    );
  }

  const data = new Date(content.data).toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        📅 {data}
      </div>

      <h1 className="text-3xl font-bold mb-2">Oggi in Politica</h1>
      <p className="mb-10" style={{ color: "var(--muted)" }}>Le notizie politiche italiane più importanti di oggi.</p>

      {/* Top 3 */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">🔥 Le 3 notizie da sapere</h2>
        <div className="space-y-4">
          {content.top3.map((n, i) => (
            <div key={i} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl font-bold flex-shrink-0" style={{ color: "var(--accent)" }}>
                  {i + 1}
                </span>
                <div>
                  <div className="font-semibold mb-1">{n.titolo}</div>
                  <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>{n.spiegazione}</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="text-xs px-2 py-1 rounded-md inline-block" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                      💡 {n.perchéRilevante}
                    </div>
                    {n.fonteUrl && n.fonte && (
                      <a
                        href={n.fonteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs"
                        style={{ color: "var(--accent)" }}
                      >
                        ↗ {n.fonte}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recap */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">📋 Recap del giorno</h2>
        <div className="rounded-xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="leading-relaxed" style={{ color: "var(--muted)" }}>{content.recap}</p>
        </div>
      </section>

    </div>
  );
}
