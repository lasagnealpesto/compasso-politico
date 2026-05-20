import express from "express";
import session from "express-session";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT    = path.resolve(__dirname, "..");
const DATA_DIR     = path.join(REPO_ROOT, "data", "daily");
const CAROUSEL_DIR = path.join(REPO_ROOT, "public", "carousels");
const NL_DIR       = path.join(REPO_ROOT, "data", "newsletters");

const PORT           = process.env.PORT || 3002;
const ADMIN_USER     = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin99";
const SESSION_SECRET = process.env.SESSION_SECRET || "compasso-crm-secret";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

function requireAuth(req, res, next) {
  if (req.session?.loggedIn) return next();
  res.redirect("/login");
}

// ── Login ─────────────────────────────────────────────────────────────────────
app.get("/login", (req, res) => {
  if (req.session?.loggedIn) return res.redirect("/");
  const err = req.query.error;
  res.send(`<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accedi — Compasso CRM</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #F0EFED; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #fff; border-radius: 20px; border: 1px solid #E5E5E3; padding: 48px 40px; width: 360px; }
    .logo-wrap { display: flex; justify-content: center; margin-bottom: 24px; }
    .logo-mark { width: 52px; height: 52px; background: #C41230; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    h1 { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 4px; }
    .sub { font-size: 13px; color: #888; text-align: center; margin-bottom: 32px; }
    label { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px; }
    input { width: 100%; border: 1.5px solid #E0E0DE; border-radius: 10px; padding: 11px 14px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 150ms; margin-bottom: 16px; }
    input:focus { border-color: #C41230; }
    button[type=submit] { width: 100%; background: #111; color: #fff; border: none; border-radius: 10px; padding: 13px; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; transition: background 150ms; }
    button[type=submit]:hover { background: #333; }
    .error { background: #fee2e2; color: #dc2626; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-wrap">
      <div class="logo-mark">
        <svg width="24" height="34" viewBox="0 0 40 58" fill="none">
          <circle cx="20" cy="18" r="16" fill="white"/>
          <rect x="11" y="26" width="18" height="24" fill="white"/>
          <path d="M11 50 Q11 58 20 58 Q29 58 29 50Z" fill="white"/>
          <rect x="11" y="36" width="18" height="2.5" fill="#C41230"/>
          <rect x="11" y="43" width="18" height="2.5" fill="#C41230"/>
        </svg>
      </div>
    </div>
    <h1>Compasso CRM</h1>
    <p class="sub">Accedi per continuare</p>
    ${err ? `<div class="error">Credenziali non corrette. Riprova.</div>` : ""}
    <form method="POST" action="/login">
      <label for="username">Utente</label>
      <input type="text" id="username" name="username" autocomplete="username" required>
      <label for="password">Password</label>
      <input type="password" id="password" name="password" autocomplete="current-password" required>
      <button type="submit">Accedi</button>
    </form>
  </div>
</body>
</html>`);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.redirect("/");
  } else {
    res.redirect("/login?error=1");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// ── Static (protetti) ─────────────────────────────────────────────────────────
app.use("/carousels",   requireAuth, express.static(CAROUSEL_DIR));
app.use("/newsletters", requireAuth, express.static(NL_DIR));

// ── Helpers ───────────────────────────────────────────────────────────────────
function getAllDailies() {
  try {
    return fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json")).sort().reverse().slice(0, 7)
      .map(f => ({ date: f.replace(".json", "") }));
  } catch { return []; }
}

function hasNewsletter(d) { try { fs.accessSync(path.join(NL_DIR, `${d}.html`)); return true; } catch { return false; } }
function hasCarousel(d)   { try { fs.accessSync(path.join(CAROUSEL_DIR, d, "slide-1.png")); return true; } catch { return false; } }

function esc(s) {
  return (s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function renderNews(c) {
  if (!c) return `<div class="empty">Nessun contenuto. Esegui <code>npm run oggi</code>.</div>`;
  return c.top3.map((n, i) => `
    <div class="news-item">
      <span class="news-num">${i+1}</span>
      <div class="news-body">
        <div class="news-title">${esc(n.titolo)}</div>
        <div class="news-spieg">${esc(n.spiegazione)}</div>
        <div class="news-perche">💡 ${esc(n.perchéRilevante)}</div>
        ${n.fonteUrl ? `<a href="${esc(n.fonteUrl)}" target="_blank" class="news-fonte">↗ ${esc(n.fonte)}</a>` : ""}
      </div>
    </div>`).join("");
}

function renderNewsletter(c) {
  if (!c) return `<div class="empty">Nessun contenuto.</div>`;
  if (hasNewsletter(c.data)) return `<div class="nl-frame"><iframe src="/newsletters/${c.data}.html" class="nl-iframe"></iframe></div>`;
  return `<div class="nl-text" id="nl-text">
    <div class="nl-subject">Oggetto: Compasso Politico — ${c.data.split("-").reverse().join("/")}</div>
    <div class="nl-head">Le 3 notizie politiche di oggi</div>
    ${c.top3.map((n,i) => `
      <div class="nl-item">
        <div class="nl-item-title">${i+1}. ${esc(n.titolo)}</div>
        <div class="nl-item-body">${esc(n.spiegazione)}</div>
        <div class="nl-item-perche">Perché conta: ${esc(n.perchéRilevante)}</div>
        ${n.fonteUrl ? `<a href="${esc(n.fonteUrl)}" target="_blank">${esc(n.fonte??'Fonte')}</a>` : ""}
      </div>`).join("")}
    <div class="nl-recap"><b>Recap</b><br>${esc(c.recap)}</div>
  </div>`;
}

function renderCarosello(c) {
  if (!c) return `<div class="empty">Nessun contenuto.</div>`;
  if (!hasCarousel(c.data)) return `<div class="empty">📱 Carosello non generato.<br><small>Esegui <code>npm run carosello</code></small></div>`;
  return `<div class="slides-grid">${[1,2,3,4,5].map(i => `
    <div class="slide-wrap${i===1?' slide-1':''}">
      <img src="/carousels/${c.data}/slide-${i}.png" alt="Slide ${i}" loading="lazy">
      <span class="slide-num">Slide ${i}</span>
      <a href="/carousels/${c.data}/slide-${i}.png" download class="slide-dl">↓</a>
    </div>`).join("")}</div>
  <p class="slides-note">1080×1080px · ↓ per scaricare</p>`;
}

function renderCaption(c) {
  if (!c) return `<div class="empty">Nessun contenuto.</div>`;
  const d = new Date(c.data).toLocaleDateString("it-IT", {day:"numeric",month:"long"});
  const nums = ["1️⃣","2️⃣","3️⃣"];
  const body = c.top3.map((n,i) => `${nums[i]} ${esc(n.titolo)}\n${esc(n.perchéRilevante)}`).join("\n\n");
  const text = `🗞️ Le 3 notizie politiche di oggi — ${d}\n\n${body}\n\n${esc(c.recap.split(". ").slice(0,2).join(". "))}.\n\n📩 Newsletter gratuita → compassopolitico.it\n\n#politicaitaliana #notizie #italia #politica #attualità #governo #parlamento #news`;
  return `<pre class="caption" id="post-text">${text}</pre>`;
}

function sidebar(dailies, sel) {
  return dailies.map(({date}) => `
    <a href="/?date=${date}" class="sid-item${date===sel?' active':''}">
      <span>${date}</span>
      ${hasCarousel(date)?'<span class="sid-badge">📱</span>':""}
    </a>`).join("");
}

// ── Git pull ──────────────────────────────────────────────────────────────────
app.post("/pull", requireAuth, (req, res) => {
  try {
    const out = execSync("git pull", { cwd: REPO_ROOT, encoding: "utf8", timeout: 30000 });
    res.json({ ok: true, output: out.trim() });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
app.get("/", requireAuth, (req, res) => {
  const dailies = getAllDailies();
  const sel = String(req.query.date ?? dailies[0]?.date ?? "");
  let content = null;
  if (sel) { try { content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${sel}.json`), "utf8")); } catch {} }

  res.send(`<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Compasso CRM</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#F0EFED;color:#111;min-height:100vh;display:flex;flex-direction:column}
    /* header */
    .hdr{background:#111;color:#fff;padding:0 24px;height:52px;display:flex;align-items:center;gap:10px;flex-shrink:0}
    .hdr-logo{width:26px;height:26px;background:#C41230;border-radius:6px;display:flex;align-items:center;justify-content:center}
    .hdr-title{font-size:14px;font-weight:700}
    .hdr-sub{font-size:12px;color:#555}
    .hdr-right{margin-left:auto;display:flex;align-items:center;gap:10px}
    .pull-btn{font-size:12px;font-weight:700;background:#222;color:#aaa;border:1px solid #333;padding:5px 14px;border-radius:7px;cursor:pointer;font-family:inherit;transition:all 150ms}
    .pull-btn:hover{background:#2a2a2a;color:#fff;border-color:#555}
    .pull-btn.ok{border-color:#22c55e;color:#22c55e}
    .pull-btn.err{border-color:#ef4444;color:#ef4444}
    .logout{font-size:11px;color:#555;text-decoration:none;padding:4px 10px;border:1px solid #333;border-radius:6px}
    .logout:hover{color:#aaa;border-color:#555}
    /* layout */
    .body{display:flex;flex:1;overflow:hidden}
    /* sidebar */
    .sid{width:175px;flex-shrink:0;background:#1A1A1A;padding:14px 10px;overflow-y:auto}
    .sid-label{font-size:10px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:.12em;margin-bottom:10px;padding:0 6px}
    .sid-item{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-radius:8px;text-decoration:none;color:#aaa;font-size:12px;font-weight:600;margin-bottom:3px;transition:background 150ms}
    .sid-item:hover{background:#2A2A2A;color:#fff}
    .sid-item.active{background:#C41230;color:#fff}
    .sid-badge{font-size:10px}
    /* main */
    .main{flex:1;overflow-y:auto;padding:24px}
    .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
    /* block */
    .block{background:#fff;border-radius:14px;border:1px solid #E5E5E3;overflow:hidden;display:flex;flex-direction:column}
    .blk-hdr{padding:14px 18px;border-bottom:1px solid #F0F0EE;display:flex;align-items:center;gap:8px}
    .blk-icon{font-size:15px}
    .blk-title{font-size:14px;font-weight:700;flex:1}
    .blk-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:#F0F0EE;color:#777;text-transform:uppercase;letter-spacing:.08em}
    .blk-action{font-size:11px;font-weight:600;background:#111;color:#fff;border:none;padding:5px 12px;border-radius:7px;cursor:pointer;font-family:inherit;text-decoration:none}
    .blk-action:hover{background:#333}
    .blk-body{padding:16px 18px;flex:1;overflow-y:auto;max-height:580px}
    /* news */
    .news-item{padding:12px 0;border-bottom:1px solid #F5F5F3;display:flex;gap:10px}
    .news-item:last-child{border-bottom:none;padding-bottom:0}
    .news-num{font-size:22px;font-weight:800;color:#C41230;line-height:1.1;flex-shrink:0}
    .news-body{flex:1;min-width:0}
    .news-title{font-size:13px;font-weight:700;line-height:1.4;margin-bottom:4px}
    .news-spieg{font-size:12px;color:#666;line-height:1.55;margin-bottom:6px}
    .news-perche{font-size:11px;background:#F5F4F2;color:#555;padding:7px 10px;border-radius:7px;line-height:1.5;margin-bottom:6px}
    .news-fonte{font-size:11px;color:#C41230;font-weight:600;text-decoration:none}
    .news-fonte:hover{text-decoration:underline}
    /* newsletter */
    .nl-frame{border-radius:10px;overflow:hidden;border:1px solid #E8E8E6;height:530px}
    .nl-iframe{width:200%;height:200%;border:none;transform:scale(.5);transform-origin:top left;display:block}
    .nl-text{background:#FAF9F7;border-radius:10px;padding:16px;border:1px solid #E8E8E6;font-size:12px}
    .nl-subject{color:#888;margin-bottom:4px}
    .nl-head{font-size:14px;font-weight:800;color:#C41230;padding-bottom:8px;border-bottom:2px solid #C41230;margin-bottom:12px}
    .nl-item{margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #EBEBEB}
    .nl-item-title{font-weight:700;margin-bottom:3px}
    .nl-item-body{color:#555;line-height:1.5;margin-bottom:3px}
    .nl-item-perche{color:#888;font-style:italic;font-size:11px}
    .nl-recap{background:#F0EFED;border-radius:8px;padding:10px;margin-top:12px;font-size:11px;color:#555;line-height:1.6}
    /* carosello */
    .slides-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .slide-1{grid-column:1/-1}
    .slide-wrap{position:relative;border-radius:10px;overflow:hidden;border:1px solid #E5E5E3;aspect-ratio:1;background:#F0EFED}
    .slide-wrap img{width:100%;height:100%;object-fit:cover;display:block}
    .slide-num{position:absolute;top:6px;left:6px;background:rgba(0,0,0,.55);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px}
    .slide-dl{position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,.55);color:#fff;font-size:13px;font-weight:700;padding:3px 8px;border-radius:6px;text-decoration:none}
    .slide-dl:hover{background:rgba(0,0,0,.85)}
    .slides-note{font-size:11px;color:#bbb;margin-top:8px}
    /* caption */
    .post-block{background:#fff;border-radius:14px;border:1px solid #E5E5E3;margin-top:20px;overflow:hidden}
    .caption{font-family:-apple-system,sans-serif;font-size:13px;line-height:1.75;white-space:pre-wrap;padding:18px;background:#FAFAF9;border-radius:10px;border:1px solid #EBEBEB;user-select:all}
    .empty{text-align:center;padding:48px 20px;color:#bbb;font-size:13px;line-height:1.8}
    .empty code{background:#F0F0EE;padding:2px 6px;border-radius:4px;font-size:12px}
  </style>
</head>
<body>
<div class="hdr">
  <div class="hdr-logo">
    <svg width="14" height="20" viewBox="0 0 40 58" fill="none">
      <circle cx="20" cy="18" r="16" fill="white"/>
      <rect x="11" y="26" width="18" height="24" fill="white"/>
      <path d="M11 50 Q11 58 20 58 Q29 58 29 50Z" fill="white"/>
      <rect x="11" y="36" width="18" height="2.5" fill="#C41230"/>
      <rect x="11" y="43" width="18" height="2.5" fill="#C41230"/>
    </svg>
  </div>
  <span class="hdr-title">Compasso Politico</span>
  <span class="hdr-sub">CRM</span>
  <div class="hdr-right">
    <button class="pull-btn" id="pullBtn" onclick="doPull()">↓ Aggiorna dati</button>
    <a href="/logout" class="logout">Esci</a>
  </div>
</div>

<div class="body">
  <nav class="sid">
    <div class="sid-label">Archivio</div>
    ${sidebar(dailies, sel)}
  </nav>
  <div class="main">
    <div class="grid">

      <div class="block">
        <div class="blk-hdr">
          <span class="blk-icon">🔥</span>
          <span class="blk-title">Oggi</span>
          <span class="blk-badge">${sel||"—"}</span>
        </div>
        <div class="blk-body">${renderNews(content)}</div>
      </div>

      <div class="block">
        <div class="blk-hdr">
          <span class="blk-icon">📧</span>
          <span class="blk-title">Newsletter</span>
          ${content && hasNewsletter(content.data)
            ? `<a href="/newsletters/${content.data}.html" target="_blank" class="blk-action">Apri HTML</a>`
            : `<button class="blk-action" onclick="copyNL()">Copia</button>`}
        </div>
        <div class="blk-body">${renderNewsletter(content)}</div>
      </div>

      <div class="block">
        <div class="blk-hdr">
          <span class="blk-icon">📱</span>
          <span class="blk-title">Carosello</span>
          <span class="blk-badge">Instagram</span>
        </div>
        <div class="blk-body">${renderCarosello(content)}</div>
      </div>

    </div>

    <div class="post-block">
      <div class="blk-hdr">
        <span class="blk-icon">📸</span>
        <span class="blk-title">Descrizione post Instagram</span>
        <button class="blk-action" onclick="copyPost()">Copia</button>
      </div>
      <div class="blk-body" style="max-height:none">${renderCaption(content)}</div>
    </div>
  </div>
</div>

<script>
  function copyNL(){
    const el=document.getElementById('nl-text');
    if(!el)return;
    navigator.clipboard.writeText(el.innerText).then(()=>{
      const btn=document.querySelector('.blk-action');
      const o=btn.textContent;btn.textContent='Copiato!';setTimeout(()=>btn.textContent=o,2000);
    });
  }
  function copyPost(){
    const el=document.getElementById('post-text');
    if(!el)return;
    navigator.clipboard.writeText(el.innerText).then(()=>{
      const btns=document.querySelectorAll('.blk-action');
      const btn=btns[btns.length-1];const o=btn.textContent;btn.textContent='Copiato!';setTimeout(()=>btn.textContent=o,2000);
    });
  }
  async function doPull(){
    const btn=document.getElementById('pullBtn');
    btn.className='pull-btn';btn.textContent='⏳ Aggiornando...';
    try{
      const r=await fetch('/pull',{method:'POST'});
      const d=await r.json();
      if(d.ok){btn.className='pull-btn ok';btn.textContent='✓ Aggiornato';setTimeout(()=>location.reload(),800);}
      else{btn.className='pull-btn err';btn.textContent='✗ Errore';setTimeout(()=>{btn.className='pull-btn';btn.textContent='↓ Aggiorna dati';},3000);}
    }catch{btn.className='pull-btn err';btn.textContent='✗ Errore';setTimeout(()=>{btn.className='pull-btn';btn.textContent='↓ Aggiorna dati';},3000);}
  }
</script>
</body>
</html>`);
});

app.listen(PORT, () => console.log(`\n🧭 Compasso CRM — http://localhost:${PORT}\n`));
