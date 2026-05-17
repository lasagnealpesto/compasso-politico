"use client";

import { useState } from "react";

interface Props {
  nome: string;
  nomeBreve: string;
  colore: string;
  logoUrl: string;
  size?: number;
  className?: string;
}

export default function PartitoLogo({ nome, nomeBreve, colore, logoUrl, size = 40, className = "" }: Props) {
  const [error, setError] = useState(false);

  if (!error && logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`Logo ${nome}`}
        width={size}
        height={size}
        onError={() => setError(true)}
        className={className}
        style={{ objectFit: "contain", width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg font-bold text-white flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: colore, fontSize: size * 0.28 }}
    >
      {nomeBreve.slice(0, 3)}
    </div>
  );
}
