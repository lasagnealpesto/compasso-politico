/**
 * Seed del database storico della politica italiana (2000–2026).
 * Esegui con: node scripts/seed-storia.mjs
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'compasso.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────
db.exec(`
  DROP TABLE IF EXISTS leggi;
  DROP TABLE IF EXISTS eventi;
  DROP TABLE IF EXISTS elezioni;
  DROP TABLE IF EXISTS governi;

  CREATE TABLE governi (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT NOT NULL,
    premier         TEXT NOT NULL,
    coalizione      TEXT NOT NULL,
    partiti         TEXT NOT NULL,       -- JSON array nomi
    dal             TEXT NOT NULL,       -- ISO date
    al              TEXT,                -- NULL = in carica
    motivo_fine     TEXT,
    note            TEXT,
    durata_giorni   INTEGER
  );

  CREATE TABLE elezioni (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    anno        INTEGER NOT NULL,
    data        TEXT NOT NULL,
    tipo        TEXT NOT NULL,           -- politiche | europee | regionali | referendum
    affluenza   REAL,
    vincitore   TEXT NOT NULL,
    risultati   TEXT NOT NULL,           -- JSON [{partito, percentuale, seggi}]
    note        TEXT
  );

  CREATE TABLE eventi (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    anno                INTEGER NOT NULL,
    data                TEXT NOT NULL,
    titolo              TEXT NOT NULL,
    descrizione         TEXT NOT NULL,
    categoria           TEXT NOT NULL,   -- governo | legge | scandalo | crisi | internazionale | riforma | sociale
    partiti_coinvolti   TEXT,            -- JSON array
    impatto             TEXT NOT NULL    -- alto | medio | basso
  );

  CREATE TABLE leggi (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    anno        INTEGER NOT NULL,
    nome        TEXT NOT NULL,
    descrizione TEXT NOT NULL,
    governo     TEXT NOT NULL,
    categoria   TEXT NOT NULL,           -- economia | lavoro | giustizia | welfare | ambiente | sicurezza
    impatto     TEXT NOT NULL
  );

  CREATE INDEX idx_eventi_anno ON eventi(anno);
  CREATE INDEX idx_elezioni_anno ON elezioni(anno);
  CREATE INDEX idx_governi_dal ON governi(dal);
`);

// ─────────────────────────────────────────────
// GOVERNI
// ─────────────────────────────────────────────
const insGoverno = db.prepare(`
  INSERT INTO governi (nome, premier, coalizione, partiti, dal, al, motivo_fine, note, durata_giorni)
  VALUES (@nome, @premier, @coalizione, @partiti, @dal, @al, @motivo_fine, @note, @durata_giorni)
`);

function giorni(dal, al) {
  const d1 = new Date(dal);
  const d2 = al ? new Date(al) : new Date();
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

const governi = [
  {
    nome: "Governo D'Alema II",
    premier: "Massimo D'Alema",
    coalizione: "Centrosinistra (Ulivo)",
    partiti: JSON.stringify(["DS", "PPI", "Democratici", "PDCI", "SDI", "Verdi", "UDEUR"]),
    dal: "1999-12-22", al: "2000-04-25",
    motivo_fine: "Sconfitta alle elezioni regionali, dimissioni volontarie",
    note: "Secondo governo D'Alema. Guidò l'Italia nel periodo della guerra in Kosovo (primo bombardamento NATO con partecipazione italiana)."
  },
  {
    nome: "Governo Amato II",
    premier: "Giuliano Amato",
    coalizione: "Centrosinistra (Ulivo)",
    partiti: JSON.stringify(["DS", "PPI", "Democratici", "PDCI", "SDI", "Verdi", "UDEUR"]),
    dal: "2000-04-25", al: "2001-06-11",
    motivo_fine: "Fine legislatura, elezioni politiche",
    note: "Governo di fine legislatura. Varò importanti riforme istituzionali (federalismo). Introduzione dell'euro avvenuta nel suo mandato (2002 fisicamente)."
  },
  {
    nome: "Governo Berlusconi II",
    premier: "Silvio Berlusconi",
    coalizione: "Centrodestra (Casa delle Libertà)",
    partiti: JSON.stringify(["FI", "AN", "Lega Nord", "CCD-CDU", "Nuovo PSI"]),
    dal: "2001-06-11", al: "2005-04-23",
    motivo_fine: "Rimpasto necessario dopo elezioni regionali perse nel 2005",
    note: "Il governo con la maggioranza più ampia nella storia della Repubblica. Ha introdotto la riforma Biagi sul lavoro. Legge Cirami sulle rogatorie. Scontro con la magistratura."
  },
  {
    nome: "Governo Berlusconi III",
    premier: "Silvio Berlusconi",
    coalizione: "Centrodestra (Casa delle Libertà)",
    partiti: JSON.stringify(["FI", "AN", "Lega Nord", "UDC"]),
    dal: "2005-04-23", al: "2006-05-17",
    motivo_fine: "Sconfitta alle elezioni politiche del 2006",
    note: "Governo riformato dopo la crisi. Approvò la legge elettorale proporzionale con soglie (Porcellum, Calderoli). Berlusconi chiamò questa legge 'una porcata'."
  },
  {
    nome: "Governo Prodi II",
    premier: "Romano Prodi",
    coalizione: "Centrosinistra (Unione)",
    partiti: JSON.stringify(["DS", "Margherita", "RC", "PDCI", "SDI", "Verdi", "UDEUR", "Rosa nel Pugno"]),
    dal: "2006-05-17", al: "2008-05-08",
    motivo_fine: "Sconfitta al Senato (voto di fiducia perso per 2 voti)",
    note: "Governo di coalizione larghissima (9 partiti). Vinse per 25.000 voti. Crisi continue al Senato. Fine prematura dopo solo 2 anni. Introdusse il TFR in busta paga, abolì i Dico."
  },
  {
    nome: "Governo Berlusconi IV",
    premier: "Silvio Berlusconi",
    coalizione: "Centrodestra (PDL + Lega)",
    partiti: JSON.stringify(["PDL", "Lega Nord", "MPA"]),
    dal: "2008-05-08", al: "2011-11-16",
    motivo_fine: "Crisi del debito sovrano, perdita della maggioranza parlamentare, pressioni UE e mercati",
    note: "Colpito dalla crisi finanziaria del 2011. Lo spread BTP-Bund salì oltre 550 punti. Dimissioni non volontarie, sostituto Monti imposto da Napolitano. Intercettazioni Berlusconi con Ruby."
  },
  {
    nome: "Governo Monti",
    premier: "Mario Monti",
    coalizione: "Governo tecnico (unità nazionale)",
    partiti: JSON.stringify(["Ministri tecnici", "Supporto PD + PDL + UDC"]),
    dal: "2011-11-16", al: "2013-04-28",
    motivo_fine: "Fine legislatura anticipata, PDL ritira supporto",
    note: "Governo di salvezza nazionale durante la crisi dello spread. Riforma delle pensioni (Fornero): abolì le pensioni di anzianità e introdusse il sistema contributivo puro. Salvataggio dei conti pubblici al prezzo di recessione e disoccupazione."
  },
  {
    nome: "Governo Letta",
    premier: "Enrico Letta",
    coalizione: "Grande coalizione (PD + PDL/NCD)",
    partiti: JSON.stringify(["PD", "NCD", "UDC", "SC", "PdL"]),
    dal: "2013-04-28", al: "2014-02-22",
    motivo_fine: "Sfiducia interna, scalzato da Renzi nella direzione PD",
    note: "Governo di 'larghe intese' nato dopo le elezioni di febbraio 2013 (stallo parlamentare). Matteo Renzi lo sfidò internamente. Famosa la frase di Renzi: 'Enrico stai sereno' — poco dopo lo fece fuori."
  },
  {
    nome: "Governo Renzi",
    premier: "Matteo Renzi",
    coalizione: "Centrosinistra (PD + NCD + SC)",
    partiti: JSON.stringify(["PD", "NCD", "SC"]),
    dal: "2014-02-22", al: "2016-12-12",
    motivo_fine: "Sconfitta al referendum costituzionale del 4 dicembre 2016, dimissioni",
    note: "Governo dei '1000 giorni'. Jobs Act (riforma del lavoro). Buona Scuola. Bonus 80 euro. Riforma del Senato tentata con il referendum poi bocciato (59% No). Riforme divisive tra progressisti."
  },
  {
    nome: "Governo Gentiloni",
    premier: "Paolo Gentiloni",
    coalizione: "Centrosinistra (PD)",
    partiti: JSON.stringify(["PD", "AP", "SC", "UDC"]),
    dal: "2016-12-12", al: "2018-06-01",
    motivo_fine: "Fine legislatura, elezioni politiche del 4 marzo 2018",
    note: "Governo di continuità dopo la caduta di Renzi. Gestì il periodo di transizione. Stabilizzò la situazione politica. Approvò la legge Madia sulla PA."
  },
  {
    nome: "Governo Conte I",
    premier: "Giuseppe Conte",
    coalizione: "Governo del cambiamento (M5S + Lega)",
    partiti: JSON.stringify(["M5S", "Lega"]),
    dal: "2018-06-01", al: "2019-09-05",
    motivo_fine: "Salvini ritira la Lega dalla coalizione (crisi di Ferragosto 2019), dimissioni Conte",
    note: "Primo governo populista italiano. Introdusse il Reddito di Cittadinanza e Quota 100 pensioni. Scontri continui con l'UE sul bilancio. Salvini aprì la crisi d'agosto pensando di andare al voto e vincere."
  },
  {
    nome: "Governo Conte II",
    premier: "Giuseppe Conte",
    coalizione: "M5S + PD + IV + LeU",
    partiti: JSON.stringify(["M5S", "PD", "IV", "LeU"]),
    dal: "2019-09-05", al: "2021-02-13",
    motivo_fine: "Italia Viva (Renzi) ritira i suoi ministri, crisi di governo durante il COVID",
    note: "Governo 'giallo-rosso'. Gestì la prima fase del COVID-19 (lockdown, DPCM). Ottenne il Recovery Fund (209 miliardi per l'Italia). Renzi aprì la crisi in piena pandemia per questioni sul PNRR."
  },
  {
    nome: "Governo Draghi",
    premier: "Mario Draghi",
    coalizione: "Unità nazionale (quasi tutti i partiti)",
    partiti: JSON.stringify(["PD", "M5S", "Lega", "FI", "IV", "LeU", "NCI", "Art.1"]),
    dal: "2021-02-13", al: "2022-10-22",
    motivo_fine: "M5S non vota la fiducia (luglio 2022), Draghi si dimette",
    note: "Governo di unità nazionale durante pandemia e guerra Ucraina. Gestì la fase vaccinale. PNRR. Sostegno all'Ucraina. Caduto per la mancata fiducia di M5S sul decreto aiuti. Draghi si era guadagnato il soprannome 'whatever it takes' già da governatore BCE."
  },
  {
    nome: "Governo Meloni",
    premier: "Giorgia Meloni",
    coalizione: "Centrodestra (FdI + Lega + FI + NM)",
    partiti: JSON.stringify(["FdI", "Lega", "FI", "NM"]),
    dal: "2022-10-22", al: null,
    motivo_fine: null,
    note: "Primo governo guidato da una donna nella storia italiana. Prima premier di destra-destra dal dopoguerra. Atlantismo sorprendente per chi l'aveva vista euroscettica. Piano Mattei per l'Africa."
  },
].map(g => ({ ...g, durata_giorni: giorni(g.dal, g.al) }));

const insertGoverni = db.transaction(() => {
  for (const g of governi) insGoverno.run(g);
});
insertGoverni();
console.log(`✅ ${governi.length} governi inseriti`);

// ─────────────────────────────────────────────
// ELEZIONI
// ─────────────────────────────────────────────
const insElezione = db.prepare(`
  INSERT INTO elezioni (anno, data, tipo, affluenza, vincitore, risultati, note)
  VALUES (@anno, @data, @tipo, @affluenza, @vincitore, @risultati, @note)
`);

const elezioni = [
  {
    anno: 2001, data: "2001-05-13", tipo: "politiche", affluenza: 81.4,
    vincitore: "Casa delle Libertà (Berlusconi)",
    risultati: JSON.stringify([
      { partito: "Casa delle Libertà", percentuale: 49.4, seggi: 368 },
      { partito: "Ulivo (centrosinistra)", percentuale: 43.7, seggi: 242 },
      { partito: "Altri", percentuale: 6.9, seggi: 20 },
    ]),
    note: "Vittoria netta di Berlusconi con la più ampia maggioranza parlamentare. Prodi uscente sconfitto."
  },
  {
    anno: 2004, data: "2004-06-13", tipo: "europee", affluenza: 73.1,
    vincitore: "FI (centrodestra)",
    risultati: JSON.stringify([
      { partito: "Forza Italia", percentuale: 21.0, seggi: 16 },
      { partito: "DS", percentuale: 15.2, seggi: 12 },
      { partito: "AN", percentuale: 11.5, seggi: 9 },
      { partito: "UDC", percentuale: 5.9, seggi: 5 },
      { partito: "Lega Nord", percentuale: 5.0, seggi: 4 },
    ]),
    note: "Elezioni europee con forte calo per la coalizione di governo."
  },
  {
    anno: 2006, data: "2006-04-09", tipo: "politiche", affluenza: 83.6,
    vincitore: "L'Unione (Prodi) — per 25.000 voti",
    risultati: JSON.stringify([
      { partito: "Unione (centrosinistra)", percentuale: 49.8, seggi: 348 },
      { partito: "Casa delle Libertà", percentuale: 49.7, seggi: 281 },
      { partito: "Altri", percentuale: 0.5, seggi: 1 },
    ]),
    note: "Risultato storico: solo 25.000 voti di scarto su 39 milioni di elettori. Il più ravvicinato della storia repubblicana. Lunga disputa sui risultati."
  },
  {
    anno: 2008, data: "2008-04-13", tipo: "politiche", affluenza: 80.5,
    vincitore: "PDL + Lega (Berlusconi)",
    risultati: JSON.stringify([
      { partito: "PDL", percentuale: 37.4, seggi: 276 },
      { partito: "PD", percentuale: 33.2, seggi: 211 },
      { partito: "Lega Nord", percentuale: 8.3, seggi: 60 },
      { partito: "UDC", percentuale: 5.6, seggi: 36 },
      { partito: "IDV", percentuale: 4.4, seggi: 29 },
    ]),
    note: "Prima elezione con il nuovo sistema bipolare semplificato. Prima volta che RC non entra in parlamento (sotto il 4%). Berlusconi quarta vittoria."
  },
  {
    anno: 2009, data: "2009-06-06", tipo: "europee", affluenza: 65.1,
    vincitore: "PDL (centrodestra)",
    risultati: JSON.stringify([
      { partito: "PDL", percentuale: 35.3, seggi: 29 },
      { partito: "PD", percentuale: 26.1, seggi: 21 },
      { partito: "Lega Nord", percentuale: 10.2, seggi: 9 },
      { partito: "UDC", percentuale: 6.5, seggi: 5 },
      { partito: "IDV", percentuale: 8.0, seggi: 7 },
    ]),
    note: "Crollo del PD (26%). Affermazione della Lega Nord."
  },
  {
    anno: 2013, data: "2013-02-24", tipo: "politiche", affluenza: 75.2,
    vincitore: "Nessuno (stallo parlamentare)",
    risultati: JSON.stringify([
      { partito: "Centrosinistra (Bersani)", percentuale: 29.5, seggi: 345 },
      { partito: "M5S (Grillo)", percentuale: 25.6, seggi: 109 },
      { partito: "Centrodestra (Berlusconi)", percentuale: 29.1, seggi: 125 },
      { partito: "Scelta Civica (Monti)", percentuale: 10.6, seggi: 47 },
    ]),
    note: "Elezione storica: M5S al primo posto come lista singola col 25.6%. Nessuna maggioranza al Senato. Nascita del governo delle 'larghe intese'. Tracollo di Monti."
  },
  {
    anno: 2014, data: "2014-05-25", tipo: "europee", affluenza: 58.7,
    vincitore: "PD (Renzi) — 40.8%",
    risultati: JSON.stringify([
      { partito: "PD", percentuale: 40.8, seggi: 31 },
      { partito: "M5S", percentuale: 21.2, seggi: 17 },
      { partito: "FI", percentuale: 16.8, seggi: 13 },
      { partito: "Lega Nord", percentuale: 6.2, seggi: 5 },
      { partito: "NCD", percentuale: 4.4, seggi: 3 },
    ]),
    note: "Trionfo di Renzi: il PD al 40.8% — massimo storico del centrosinistra alle europee. M5S secondo al 21.2%. Lega sotto al 6%, poi esploderà con Salvini."
  },
  {
    anno: 2018, data: "2018-03-04", tipo: "politiche", affluenza: 73.0,
    vincitore: "M5S primo partito (32.7%), centrodestra prima coalizione",
    risultati: JSON.stringify([
      { partito: "M5S", percentuale: 32.7, seggi: 333 },
      { partito: "Lega", percentuale: 17.4, seggi: 125 },
      { partito: "PD", percentuale: 18.7, seggi: 112 },
      { partito: "FI", percentuale: 14.0, seggi: 104 },
      { partito: "FdI", percentuale: 4.4, seggi: 32 },
    ]),
    note: "Elezione rivoluzionaria: M5S al 32.7% (mai così alto), Lega raddoppia al 17%, PD crolla al 18.7%. Nasce il governo 'del cambiamento' M5S-Lega. FdI al 4.4% — base da cui partirà la crescita."
  },
  {
    anno: 2019, data: "2019-05-26", tipo: "europee", affluenza: 56.1,
    vincitore: "Lega (Salvini) — 34.3%",
    risultati: JSON.stringify([
      { partito: "Lega", percentuale: 34.3, seggi: 28 },
      { partito: "M5S", percentuale: 17.1, seggi: 14 },
      { partito: "PD", percentuale: 22.7, seggi: 19 },
      { partito: "FI", percentuale: 8.8, seggi: 7 },
      { partito: "FdI", percentuale: 6.5, seggi: 5 },
    ]),
    note: "Apice di Salvini: Lega al 34.3%. PD risale al 22.7%. M5S crolla al 17%. FdI sale al 6.5%. Salvini aprì la crisi di governo pensando di capitalizzare — ma sbagliò i calcoli."
  },
  {
    anno: 2022, data: "2022-09-25", tipo: "politiche", affluenza: 63.9,
    vincitore: "Centrodestra — FdI primo partito",
    risultati: JSON.stringify([
      { partito: "FdI", percentuale: 26.0, seggi: 185 },
      { partito: "PD", percentuale: 19.1, seggi: 69 },
      { partito: "M5S", percentuale: 15.4, seggi: 105 },
      { partito: "Lega", percentuale: 8.9, seggi: 66 },
      { partito: "FI", percentuale: 8.1, seggi: 45 },
      { partito: "Azione+IV", percentuale: 7.8, seggi: 21 },
      { partito: "AVS", percentuale: 3.6, seggi: 11 },
    ]),
    note: "FdI dal 4.4% (2018) al 26% (2022) in 4 anni. Affluenza al minimo storico (63.9%). Meloni prima premier donna. Centrodestra con maggioranza ampia."
  },
  {
    anno: 2024, data: "2024-06-08", tipo: "europee", affluenza: 49.7,
    vincitore: "FdI (Meloni) — conferma primo partito",
    risultati: JSON.stringify([
      { partito: "FdI", percentuale: 28.8, seggi: 24 },
      { partito: "PD", percentuale: 24.0, seggi: 21 },
      { partito: "M5S", percentuale: 9.9, seggi: 8 },
      { partito: "FI", percentuale: 9.7, seggi: 7 },
      { partito: "Lega", percentuale: 9.0, seggi: 8 },
      { partito: "AVS", percentuale: 6.7, seggi: 4 },
      { partito: "Azione", percentuale: 3.3, seggi: 0 },
      { partito: "IV", percentuale: 3.8, seggi: 0 },
    ]),
    note: "FdI cresce ancora al 28.8%. PD risale al 24% — duello ravvicinato. M5S crolla al 9.9%. Calo Lega (9%). Azione e IV sotto la soglia del 4% per i seggi."
  },
  {
    anno: 2016, data: "2016-12-04", tipo: "referendum", affluenza: 65.5,
    vincitore: "No (59.1%) — bocciata riforma Renzi",
    risultati: JSON.stringify([
      { partito: "No", percentuale: 59.1, seggi: null },
      { partito: "Sì", percentuale: 40.9, seggi: null },
    ]),
    note: "Referendum costituzionale sulla riforma del Senato proposta da Renzi. Il No vince con quasi 20 punti. Renzi si dimette. Momento spartiacque della politica italiana."
  },
];

const insertElezioni = db.transaction(() => {
  for (const e of elezioni) insElezione.run(e);
});
insertElezioni();
console.log(`✅ ${elezioni.length} elezioni inserite`);

// ─────────────────────────────────────────────
// EVENTI STORICI
// ─────────────────────────────────────────────
const insEvento = db.prepare(`
  INSERT INTO eventi (anno, data, titolo, descrizione, categoria, partiti_coinvolti, impatto)
  VALUES (@anno, @data, @titolo, @descrizione, @categoria, @partiti_coinvolti, @impatto)
`);

const eventi = [
  // 2001
  { anno: 2001, data: "2001-07-20", titolo: "G8 di Genova — la morte di Carlo Giuliani", descrizione: "Il summit del G8 a Genova si trasforma in un bagno di sangue. Carlo Giuliani, 23 anni, viene ucciso da un carabiniere. La scuola Diaz viene assaltata dalla polizia con decine di arresti e pestaggi. Segna una rottura profonda tra una generazione e le istituzioni.", categoria: "sociale", partiti_coinvolti: JSON.stringify(["Governo Berlusconi II"]), impatto: "alto" },
  { anno: 2001, data: "2001-09-11", titolo: "Attentati dell'11 settembre — impatto sulla politica italiana", descrizione: "Gli attacchi alle Torri Gemelle cambiano la politica estera italiana. L'Italia aderisce alla coalizione anti-terrorismo. Berlusconi rilascia dichiarazioni controverse sulla 'superiorità della civiltà occidentale'. L'Italia invia truppe in Afghanistan.", categoria: "internazionale", partiti_coinvolti: JSON.stringify(["Governo Berlusconi II"]), impatto: "alto" },
  // 2002
  { anno: 2002, data: "2002-03-19", titolo: "Omicidio Biagi — Brigate Rosse uccidono il consulente del governo", descrizione: "Marco Biagi, professore bolognese consulente del governo per la riforma del lavoro, viene ucciso dalle Brigate Rosse davanti a casa. Il governo accelera la riforma: nasce la Legge Biagi (D.Lgs. 276/2003).", categoria: "sociale", partiti_coinvolti: JSON.stringify(["Governo Berlusconi II", "BR"]), impatto: "alto" },
  { anno: 2002, data: "2002-01-01", titolo: "Introduzione fisica dell'Euro in Italia", descrizione: "Il 1° gennaio 2002 le monete e le banconote in euro entrano in circolazione in 12 Paesi UE inclusa l'Italia. La lira viene ritirata. Molti italiani percepiscono un raddoppio dei prezzi (il fenomeno del 'rincaro dell'euro').", categoria: "internazionale", partiti_coinvolti: JSON.stringify([]), impatto: "alto" },
  // 2003
  { anno: 2003, data: "2003-03-20", titolo: "Guerra in Iraq — l'Italia ci va (ma con distinguo)", descrizione: "Gli USA invadono l'Iraq. Berlusconi appoggia Bush. Le piazze italiane esplodono: la più grande manifestazione pacifista della storia con 3 milioni a Roma. L'Italia manda truppe in Iraq per 'missione umanitaria'. Polemiche infinite.", categoria: "internazionale", partiti_coinvolti: JSON.stringify(["Governo Berlusconi II", "AN", "FI"]), impatto: "alto" },
  { anno: 2003, data: "2003-06-01", titolo: "Legge Gasparri sul sistema radiotelevisivo", descrizione: "La legge Gasparri ridisegna il sistema televisivo italiano permettendo a Mediaset (di Berlusconi) di mantenere le tre reti. Il Presidente Ciampi la rinvia alle Camere. Poi viene approvata. Scontro frontale tra politica e RAI.", categoria: "legge", partiti_coinvolti: JSON.stringify(["FI", "AN", "Governo Berlusconi III"]), impatto: "alto" },
  // 2004
  { anno: 2004, data: "2004-06-01", titolo: "Legge Cirami e scontri sulla giustizia", descrizione: "Il quinquennio 2001-2006 è dominato dallo scontro tra Berlusconi e la magistratura. Legge Cirami, riforma delle rogatorie, legge sul falso in bilancio: pacchetti di norme accusati di essere 'ad personam' per proteggere Berlusconi dai processi.", categoria: "legge", partiti_coinvolti: JSON.stringify(["FI", "PDL"]), impatto: "alto" },
  // 2005
  { anno: 2005, data: "2005-04-03", titolo: "Sconfitta alle regionali — il Porcellum nasce dalla vendetta", descrizione: "Il centrodestra perde pesantemente le elezioni regionali. Calderoli propone una nuova legge elettorale proporzionale con liste bloccate e premio di maggioranza. Lui stesso la chiama 'una porcata'. Il 'Porcellum' regge fino al 2013.", categoria: "legge", partiti_coinvolti: JSON.stringify(["Lega Nord", "Governo Berlusconi III"]), impatto: "alto" },
  // 2006
  { anno: 2006, data: "2006-07-09", titolo: "Italia campione del mondo di calcio a Berlino", descrizione: "L'Italia vince i Mondiali a Berlino battendo la Francia ai rigori. Nazionale ferita dallo scandalo Calciopoli (retrocessione Juventus in Serie B) ma comunque campione. Momento di orgoglio nazionale trasversale.", categoria: "sociale", partiti_coinvolti: JSON.stringify([]), impatto: "medio" },
  { anno: 2006, data: "2006-05-09", titolo: "Giorgio Napolitano eletto Presidente della Repubblica", descrizione: "Napolitano, ex PCI poi DS, viene eletto Presidente. Sarà una delle figure più influenti della storia repubblicana, protagonista delle crisi del 2011 e 2013. Rieletto nel 2013 ('il Napolitano bis').", categoria: "governo", partiti_coinvolti: JSON.stringify(["PD", "DS"]), impatto: "alto" },
  // 2007
  { anno: 2007, data: "2007-10-14", titolo: "Nasce il Partito Democratico", descrizione: "DS e Margherita si sciolgono per dar vita al Partito Democratico. Walter Veltroni è il primo segretario. Il PD nasce con ambizioni di 'terza via' all'americana, ma fatica a trovare un'identità chiara tra laburismo e centrismo.", categoria: "governo", partiti_coinvolti: JSON.stringify(["DS", "Margherita", "PD"]), impatto: "alto" },
  // 2008
  { anno: 2008, data: "2008-09-15", titolo: "Lehman Brothers fallisce — crisi finanziaria globale colpisce l'Italia", descrizione: "Il fallimento di Lehman scatena la peggior crisi finanziaria dal '29. L'Italia entra in recessione. Il debito pubblico al 106% del PIL inizia a preoccupare i mercati. Le banche italiane reggono meglio di quelle nordeuropee (esposizione limitata ai mutui USA).", categoria: "internazionale", partiti_coinvolti: JSON.stringify([]), impatto: "alto" },
  // 2009
  { anno: 2009, data: "2009-04-06", titolo: "Terremoto dell'Aquila — 309 morti", descrizione: "Un terremoto di magnitudo 6.3 colpisce L'Aquila. 309 vittime, 1500 feriti, 65.000 sfollati. La Protezione Civile di Bertolaso diventa centro di potere (poi coinvolta in scandali). Bertolaso diventa personaggio chiave del governo Berlusconi.", categoria: "sociale", partiti_coinvolti: JSON.stringify(["Governo Berlusconi IV"]), impatto: "alto" },
  { anno: 2009, data: "2009-03-27", titolo: "Nasce il Popolo della Libertà (PDL)", descrizione: "FI, AN e altri partiti del centrodestra si fondono nel PDL. Fine dell'MSI/AN come soggetto autonomo. Ignazio La Russa, Giorgia Meloni e altri decidono invece di fondare FdI nel 2012 rifiutando la fusione.", categoria: "governo", partiti_coinvolti: JSON.stringify(["FI", "AN", "PDL"]), impatto: "alto" },
  // 2011
  { anno: 2011, data: "2011-07-01", titolo: "Crisi dello spread — l'Italia sull'orlo del baratro", descrizione: "Lo spread BTP-Bund esplode: passa da 180 punti di gennaio a oltre 550 di novembre. I mercati scommettono sul default italiano. La BCE di Trichet e poi Draghi compra titoli italiani a patto di riforme. L'Italia è sotto pressione internazionale come non mai.", categoria: "crisi", partiti_coinvolti: JSON.stringify(["Governo Berlusconi IV", "PDL", "Lega Nord"]), impatto: "alto" },
  { anno: 2011, data: "2011-11-12", titolo: "Fine era Berlusconi — dimissioni sotto pressione", descrizione: "Berlusconi perde la maggioranza alla Camera (solo 308 voti, non la maggioranza assoluta di 316). Si dimette. Napolitano nomina Mario Monti senatore a vita e poi incarica lui. Fine di un'era: Berlusconi era stato protagonista della politica per 17 anni.", categoria: "governo", partiti_coinvolti: JSON.stringify(["PDL", "Lega Nord"]), impatto: "alto" },
  // 2012
  { anno: 2012, data: "2012-12-21", titolo: "Nasce Fratelli d'Italia", descrizione: "Giorgia Meloni, Ignazio La Russa e Guido Crosetto fondano Fratelli d'Italia rifiutando di sciogliersi nel PDL. Mantengono il simbolo della fiamma tricolore. Alle elezioni 2013 prendono il 2%. Inizio di una crescita decennale.", categoria: "governo", partiti_coinvolti: JSON.stringify(["FdI"]), impatto: "medio" },
  { anno: 2012, data: "2012-01-01", titolo: "Riforma Fornero delle pensioni — addio pensioni di anzianità", descrizione: "Il governo Monti approva la riforma Fornero: abolisce le pensioni di anzianità, introduce il sistema contributivo puro, alza l'età pensionabile (67 anni). Crea i 'quota esodati': centinaia di migliaia di persone rimaste senza pensione né lavoro.", categoria: "legge", partiti_coinvolti: JSON.stringify(["Governo Monti"]), impatto: "alto" },
  // 2013
  { anno: 2013, data: "2013-02-24", titolo: "Elezioni politiche — il M5S spacca il sistema", descrizione: "Il M5S ottiene il 25.6% al primo tentativo. Grillo e Casaleggio hanno costruito un movimento attraverso il blog e meetup locali. Nessuna maggioranza al Senato. Il sistema politico italiano non è più lo stesso.", categoria: "governo", partiti_coinvolti: JSON.stringify(["M5S", "PD", "PDL"]), impatto: "alto" },
  { anno: 2013, data: "2013-08-01", titolo: "Condanna Berlusconi per frode fiscale — decadenza dal Senato", descrizione: "La Cassazione conferma la condanna definitiva di Berlusconi per frode fiscale (caso Mediaset). La Giunta del Senato ne delibera la decadenza. Berlusconi è escluso dal Parlamento per 6 anni. Proteste del PDL, sit-in a Palazzo Madama.", categoria: "scandalo", partiti_coinvolti: JSON.stringify(["PDL", "FI"]), impatto: "alto" },
  // 2014
  { anno: 2014, data: "2014-02-22", titolo: "Renzi scalza Letta — 'Enrico stai sereno' era una bugia", descrizione: "Matteo Renzi, segretario PD, forza Enrico Letta alle dimissioni dopo aver dichiarato 'Enrico stai sereno'. Senza passare per le urne diventa premier. La mossa è criticata come 'golpe bianco' ma Renzi porta il PD al 40% alle europee.", categoria: "governo", partiti_coinvolti: JSON.stringify(["PD"]), impatto: "alto" },
  { anno: 2014, data: "2014-03-01", titolo: "Jobs Act — la riforma del lavoro più controversa degli anni 2010", descrizione: "Il Jobs Act di Renzi (2015) abolisce l'art.18 dello Statuto dei Lavoratori per i nuovi assunti, introduce il contratto a tutele crescenti. CGIL contraria, proteste di piazza. I risultati occupazionali sono contestati: disoccupazione scende ma il precariato non scompare.", categoria: "legge", partiti_coinvolti: JSON.stringify(["PD", "Governo Renzi"]), impatto: "alto" },
  // 2015
  { anno: 2015, data: "2015-01-09", titolo: "Attentato a Charlie Hebdo — l'Italia tra sicurezza e diritti", descrizione: "L'attentato islamista a Parigi riapre il dibattito sulla sicurezza in Italia. Il governo vara il pacchetto sicurezza. Il Ministro Orlando (PD) e Alfano si scontrano sulle misure da adottare.", categoria: "internazionale", partiti_coinvolti: JSON.stringify(["Governo Renzi"]), impatto: "medio" },
  { anno: 2015, data: "2015-04-01", titolo: "Crisi migranti nel Mediterraneo — 900 morti in un naufragio", descrizione: "Un naufragio nel Mediterraneo uccide 900 migranti. L'Italia gestisce da sola la pressione migratoria. Nasce la disputa politica sulla redistribuzione in Europa. La questione migranti diventa il tema politico dominante degli anni successivi.", categoria: "sociale", partiti_coinvolti: JSON.stringify(["Governo Renzi", "Lega Nord"]), impatto: "alto" },
  // 2016
  { anno: 2016, data: "2016-12-04", titolo: "Referendum costituzionale — Renzi sconfitto, si dimette", descrizione: "Il referendum sulla riforma del Senato proposta da Renzi viene bocciato con il 59.1% di No. Renzi aveva personalizzato il voto ('se perdo me ne vado'). Si dimette. Segna la fine del 'renzismo' nella sua forma originale.", categoria: "governo", partiti_coinvolti: JSON.stringify(["PD", "Governo Renzi", "M5S", "Lega Nord", "FdI"]), impatto: "alto" },
  { anno: 2016, data: "2016-08-24", titolo: "Terremoto del Centro Italia — 299 morti", descrizione: "Una serie di scosse (magnitudo 6.0-6.5) devastano Amatrice, Accumoli, Arquata del Tronto. 299 vittime. La ricostruzione diventa lenta e contestata. Il terremoto torna nella campagna elettorale 2022.", categoria: "sociale", partiti_coinvolti: JSON.stringify([]), impatto: "alto" },
  // 2017
  { anno: 2017, data: "2017-09-01", titolo: "Nasce Italia Viva — anticipazione della scissione Renzi", descrizione: "Renzi torna segretario PD dopo Martina. Ma le tensioni con la componente di sinistra del partito restano. Nel 2019 darà vita a Italia Viva.", categoria: "governo", partiti_coinvolti: JSON.stringify(["PD"]), impatto: "medio" },
  { anno: 2017, data: "2017-10-22", titolo: "Referendum autonomia Veneto e Lombardia", descrizione: "Lega e Zaia organizzano referendum sull'autonomia in Veneto e Lombardia. In Veneto vota il 57%, quasi tutti per il Sì. La questione autonomia torna prepotentemente in agenda. Porterà alla legge Calderoli del 2024.", categoria: "legge", partiti_coinvolti: JSON.stringify(["Lega Nord", "Regione Veneto", "Regione Lombardia"]), impatto: "medio" },
  // 2018
  { anno: 2018, data: "2018-06-01", titolo: "Nasce il governo Conte I — M5S e Lega al potere", descrizione: "Per la prima volta due partiti anti-establishment vanno al governo insieme. Il 'contratto di governo' include reddito di cittadinanza, quota 100 pensioni, flat tax. Scoppia il conflitto con l'UE sul deficit al 2.4%.", categoria: "governo", partiti_coinvolti: JSON.stringify(["M5S", "Lega"]), impatto: "alto" },
  { anno: 2018, data: "2018-06-10", titolo: "Aquarius — Salvini chiude i porti", descrizione: "La nave Aquarius con 629 migranti a bordo si vede rifiutare l'approdo in Italia da Salvini. La nave va a Valencia. È il simbolo della svolta securitaria: Salvini diventa il politico più popolare d'Italia con i sondaggi che schizzano al 34%.", categoria: "sociale", partiti_coinvolti: JSON.stringify(["Lega", "Governo Conte I"]), impatto: "alto" },
  // 2019
  { anno: 2019, data: "2019-08-08", titolo: "Crisi di Ferragosto — Salvini apre la crisi e la perde", descrizione: "Salvini al Papeete Beach annuncia: 'Riprendiamo la parola agli italiani'. Apre la crisi di governo convinto di vincere le elezioni. Sbaglia: PD e M5S si accordano per fare un nuovo governo senza di lui. Conte II nasce senza passare dalle urne.", categoria: "governo", partiti_coinvolti: JSON.stringify(["Lega", "M5S", "PD"]), impatto: "alto" },
  { anno: 2019, data: "2019-09-18", titolo: "Nasce Italia Viva — Renzi lascia il PD", descrizione: "Matteo Renzi lascia il PD e fonda Italia Viva. La scissione porta con sé circa 30 parlamentari. Il PD di Zingaretti perde la componente renziana. IV oscilla tra il 2% e il 5% nei sondaggi.", categoria: "governo", partiti_coinvolti: JSON.stringify(["IV", "PD"]), impatto: "medio" },
  // 2020
  { anno: 2020, data: "2020-03-09", titolo: "Lockdown COVID-19 — l'Italia prima in Europa", descrizione: "L'Italia è il primo Paese europeo colpito duramente dal COVID. Conte firma il DPCM del lockdown totale. Per 2 mesi nessuno può uscire di casa. Bergamo diventa simbolo globale della tragedia. Il governo Conte II gestisce la crisi con misure draconiane.", categoria: "sociale", partiti_coinvolti: JSON.stringify(["Governo Conte II"]), impatto: "alto" },
  { anno: 2020, data: "2020-07-21", titolo: "Recovery Fund — 209 miliardi per l'Italia", descrizione: "Il Consiglio Europeo approva il Next Generation EU (Recovery Fund). All'Italia vanno 209 miliardi tra sussidi e prestiti. È il più grande trasferimento di risorse europee mai ricevuto dall'Italia. Il PNRR diventerà la colonna della politica economica nei 4 anni successivi.", categoria: "internazionale", partiti_coinvolti: JSON.stringify(["Governo Conte II"]), impatto: "alto" },
  { anno: 2020, data: "2020-09-21", titolo: "Referendum taglio parlamentari — vince il Sì (69.6%)", descrizione: "Il referendum per ridurre il numero di parlamentari da 945 a 600 vince con il 69.6% di Sì. Una vittoria del M5S ma sostenuta da tutti i partiti. Dal 2022 la Camera ha 400 deputati e il Senato 200.", categoria: "legge", partiti_coinvolti: JSON.stringify(["M5S", "Tutti i partiti"]), impatto: "alto" },
  // 2021
  { anno: 2021, data: "2021-01-13", titolo: "Renzi fa cadere il governo Conte II — in piena pandemia", descrizione: "Italia Viva ritira i ministri dal governo Conte II durante la terza ondata COVID. Renzi critica il piano PNRR di Conte. Crisi in piena pandemia, con l'Italia in lockdown. Indignazione popolare. Conte si dimette e nasce il governo Draghi.", categoria: "governo", partiti_coinvolti: JSON.stringify(["IV", "Governo Conte II"]), impatto: "alto" },
  { anno: 2021, data: "2021-02-13", titolo: "Governo Draghi — 'whatever it takes' alla presidenza del Consiglio", descrizione: "Mario Draghi, ex governatore BCE che aveva salvato l'euro nel 2012, diventa premier. Governo di quasi unità nazionale: tutti dentro tranne FdI. Vaccini accelerati, PNRR gestito, sostegno pieno all'Ucraina. Draghi porta il suo stile decisionista alla guida del Paese.", categoria: "governo", partiti_coinvolti: JSON.stringify(["PD", "M5S", "Lega", "FI", "IV"]), impatto: "alto" },
  { anno: 2021, data: "2021-03-01", titolo: "Campagna vaccinale anti-COVID — l'Italia accelera", descrizione: "L'Italia scala la campagna vaccinale: da marzo con AstraZeneca, poi Pfizer. Draghi introduce il Green Pass per contenere la quarta ondata. Manifestazioni No-vax in tutta Italia. Obbligo vaccinale per alcune categorie.", categoria: "sociale", partiti_coinvolti: JSON.stringify(["Governo Draghi"]), impatto: "alto" },
  // 2022
  { anno: 2022, data: "2022-02-24", titolo: "Russia invade l'Ucraina — l'Italia si schiera con Kiev", descrizione: "Putin invade l'Ucraina. L'Italia sotto Draghi si schiera con l'Occidente, invia armi e aderisce alle sanzioni. M5S inizia a vacillare sull'invio di armi. Luglio: M5S non vota il decreto aiuti, Draghi si dimette.", categoria: "internazionale", partiti_coinvolti: JSON.stringify(["Governo Draghi", "M5S"]), impatto: "alto" },
  { anno: 2022, data: "2022-07-21", titolo: "Caduta del governo Draghi — M5S non vota il decreto aiuti", descrizione: "M5S non partecipa al voto di fiducia sul decreto aiuti. Draghi si dimette dichiarando che 'è venuto meno il patto di fiducia'. Lega e FI lo seguono. Crisi a luglio, governo in carica fino ad ottobre. Elezioni anticipate a settembre.", categoria: "governo", partiti_coinvolti: JSON.stringify(["M5S", "Lega", "FI"]), impatto: "alto" },
  { anno: 2022, data: "2022-10-22", titolo: "Giorgia Meloni Presidente del Consiglio — prima donna nella storia", descrizione: "FdI vince le elezioni con il 26%. Giorgia Meloni diventa la prima donna Presidente del Consiglio della Repubblica italiana. La prima premier di destra-destra dal dopoguerra. Mercati tranquilli, atlantismo confermato. Sorpresa internazionale.", categoria: "governo", partiti_coinvolti: JSON.stringify(["FdI", "Lega", "FI", "NM"]), impatto: "alto" },
  // 2023
  { anno: 2023, data: "2023-06-12", titolo: "Muore Silvio Berlusconi — fine di un'epoca", descrizione: "Silvio Berlusconi muore a Milano a 86 anni. Quattro volte premier, fondatore di FI, il politico che più di ogni altro ha dominato la politica italiana negli ultimi 30 anni. L'eredità è controversa: modernizzazione vs conflitti d'interesse. L'Italia piange e discute.", categoria: "governo", partiti_coinvolti: JSON.stringify(["FI"]), impatto: "alto" },
  { anno: 2023, data: "2023-02-26", titolo: "Strage di Cutro — migranti muoiono a pochi metri dalla riva", descrizione: "Un barcone con centinaia di migranti si schianta vicino a Cutro (Calabria). 98 morti accertati. Meloni è in Toscana in vacanza. Polemiche sull'assenza della premier, sul mancato intervento della Guardia Costiera, sulle politiche di contrasto all'immigrazione.", categoria: "sociale", partiti_coinvolti: JSON.stringify(["Governo Meloni", "FdI"]), impatto: "alto" },
  { anno: 2023, data: "2023-09-10", titolo: "Alluvione in Emilia Romagna — disastro e polemiche politiche", descrizione: "L'alluvione del maggio 2023 (non settembre) devasta l'Emilia Romagna: 15 morti, 36.000 sfollati, danni per miliardi. Scontro politico tra Meloni e Bonaccini sulla ricostruzione e sui fondi. I cambiamenti climatici entrano definitivamente nel dibattito politico.", categoria: "sociale", partiti_coinvolti: JSON.stringify(["Governo Meloni", "PD", "Regione ER"]), impatto: "alto" },
  // 2024
  { anno: 2024, data: "2024-06-08", titolo: "Europee 2024 — FdI al 28.8%, duello con PD (24%)", descrizione: "Le europee 2024 confermano FdI primo partito al 28.8%. Il PD risale al 24% con Schlein. M5S crolla al 9.9%. Lega al 9%. Azione e IV sotto soglia. L'Italia si consolida come paese dove FdI è dominante. Schlein rilancia il PD come alternativa credibile.", categoria: "governo", partiti_coinvolti: JSON.stringify(["FdI", "PD", "M5S", "Lega"]), impatto: "alto" },
  { anno: 2024, data: "2024-06-19", titolo: "Legge sull'autonomia differenziata (Calderoli) approvata", descrizione: "La legge Calderoli sull'autonomia differenziata viene approvata. Permette alle regioni di richiedere più autonomia su 23 materie. Il Sud protesta: rischia di aumentare il divario Nord-Sud. Referendum abrogativo raccolte 1,3 milioni di firme. La Corte Costituzionale poi la ridimensiona.", categoria: "legge", partiti_coinvolti: JSON.stringify(["Lega", "Governo Meloni"]), impatto: "alto" },
  { anno: 2024, data: "2024-11-01", titolo: "Caso Almasri — il governo libera un generale libico torturatore", descrizione: "Osama Almasri, generale libico ricercato dalla Corte Penale Internazionale per crimini contro l'umanità, viene arrestato in Italia e poi liberato e rimpatriato su un aereo di Stato. Scandalo diplomatico e politico. Meloni e Nordio sotto attacco per l'accaduto.", categoria: "scandalo", partiti_coinvolti: JSON.stringify(["Governo Meloni", "FdI"]), impatto: "alto" },
  // 2025
  { anno: 2025, data: "2025-01-20", titolo: "Trump torna al potere — effetti sulla politica italiana", descrizione: "Il ritorno di Trump alla Casa Bianca cambia gli equilibri geopolitici. Meloni è la leader europea con i migliori rapporti con Trump. L'Italia gioca un ruolo da intermediario tra USA e UE. Cresce il dibattito sull'autonomia europea sulla difesa.", categoria: "internazionale", partiti_coinvolti: JSON.stringify(["Governo Meloni"]), impatto: "alto" },
  { anno: 2025, data: "2025-03-01", titolo: "Guerra in Ucraina — pressione per la pace, posizioni divise", descrizione: "Nel 2025 cresce la pressione per un negoziato di pace in Ucraina. M5S e Lega chiedono di fermare le armi. Meloni mantiene il sostegno a Kiev. L'Europa si divide sulla strategia. L'Italia è terreno di scontro tra atlantismo (FdI/FI) e dialog (M5S/Lega).", categoria: "internazionale", partiti_coinvolti: JSON.stringify(["Governo Meloni", "M5S", "Lega"]), impatto: "alto" },
];

const insertEventi = db.transaction(() => {
  for (const e of eventi) insEvento.run(e);
});
insertEventi();
console.log(`✅ ${eventi.length} eventi inseriti`);

// ─────────────────────────────────────────────
// LEGGI STORICHE
// ─────────────────────────────────────────────
const insLegge = db.prepare(`
  INSERT INTO leggi (anno, nome, descrizione, governo, categoria, impatto)
  VALUES (@anno, @nome, @descrizione, @governo, @categoria, @impatto)
`);

const leggi = [
  { anno: 2002, nome: "Legge Bossi-Fini sull'immigrazione", descrizione: "Restringe i permessi di soggiorno, introduce il reato di immigrazione clandestina (poi depenalizzato), lega il permesso di soggiorno al contratto di lavoro. Ancora oggi base del sistema migratorio italiano.", governo: "Berlusconi II", categoria: "sicurezza", impatto: "alto" },
  { anno: 2003, nome: "Legge Biagi (D.Lgs 276/2003) — riforma del lavoro", descrizione: "Introduce nuove forme contrattuali flessibili (co.co.pro, job on call, staff leasing). Accusata di aumentare la precarietà, difesa come modernizzazione del mercato del lavoro. Marco Biagi fu ucciso dalle BR prima della sua approvazione.", governo: "Berlusconi II", categoria: "lavoro", impatto: "alto" },
  { anno: 2004, nome: "Legge Gasparri sul sistema televisivo", descrizione: "Ridisegna il sistema radiotelevisivo permettendo a Mediaset di mantenere le tre reti. Il Presidente Ciampi la rinviò alle Camere. Considerata 'ad personam' da molti giuristi.", governo: "Berlusconi II", categoria: "economia", impatto: "alto" },
  { anno: 2006, nome: "Abolizione tassa di successione e IMU", descrizione: "Il governo Prodi ripristina alcune tasse. Berlusconi aveva eliminato la tassa di successione. Il dibattito sulle tasse sulla casa torna puntualmente in ogni campagna elettorale.", governo: "Prodi II", categoria: "economia", impatto: "medio" },
  { anno: 2011, nome: "Riforma Fornero delle pensioni", descrizione: "Abolisce pensioni di anzianità, introduce sistema contributivo puro, alza età pensionabile a 67 anni. Crea 'esodati'. La riforma più impopolare degli ultimi 20 anni — ancora contestata.", governo: "Monti", categoria: "welfare", impatto: "alto" },
  { anno: 2012, nome: "Fiscal Compact — stretta sui conti pubblici", descrizione: "L'Italia aderisce al Fiscal Compact europeo: obbligo di pareggio di bilancio in Costituzione (art.81), riduzione del debito al 60% del PIL in 20 anni. Vincolo durissimo sulla spesa pubblica.", governo: "Monti", categoria: "economia", impatto: "alto" },
  { anno: 2015, nome: "Jobs Act (D.Lgs 23/2015) — riforma Renzi del lavoro", descrizione: "Abolisce l'art.18 per i nuovi assunti, introduce il contratto a tutele crescenti. CGIL contraria. Il Jobs Act è il simbolo del renzismo: riformismo liberale che divide la sinistra.", governo: "Renzi", categoria: "lavoro", impatto: "alto" },
  { anno: 2015, nome: "Legge sulle unioni civili (Cirinnà)", descrizione: "Approvata nel 2016, riconosce le coppie dello stesso sesso (ma non matrimonio). Compromesso al ribasso: la stepchild adoption fu espunta. Un passo avanti considerato insufficiente dalla comunità LGBTQ+.", governo: "Renzi", categoria: "welfare", impatto: "alto" },
  { anno: 2018, nome: "Reddito di Cittadinanza (Decreto 4/2019)", descrizione: "Misura di contrasto alla povertà: fino a 780€/mese per chi è sotto la soglia. Gestito dai Centri per l'Impiego. Costo: 7-8 miliardi/anno. Abolito dal governo Meloni nel 2023 e sostituito con l'Assegno di Inclusione.", governo: "Conte I", categoria: "welfare", impatto: "alto" },
  { anno: 2018, nome: "Quota 100 — pensione anticipata", descrizione: "Permette di andare in pensione con 62 anni di età + 38 anni di contributi. Costo: 4 miliardi/anno. Misura sperimentale, scaduta nel 2021. Poi sostituita con Quota 102, 103, 41.", governo: "Conte I", categoria: "welfare", impatto: "alto" },
  { anno: 2020, nome: "Decreto Rilancio e Superbonus 110%", descrizione: "Il Superbonus permette detrazioni al 110% per lavori di riqualificazione energetica. Boom edilizio ma costi esplosi: da 33 miliardi stimati a oltre 120 miliardi effettivi. Il più costoso bonus fiscale della storia italiana.", governo: "Conte II", categoria: "economia", impatto: "alto" },
  { anno: 2022, nome: "Abolizione del Reddito di Cittadinanza", descrizione: "Il governo Meloni abolisce il RdC sostituendolo con l'Assegno di Inclusione (solo per famiglie con minori, disabili o over 60) e il Supporto Formazione e Lavoro. Chi è in età lavorativa e sano perde il sussidio.", governo: "Meloni", categoria: "welfare", impatto: "alto" },
  { anno: 2023, nome: "Decreto Cutro — stretta sull'immigrazione", descrizione: "Dopo la strage di Cutro, il governo vara un decreto che restringe la protezione speciale e rende più difficile i ricongiungimenti familiari. Critiche da ONG e opposizione. Alcune norme dichiarate incostituzionali.", governo: "Meloni", categoria: "sicurezza", impatto: "alto" },
  { anno: 2024, nome: "Legge Calderoli sull'autonomia differenziata", descrizione: "Permette alle regioni di chiedere competenze legislative su 23 materie (scuola, sanità, infrastrutture). Il Sud teme di perdere risorse. La Corte Costituzionale ne boccia alcune parti. Referendum abrogativo in corso.", governo: "Meloni", categoria: "economia", impatto: "alto" },
  { anno: 2024, nome: "Riforma della Giustizia — separazione delle carriere", descrizione: "La riforma costituzionale separa le carriere dei magistrati giudicanti e requirenti. Prima legge di revisione costituzionale del governo Meloni. In iter parlamentare accelerato. Opposizione contraria, ANM in sciopero.", governo: "Meloni", categoria: "giustizia", impatto: "alto" },
];

const insertLeggi = db.transaction(() => {
  for (const l of leggi) insLegge.run(l);
});
insertLeggi();
console.log(`✅ ${leggi.length} leggi inserite`);

// Summary
const totGoverni = db.prepare('SELECT COUNT(*) as n FROM governi').get();
const totElezioni = db.prepare('SELECT COUNT(*) as n FROM elezioni').get();
const totEventi = db.prepare('SELECT COUNT(*) as n FROM eventi').get();
const totLeggi = db.prepare('SELECT COUNT(*) as n FROM leggi').get();

console.log('\n📊 DATABASE COMPASSO POLITICO');
console.log(`   Governi:  ${totGoverni.n}`);
console.log(`   Elezioni: ${totElezioni.n}`);
console.log(`   Eventi:   ${totEventi.n}`);
console.log(`   Leggi:    ${totLeggi.n}`);
console.log(`\n💾 DB: ${DB_PATH}`);
db.close();
