import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MAILERLITE_API_KEY  = process.env.MAILERLITE_API_KEY  ?? "";
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID ?? "";
const FROM_EMAIL = "newsletter@compassopolitico.it";
const FROM_NAME  = "Compasso Politico";

export async function POST(req: NextRequest) {
  const auth = req.cookies.get("crm_auth")?.value;
  if (auth !== "crm_authenticated") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  let date: string;
  try {
    ({ date } = await req.json());
  } catch {
    return NextResponse.json({ error: "Body JSON non valido" }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Data non valida" }, { status: 400 });
  }

  const htmlPath = path.join(process.cwd(), "data", "newsletters", `${date}.html`);
  let html: string;
  try {
    html = fs.readFileSync(htmlPath, "utf8");
  } catch {
    return NextResponse.json({ error: "HTML newsletter non trovato per questa data" }, { status: 404 });
  }

  if (!MAILERLITE_API_KEY) {
    return NextResponse.json({ error: "MAILERLITE_API_KEY non configurata su Vercel" }, { status: 500 });
  }
  if (!MAILERLITE_GROUP_ID) {
    return NextResponse.json({ error: "MAILERLITE_GROUP_ID non configurata su Vercel" }, { status: 500 });
  }

  const headers = {
    "Authorization": `Bearer ${MAILERLITE_API_KEY}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  const d = date.split("-").reverse().join("/");
  const subject = `${d} — Le 3 notizie politiche di oggi`;

  const createRes = await fetch("https://connect.mailerlite.com/api/campaigns", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: `Compasso Politico — ${date}`,
      type: "regular",
      emails: [{ subject, from: FROM_EMAIL, from_name: FROM_NAME, content: html }],
      groups: [MAILERLITE_GROUP_ID],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    return NextResponse.json({ error: `Errore creazione campagna MailerLite: ${err}` }, { status: 500 });
  }

  const { data: campaign } = await createRes.json();

  const sendRes = await fetch(
    `https://connect.mailerlite.com/api/campaigns/${campaign.id}/actions/send`,
    { method: "POST", headers }
  );

  if (!sendRes.ok) {
    const err = await sendRes.text();
    return NextResponse.json(
      { error: `Campagna creata (ID ${campaign.id}) ma invio fallito: ${err}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, campaignId: campaign.id });
}
