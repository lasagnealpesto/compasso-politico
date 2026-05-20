import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("crm_auth");
  return NextResponse.redirect(new URL("/crm/login", req.url));
}
