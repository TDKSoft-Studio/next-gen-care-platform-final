import { isLocale, preferredLocale } from "@next-gen-care/localization";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const firstSegment = request.nextUrl.pathname.split("/")[1] ?? "";
  if (isLocale(firstSegment)) return NextResponse.next();

  const locale = preferredLocale(request.headers.get("accept-language"));
  const destination = request.nextUrl.clone();
  destination.pathname = `/${locale}${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}`;
  return NextResponse.redirect(destination, 307);
}

export const config = {
  matcher: ["/((?!admin|api|health|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
