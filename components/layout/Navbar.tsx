"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home", exact: true },
  { href: "/partiti", label: "Partiti", exact: false },
  { href: "/esponenti", label: "Esponenti", exact: false },
  { href: "/storia", label: "Storia", exact: false },
  { href: "/oggi", label: "Oggi", exact: false },
  { href: "/newsletter", label: "Newsletter", exact: false },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
      {/* Striscia rossa editoriale */}
      <div style={{ height: 3, background: "var(--accent)" }} />

      <div className="max-w-6xl mx-auto px-4">
        {/* Testata */}
        <div className="py-3 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/" style={{ color: "var(--foreground)", textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Compasso Politico
            </span>
          </Link>
          <span className="hidden md:block text-xs" style={{ color: "var(--muted)", fontVariant: "small-caps", letterSpacing: "0.08em" }}>
            La politica italiana spiegata bene
          </span>
        </div>

        {/* Barra navigazione */}
        <div className="flex items-center gap-0 overflow-x-auto">
          {links.map(({ href, label, exact }) => {
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
