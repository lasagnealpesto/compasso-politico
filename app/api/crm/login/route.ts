import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_USER     = process.env.CRM_USER     ?? "admin";
const ADMIN_PASSWORD = process.env.CRM_PASSWORD ?? "admin99";

export async function POST(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const isCrmHost = host === "crm.compassopolitico.it";

  const body = await req.formData();
  const username = body.get("username")?.toString() ?? "";
  const password = body.get("password")?.toString() ?? "";

  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    const errorPath = isCrmHost ? "/login?error=1" : "/crm/login?error=1";
    return NextResponse.redirect(new URL(errorPath, req.url));
  }

  const cookieStore = await cookies();
  cookieStore.set("crm_auth", "crm_authenticated", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  // Su subdomain: / viene riscritto da Vercel a /crm
  const successPath = isCrmHost ? "/" : "/crm";
  return NextResponse.redirect(new URL(successPath, req.url));
}
