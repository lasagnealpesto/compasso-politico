"use client";
import { useState } from "react";

type State = "idle" | "confirm" | "loading" | "ok" | "error";

export default function SendNewsletterButton({ date }: { date: string }) {
  const [state, setState] = useState<State>("idle");
  const [errMsg, setErrMsg] = useState("");

  async function send() {
    setState("loading");
    try {
      const res = await fetch("/api/crm/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      const data = await res.json();
      if (data.ok) {
        setState("ok");
      } else {
        setErrMsg(data.error ?? "Errore sconosciuto");
        setState("error");
      }
    } catch {
      setErrMsg("Errore di rete");
      setState("error");
    }
  }

  if (state === "ok") {
    return <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e" }}>✓ Inviata!</span>;
  }

  if (state === "error") {
    return (
      <span
        style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", maxWidth: 260, lineHeight: 1.4, cursor: "pointer" }}
        onClick={() => setState("idle")}
        title="Clicca per riprovare"
      >
        ✗ {errMsg || "Errore sconosciuto"}
      </span>
    );
  }

  if (state === "loading") {
    return <span style={{ fontSize: 11, color: "#777" }}>Invio...</span>;
  }

  if (state === "confirm") {
    return (
      <>
        <span style={{ fontSize: 11, color: "#777" }}>Inviare a tutti gli iscritti?</span>
        <button
          className="blk-action"
          style={{ background: "#C41230" }}
          onClick={send}
        >
          Sì, invia
        </button>
        <button className="blk-action" onClick={() => setState("idle")}>
          Annulla
        </button>
      </>
    );
  }

  return (
    <button
      className="blk-action"
      style={{ background: "#C41230" }}
      onClick={() => setState("confirm")}
    >
      Invia newsletter
    </button>
  );
}
