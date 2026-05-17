"use server";

import { supabase } from "@/lib/supabase";

export async function iscriviNewsletter(email: string): Promise<{ ok: boolean; msg: string }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, msg: "Inserisci un'email valida." };
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert([{ email: email.toLowerCase().trim(), iscritta_il: new Date().toISOString() }]);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, msg: "Sei già iscritto con questa email." };
    }
    console.error("Supabase error:", error);
    return { ok: false, msg: "Errore di sistema. Riprova tra poco." };
  }

  return { ok: true, msg: "Iscritto! Ti mandiamo il recap ogni mattina alle 7:00." };
}
