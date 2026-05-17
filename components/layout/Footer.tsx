import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t mt-20" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <div className="font-bold text-lg mb-1">🧭 Compasso Politico</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            La politica italiana spiegata bene.
          </p>
        </div>

        <div className="flex flex-col gap-1 text-sm" style={{ color: "var(--muted)" }}>
          <span className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>Esplora</span>
          <Link href="/partiti" className="hover:underline">Partiti</Link>
          <Link href="/esponenti" className="hover:underline">Esponenti</Link>
          <Link href="/oggi" className="hover:underline">Oggi in Politica</Link>
          <Link href="/glossario" className="hover:underline">Glossario</Link>
          <Link href="/storia" className="hover:underline">Storia</Link>
        </div>

        <div className="flex flex-col gap-1 text-sm" style={{ color: "var(--muted)" }}>
          <span className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>Newsletter</span>
          <p>Ricevi il recap politico ogni mattina.</p>
          <Link href="/newsletter" className="mt-1 text-sm font-medium" style={{ color: "var(--accent)" }}>
            Iscriviti gratis →
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
        © {new Date().getFullYear()} Compasso Politico. Contenuto informativo e indipendente.
      </div>
    </footer>
  );
}
