// Download photos for ministers + regional figures
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEST = path.join(ROOT, "public", "politici");
const FOTOS_FILE = path.join(ROOT, "data", "foto-politici.json");

let fotos = {};
try { fotos = JSON.parse(fs.readFileSync(FOTOS_FILE, "utf8")); } catch {}

const PEOPLE = [
  // Ministers
  { id: "carlo-nordio", wiki: "Carlo_Nordio" },
  { id: "matteo-piantedosi", wiki: "Matteo_Piantedosi" },
  { id: "daniela-santanche", wiki: "Daniela_Santanchè" },
  { id: "adolfo-urso", wiki: "Adolfo_Urso" },
  { id: "gilberto-pichetto-fratin", wiki: "Gilberto_Pichetto_Fratin" },
  { id: "roberto-calderoli", wiki: "Roberto_Calderoli" },
  { id: "francesco-lollobrigida", wiki: "Francesco_Lollobrigida" },
  { id: "giuseppe-valditara", wiki: "Giuseppe_Valditara" },
  { id: "orazio-schillaci", wiki: "Orazio_Schillaci" },
  { id: "eugenia-roccella", wiki: "Eugenia_Roccella" },
  { id: "elisabetta-casellati", wiki: "Elisabetta_Alberti_Casellati" },
  { id: "nello-musumeci", wiki: "Nello_Musumeci" },
  // Presidenti di regione
  { id: "renzo-testolin", wiki: "Renzo_Testolin" },
  { id: "alberto-cirio", wiki: "Alberto_Cirio" },
  { id: "attilio-fontana", wiki: "Attilio_Fontana" },
  { id: "maurizio-fugatti", wiki: "Maurizio_Fugatti" },
  { id: "massimiliano-fedriga", wiki: "Massimiliano_Fedriga" },
  { id: "marco-bucci", wiki: "Marco_Bucci" },
  { id: "michele-de-pascale", wiki: "Michele_de_Pascale" },
  { id: "eugenio-giani", wiki: "Eugenio_Giani" },
  { id: "donatella-tesei", wiki: "Donatella_Tesei" },
  { id: "francesco-acquaroli", wiki: "Francesco_Acquaroli" },
  { id: "francesco-rocca", wiki: "Francesco_Rocca_(politico)" },
  { id: "marco-marsilio", wiki: "Marco_Marsilio" },
  { id: "vincenzo-de-luca", wiki: "Vincenzo_De_Luca" },
  { id: "michele-emiliano", wiki: "Michele_Emiliano" },
  { id: "vito-bardi", wiki: "Vito_Bardi" },
  { id: "roberto-occhiuto", wiki: "Roberto_Occhiuto" },
  { id: "renato-schifani", wiki: "Renato_Schifani" },
  { id: "alessandra-todde", wiki: "Alessandra_Todde" },
  // Sindaci
  { id: "roberto-gualtieri", wiki: "Roberto_Gualtieri" },
  { id: "giuseppe-sala", wiki: "Giuseppe_Sala_(politico)" },
  { id: "stefano-lo-russo", wiki: "Stefano_Lo_Russo" },
  { id: "luigi-brugnaro", wiki: "Luigi_Brugnaro" },
  { id: "roberto-dipiazza", wiki: "Roberto_Dipiazza" },
  { id: "matteo-lepore", wiki: "Matteo_Lepore" },
  { id: "sara-funaro", wiki: "Sara_Funaro" },
  { id: "daniele-silvetti", wiki: "Daniele_Silvetti" },
  { id: "gaetano-manfredi", wiki: "Gaetano_Manfredi" },
  { id: "vito-leccese", wiki: "Vito_Leccese" },
  { id: "roberto-lagalla", wiki: "Roberto_Lagalla" },
  { id: "massimo-zedda", wiki: "Massimo_Zedda" },
  { id: "pierluigi-biondi", wiki: "Pierluigi_Biondi" },
  { id: "nicola-fiorita", wiki: "Nicola_Fiorita" },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { "User-Agent": "CompassoPoliticoBot/1.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlink(dest, () => {});
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function getWikiPhoto(wikiTitle) {
  return new Promise((resolve) => {
    const url = `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
    https.get(url, { headers: { "User-Agent": "CompassoPoliticoBot/1.0" } }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.thumbnail?.source || json.originalimage?.source || null);
        } catch { resolve(null); }
      });
    }).on("error", () => resolve(null));
  });
}

(async () => {
  for (const person of PEOPLE) {
    if (fotos[person.id]) {
      console.log(`  skip ${person.id} (already have)`);
      continue;
    }
    try {
      const photoUrl = await getWikiPhoto(person.wiki);
      if (!photoUrl) { console.log(`  no photo: ${person.id}`); await sleep(800); continue; }
      const dest = path.join(DEST, `${person.id}.jpg`);
      await download(photoUrl, dest);
      fotos[person.id] = `/politici/${person.id}.jpg`;
      console.log(`  ✓ ${person.id}`);
    } catch (e) {
      console.log(`  ✗ ${person.id}: ${e.message}`);
    }
    await sleep(1200);
  }
  fs.writeFileSync(FOTOS_FILE, JSON.stringify(fotos, null, 2));
  console.log("Done. foto-politici.json updated.");
})();
