"use client";
import Link from "next/link";

const TEMI = [
  { icona: "🏠", label: "Economia", slug: "economia" },
  { icona: "🌍", label: "Immigrazione", slug: "immigrazione" },
  { icona: "⚖️", label: "Giustizia", slug: "giustizia" },
  { icona: "🌿", label: "Ambiente", slug: "ambiente" },
  { icona: "🌐", label: "Esteri", slug: "esteri" },
  { icona: "👨‍👩‍👧", label: "Welfare", slug: "welfare" },
];

export default function TemiGrid() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {TEMI.map(({ icona, label, slug }) => (
        <Link
          key={slug}
          href={`/partiti/temi/${slug}`}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all hover:scale-105"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <span className="text-2xl">{icona}</span>
          <span className="text-xs font-medium">{label}</span>
        </Link>
      ))}
    </div>
  );
}
