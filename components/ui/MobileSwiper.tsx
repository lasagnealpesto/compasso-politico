"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { DailyContent } from "@/types";

interface Props {
  days: DailyContent[];
}

export default function MobileSwiper({ days }: Props) {
  const [dayIdx, setDayIdx] = useState(0);
  const [slide, setSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const content = days[dayIdx];
  if (!content) return null;

  const TOTAL = 5; // notizia 1, 2, 3, recap, done

  function goNext() {
    setSlide((s) => Math.min(s + 1, TOTAL - 1));
  }
  function goPrev() {
    setSlide((s) => Math.max(s - 1, 0));
  }
  function changeDay(idx: number) {
    setDayIdx(idx);
    setSlide(0);
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

  const data = new Date(content.data + "T12:00:00Z").toLocaleDateString("it-IT", {
    weekday: "short", day: "numeric", month: "short",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)", overflow: "hidden" }}>

      {/* Header: navigazione giorni + LIVE */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {days.map((d, i) => {
            const label = i === 0 ? "Oggi" : i === 1 ? "Ieri" : new Date(d.data + "T12:00:00Z").toLocaleDateString("it-IT", { day: "numeric", month: "short" });
            return (
              <button
                key={d.data}
                onClick={() => changeDay(i)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  border: "1px solid",
                  borderColor: dayIdx === i ? "var(--accent)" : "var(--border)",
                  background: dayIdx === i ? "var(--accent)" : "transparent",
                  color: dayIdx === i ? "#fff" : "var(--muted)",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <Link
          href="/live"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 12, fontWeight: 700, color: "#ef4444",
            padding: "4px 10px", borderRadius: 20,
            border: "1px solid #ef4444",
            textDecoration: "none",
          }}
        >
          <span
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 1.5s infinite" }}
          />
          LIVE
        </Link>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "10px 0", flexShrink: 0 }}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            style={{
              width: i === slide ? 20 : 7,
              height: 7,
              borderRadius: 4,
              background: i === slide ? "var(--accent)" : i < slide ? "var(--accent)" : "var(--border)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.25s",
              opacity: i < slide ? 0.4 : 1,
            }}
          />
        ))}
      </div>

      {/* Slide content */}
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
          {/* Slides 0-2: notizie */}
          {content.top3.map((n, i) => (
            <div key={i} style={{ minWidth: "100%", height: "100%", overflowY: "auto", padding: "20px 20px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, color: "var(--accent)", flexShrink: 0 }}>
                  {i + 1}
                </span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 4 }}>
                    Notizia {i + 1} di 3
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{data}</div>
                </div>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.25, marginBottom: 14, letterSpacing: "-0.02em" }}>
                {n.titolo}
              </h2>

              <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--muted)", marginBottom: 16 }}>
                {n.spiegazione}
              </p>

              <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", marginBottom: 4 }}>
                  Perché conta
                </div>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>{n.perchéRilevante}</p>
              </div>

              {n.fonteUrl && n.fonte && (
                <a href={n.fonteUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                  ↗ {n.fonte}
                </a>
              )}
            </div>
          ))}

          {/* Slide 3: Recap */}
          <div style={{ minWidth: "100%", height: "100%", overflowY: "auto", padding: "20px 20px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>📋</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>
                  Recap del giorno
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{data}</div>
              </div>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Il quadro completo</h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--muted)" }}>{content.recap}</p>
          </div>

          {/* Slide 4: Done */}
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
              Hai finito le notizie principali di oggi!
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28, lineHeight: 1.6 }}>
              Domani alle 7:00 trovi il nuovo recap.
            </p>
            <Link
              href="/newsletter"
              style={{
                display: "inline-block",
                background: "var(--accent)", color: "#fff",
                padding: "12px 24px", borderRadius: 10,
                fontWeight: 700, fontSize: 14,
                textDecoration: "none", marginBottom: 12,
              }}
            >
              📬 Ricevile per email →
            </Link>
            <Link
              href="/live"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                color: "#ef4444", fontSize: 14, fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              Segui il live parlamentare
            </Link>
          </div>
        </div>
      </div>

      {/* Footer: prev/next */}
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
          {slide + 1} / {TOTAL}
        </span>

        <button
          onClick={goNext}
          disabled={slide === TOTAL - 1}
          style={{
            padding: "10px 20px", borderRadius: 10,
            fontWeight: 700, fontSize: 14,
            border: "none",
            background: slide === TOTAL - 1 ? "var(--border)" : "var(--accent)",
            color: "#fff",
            cursor: slide === TOTAL - 1 ? "default" : "pointer",
          }}
        >
          Avanti →
        </button>
      </div>
    </div>
  );
}
