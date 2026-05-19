import express from "express";
import session from "express-session";
import { OAuth2Client } from "google-auth-library";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// In produzione (Railway) il CRM è dentro il repo: ./crm/
// I dati sono nella root del repo: ../data/, ../public/
const REPO_ROOT = path.resolve(__dirname, "..");
const DATA_DIR   = path.join(REPO_ROOT, "data", "daily");
const CAROUSEL_DIR = path.join(REPO_ROOT, "public", "carousels");
const NL_DIR     = path.join(REPO_ROOT, "data", "newsletters");

const PORT = process.env.PORT || 3002;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SESSION_SECRET   = process.env.SESSION_SECRET || "compasso-secret-change-me";
const ALLOWED_EMAILS   = (process.env.ALLOWED_EMAILS || "lormilano99@gmail.com").split(",").map(e => e.trim());
const BASE_URL         = process.env.BASE_URL || `http://localhost:${PORT}`;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: BASE_URL.startsWith("https"), maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

// ── Auth middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  res.redirect("/login");
}

// ── Login page ───────────────────────────────────────────────────────────────
app.get("/login", (req, res) => {
  if (req.session?.user) return res.redirect("/");
  res.send(`<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accedi — Compasso CRM</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #F0EFED; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #fff; border-radius: 20px; border: 1px solid #E5E5E3; padding: 48px 40px; text-align: center; width: 360px; }
    .logo-mark { width: 48px; height: 48px; background: #C41230; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
    p { font-size: 13px; color: #888; margin-bottom: 32px; }
    .g-btn-wrap { display: flex; justify-content: center; }
    .error { color: #dc2626; font-size: 13px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-mark">
      <svg width="22" height="30" viewBox="0 0 40 58" fill="none">
        <circle cx="20" cy="18" r="16" fill="white"/>
        <rect x="11" y="26" width="18" height="24" fill="white"/>
        <path d="M11 50 Q11 58 20 58 Q29 58 29 50Z" fill="white"/>
        <rect x="11" y="36" width="18" height="2.5" fill="#C41230"/>
        <rect x="11" y="43" width="18" height="2.5" fill="#C41230"/>
      </svg>
    </div>
    <h1>Compasso CRM</h1>
    <p>Accedi con il tuo account Google per continuare</p>
    <div class="g-btn-wrap">
      <div id="g_id_onload"
           data-client_id="${GOOGLE_CLIENT_ID}"
           data-callback="handleCredential"
           data-auto_prompt="false">
      </div>
      <div class="g_id_signin"
           data-type="standard"
           data-size="large"
           data-theme="outline"
           data-text="signin_with"
           data-shape="rectangular"
           data-logo_alignment="left">
      </div>
    </div>
    ${req.query.error ? `<p class="error">Accesso non autorizzato per questo account.</p>` : ""}
  </div>
  <script>
    async function handleCredential(response) {
      const res = await fetch("/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (data.ok) {
        window.location.href = "/";
      } else {
        window.location.href = "/login?error=1";
      }
    }
  </script>
</body>
</html>`);
});

// ── Google token verification ─────────────────────────────────────────────────
app.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email ?? "";
    if (!ALLOWED_EMAILS.includes(email)) {
      return res.json({ ok: false, error: "not_allowed" });
    }
    req.session.user = { email, name: payload?.name, picture: payload?.picture };
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: "invalid_token" });
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// ── Static files (protetti da auth) ──────────────────────────────────────────
app.use("/carousels", requireAuth, express.static(CAROUSEL_DIR));
app.use("/newsletters", requireAuth, express.static(NL_DIR));

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLatestDaily() {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json")).sort().reverse();
    if (!files.length) return null;
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, files[0]), "utf8"));
  } catch { return null; }
}

function getAllDailies() {
  try {
    return fs.readdirSync(DATA_DIR)
      .filter(f => f.endsWith(".json")).sort().reverse().slice(0, 7)
      .map(f => ({ file: f, date: f.replace(".json", "") }));
  } catch { return []; }
}

function hasNewsletter(dateStr) {
  try { fs.accessSync(path.join(NL_DIR, `${dateStr}.html`)); return true; } catch { return false; }
}

