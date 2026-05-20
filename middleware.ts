import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Proteggi tutto /crm tranne /crm/login e le API di auth
  if (
    pathname.startsWith("/crm") &&
    !pathname.startsWith("/crm/login") &&
    !pathname.startsWith("/api/crm/login")
  ) {
    const auth = req.cookies.get("crm_auth")?.value;
    if (auth !== "crm_authenticated") {
      return NextResponse.redirect(new URL("/crm/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/crm/:path*", "/api/crm/:path*"],
};
