import type { Metadata } from "next";
import NewsletterForm from "@/components/ui/NewsletterForm";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Iscriviti al recap politico giornaliero di Compasso Politico. Gratis, ogni mattina.",
};

export default function NewsletterPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-6">📬</div>
      <h1 className="text-4xl font-bold mb-4">Il recap politico italiano</h1>
      <p className="text-lg mb-2" style={{ color: "var(--muted)" }}>
        Ogni mattina alle 8:00 ricevi:
      </p>
      <ul className="text-left max-w-sm mx-auto mb-10 space-y-3">
        {[
          "🔥 Le 3 notizie di politica da sapere",
          "📋 Recap del giorno in 300 parole",
          "🧭 Aggiornamenti su partiti ed esponenti",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "var(--muted)" }}>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border p-8 flex flex-col items-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <p className="font-semibold mb-4">Iscriviti gratis</p>
        <NewsletterForm />
      </div>
    </div>
  );
}
