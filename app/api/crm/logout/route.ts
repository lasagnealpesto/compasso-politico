import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const isCrmHost = host === "crm.compassopolitico.it";

  const cookieStore = await cookies();
  cookieStore.delete("crm_auth");

  // Su subdomain: /login viene riscritto da Vercel a /crm/login
  const loginPath = isCrmHost ? "/login" : "/crm/login";
  return NextResponse.redirect(new URL(loginPath, req.url));
}
