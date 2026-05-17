"use client";

import { useState } from "react";

interface Props {
  nome: string;
  colore: string;
  fotoUrl: string;
  size?: number;
  className?: string;
}

export default function EsponenteAvatar({ nome, colore, fotoUrl, size = 48, className = "" }: Props) {
  const [err, setErr] = useState(false);
  const initials = nome.split(" ").map((n) => n[0]).slice(0, 2).join("");

  if (fotoUrl && !err) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fotoUrl}
        alt={nome}
        width={size}
        height={size}
        onError={() => setErr(true)}
        className={`flex-shrink-0 ${className}`}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", objectPosition: "top", border: `2px solid ${colore}` }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: colore, fontSize: size * 0.28 }}
    >
      {initials}
    </div>
  );
}
