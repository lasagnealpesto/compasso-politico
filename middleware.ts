import { NextRequest, NextResponse } from "next/server";

const CRM_DOMAIN = "crm.compassopolitico.it";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const isCrm = host === CRM_DOMAIN;
  const { pathname } = req.nextUrl;

  // ── Sottodominio crm.compassopolitico.it ──────────────────────────────────
  if (isCrm) {
    const auth = req.cookies.get("crm_auth")?.value;
    const isAuth = auth === "crm_authenticated";

    // Mappa path esterni → path interni
    const internalMap: Record<string, string> = {
      "/":              "/crm",
      "/login":         "/crm/login",
      "/api/login":     "/api/crm/login",
      "/api/logout":    "/api/crm/logout",
      // passthrough: form posta direttamente a questi path
      "/api/crm/login":  "/api/crm/login",
      "/api/crm/logout": "/api/crm/logout",
    };

    const internalPath = internalMap[pathname] ?? `/crm${pathname}`;

    // Non autenticato → login (escludi le rotte di auth stesse)
    const isAuthRoute = ["/login", "/api/login", "/api/crm/login", "/api/crm/logout"].includes(pathname);
    if (!isAuth && !isAuthRoute) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Già autenticato su /login → home
    if (isAuth && pathname === "/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // Rewrite verso il path interno Next.js
    const url = req.nextUrl.clone();
    url.pathname = internalPath;
    return NextResponse.rewrite(url);
  }

  // ── Dominio principale: proteggi /crm/* ───────────────────────────────────
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
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|loghi|politici|carousels|newsletters).*)"],
};
