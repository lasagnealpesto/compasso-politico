/**
 * Invia la newsletter giornaliera via MailerLite.
 * Salva sempre l'HTML in data/newsletters/YYYY-MM-DD.html (preview nel CRM).
 *
 * Variabili necessarie (.env.local + GitHub Secrets):
 *   MAILERLITE_API_KEY   — da app.mailerlite.com > Integrations > API
 *   MAILERLITE_GROUP_ID  — ID del gruppo iscritti in MailerLite
 */

import { readFile, readdir, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// ──────────────────── Config ────────────────────

const MAILERLITE_API_KEY  = process.env.MAILERLITE_API_KEY ?? "";
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID ?? "";
const FROM_EMAIL          = "newsletter@compassopolitico.it";
const FROM_NAME           = "Compasso Politico";
const SITE_URL            = "https://compassopolitico.it";

// ──────────────────── Leggi daily JSON ────────────────────

async function getLatestContent() {
  const dir = path.join(ROOT, "data", "daily");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort().reverse();
  if (!files.length) throw new Error("Nessun file daily trovato. Esegui prima: npm run oggi");
  return JSON.parse(await readFile(path.join(dir, files[0]), "utf-8"));
}

// ──────────────────── HTML email ────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function esc(s) {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildEmailHtml(content) {
  const dataFmt = formatDate(content.data);

  const newsHtml = content.top3.map((n, i) => `
    <tr>
      <td style="padding:24px 32px 20px;border-bottom:1px solid #F0EFED;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="40" valign="top" style="font-size:30px;font-weight:800;color:#C41230;line-height:1;padding-right:14px;">${i + 1}</td>
            <td valign="top">
              <div style="font-size:17px;font-weight:700;color:#111111;line-height:1.35;margin-bottom:8px;">${esc(n.titolo)}</div>
              <div style="font-size:14px;color:#555555;line-height:1.65;margin-bottom:10px;">${esc(n.spiegazione)}</div>
              <div style="background:#F5F4F2;border-radius:8px;padding:10px 14px;font-size:13px;color:#444444;line-height:1.55;margin-bottom:10px;">
                💡 ${esc(n.perchéRilevante)}
              </div>
              ${n.fonteUrl && n.fonte
                ? `<a href="${esc(n.fonteUrl)}" style="font-size:12px;color:#C41230;font-weight:600;text-decoration:none;">↗ ${esc(n.fonte)}</a>`
                : n.fonte ? `<span style="font-size:12px;color:#999;">${esc(n.fonte)}</span>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compasso Politico — ${dataFmt}</title>
</head>
<body style="margin:0;padding:0;background:#F5F4F2;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:none;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F2;padding:24px 0 48px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">

          <!-- Header rosso -->
          <tr>
            <td style="background:#C41230;padding:22px 32px;text-align:center;">
              <span style="color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.22em;">COMPASSO POLITICO</span>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:28px 32px 8px;">
              <div style="font-size:12px;color:#999999;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em;">${dataFmt}</div>
              <h1 style="margin:0 0 14px;font-size:22px;font-weight:700;color:#111111;line-height:1.3;">Le 3 notizie politiche di oggi</h1>
              <div style="width:40px;height:3px;background:#C41230;border-radius:2px;"></div>
            </td>
          </tr>

          <!-- Notizie -->
          ${newsHtml}

          <!-- Recap -->
          <tr>
            <td style="padding:24px 32px;">
              <div style="background:#F5F4F2;border-radius:12px;padding:20px 24px;">
                <div style="font-size:11px;font-weight:700;color:#999999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">Recap del giorno</div>
                <div style="font-size:14px;color:#444444;line-height:1.7;">${esc(content.recap)}</div>
              </div>
            </td>
          </tr>

          <!-- CTA sito -->
          <tr>
            <td style="padding:0 32px 24px;text-align:center;">
              <a href="${SITE_URL}/oggi"
                 style="display:inline-block;background:#C41230;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;">
                Leggi sul sito →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F5F4F2;padding:20px 32px;border-top:1px solid #E8E8E6;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:11px;color:#aaaaaa;line-height:1.6;">
                    <strong style="color:#777777;">Compasso Politico</strong><br>
                    La politica italiana spiegata bene.<br>
                    <a href="${SITE_URL}" style="color:#C41230;text-decoration:none;">${SITE_URL}</a>
                  </td>
                  <td align="right" style="font-size:11px;color:#bbbbbb;">
                    <a href="{$unsubscribe}" style="color:#bbbbbb;text-decoration:underline;">Disiscrivi</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ──────────────────── Invia via MailerLite ────────────────────

async function sendNewsletter(content, html) {
  if (!MAILERLITE_API_KEY || MAILERLITE_API_KEY === "your_api_key_here") {
    console.warn("⚠  MAILERLITE_API_KEY non configurato — salvo solo HTML, non invio.");
    return;
  }
  if (!MAILERLITE_GROUP_ID) {
    console.warn("⚠  MAILERLITE_GROUP_ID non configurato — salvo solo HTML, non invio.");
    return;
  }

  const d = content.data.split("-").reverse().join("/");
  const subject = `${d} — Le 3 notizie politiche di oggi`;

  const headers = {
    "Authorization": `Bearer ${MAILERLITE_API_KEY}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  // 1. Crea campagna
  console.log("   Creando campagna...");
  const createRes = await fetch("https://connect.mailerlite.com/api/campaigns", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: `Compasso Politico — ${content.data}`,
      type: "regular",
      emails: [{
        subject,
        from: FROM_EMAIL,
        from_name: FROM_NAME,
        content: html,
      }],
      groups: [MAILERLITE_GROUP_ID],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Errore creazione campagna MailerLite: ${err}`);
  }

  const { data: campaign } = await createRes.json();
  console.log(`   Campagna creata: ID ${campaign.id}`);

  // 2. Invia subito
  console.log("   Inviando...");
  const sendRes = await fetch(
    `https://connect.mailerlite.com/api/campaigns/${campaign.id}/actions/send`,
    { method: "POST", headers }
  );

  if (!sendRes.ok) {
    const err = await sendRes.text();
    throw new Error(`Errore invio campagna MailerLite: ${err}`);
  }

  console.log(`   Newsletter inviata al gruppo ${MAILERLITE_GROUP_ID}`);
}

// ──────────────────── Main ────────────────────

async function main() {
  console.log("📧 Compasso Politico — Newsletter");
  console.log(`📅 ${new Date().toISOString()}\n`);

  // 1. Leggi contenuto
  const content = await getLatestContent();
  console.log(`📰 Contenuto: ${content.data} (${content.top3.length} notizie)`);

  // 2. Genera HTML
  const html = buildEmailHtml(content);

  // 3. Salva HTML (sempre — anche se l'invio fallisce)
  const nlDir = path.join(ROOT, "data", "newsletters");
  await mkdir(nlDir, { recursive: true });
  const htmlPath = path.join(nlDir, `${content.data}.html`);
  await writeFile(htmlPath, html, "utf-8");
  console.log(`💾 HTML salvato: data/newsletters/${content.data}.html`);

  // 4. Invia — non bloccante: se fallisce logga ma non crasha
  console.log("\n📤 Invio newsletter via MailerLite...");
  try {
    await sendNewsletter(content, html);
  } catch (err) {
    console.warn(`⚠  Invio fallito: ${err.message}`);
    console.warn("   L'HTML è salvato — puoi inviarlo manualmente da MailerLite.");
  }

  console.log(`\n✅ Completato — HTML: data/newsletters/${content.data}.html`);
}

main().catch((err) => {
  console.error("❌ Errore fatale:", err.message);
  process.exit(1);
});
