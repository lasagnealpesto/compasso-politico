import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_USER     = process.env.CRM_USER     ?? "admin";
const ADMIN_PASSWORD = process.env.CRM_PASSWORD ?? "admin99";
const COOKIE_VALUE   = "crm_authenticated";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const username = body.get("username")?.toString() ?? "";
  const password = body.get("password")?.toString() ?? "";

  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/crm/login?error=1", req.url));
  }

  const cookieStore = await cookies();
  cookieStore.set("crm_auth", COOKIE_VALUE, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.redirect(new URL("/crm", req.url));
}
