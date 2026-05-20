import { NextRequest, NextResponse } from "next/server";

const CRM_HOST = "crm.compassopolitico.it";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";
  const isCrmHost = host === CRM_HOST;

  // ── Subdomain: crm.compassopolitico.it ──
  if (isCrmHost) {
    // Lascia passare API e asset senza toccarli
    if (pathname.startsWith("/api/") || pathname.startsWith("/carousels/")) {
      return NextResponse.next();
    }

    // Se per caso qualcuno arriva su /crm o /crm/* dal subdomain, pulisci l'URL
    if (pathname === "/crm") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (pathname.startsWith("/crm/")) {
      return NextResponse.redirect(new URL(pathname.replace(/^\/crm/, ""), req.url));
    }

    // /login → rewrite a /crm/login (no auth check)
    if (pathname === "/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/crm/login";
      return NextResponse.rewrite(url);
    }

    // Tutto il resto: check auth, poi rewrite a /crm/*
    const auth = req.cookies.get("crm_auth")?.value;
    if (auth !== "crm_authenticated") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/crm" : `/crm${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ── Main domain: /crm/* non esiste più, redirect al subdomain ──
  if (pathname.startsWith("/crm")) {
    return NextResponse.redirect(new URL(`https://${CRM_HOST}/`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Escludi static Next.js, favicon, e carousel (file statici pubblici)
  matcher: ["/((?!_next/|favicon\\.ico|icon\\.svg|carousels/).*)"],
};
