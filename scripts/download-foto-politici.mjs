import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import fs from "fs";
import path from "path";

const esponenti = JSON.parse(fs.readFileSync("data/esponenti.json", "utf8"));

fs.mkdirSync("public/politici", { recursive: true });

async function fetchWikiThumbnail(wikiUrl) {
  const title = decodeURIComponent(wikiUrl.split("/wiki/").pop());
  const apiUrl = `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(apiUrl, { headers: { "User-Agent": "CompassoPolitico/1.0" } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.thumbnail?.source ?? null;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": "CompassoPolitico/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const stream = createWriteStream(dest);
  await pipeline(Readable.fromWeb(res.body), stream);
}

async function main() {
  const fotoMap = {};

  for (const esp of esponenti) {
    if (!esp.wikipedia) continue;
    try {
      const thumbnailUrl = await fetchWikiThumbnail(esp.wikipedia);
      if (!thumbnailUrl) { console.log(`⚠ ${esp.nome}: no thumbnail`); continue; }

      // pick reasonable extension
      const ext = thumbnailUrl.includes(".png") ? "png" : thumbnailUrl.includes(".svg") ? "svg" : "jpg";
      const filename = `${esp.id}.${ext}`;
      const dest = path.join("public/politici", filename);

      await download(thumbnailUrl, dest);
      fotoMap[esp.id] = `/politici/${filename}`;
      console.log(`✓ ${esp.nome}`);
    } catch (e) {
      console.log(`✗ ${esp.nome}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  // save map to JSON
  fs.writeFileSync("data/foto-politici.json", JSON.stringify(fotoMap, null, 2));
  console.log("\nDone → data/foto-politici.json");
}

main().catch(console.error);
