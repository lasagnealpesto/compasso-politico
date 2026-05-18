@AGENTS.md

# Compasso Politico — Regole di progetto

## Brand & stile di comunicazione
Rispetta sempre le regole del brand guide (`brand-guide.html`).

### Colori
- Rosso accent: `#C41230` (var: `--accent`)
- Testo principale: `#111111`
- Muted: `#777777`
- Superficie: `#F5F4F2`

### Font
Inter — unico font per titoli e corpo. Nessun altro font.

### Regole di scrittura (obbligatorie per ogni contenuto generato)
1. Giornalista, non commentatore — fatti secchi, zero opinioni
2. **Bullet point e schemi sempre** — 3+ elementi = lista, mai prosa
3. Frasi max 20 parole
4. **Vietato il trattino em (—)** — usa virgola o punto
5. Il "perché conta" è obbligatorio in ogni notizia
6. Gergo sempre spiegato subito dopo
7. Titoli: max 8 parole, fatto diretto (no clickbait)

### Struttura notizia standard
- Titolo (max 8 parole)
- Spiegazione (2-3 frasi brevi)
- Perché conta (1 frase)
- Fonte (testata + link)

## Automazioni chiave
- `npm run oggi` — genera `data/daily/YYYY-MM-DD.json` via RSS + Claude API
- `npm run carosello` — genera 5 slide PNG 1080×1080 in `public/carousels/YYYY-MM-DD/`
- GitHub Actions cron 07:00 (05:00 UTC) — esegue entrambi e committa

## Stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4
- better-sqlite3 per lettura dati statici (usato solo a build time → SSG)
- Supabase per newsletter subscribers
- Satori + @resvg/resvg-js per generazione PNG carosello
