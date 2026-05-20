"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const CULTURA_LINKS = [
  { href: "/partiti",   label: "Partiti" },
  { href: "/esponenti", label: "Esponenti" },
  { href: "/storia",    label: "Storia" },
];

const TOP_LINKS_LEFT = [
  { href: "/",            label: "Home",        exact: true },
  { href: "/grandi-temi", label: "Grandi Temi", exact: false },
  { href: "/oggi",        label: "Oggi",        exact: false },
  { href: "/live",        label: "Live",        exact: false, live: true },
];

const TOP_LINKS_RIGHT = [
  { href: "/newsletter", label: "Newsletter", exact: false },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const culturaActive = CULTURA_LINKS.some((l) => pathname.startsWith(l.href));

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="sticky top-0" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", zIndex: 500 }}>
      <div style={{ height: 3, background: "var(--accent)" }} />

      <div className="max-w-6xl mx-auto px-4">
        {/* Testata */}
        <div className="py-3 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/" style={{ color: "var(--foreground)", textDecoration: "none" }}>
            <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Compasso Politico
            </span>
          </Link>
          <span className="hidden md:block text-xs" style={{ color: "var(--muted)", fontVariant: "small-caps", letterSpacing: "0.08em" }}>
            La politica italiana spiegata bene
          </span>
        </div>

        {/* Barra navigazione */}
        <div className="flex items-center gap-0" style={{ overflowX: "visible" }}>

          {/* Link sinistri: Home, Grandi Temi, Oggi, Live */}
          {TOP_LINKS_LEFT.map(({ href, label, exact, live }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex-shrink-0 px-4 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-1.5"
                style={{
                  color: active ? "var(--accent)" : live ? "#ef4444" : "var(--foreground)",
                  borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                  letterSpacing: "0.1em",
                }}
              >
                {live && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: "#ef4444" }} />
                )}
                {label}
              </Link>
            );
          })}

          {/* Dropdown Cultura — prima di Newsletter */}
          <div
            ref={ref}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            style={{ position: "relative" }}
          >
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex-shrink-0 px-4 py-2.5 text-xs font-bold tracking-widest uppercase flex items-center gap-1"
              style={{
                color: culturaActive || open ? "var(--accent)" : "var(--foreground)",
                background: "none",
                border: "none",
                borderBottom: culturaActive || open ? "2px solid var(--accent)" : "2px solid transparent",
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              Cultura
              <span style={{ fontSize: 9, marginLeft: 2, opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
            </button>

            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  minWidth: 160,
                  zIndex: 600,
                  overflow: "hidden",
                  paddingTop: 4,
                }}
              >
                {CULTURA_LINKS.map(({ href, label }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      style={{
                        display: "block",
                        padding: "10px 16px",
                        fontSize: 13,
                        fontWeight: active ? 700 : 500,
                        color: active ? "var(--accent)" : "var(--foreground)",
                        textDecoration: "none",
                        background: active ? "var(--surface-2)" : "transparent",
                        borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
                      }}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Newsletter */}
          {TOP_LINKS_RIGHT.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex-shrink-0 px-4 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors"
                style={{
                  color: active ? "var(--accent)" : "var(--foreground)",
                  borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                  letterSpacing: "0.1em",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
