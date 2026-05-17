/**
 * Genera il carosello Instagram (5 slide PNG 1080×1080) dal JSON delle notizie.
 * Usa satori per il rendering e @resvg/resvg-js per convertire SVG → PNG.
 *
 * Output: public/carousels/YYYY-MM-DD/slide-1.png … slide-5.png
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { createElement as h } from "react";
import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const W = 1080;
const H = 1080;

// Brand colors
const RED = "#C41230";
const DARK = "#111111";
const MUTED = "#777777";
const BG = "#FFFFFF";
const SURFACE = "#F5F4F2";
const SURFACE_RED = "#FDF2F4";
const FONT = "Inter";

// ──────────────────── Utilities ────────────────────

function trunc(text, max) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  const raw = d.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Europe/Rome",
  });
  return raw.split(" ").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

async function loadFonts() {
  // Google Fonts CDN — TTF format (satori 0.26.x non supporta woff2)
  const URL_400 = "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.ttf";
  const URL_700 = "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjQ.ttf";
  process.stdout.write("   Scaricando font Inter (TTF)... ");
  const [r400, r700] = await Promise.all([
    fetch(URL_400).then((r) => r.arrayBuffer()),
    fetch(URL_700).then((r) => r.arrayBuffer()),
  ]);
  console.log("ok");
  return [
    { name: FONT, data: r400, weight: 400, style: "normal" },
    { name: FONT, data: r700, weight: 700, style: "normal" },
  ];
}

async function renderSlide(element, fonts) {
  const svg = await satori(element, { width: W, height: H, fonts });
  const resvg = new Resvg(svg, { background: "rgba(255,255,255,1)" });
  return Buffer.from(resvg.render().asPng());
}

// Helper: elemento testo semplice (senza flex necessario - figlio unico)
const txt = (style, text) => h("div", { style: { display: "flex", ...style } }, text);

// ──────────────────── SLIDE 1: Cover ────────────────────

function slide1(content) {
  const main = content.top3[content.top3.length - 1];
  const dateStr = formatDate(content.data);

  return h("div", {
    style: {
      width: W, height: H,
      display: "flex", flexDirection: "column",
      fontFamily: FONT, backgroundColor: BG,
    },
  },
    // Brand bar rossa
    h("div", {
      style: {
        height: 90, backgroundColor: RED,
        display: "flex", alignItems: "center", justifyContent: "center",
      },
    },
      txt({ fontSize: 24, fontWeight: 700, color: "#FFF", letterSpacing: "0.28em" },
        "COMPASSO POLITICO"),
    ),

    // Area principale
    h("div", {
      style: {
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 96px", gap: "0px",
      },
    },
      // Data
      txt({ fontSize: 23, color: MUTED, fontWeight: 400, marginBottom: "32px" }, dateStr),

      // Titolo su due righe
      h("div", {
        style: {
          display: "flex", flexDirection: "column", alignItems: "center",
          marginBottom: "44px",
        },
      },
        txt({ fontSize: 74, fontWeight: 700, color: DARK, lineHeight: 1.12 }, "Le 3 notizie"),
        txt({ fontSize: 74, fontWeight: 700, color: DARK, lineHeight: 1.12 }, "politiche di oggi"),
      ),

      // Linea rossa
      h("div", {
        style: { width: "72px", height: "5px", backgroundColor: RED, borderRadius: "3px", marginBottom: "48px" },
      }),

      // Card notizia principale
      h("div", {
        style: {
          backgroundColor: SURFACE_RED, borderRadius: "18px",
          padding: "28px 36px",
          borderLeftWidth: 5, borderLeftColor: RED, borderLeftStyle: "solid",
          display: "flex", flexDirection: "column", gap: "12px",
        },
      },
        txt({ fontSize: 14, color: RED, fontWeight: 700, letterSpacing: "0.22em" },
          "LA PIU' IMPORTANTE"),
        txt({ fontSize: 36, color: DARK, fontWeight: 700, lineHeight: 1.28 },
          trunc(main.titolo, 80)),
      ),
    ),

    // Footer
    h("div", {
      style: {
        height: "70px", backgroundColor: SURFACE,
        display: "flex", alignItems: "center", justifyContent: "center",
      },
    },
      txt({ fontSize: 19, color: MUTED }, "scorri per leggere  →"),
    ),
  );
}

// ──────────────────── SLIDES 2–4: Notizia ────────────────────

function slideNotizia(n, idx) {
  const isLast = idx === 2;
  const headerBg = isLast ? RED : SURFACE;
  const headerNumColor = isLast ? "#FFF" : RED;
  const headerColor = isLast ? "#FFF" : DARK;
  const headerMuted = isLast ? "rgba(255,255,255,0.7)" : MUTED;
  const perché = n["perchéRilevante"] ?? n.perche ?? "";

  return h("div", {
    style: {
      width: W, height: H,
      display: "flex", flexDirection: "column",
      fontFamily: FONT, backgroundColor: BG,
    },
  },
    // Header con numero
    h("div", {
      style: {
        height: "108px", backgroundColor: headerBg,
        display: "flex", alignItems: "center",
        padding: "0 80px", gap: "24px",
      },
    },
      txt({ fontSize: 58, fontWeight: 700, color: headerNumColor, lineHeight: 1 },
        String(idx + 1)),
      h("div", {
        style: { display: "flex", flexDirection: "column", gap: "3px" },
      },
        txt({ fontSize: 12, color: headerMuted, letterSpacing: "0.24em", fontWeight: 700 }, "NOTIZIA"),
        txt({ fontSize: 17, color: headerColor, fontWeight: 700 }, "COMPASSO POLITICO"),
      ),
    ),

    // Contenuto
    h("div", {
      style: {
        flex: 1, display: "flex", flexDirection: "column",
        padding: "48px 80px 0 80px",
      },
    },
      // Titolo notizia
      txt({ fontSize: 50, fontWeight: 700, color: DARK, lineHeight: 1.16, marginBottom: "28px" },
        trunc(n.titolo, 80)),

      // Spiegazione
      txt({ fontSize: 27, color: MUTED, lineHeight: 1.55, flex: 1 },
        trunc(n.spiegazione, 210)),

      // Box perché rilevante
      h("div", {
        style: {
          backgroundColor: SURFACE, borderRadius: "14px",
          padding: "22px 28px",
          display: "flex", gap: "14px", alignItems: "flex-start",
          marginTop: "auto", marginBottom: "28px",
        },
      },
        txt({ fontSize: 20, color: RED, fontWeight: 700 }, "→"),
        txt({ fontSize: 24, color: DARK, fontWeight: 500, lineHeight: 1.4, flex: 1 },
          trunc(perché, 140)),
      ),
    ),

    // Footer
    h("div", {
      style: {
        height: "68px",
        borderTopWidth: 1, borderTopColor: "#E8E8E8", borderTopStyle: "solid",
        display: "flex", alignItems: "center",
        padding: "0 80px", justifyContent: "space-between",
      },
    },
      txt({ fontSize: 17, color: MUTED }, n.fonte ? `Fonte: ${n.fonte}` : ""),
      txt({ fontSize: 17, color: MUTED }, "compassopolitico.it"),
    ),
  );
}

// ──────────────────── SLIDE 5: Outro ────────────────────

function slide5() {
  return h("div", {
    style: {
      width: W, height: H,
      display: "flex", flexDirection: "column",
      fontFamily: FONT, backgroundColor: RED,
      padding: "80px",
      justifyContent: "space-between",
    },
  },
    // Brand
    h("div", { style: { display: "flex", flexDirection: "column" } },
      txt({ color: "rgba(255,255,255,0.75)", fontSize: 20, letterSpacing: "0.28em", fontWeight: 700 },
        "COMPASSO POLITICO"),
      h("div", {
        style: { width: "52px", height: "4px", backgroundColor: "#FFF", borderRadius: "2px", marginTop: "14px" },
      }),
    ),

    // Messaggio principale
    h("div", { style: { display: "flex", flexDirection: "column", gap: "28px" } },
      h("div", { style: { display: "flex", flexDirection: "column" } },
        txt({ fontSize: 66, fontWeight: 700, color: "#FFF", lineHeight: 1.1 }, "La politica italiana"),
        txt({ fontSize: 66, fontWeight: 700, color: "#FFF", lineHeight: 1.1 }, "spiegata bene."),
      ),
      txt({ fontSize: 27, color: "rgba(255,255,255,0.85)", lineHeight: 1.55, fontWeight: 400 },
        "Ogni mattina le 3 notizie piu' importanti del giorno, spiegate in modo chiaro e senza schieramenti."),
    ),

    // CTA
    h("div", { style: { display: "flex", flexDirection: "column", gap: "18px" } },
      h("div", {
        style: {
          backgroundColor: "#FFF", borderRadius: "14px",
          padding: "22px 0",
          display: "flex", alignItems: "center", justifyContent: "center",
        },
      },
        txt({ fontSize: 30, fontWeight: 700, color: RED }, "compassopolitico.it"),
      ),
      txt({ color: "rgba(255,255,255,0.7)", fontSize: 20, textAlign: "center" },
        "Seguici per il recap ogni mattina"),
    ),
  );
}

// ──────────────────── Main ────────────────────

export async function generateCarousel(content) {
  const dateStr = content.data;
  console.log(`\n🎨 Generando carosello per ${dateStr}...`);

  const fonts = await loadFonts();

  const slides = [
    slide1(content),
    slideNotizia(content.top3[0], 0),
    slideNotizia(content.top3[1], 1),
    slideNotizia(content.top3[2], 2),
    slide5(),
  ];

  const outDir = path.join(ROOT, "public", "carousels", dateStr);
  await mkdir(outDir, { recursive: true });

  for (let i = 0; i < slides.length; i++) {
    process.stdout.write(`   Slide ${i + 1}/5... `);
    const png = await renderSlide(slides[i], fonts);
    await writeFile(path.join(outDir, `slide-${i + 1}.png`), png);
    console.log("ok");
  }

  console.log(`\n✅ Carosello salvato in public/carousels/${dateStr}/`);
  return dateStr;
}

async function main() {
  console.log("🎨 Compasso Politico — Carousel Generator");
  console.log(`📅 ${new Date().toISOString()}\n`);

  const dailyDir = path.join(ROOT, "data", "daily");
  const files = (await readdir(dailyDir)).filter((f) => f.endsWith(".json")).sort().reverse();

  if (!files.length) {
    console.error("❌ Nessun file daily trovato. Esegui prima: npm run oggi");
    process.exit(1);
  }

  const content = JSON.parse(await readFile(path.join(dailyDir, files[0]), "utf-8"));
  await generateCarousel(content);

  console.log(`\n📁 Slide su /carousels/${content.data}/slide-1.png … slide-5.png`);
}

main().catch((err) => {
  console.error("❌ Errore:", err.message);
  process.exit(1);
});
