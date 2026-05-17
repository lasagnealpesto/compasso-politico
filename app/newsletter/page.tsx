import type { Metadata } from "next";

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

      {/* Form iscrizione Ghost */}
      <div className="rounded-2xl border p-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <p className="font-semibold mb-4">Iscriviti gratis</p>
        <form
          action="https://compassopolitico.ghost.io/members/api/send-magic-link/"
          method="POST"
          className="flex flex-col sm:flex-row gap-3"
        >
          <input type="hidden" name="emailType" value="subscribe" />
          <input
            type="email"
            name="email"
            required
            placeholder="la-tua@email.it"
            className="flex-1 px-4 py-3 rounded-lg text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg font-semibold text-sm text-white"
            style={{ background: "var(--accent)" }}
          >
            Iscriviti →
          </button>
        </form>
        <p className="text-xs mt-4" style={{ color: "var(--muted)" }}>
          Niente spam. Disiscrizione in un click. Powered by Ghost.
        </p>
      </div>
    </div>
  );
}
