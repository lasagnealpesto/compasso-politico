"use client";

import { useState, useRef } from "react";
import { iscriviNewsletter } from "@/app/actions/newsletter";

export default function NewsletterForm() {
  const [stato, setStato] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = inputRef.current?.value ?? "";
    setStato("loading");
    const res = await iscriviNewsletter(email);
    setStato(res.ok ? "ok" : "err");
    setMsg(res.msg);
    if (res.ok && inputRef.current) inputRef.current.value = "";
  }

  if (stato === "ok") {
    return (
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl"
        style={{ background: "#dcfce7", border: "1px solid #86efac" }}
      >
        <span style={{ color: "#15803d", fontSize: 18 }}>✓</span>
        <span className="text-sm font-medium" style={{ color: "#15803d" }}>{msg}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" style={{ maxWidth: 440 }}>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="email"
          placeholder="la-tua-email@gmail.com"
          required
          disabled={stato === "loading"}
          className="flex-1 px-4 py-3 rounded-lg text-sm outline-none"
          style={{
            background: "var(--surface)",
            border: "1.5px solid var(--border-strong)",
            color: "var(--foreground)",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
        />
        <button
          type="submit"
          disabled={stato === "loading"}
          className="btn-primary px-5 py-3 rounded-lg text-sm font-semibold text-white flex-shrink-0"
          style={{
            background: "var(--accent)",
            opacity: stato === "loading" ? 0.7 : 1,
            cursor: stato === "loading" ? "wait" : "pointer",
          }}
        >
          {stato === "loading" ? "..." : "Iscriviti →"}
        </button>
      </div>
      {stato === "err" && (
        <p className="text-xs mt-2" style={{ color: "var(--accent)" }}>{msg}</p>
      )}
      <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
        Ogni mattina alle 7:00. Gratis. Zero spam.
      </p>
    </form>
  );
}
