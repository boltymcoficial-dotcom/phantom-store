import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.endsWith(".html")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const cleanPath = pathname.slice(0, -".html".length);

  url.pathname = cleanPath === "/index" || cleanPath === "/inicio" ? "/" : cleanPath || "/";

  return NextResponse.redirect(url, 308);
}