function hasCarousel(dateStr) {
  try { fs.accessSync(path.join(CAROUSEL_DIR, dateStr, "slide-1.png")); return true; } catch { return false; }
}

function esc(str) {
  return (str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderNews(content) {
  if (!content) return `<div class="empty">Nessun contenuto. Esegui <code>npm run oggi</code>.</div>`;
  return content.top3.map((n, i) => `
    <div class="news-item">
      <span class="news-num">${i + 1}</span>
      <div class="news-content">
        <div class="news-title">${esc(n.titolo)}</div>
        <div class="news-spieg">${esc(n.spiegazione)}</div>
        <div class="news-perche">💡 ${esc(n.perchéRilevante)}</div>
        ${n.fonteUrl && n.fonte ? `<a href="${esc(n.fonteUrl)}" target="_blank" rel="noopener" class="news-fonte">↗ ${esc(n.fonte)}</a>` : n.fonte ? `<span class="news-fonte-plain">${esc(n.fonte)}</span>` : ""}
      </div>
    </div>`).join("");
}

function renderNewsletter(content) {
  if (!content) return `<div class="empty">Nessun contenuto.</div>`;
  const dateStr = content.data;
  if (hasNewsletter(dateStr)) {
    return `<div class="nl-iframe-wrap"><iframe src="/newsletters/${dateStr}.html" class="nl-iframe" title="Newsletter ${dateStr}"></iframe></div>`;
  }
  const d = dateStr.split("-").reverse().join("/");
  return `
    <div class="nl-preview" id="nl-text">
      <div class="nl-subject">Oggetto: Compasso Politico — ${d}</div>
      <div class="nl-head">Le 3 notizie politiche di oggi</div>
      ${content.top3.map((n, i) => `
        <div class="nl-item">
          <div class="nl-item-title">${i + 1}. ${esc(n.titolo)}</div>
          <div class="nl-item-body">${esc(n.spiegazione)}</div>
          <div class="nl-item-perche">Perché conta: ${esc(n.perchéRilevante)}</div>
          ${n.fonteUrl ? `<div class="nl-item-fonte"><a href="${esc(n.fonteUrl)}" target="_blank">${esc(n.fonte ?? "Fonte")}</a></div>` : ""}
        </div>`).join("")}
      <div class="nl-recap"><div class="nl-recap-title">Recap del giorno</div><div class="nl-recap-body">${esc(content.recap)}</div></div>
      <div class="nl-footer">Compasso Politico · compassopolitico.it</div>
    </div>`;
}

function renderPostCaption(content) {
  if (!content) return `<div class="empty">Nessun contenuto.</div>`;
  const d = new Date(content.data).toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  const nums = ["1️⃣", "2️⃣", "3️⃣"];
  const news = content.top3.map((n, i) => `${nums[i]} ${esc(n.titolo)}\n${esc(n.perchéRilevante)}`).join("\n\n");
  const caption = `🗞️ Le 3 notizie politiche di oggi — ${d}\n\n${news}\n\n${esc(content.recap.split(". ").slice(0, 2).join(". "))}.\n\n📩 Newsletter gratuita → compassopolitico.it\n\n#politicaitaliana #notizie #italia #politica #attualità #governo #parlamento #news`;
  return `<pre class="post-caption" id="post-text">${caption}</pre>`;
}

function renderCarosello(content) {
  if (!content) return `<div class="empty">Nessun contenuto.</div>`;
  if (!hasCarousel(content.data)) return `<div class="no-carousel"><div style="font-size:40px;margin-bottom:10px">📱</div><div>Carosello non ancora generato.</div></div>`;
  return `
    <div class="slides-grid">
      ${[1,2,3,4,5].map(i => `
        <div class="slide-wrap ${i === 1 ? "slide-1" : ""}">
          <img src="/carousels/${content.data}/slide-${i}.png" alt="Slide ${i}" loading="lazy">
          <span class="slide-num">Slide ${i}</span>
          <a href="/carousels/${content.data}/slide-${i}.png" download="compasso-${content.data}-slide-${i}.png" class="slide-dl">↓</a>
        </div>`).join("")}
    </div>
    <p class="slides-note">1080×1080px · Clicca ↓ per scaricare ogni slide</p>`;
}

function renderSidebar(dailies, selectedDate) {
  return dailies.map(({ date }) => `
    <a href="/?date=${date}" class="sidebar-item ${date === selectedDate ? "active" : ""}">
      <span class="sidebar-date">${date}</span>
      ${hasCarousel(date) ? '<span class="sidebar-badge">📱</span>' : ""}
    </a>`).join("");
}

// ── Git pull ──────────────────────────────────────────────────────────────────
app.post("/pull", requireAuth, (req, res) => {
  try {
    const out = execSync("git pull", { cwd: REPO_ROOT, encoding: "utf8", timeout: 30000 });
    res.json({ ok: true, output: out.trim() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── Main dashboard ────────────────────────────────────────────────────────────
app.get("/", requireAuth, (req, res) => {
  const dailies = getAllDailies();
  const selectedDate = req.query.date ?? (dailies[0]?.date ?? "");
  let content = null;
  if (selectedDate) {
    try { content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${selectedDate}.json`), "utf8")); } catch {}
  }
  const user = req.session.user;

  res.send(`<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compasso CRM</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #F0EFED; color: #111; min-height: 100vh; display: flex; flex-direction: column; }
    .header { background: #111; color: #fff; padding: 0 24px; height: 52px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .pull-btn { font-size: 12px; font-weight: 700; background: #222; color: #aaa; border: 1px solid #333; padding: 5px 14px; border-radius: 7px; cursor: pointer; font-family: inherit; transition: all 150ms; }
    .pull-btn:hover { background: #2a2a2a; color: #fff; border-color: #555; }
    .pull-btn.loading { color: #666; cursor: default; }
    .pull-btn.success { border-color: #22c55e; color: #22c55e; }
    .pull-btn.error { border-color: #ef4444; color: #ef4444; }
    .header-logo { display: flex; align-items: center; gap: 8px; }
    .logo-mark { width: 26px; height: 26px; background: #C41230; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .header-title { font-size: 14px; font-weight: 700; }
    .header-sub { font-size: 12px; color: #666; margin-left: 4px; }
    .header-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
    .user-pill { display: flex; align-items: center; gap: 7px; }
    .user-avatar { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 1px solid #333; }
    .user-name { font-size: 12px; color: #888; }
    .logout-btn { font-size: 11px; color: #555; text-decoration: none; padding: 4px 10px; border: 1px solid #333; border-radius: 6px; }
    .logout-btn:hover { color: #aaa; border-color: #555; }
    .body { display: flex; flex: 1; overflow: hidden; }
    .sidebar { width: 180px; flex-shrink: 0; background: #1A1A1A; padding: 16px 12px; overflow-y: auto; }
    .sidebar-label { font-size: 10px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; padding: 0 6px; }
    .sidebar-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 8px; text-decoration: none; color: #aaa; font-size: 12px; margin-bottom: 3px; transition: background 150ms; }
    .sidebar-item:hover { background: #2A2A2A; color: #fff; }
    .sidebar-item.active { background: #C41230; color: #fff; }
    .sidebar-date { font-weight: 600; }
    .sidebar-badge { font-size: 10px; }
    .main { flex: 1; overflow-y: auto; padding: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
    .block { background: #fff; border-radius: 14px; border: 1px solid #E5E5E3; overflow: hidden; display: flex; flex-direction: column; }
    .block-header { padding: 16px 20px 14px; border-bottom: 1px solid #F0F0EE; display: flex; align-items: center; gap: 8px; }
    .block-icon { font-size: 16px; }
    .block-title { font-size: 14px; font-weight: 700; flex: 1; }
    .block-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; background: #F0F0EE; color: #777; text-transform: uppercase; letter-spacing: 0.08em; }
    .block-action { font-size: 11px; font-weight: 600; background: #111; color: #fff; border: none; padding: 5px 12px; border-radius: 7px; cursor: pointer; font-family: inherit; text-decoration: none; }
    .block-action:hover { background: #333; }
    .block-body { padding: 16px 20px; flex: 1; overflow-y: auto; max-height: 580px; }
    .news-item { padding: 14px 0; border-bottom: 1px solid #F5F5F3; display: flex; gap: 12px; }
    .news-item:last-child { border-bottom: none; padding-bottom: 0; }
    .news-num { font-size: 22px; font-weight: 800; color: #C41230; line-height: 1.1; flex-shrink: 0; }
    .news-content { flex: 1; min-width: 0; }
    .news-title { font-size: 13px; font-weight: 700; line-height: 1.4; margin-bottom: 5px; }
    .news-spieg { font-size: 12px; color: #666; line-height: 1.55; margin-bottom: 7px; }
    .news-perche { font-size: 11px; background: #F5F4F2; color: #555; padding: 7px 10px; border-radius: 7px; line-height: 1.5; margin-bottom: 7px; }
    .news-fonte { font-size: 11px; color: #C41230; font-weight: 600; text-decoration: none; }
    .news-fonte:hover { text-decoration: underline; }
    .news-fonte-plain { font-size: 11px; color: #999; }
    .nl-iframe-wrap { border-radius: 10px; overflow: hidden; border: 1px solid #E8E8E6; background: #fff; height: 530px; }
    .nl-iframe { width: 200%; height: 200%; border: none; transform: scale(0.5); transform-origin: top left; display: block; }
    .nl-preview { background: #FAF9F7; border-radius: 10px; padding: 18px; border: 1px solid #E8E8E6; font-size: 12px; }
    .nl-subject { color: #888; margin-bottom: 5px; }
    .nl-head { font-size: 15px; font-weight: 800; color: #C41230; padding-bottom: 10px; border-bottom: 2px solid #C41230; margin-bottom: 14px; }
    .nl-item { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #EBEBEB; }
    .nl-item-title { font-weight: 700; margin-bottom: 4px; font-size: 12px; }
    .nl-item-body { color: #555; line-height: 1.55; margin-bottom: 4px; }
    .nl-item-perche { color: #888; font-style: italic; margin-bottom: 4px; }
    .nl-item-fonte a { color: #C41230; text-decoration: none; font-weight: 600; font-size: 11px; }
    .nl-recap { background: #F0EFED; border-radius: 8px; padding: 12px; margin-top: 14px; }
    .nl-recap-title { font-weight: 700; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #888; }
    .nl-recap-body { color: #555; line-height: 1.6; font-size: 11px; }
    .nl-footer { text-align: center; color: #bbb; font-size: 10px; margin-top: 14px; padding-top: 10px; border-top: 1px solid #E8E8E6; }
    .slides-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .slide-1 { grid-column: 1 / -1; }
    .slide-wrap { position: relative; border-radius: 10px; overflow: hidden; border: 1px solid #E5E5E3; aspect-ratio: 1; background: #F0EFED; }
    .slide-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .slide-num { position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.55); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
    .slide-dl { position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.55); color: #fff; font-size: 13px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-decoration: none; }
    .slide-dl:hover { background: rgba(0,0,0,0.85); }
    .slides-note { font-size: 11px; color: #bbb; margin-top: 10px; }
    .no-carousel { text-align: center; padding: 48px 20px; color: #bbb; }
    .empty { text-align: center; padding: 48px 20px; color: #bbb; font-size: 13px; }
    .empty code { background: #F0F0EE; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
    .post-block { background: #fff; border-radius: 14px; border: 1px solid #E5E5E3; margin-top: 20px; overflow: hidden; }
    .post-caption { font-family: -apple-system, sans-serif; font-size: 13px; line-height: 1.75; color: #111; white-space: pre-wrap; padding: 18px 20px; background: #FAFAF9; border-radius: 10px; border: 1px solid #EBEBEB; cursor: text; user-select: all; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-logo">
      <div class="logo-mark">
        <svg width="14" height="20" viewBox="0 0 40 58" fill="none">
          <circle cx="20" cy="18" r="16" fill="white"/>
          <rect x="11" y="26" width="18" height="24" fill="white"/>
          <path d="M11 50 Q11 58 20 58 Q29 58 29 50Z" fill="white"/>
          <rect x="11" y="36" width="18" height="2.5" fill="#C41230"/>
          <rect x="11" y="43" width="18" height="2.5" fill="#C41230"/>
        </svg>
      </div>
      <span class="header-title">Compasso Politico</span>
      <span class="header-sub">CRM</span>
    </div>
    <div class="header-right">
      <button class="pull-btn" id="pullBtn" onclick="doPull()">↓ Aggiorna dati</button>
      <div class="user-pill">
        ${user.picture ? `<img src="${esc(user.picture)}" class="user-avatar" alt="">` : ""}
        <span class="user-name">${esc(user.name ?? user.email)}</span>
      </div>
      <a href="/logout" class="logout-btn">Esci</a>
    </div>
  </div>

  <div class="body">
    <nav class="sidebar">
      <div class="sidebar-label">Archivio</div>
      ${renderSidebar(dailies, selectedDate)}
    </nav>

    <div class="main">
      <div class="grid">
        <div class="block">
          <div class="block-header">
            <span class="block-icon">🔥</span>
            <span class="block-title">Oggi</span>
            <span class="block-badge">${selectedDate || "—"}</span>
          </div>
          <div class="block-body">${renderNews(content)}</div>
        </div>

        <div class="block">
          <div class="block-header">
            <span class="block-icon">📧</span>
            <span class="block-title">Newsletter</span>
            ${content && hasNewsletter(content.data)
              ? `<a href="/newsletters/${content.data}.html" target="_blank" class="block-action">Apri HTML</a>`
              : `<button class="block-action" onclick="copyNL()">Copia</button>`}
          </div>
          <div class="block-body">${renderNewsletter(content)}</div>
        </div>

        <div class="block">
          <div class="block-header">
            <span class="block-icon">📱</span>
            <span class="block-title">Carosello</span>
            <span class="block-badge">Instagram</span>
          </div>
          <div class="block-body">${renderCarosello(content)}</div>
        </div>
      </div>

      <div class="post-block">
        <div class="block-header">
          <span class="block-icon">📸</span>
          <span class="block-title">Descrizione post Instagram</span>
          <button class="block-action" onclick="copyPost()">Copia</button>
        </div>
        <div class="block-body" style="max-height:none;">${renderPostCaption(content)}</div>
      </div>
    </div>
  </div>

  <script>
    function copyNL() {
      const el = document.getElementById("nl-text");
      if (!el) return;
      navigator.clipboard.writeText(el.innerText).then(() => {
        const btn = document.querySelector(".block-action");
        const orig = btn.textContent; btn.textContent = "Copiato!";
        setTimeout(() => btn.textContent = orig, 2000);
      });
    }
    function copyPost() {
      const el = document.getElementById("post-text");
      if (!el) return;
      navigator.clipboard.writeText(el.innerText).then(() => {
        const btns = document.querySelectorAll(".block-action");
        const btn = btns[btns.length - 1];
        const orig = btn.textContent; btn.textContent = "Copiato!";
        setTimeout(() => btn.textContent = orig, 2000);
      });
    }
    async function doPull() {
      const btn = document.getElementById("pullBtn");
      btn.className = "pull-btn loading"; btn.textContent = "⏳ Aggiornando...";
      try {
        const res = await fetch("/pull", { method: "POST" });
        const data = await res.json();
        if (data.ok) {
          btn.className = "pull-btn success"; btn.textContent = "✓ Aggiornato";
          setTimeout(() => location.reload(), 800);
        } else {
          btn.className = "pull-btn error"; btn.textContent = "✗ Errore";
          setTimeout(() => { btn.className = "pull-btn"; btn.textContent = "↓ Aggiorna dati"; }, 3000);
        }
      } catch {
        btn.className = "pull-btn error"; btn.textContent = "✗ Errore";
        setTimeout(() => { btn.className = "pull-btn"; btn.textContent = "↓ Aggiorna dati"; }, 3000);
      }
    }
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`\n🧭 Compasso CRM — ${BASE_URL}\n`);
});
