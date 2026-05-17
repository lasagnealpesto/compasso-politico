"use client";

import Link from "next/link";
import { useState } from "react";
import type { Fondatore } from "@/types";

interface Props {
  fondatore: Fondatore;
  colore: string;
  fotos: Record<string, string>;
}

export default function FondatoreCard({ fondatore, colore, fotos }: Props) {
  const [err, setErr] = useState(false);
  const fotoUrl = fotos[fondatore.fotoId] ?? "";
  const initials = fondatore.nome.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <Link
      href={fondatore.wikiUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-2 group"
      style={{ textDecoration: "none" }}
    >
      {fotoUrl && !err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fotoUrl}
          alt={fondatore.nome}
          width={72}
          height={72}
          onError={() => setErr(true)}
          style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", objectPosition: "top", border: `3px solid ${colore}` }}
        />
      ) : (
        <div
          style={{ width: 72, height: 72, borderRadius: "50%", background: colore, border: `3px solid ${colore}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 22 }}
        >
          {initials}
        </div>
      )}
      <div className="text-center">
        <div className="text-xs font-semibold group-hover:underline" style={{ maxWidth: 80 }}>{fondatore.nome}</div>
        <div className="text-xs" style={{ color: "var(--accent)" }}>Wikipedia →</div>
      </div>
    </Link>
  );
}
