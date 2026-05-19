"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export interface RssItem {
  titolo: string;
  link: string;
  data: string;
  desc: string;
  fonte: string;
  colore: string;
}

interface Props {
  news: RssItem[];
  oggi: string; // YYYY-MM-DD, usato come chiave localStorage
}

function getSeenKey(oggi: string) {
  return `compasso_live_seen_${oggi}`;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 2)  return "ora";
    if (mins < 60) return `${mins}m fa`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h fa`;
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  } catch { return ""; }
}

export default function LiveSwiper({ news, oggi }: Props) {
  const [slide, setSlide] = useState(0);
  const [unseenNews, setUnseenNews] = useState<RssItem[]>(news);
  const [ready, setReady] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Carica visti da localStorage e filtra
  useEffect(() => {
    const key = getSeenKey(oggi);
    const seen: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    const filtered = news.filter((n) => !seen.includes(n.link));
    setUnseenNews(filtered.length > 0 ? filtered : news); // se tutto visto, mostra tutto
    setReady(true);
  }, [news, oggi]);

  const TOTAL = unseenNews.length + 1; // +1 per la slide finale

  function markSeen(item: RssItem) {
    const key = getSeenKey(oggi);
    const seen: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (!seen.includes(item.link)) {
      seen.push(item.link);
      localStorage.setItem(key, JSON.stringify(seen));
    }
  }

  function goNext() {
    if (slide < unseenNews.length) {
      markSeen(unseenNews[slide]);
      setSlide((s) => s + 1);
    }
  }
  function goPrev() {
    setSlide((s) => Math.max(s - 1, 0));
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 40) return;
    if (dx < 0) goNext();
    else goPrev();
  }

  if (!ready) return null;

  const isLast = slide === TOTAL - 1;
  const nuoveCount = unseenNews.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live</span>
        </div>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          {nuoveCount} {nuoveCount === 1 ? "nuova notizia" : "nuove notizie"}
        </span>
        <Link href="/oggi" style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
          Recap →
        </Link>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, padding: "8px 0", flexShrink: 0 }}>
        {Array.from({ length: Math.min(TOTAL, 12) }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === slide ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background: i === slide ? "#ef4444" : i < slide ? "#ef444460" : "var(--border)",
              transition: "all 0.25s",
              flexShrink: 0,
            }}
          />
        ))}
        {TOTAL > 12 && (
          <span style={{ fontSize: 10, color: "var(--muted)" }}>+{TOTAL - 12}</span>
        )}
      </div>

      {/* Slides */}
      <div
        style={{ flex: 1, overflow: "hidden", position: "relative" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
            transform: `translateX(-${slide * 100}%)`,
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Card notizie */}
          {unseenNews.map((item, i) => {
            const ago = timeAgo(item.data);
            return (
              <div key={i} style={{ minWidth: "100%", height: "100%", overflowY: "auto", padding: "20px 20px 16px", display: "flex", flexDirection: "column" }}>
                {/* Badge fonte + tempo */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px",
                    borderRadius: 20, background: item.colore + "18", color: item.colore,
                  }}>
                    {item.fonte}
                  </span>
                  {ago && <span style={{ fontSize: 11, color: "var(--muted)" }}>{ago}</span>}
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>{i + 1}/{unseenNews.length}</span>
                </div>

                {/* Titolo */}
                <h2 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.25, marginBottom: 16, letterSpacing: "-0.02em", flex: "none" }}>
                  {item.titolo}
                </h2>

                {/* Descrizione */}
                {item.desc && (
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--muted)", marginBottom: 20, flex: 1 }}>
                    {item.desc}
                  </p>
                )}

                {/* Link articolo */}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 14, fontWeight: 700, color: "var(--accent)",
                    textDecoration: "none", padding: "12px 0",
                    borderTop: "1px solid var(--border)", marginTop: "auto",
                  }}
                >
                  Leggi su {item.fonte} ↗
                </a>
              </div>
            );
          })}

          {/* Slide finale */}
          <div style={{ minWidth: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#dcfce7", border: "2px solid #86efac",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}>
              <span style={{ fontSize: 36, color: "#15803d" }}>✓</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>
              Hai finito le notizie di oggi!
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28, lineHeight: 1.6 }}>
              Torna più tardi per le ultime novità.
            </p>
            <Link
              href="/oggi"
              style={{
                display: "inline-block",
                background: "var(--accent)", color: "#fff",
                padding: "12px 24px", borderRadius: 10,
                fontWeight: 700, fontSize: 14,
                textDecoration: "none", marginBottom: 12, width: "100%", textAlign: "center",
              }}
            >
              📋 Leggi il recap del giorno →
            </Link>
            <Link
              href="/newsletter"
              style={{
                display: "inline-block", width: "100%", textAlign: "center",
                border: "1px solid var(--border)",
                padding: "12px 24px", borderRadius: 10,
                fontWeight: 600, fontSize: 14, color: "var(--foreground)",
                textDecoration: "none",
              }}
            >
              📬 Iscriviti alla newsletter
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <button
          onClick={goPrev}
          disabled={slide === 0}
          style={{
            padding: "10px 20px", borderRadius: 10,
            fontWeight: 700, fontSize: 14,
            border: "1px solid var(--border)",
            background: "transparent",
            color: slide === 0 ? "var(--border)" : "var(--foreground)",
            cursor: slide === 0 ? "default" : "pointer",
          }}
        >
          ← Indietro
        </button>

        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
          {isLast ? "Fine" : `${slide + 1} / ${unseenNews.length}`}
        </span>

        <button
          onClick={goNext}
          disabled={isLast}
          style={{
            padding: "10px 20px", borderRadius: 10,
            fontWeight: 700, fontSize: 14,
            border: "none",
            background: isLast ? "var(--border)" : "#ef4444",
            color: "#fff",
            cursor: isLast ? "default" : "pointer",
          }}
        >
          Avanti →
        </button>
      </div>
    </div>
  );
}
