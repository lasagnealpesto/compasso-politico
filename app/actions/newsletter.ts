"use server";

import { supabase } from "@/lib/supabase";

async function syncMailerLite(email: string): Promise<void> {
  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;
  if (!apiKey || !groupId) return;
  try {
    await fetch(`https://connect.mailerlite.com/api/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email, groups: [groupId] }),
      signal: AbortSignal.timeout(6000),
    });
  } catch {
    // sync non bloccante — l'iscrizione in Supabase è già avvenuta
  }
}

export async function iscriviNewsletter(email: string): Promise<{ ok: boolean; msg: string }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, msg: "Inserisci un'email valida." };
  }

  const normalised = email.toLowerCase().trim();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert([{ email: normalised, iscritta_il: new Date().toISOString(), fonte: "sito" }]);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, msg: "Sei già iscritto con questa email." };
    }
    console.error("Supabase error:", error);
    return { ok: false, msg: "Errore di sistema. Riprova tra poco." };
  }

  // Sync non bloccante a MailerLite
  void syncMailerLite(normalised);

  return { ok: true, msg: "Iscritto! Ti mandiamo il recap ogni mattina alle 7:00." };
}
