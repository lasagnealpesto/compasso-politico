"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/partiti", label: "Partiti" },
  { href: "/esponenti", label: "Esponenti" },
  { href: "/oggi", label: "Oggi in Politica" },
  { href: "/newsletter", label: "Newsletter" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight" style={{ color: "var(--foreground)" }}>
          <span className="text-2xl">🧭</span>
          <span>Compasso Politico</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-md text-sm transition-colors"
                style={{
                  color: active ? "var(--foreground)" : "var(--muted)",
                  background: active ? "var(--surface-2)" : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu semplificato */}
        <div className="flex md:hidden items-center gap-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs px-2 py-1 rounded"
              style={{ color: "var(--muted)" }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
