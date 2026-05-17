/**
 * Script automazione daily content.
 * Eseguito ogni mattina alle 7:00 da GitHub Actions.
 *
 * Flusso:
 * 1. Scarica RSS da ANSA, Corriere, Repubblica
 * 2. Filtra notizie politiche
 * 3. Invia a Claude API → genera top 3 + recap
 * 4. Salva in /data/daily/YYYY-MM-DD.json
 */

import Anthropic from "@anthropic-ai/sdk";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const RSS_FEEDS = [
  { fonte: "ANSA Politica", url: "https://www.ansa.it/sito/notizie/politica/politica_rss.xml" },
  { fonte: "Repubblica Politica", url: "https://www.repubblica.it/rss/politica/rss2.0.xml" },
  { fonte: "Corriere della Sera", url: "https://www.corriere.it/rss/politica.xml" },
  { fonte: "Il Sole 24 Ore", url: "https://www.ilsole24ore.com/rss/italia.xml" },
  { fonte: "Il Fatto Quotidiano", url: "https://www.ilfattoquotidiano.it/feed/" },
  { fonte: "La Stampa", url: "https://www.lastampa.it/rss.xml" },
  { fonte: "HuffPost Italia", url: "https://www.huffingtonpost.it/feeds/index.xml" },
];

async function fetchRSS(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    // Estrai titoli e descrizioni con regex semplice (no dipendenze XML)
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i;
    const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i;

    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const block = match[1];
      const t = titleRegex.exec(block);
      const d = descRegex.exec(block);
      const titolo = (t?.[1] ?? t?.[2] ?? "").trim();
      const desc = (d?.[1] ?? d?.[2] ?? "").replace(/<[^>]+>/g, "").trim().slice(0, 200);
      if (titolo && titolo.length > 5) items.push({ titolo, desc });
    }
    return items.slice(0, 15);
  } catch {
    console.warn(`Feed non raggiungibile: ${url}`);
    return [];
  }
}

async function generateDailyContent(notizie) {
  const client = new Anthropic();
  const today = new Date().toISOString().split("T")[0];

  const newsText = notizie
    .map((n, i) => `${i + 1}. [${n.fonte}] ${n.titolo}\n   ${n.desc}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: "Sei un giornalista politico italiano esperto e imparziale. Scrivi sempre in italiano. Sii chiaro, diretto e accessibile anche per chi non segue la politica quotidianamente.",
    messages: [
      {
        role: "user",
        content: `Oggi è ${today}. Queste sono le notizie politiche italiane di oggi:

${newsText}

Rispondi con un JSON valido con questa struttura esatta:
{
  "data": "${today}",
  "top3": [
    { "titolo": "...", "spiegazione": "...", "perchéRilevante": "..." },
    { "titolo": "...", "spiegazione": "...", "perchéRilevante": "..." },
    { "titolo": "...", "spiegazione": "...", "perchéRilevante": "..." }
  ],
  "recap": "..."
}

Regole:
- top3: le 3 notizie più importanti del giorno. Titolo max 8 parole. Spiegazione 2-3 frasi semplici. PerchéRilevante: 1 frase sul perché conta.
- recap: riassunto delle notizie del giorno in 250-300 parole. Tono giornalistico, imparziale, chiaro.
- Rispondi SOLO con il JSON, nessun testo aggiuntivo.`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "";
  // Pulisci eventuali backtick di markdown
  const clean = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(clean);
}

async function main() {
  console.log("🗞️  Compasso Politico — Daily Content Generator");
  console.log(`📅 ${new Date().toISOString()}\n`);

  // 1. Scarica RSS
  console.log("📡 Scaricando feed RSS...");
  const tutteLeNotizie = [];
  for (const feed of RSS_FEEDS) {
    const items = await fetchRSS(feed.url);
    items.forEach((n) => tutteLeNotizie.push({ ...n, fonte: feed.fonte }));
    console.log(`   ${feed.fonte}: ${items.length} notizie`);
  }

  if (tutteLeNotizie.length === 0) {
    console.error("❌ Nessuna notizia recuperata. Uscita.");
    process.exit(1);
  }

  // 2. Genera contenuto con Claude
  console.log("\n🤖 Generando contenuto con Claude API...");
  const content = await generateDailyContent(tutteLeNotizie);

  // 3. Salva JSON
  const today = new Date().toISOString().split("T")[0];
  const dir = path.join(ROOT, "data", "daily");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${today}.json`);
  await writeFile(filePath, JSON.stringify(content, null, 2), "utf-8");

  console.log(`\n✅ Salvato: data/daily/${today}.json`);
  console.log("📰 Top 3 titoli:");
  content.top3.forEach((n, i) => console.log(`   ${i + 1}. ${n.titolo}`));
}

main().catch((err) => {
  console.error("❌ Errore:", err.message);
  process.exit(1);
});
