import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";
  const isCrmHost = host === "crm.compassopolitico.it";

  if (
    pathname.startsWith("/crm") &&
    !pathname.startsWith("/crm/login") &&
    !pathname.startsWith("/api/crm/login") &&
    !pathname.startsWith("/api/crm/logout")
  ) {
    const auth = req.cookies.get("crm_auth")?.value;
    if (auth !== "crm_authenticated") {
      // Su subdomain redirect a /login (Vercel lo riscrive a /crm/login)
      // Su main domain redirect a /crm/login direttamente
      const loginPath = isCrmHost ? "/login" : "/crm/login";
      return NextResponse.redirect(new URL(loginPath, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/crm/:path*", "/api/crm/:path*"],
};
