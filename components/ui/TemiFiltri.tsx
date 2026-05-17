"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Tema {
  slug: string;
  icona: string;
  label: string;
}

export default function TemiFiltri({ temi, attivo }: { temi: Tema[]; attivo: string }) {
  const router = useRouter();
  const [pressing, setPressing] = useState<string | null>(null);

  function handleClick(slug: string) {
    if (slug === attivo) return;
    setPressing(slug);
    setTimeout(() => {
      setPressing(null);
      router.push(`/partiti/temi/${slug}`);
    }, 180);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-10">
      {temi.map(({ slug, icona, label }) => {
        const isActive = slug === attivo;
        const isPressing = pressing === slug;
        return (
          <button
            key={slug}
            onClick={() => handleClick(slug)}
            disabled={isActive}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 999,
              border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
              background: isActive ? "var(--accent)" : "var(--surface)",
              color: isActive ? "#fff" : "var(--muted)",
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              cursor: isActive ? "default" : "pointer",
              transform: isPressing ? "scale(1.14)" : "scale(1)",
              transition: "transform 0.12s ease, background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
              outline: "none",
            }}
          >
            {icona} {label}
          </button>
        );
      })}
    </div>
  );
}
