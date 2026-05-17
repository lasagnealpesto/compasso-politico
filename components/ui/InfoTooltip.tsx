"use client";

import { useState } from "react";

interface Props {
  titolo: string;
  testo: string;
}

export default function InfoTooltip({ titolo, testo }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block ml-1.5">
      <button
        onClick={() => setOpen(!open)}
        className="w-4 h-4 rounded-full text-xs font-bold inline-flex items-center justify-center leading-none transition-colors"
        style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}
        aria-label={`Info: ${titolo}`}
      >
        i
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute z-50 w-64 p-3 rounded-xl shadow-xl text-sm bottom-6 left-0"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            <div className="font-semibold mb-1">{titolo}</div>
            <p style={{ color: "var(--muted)" }}>{testo}</p>
          </div>
        </>
      )}
    </span>
  );
}
