import Link from "next/link";
import { partiti } from "@/lib/data";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-6 border"
          style={{ borderColor: "var(--border)", color: "var(--muted)", background: "var(--surface)" }}>
          Politica italiana — aggiornato quotidianamente
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          La politica italiana<br />
          <span style={{ color: "var(--accent)" }}>finalmente spiegata bene.</span>
        </h1>

        <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: "var(--muted)" }}>
          Mappa dei partiti, profili degli esponenti, programmi politici e un recap giornaliero delle notizie più importanti.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/partiti"
            className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Esplora i partiti
          </Link>
          <Link
            href="/oggi"
            className="px-6 py-3 rounded-lg font-semibold text-sm border transition-colors"
            style={{ border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            Notizie di oggi →
          </Link>
        </div>
      </section>

      {/* Come funziona */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🗺️", titolo: "Mappa dei partiti", desc: "Visualizza tutti i partiti italiani su una mappa ideologica sinistra-destra, liberale-conservatore." },
            { icon: "👤", titolo: "Profili esponenti", desc: "Per ogni partito: i 5 esponenti principali con bio, storia politica e posizioni chiave." },
            { icon: "📰", titolo: "Recap giornaliero", desc: "Ogni mattina: le 3 notizie da sapere e un riassunto della politica italiana del giorno." },
          ].map(({ icon, titolo, desc }) => (
            <div key={titolo} className="p-6 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold mb-2">{titolo}</h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview partiti */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">I partiti in parlamento</h2>
          <Link href="/partiti" className="text-sm" style={{ color: "var(--accent)" }}>Vedi tutti →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {partiti.map((p) => (
            <Link
              key={p.id}
              href={`/partiti/${p.id}`}
              className="p-4 rounded-xl border flex items-center gap-3 transition-all hover:scale-[1.02]"
              style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeftWidth: 3, borderLeftColor: p.colore }}
            >
              <div>
                <div className="font-semibold text-sm">{p.nomeBreve}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{p.segretario}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Newsletter */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl p-8 md:p-12 text-center border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-2xl font-bold mb-3">Resta informato — gratis</h2>
          <p className="mb-6" style={{ color: "var(--muted)" }}>
            Ogni mattina ricevi le 3 notizie di politica italiana da sapere. Niente spam, solo contenuto.
          </p>
          <Link
            href="/newsletter"
            className="inline-block px-8 py-3 rounded-lg font-semibold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Iscriviti alla newsletter →
          </Link>
        </div>
      </section>
    </div>
  );
}
