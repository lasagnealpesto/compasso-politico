import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const DATA_DIR     = path.join(process.cwd(), "data", "daily");
const NL_DIR       = path.join(process.cwd(), "data", "newsletters");
const CAROUSEL_DIR = path.join(process.cwd(), "public", "carousels");

function getAllDailies() {
  try {
    return fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json")).sort().reverse().slice(0, 14)
      .map(f => ({ date: f.replace(".json", "") }));
  } catch { return []; }
}

function hasNewsletter(d: string) {
  try { fs.accessSync(path.join(NL_DIR, `${d}.html`)); return true; } catch { return false; }
}

function hasCarousel(d: string) {
  try { fs.accessSync(path.join(CAROUSEL_DIR, d, "slide-1.png")); return true; } catch { return false; }
}

interface DailyContent {
  data: string;
  top3: { titolo: string; spiegazione: string; perchéRilevante: string; fonte?: string; fonteUrl?: string }[];
  recap: string;
}

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function CrmPage({ searchParams }: Props) {
  const cookieStore = await cookies();
  if (cookieStore.get("crm_auth")?.value !== "crm_authenticated") {
    redirect("/crm/login");
  }

  const { date: qDate } = await searchParams;
  const dailies = getAllDailies();
  const sel = qDate ?? dailies[0]?.date ?? "";

  let content: DailyContent | null = null;
  if (sel) {
    try { content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${sel}.json`), "utf8")); } catch {}
  }

  const caption = content ? (() => {
    const nums = ["1️⃣", "2️⃣", "3️⃣"];
    const d = new Date(content.data).toLocaleDateString("it-IT", { day: "numeric", month: "long" });
    const body = content.top3.map((n, i) => `${nums[i]} ${n.titolo}\n${n.perchéRilevante}`).join("\n\n");
    return `🗞️ Le 3 notizie politiche di oggi — ${d}\n\n${body}\n\n${content.recap.split(". ").slice(0, 2).join(". ")}.\n\n📩 Newsletter gratuita → compassopolitico.it\n\n#politicaitaliana #notizie #italia #politica #attualità #governo #parlamento #news`;
  })() : null;

  return (
    <>
      <style>{`
        .crm-wrap { font-family:'Inter',sans-serif; background:#F0EFED; color:#111; min-height:100vh; display:flex; flex-direction:column; }
        .hdr { background:#111; color:#fff; padding:0 24px; height:52px; display:flex; align-items:center; gap:10px; flex-shrink:0; }
        .hdr-logo { width:26px; height:26px; background:#C41230; border-radius:6px; display:flex; align-items:center; justify-content:center; }
        .hdr-title { font-size:14px; font-weight:700; }
        .hdr-sub { font-size:12px; color:#555; }
        .hdr-right { margin-left:auto; display:flex; align-items:center; gap:10px; }
        .logout { font-size:11px; color:#555; text-decoration:none; padding:4px 10px; border:1px solid #333; border-radius:6px; }
        .logout:hover { color:#aaa; border-color:#555; }
        .layout { display:flex; flex:1; overflow:hidden; height:calc(100vh - 52px); }
        .sid { width:175px; flex-shrink:0; background:#1A1A1A; padding:14px 10px; overflow-y:auto; }
        .sid-lbl { font-size:10px; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:.12em; margin-bottom:10px; padding:0 6px; }
        .sid-item { display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:8px; text-decoration:none; color:#aaa; font-size:12px; font-weight:600; margin-bottom:3px; }
        .sid-item:hover { background:#2A2A2A; color:#fff; }
        .sid-item.active { background:#C41230; color:#fff; }
        .main { flex:1; overflow-y:auto; padding:24px; }
        .grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; }
        .block { background:#fff; border-radius:14px; border:1px solid #E5E5E3; overflow:hidden; display:flex; flex-direction:column; }
        .blk-hdr { padding:14px 18px; border-bottom:1px solid #F0F0EE; display:flex; align-items:center; gap:8px; }
        .blk-icon { font-size:15px; }
        .blk-title { font-size:14px; font-weight:700; flex:1; }
        .blk-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; background:#F0F0EE; color:#777; text-transform:uppercase; }
        .blk-action { font-size:11px; font-weight:600; background:#111; color:#fff; border:none; padding:5px 12px; border-radius:7px; cursor:pointer; font-family:inherit; text-decoration:none; }
        .blk-action:hover { background:#333; }
        .blk-body { padding:16px 18px; flex:1; overflow-y:auto; max-height:560px; }
        .news-item { padding:12px 0; border-bottom:1px solid #F5F5F3; display:flex; gap:10px; }
        .news-item:last-child { border-bottom:none; padding-bottom:0; }
        .news-num { font-size:22px; font-weight:800; color:#C41230; line-height:1.1; flex-shrink:0; }
        .news-body { flex:1; min-width:0; }
        .news-title { font-size:13px; font-weight:700; line-height:1.4; margin-bottom:4px; }
        .news-spieg { font-size:12px; color:#666; line-height:1.55; margin-bottom:6px; }
        .news-perche { font-size:11px; background:#F5F4F2; color:#555; padding:7px 10px; border-radius:7px; line-height:1.5; margin-bottom:6px; }
        .news-fonte { font-size:11px; color:#C41230; font-weight:600; text-decoration:none; }
        .nl-frame { border-radius:10px; overflow:hidden; border:1px solid #E8E8E6; height:520px; }
        .nl-iframe { width:200%; height:200%; border:none; transform:scale(.5); transform-origin:top left; display:block; }
        .slides-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .slide-1 { grid-column:1/-1; }
        .slide-wrap { position:relative; border-radius:10px; overflow:hidden; border:1px solid #E5E5E3; aspect-ratio:1; background:#F0EFED; }
        .slide-wrap img { width:100%; height:100%; object-fit:cover; display:block; }
        .slide-num { position:absolute; top:6px; left:6px; background:rgba(0,0,0,.55); color:#fff; font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; }
        .slide-dl { position:absolute; bottom:6px; right:6px; background:rgba(0,0,0,.55); color:#fff; font-size:13px; font-weight:700; padding:3px 8px; border-radius:6px; text-decoration:none; }
        .slide-dl:hover { background:rgba(0,0,0,.85); }
        .slides-note { font-size:11px; color:#bbb; margin-top:8px; }
        .post-block { background:#fff; border-radius:14px; border:1px solid #E5E5E3; margin-top:20px; overflow:hidden; }
        .caption { font-family:-apple-system,sans-serif; font-size:13px; line-height:1.75; white-space:pre-wrap; padding:18px; background:#FAFAF9; border-radius:10px; border:1px solid #EBEBEB; user-select:all; margin:0; }
        .empty { text-align:center; padding:48px 20px; color:#bbb; font-size:13px; }
      `}</style>

      <div className="crm-wrap">
        {/* Header */}
        <div className="hdr">
          <div className="hdr-logo">
            <svg width="14" height="20" viewBox="0 0 40 58" fill="none">
              <circle cx="20" cy="18" r="16" fill="white"/>
              <rect x="11" y="26" width="18" height="24" fill="white"/>
              <path d="M11 50 Q11 58 20 58 Q29 58 29 50Z" fill="white"/>
              <rect x="11" y="36" width="18" height="2.5" fill="#C41230"/>
              <rect x="11" y="43" width="18" height="2.5" fill="#C41230"/>
            </svg>
          </div>
          <span className="hdr-title">Compasso Politico</span>
          <span className="hdr-sub">CRM</span>
          <div className="hdr-right">
            <a href="/api/crm/logout" className="logout">Esci</a>
          </div>
        </div>

        {/* Layout */}
        <div className="layout">
          <nav className="sid">
            <div className="sid-lbl">Archivio</div>
            {dailies.map(({ date }) => (
              <a key={date} href={`/crm?date=${date}`} className={`sid-item${date === sel ? " active" : ""}`}>
                <span>{date}</span>
                {hasCarousel(date) && <span>📱</span>}
              </a>
            ))}
          </nav>

          <div className="main">
            <div className="grid">

              {/* Notizie */}
              <div className="block">
                <div className="blk-hdr">
                  <span className="blk-icon">🔥</span>
                  <span className="blk-title">Notizie del giorno</span>
                  <span className="blk-badge">{sel || "—"}</span>
                </div>
                <div className="blk-body">
                  {content ? content.top3.map((n, i) => (
                    <div key={i} className="news-item">
                      <span className="news-num">{i + 1}</span>
                      <div className="news-body">
                        <div className="news-title">{n.titolo}</div>
                        <div className="news-spieg">{n.spiegazione}</div>
                        <div className="news-perche">💡 {n.perchéRilevante}</div>
                        {n.fonteUrl && <a href={n.fonteUrl} target="_blank" rel="noopener" className="news-fonte">↗ {n.fonte}</a>}
                      </div>
                    </div>
                  )) : <div className="empty">Nessun contenuto per questa data.</div>}
                </div>
              </div>

              {/* Newsletter */}
              <div className="block">
                <div className="blk-hdr">
                  <span className="blk-icon">📧</span>
                  <span className="blk-title">Newsletter</span>
                  {content && hasNewsletter(content.data)
                    ? <a href={`/api/newsletter/${content.data}`} target="_blank" className="blk-action">Apri HTML</a>
                    : <span className="blk-badge">Non generata</span>}
                </div>
                <div className="blk-body">
                  {content && hasNewsletter(content.data)
                    ? <div className="nl-frame"><iframe src={`/api/newsletter/${content.data}`} className="nl-iframe" title="Newsletter" /></div>
                    : <div className="empty">Newsletter non ancora generata.</div>}
                </div>
              </div>

              {/* Carosello */}
              <div className="block">
                <div className="blk-hdr">
                  <span className="blk-icon">📱</span>
                  <span className="blk-title">Carosello Instagram</span>
                  <span className="blk-badge">5 slide</span>
                </div>
                <div className="blk-body">
                  {content && hasCarousel(content.data) ? (
                    <>
                      <div className="slides-grid">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`slide-wrap${i === 1 ? " slide-1" : ""}`}>
                            <img src={`/carousels/${content!.data}/slide-${i}.png`} alt={`Slide ${i}`} loading="lazy" />
                            <span className="slide-num">Slide {i}</span>
                            <a href={`/carousels/${content!.data}/slide-${i}.png`} download className="slide-dl">↓</a>
                          </div>
                        ))}
                      </div>
                      <p className="slides-note">1080×1080px · ↓ per scaricare</p>
                    </>
                  ) : <div className="empty">📱 Carosello non generato.</div>}
                </div>
              </div>

            </div>

            {/* Caption Instagram */}
            <div className="post-block">
              <div className="blk-hdr">
                <span className="blk-icon">📸</span>
                <span className="blk-title">Caption Instagram</span>
                <button className="blk-action" id="copyBtn">Copia</button>
              </div>
              <div className="blk-body" style={{ maxHeight: "none" }}>
                {caption
                  ? <pre className="caption" id="post-text">{caption}</pre>
                  : <div className="empty">Nessun contenuto.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('copyBtn')?.addEventListener('click', () => {
          const el = document.getElementById('post-text');
          if (!el) return;
          navigator.clipboard.writeText(el.innerText).then(() => {
            const btn = document.getElementById('copyBtn');
            const o = btn.textContent; btn.textContent = 'Copiato!';
            setTimeout(() => btn.textContent = o, 2000);
          });
        });
      `}} />
    </>
  );
}
