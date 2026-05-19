import type { Metadata } from "next";
import Link from "next/link";
import { readdir, readFile } from "fs/promises";
import path from "path";
import type { DailyContent } from "@/types";
import LiveSwiper from "@/components/ui/LiveSwiper";

export const metadata: Metadata = {
  title: "Parlamento Live",
  description: "Notizie politiche italiane in tempo reale: Camera, Senato, Quirinale. Atti parlamentari, votazioni e lavori delle commissioni aggiornati ogni ora.",
  keywords: ["parlamento live", "notizie politica italiana", "camera deputati", "senato", "votazioni parlamento", "lavori parlamentari"],
  openGraph: {
    title: "Parlamento Live | Compasso Politico",
    description: "Notizie politiche italiane in tempo reale: Camera, Senato, Quirinale e atti parlamentari.",
    type: "website",
    url: "/live",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parlamento Live | Compasso Politico",
    description: "Notizie politiche italiane aggiornate ogni ora: Camera, Senato, Quirinale.",
  },
  alternates: { canonical: "/live" },
};

export const revalidate = 1800;

interface RssItem {
  titolo: string;
  link: string;
  data: string;
  desc: string;
  fonte: string;
  colore: string;
}

const RSS_FEEDS = [
  { nome: "ANSA Politica",       url: "https://www.ansa.it/sito/notizie/politica/politica_rss.xml",    colore: "#C41230" },
  { nome: "Quirinale",           url: "https://www.quirinale.it/rss",                                    colore: "#1A3A5C" },
  { nome: "Governo",             url: "https://www.governo.it/it/rss.xml",                               colore: "#555555" },
  { nome: "Repubblica Politica", url: "https://www.repubblica.it/rss/politica/rss2.0.xml",               colore: "#E50012" },
  { nome: "Corriere",            url: "https://www.corriere.it/rss/politica.xml",                        colore: "#003399" },
];

