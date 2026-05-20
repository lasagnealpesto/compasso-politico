import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CRM_DOMAIN = "crm.compassopolitico.it";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("crm_auth");

  const host = req.headers.get("host") ?? "";
  const loginUrl = host === CRM_DOMAIN ? "/login" : "/crm/login";
  return NextResponse.redirect(new URL(loginUrl, req.url));
}
