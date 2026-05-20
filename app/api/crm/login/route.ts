import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_USER     = process.env.CRM_USER     ?? "admin";
const ADMIN_PASSWORD = process.env.CRM_PASSWORD ?? "admin99";
const CRM_DOMAIN     = "crm.compassopolitico.it";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const username = body.get("username")?.toString() ?? "";
  const password = body.get("password")?.toString() ?? "";

  const host = req.headers.get("host") ?? "";
  const isCrm = host === CRM_DOMAIN;

  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    const loginUrl = isCrm ? "/login?error=1" : "/crm/login?error=1";
    return NextResponse.redirect(new URL(loginUrl, req.url));
  }

  const cookieStore = await cookies();
  cookieStore.set("crm_auth", "crm_authenticated", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  const homeUrl = isCrm ? "/" : "/crm";
  return NextResponse.redirect(new URL(homeUrl, req.url));
}