async function fetchFeed(feed: (typeof RSS_FEEDS)[0]): Promise<RssItem[]> {
  try {
    const res = await fetch(feed.url, {
      next: { revalidate: 1800 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CompassoPolitico/1.0; +https://compassopolitico.it)" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const text = await res.text();

    const items: RssItem[] = [];
    const itemRx  = /<item>([\s\S]*?)<\/item>/gi;
    const titleRx = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>([^<]*?)<\/title>/i;
    const descRx  = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>([^<]*?)<\/description>/i;
    const linkRx  = /<link>(https?[^<]+)<\/link>/i;
    const dateRx  = /<pubDate>([^<]+)<\/pubDate>|<published>([^<]+)<\/published>/i;

    let m: RegExpExecArray | null;
    while ((m = itemRx.exec(text)) !== null) {
      const b = m[1];
      const t  = titleRx.exec(b);
      const d  = descRx.exec(b);
      const l  = linkRx.exec(b);
      const dt = dateRx.exec(b);
      const titolo = (t?.[1] ?? t?.[2] ?? "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim();
      const desc   = (d?.[1] ?? d?.[2] ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim().slice(0, 220);
      const link   = (l?.[1] ?? "").trim();
      const data   = (dt?.[1] ?? dt?.[2] ?? "").trim();
      if (titolo.length > 8 && link.startsWith("http")) {
        items.push({ titolo, link, data, desc, fonte: feed.nome, colore: feed.colore });
      }
    }
    return items.slice(0, 10);
  } catch {
    return [];
  }
}

async function getNews(): Promise<RssItem[]> {
  const results = await Promise.all(RSS_FEEDS.map(fetchFeed));
  const all = results.flat();
  // Deduplication by title similarity, sort by date desc
  const seen = new Set<string>();
  const unique = all.filter((item) => {
    const key = item.titolo.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique
    .sort((a, b) => {
      const da = new Date(a.data).getTime();
      const db = new Date(b.data).getTime();
      return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da);
    })
    .slice(0, 24);
}

async function getDaily(): Promise<DailyContent | null> {
  try {
    const dir = path.join(process.cwd(), "data", "daily");
    const files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort().reverse();
    if (!files.length) return null;
    return JSON.parse(await readFile(path.join(dir, files[0]), "utf-8")) as DailyContent;
  } catch {
    return null;
  }
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2)  return "ora";
    if (mins < 60) return `${mins}m fa`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h fa`;
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

const FONTI_LABELS: Record<string, string> = {
  camera:   "Camera",
  senato:   "Senato",
  quirinale: "Quirinale",
  governo:  "Governo",
};

export default async function LivePage() {
  const [news, daily] = await Promise.all([getNews(), getDaily()]);

  const ora = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
  const oggiISO = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" }); // YYYY-MM-DD
  const dataOggi = daily
    ? new Date(daily.data).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Rome" })
    : null;

  return (
    <>
      {/* Mobile: swiper */}
      <div className="block md:hidden">
        <LiveSwiper news={news} oggi={oggiISO} />
      </div>

      {/* Desktop: layout classico */}
      <div className="hidden md:block max-w-6xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-3 mb-8 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ background: "#ef4444" }}
          />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#ef4444" }}>Live</span>
        </div>
        <h1 className="text-2xl font-bold">Parlamento Live</h1>
        <span className="ml-auto text-xs" style={{ color: "var(--muted)" }}>
          Aggiornato alle {ora} · dati ogni 30 min
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Colonna principale: feed notizie ── */}
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--muted)" }}>
            Ultime notizie · {news.length} fonti
          </h2>

          {news.length === 0 ? (
            <div className="rounded-xl border p-8 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <p style={{ color: "var(--muted)" }}>Feed temporaneamente non disponibile. Riprova tra qualche minuto.</p>
            </div>
          ) : (
            news.map((item, i) => {
              const ago = timeAgo(item.data);
              return (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border p-4 transition-colors hover:border-current"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", textDecoration: "none" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: item.colore + "18", color: item.colore }}
                    >
                      {item.fonte}
                    </span>
                    {ago && (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>{ago}</span>
                    )}
                  </div>
                  <p className="font-semibold text-sm leading-snug" style={{ color: "var(--foreground)" }}>
                    {item.titolo}
                  </p>
                  {item.desc && (
                    <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "var(--muted)" }}>
                      {item.desc}
                    </p>
                  )}
                </a>
              );
            })
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-8">

          {/* Recap di oggi */}
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--muted)" }}>
              {dataOggi ? `Recap — ${dataOggi}` : "Il recap di oggi"}
            </h2>

            {daily ? (
              <div className="space-y-3">
                {daily.top3.map((n, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-4"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                      borderLeftWidth: 3,
                      borderLeftColor: "var(--accent)",
                    }}
                  >
                    <div className="text-xs font-bold mb-1.5" style={{ color: "var(--accent)" }}>
                      Notizia {i + 1}
                    </div>
                    <p className="font-semibold text-sm leading-snug">{n.titolo}</p>
                    <p className="text-xs mt-1.5 line-clamp-3" style={{ color: "var(--muted)" }}>
                      {n.spiegazione}
                    </p>
                    {n.fonte && (
                      <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                        Fonte: {n.fonte}
                      </p>
                    )}
                  </div>
                ))}

                <Link
                  href="/oggi"
                  className="flex items-center justify-center gap-1 text-xs font-bold py-2.5 rounded-xl"
                  style={{ background: "var(--accent)", color: "#fff", textDecoration: "none" }}
                >
                  Vai al recap completo →
                </Link>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Recap non ancora disponibile. L&apos;automazione si attiva ogni mattina alle 7.
              </p>
            )}
          </div>

          {/* Lavori parlamentari */}
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--muted)" }}>
              Lavori parlamentari
            </h2>
            <div className="space-y-2">
              {[
                { href: "https://www.camera.it/leg20/410", icon: "🏛️", label: "Camera dei Deputati", sub: "Ordine del giorno" },
                { href: "https://www.senato.it/leg/19/BGT/Schede/Attsen/home.html", icon: "⚖️", label: "Senato della Repubblica", sub: "Lavori e commissioni" },
                { href: "https://dati.camera.it", icon: "📊", label: "Open Data Camera", sub: "Votazioni e atti in open data" },
                { href: "https://dati.senato.it", icon: "📂", label: "Open Data Senato", sub: "Dataset pubblici ufficiali" },
              ].map(({ href, icon, label, sub }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border p-3.5 transition-colors"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", textDecoration: "none" }}
                >
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm leading-tight">{label}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>{sub}</p>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>↗</span>
                </a>
              ))}
            </div>
          </div>

          {/* Fonti dati */}
          <div
            className="rounded-xl border p-4 text-xs"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}
          >
            <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>Fonti dati</p>
            <p>
              Notizie da ANSA Politica, Quirinale, Governo, Repubblica e Corriere.
              Dati ufficiali da{" "}
              <a href="https://dati.camera.it" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
                dati.camera.it
              </a>{" "}
              e{" "}
              <a href="https://dati.senato.it" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
                dati.senato.it
              </a>{" "}
              (licenza CC BY 3.0). Aggiornamento ogni 30 minuti.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
