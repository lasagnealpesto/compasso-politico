/**
 * Genera un Reel Instagram dalle slide del carosello del giorno.
 * Ogni slide dura 4 secondi, fade-out finale di 1 secondo. Totale: 20s.
 *
 * Richiede: FFmpeg installato (pre-installato su GitHub Actions ubuntu-latest).
 * Musica:   assets/reel-music.mp3 (aggiungila al repo — vedi assets/README.md)
 * Output:   public/reels/YYYY-MM-DD/reel.mp4
 *
 * Uso: node scripts/daily-reel.mjs
 *      REEL_DATE=2026-05-20 node scripts/daily-reel.mjs
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const N_SLIDES      = 5;
const SLIDE_SECONDS = 4;
const TOTAL_SECONDS = N_SLIDES * SLIDE_SECONDS; // 20
const FADE_START    = TOTAL_SECONDS - 1;        // fade-out nell'ultimo secondo
const MUSIC_PATH    = path.join(ROOT, "assets", "reel-music.mp3");

async function getLatestDate() {
  const dir = path.join(ROOT, "public", "carousels");
  const entries = await readdir(dir);
  const dates = entries.filter(e => /^\d{4}-\d{2}-\d{2}$/.test(e)).sort().reverse();
  if (!dates.length) throw new Error("Nessuna cartella carosello trovata. Esegui prima: npm run carosello");
  return dates[0];
}

async function main() {
  console.log("🎬 Compasso Politico — Reel Generator");
  console.log(`📅 ${new Date().toISOString()}\n`);

  const date = process.env.REEL_DATE ?? await getLatestDate();
  const carouselDir = path.join(ROOT, "public", "carousels", date);

  // Verifica slide esistenti
  for (let i = 1; i <= N_SLIDES; i++) {
    const p = path.join(carouselDir, `slide-${i}.png`);
    if (!existsSync(p)) throw new Error(`Slide mancante: ${p}\nEsegui prima: npm run carosello`);
  }

  const outDir = path.join(ROOT, "public", "reels", date);
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "reel.mp4");

  const hasMusic = existsSync(MUSIC_PATH);
  console.log(`📅 Data: ${date}`);
  console.log(`🎵 Musica: ${hasMusic ? "✓ assets/reel-music.mp3" : "✗ non trovata — video senza audio"}`);
  console.log(`⏱  Durata: ${TOTAL_SECONDS}s (${N_SLIDES} slide × ${SLIDE_SECONDS}s)`);

  // 5 input immagine (ciascuna "loopata" per esattamente SLIDE_SECONDS)
  const slideInputs = Array.from({ length: N_SLIDES }, (_, i) =>
    `-loop 1 -t ${SLIDE_SECONDS} -i "${path.join(carouselDir, `slide-${i + 1}.png`)}"`
  ).join(" ");

  // Musica in loop (stream_loop -1) se disponibile
  const musicInput = hasMusic ? `-stream_loop -1 -i "${MUSIC_PATH}"` : "";

  // filter_complex: concat le 5 clip video, aggiungi fps e fade-out finale
  const concatIn = Array.from({ length: N_SLIDES }, (_, i) => `[${i}:v]`).join("");
  const filterComplex = `"${concatIn}concat=n=${N_SLIDES}:v=1:a=0,fps=25,fade=t=out:st=${FADE_START}:d=1[v]"`;

  // Mapping: video sempre, audio solo se musica presente
  const audioIdx = N_SLIDES; // indice del 6° input (0-based)
  const maps = hasMusic
    ? `-map "[v]" -map ${audioIdx}:a -c:a aac -b:a 192k -ar 44100`
    : `-map "[v]"`;

  const cmd = [
    "ffmpeg -y",
    slideInputs,
    musicInput,
    `-filter_complex ${filterComplex}`,
    maps,
    `-c:v libx264 -pix_fmt yuv420p -preset fast -crf 23`,
    `-t ${TOTAL_SECONDS}`,
    `"${outPath}"`,
  ].filter(Boolean).join(" ");

  console.log("\n⚙️  FFmpeg in esecuzione...");
  execSync(cmd, { stdio: ["ignore", "ignore", "inherit"] });

  console.log(`\n✅ Reel salvato: public/reels/${date}/reel.mp4`);
  if (!hasMusic) {
    console.log("\n⚠️  Per aggiungere musica:");
    console.log("   1. Scegli un brano royalty-free (es. Pixabay Music, YouTube Audio Library)");
    console.log("   2. Salvalo come assets/reel-music.mp3");
    console.log("   3. Committa: git add assets/reel-music.mp3 && git commit");
  }
}

main().catch(err => {
  console.error("❌ Errore:", err.message);
  process.exit(1);
});
