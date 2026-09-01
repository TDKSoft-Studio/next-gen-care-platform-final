import { timingSafeEqual } from "node:crypto";

import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function isAuthorized(received: string | null, expected: string | undefined): boolean {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

// The secret arrives as a query parameter (Payload's standard preview pattern).
// `Referrer-Policy: no-referrer` blocks referrer leakage and the redirect below
// drops the secret from the browser-visible URL, but it can still land in server
// access logs. Tracked as debt in docs/compliance/SECURITY-BASELINE.md.
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const locale = request.nextUrl.searchParams.get("locale");
  const slug = request.nextUrl.searchParams.get("slug");

  if (!isAuthorized(secret, process.env.PREVIEW_SECRET)) {
    return new NextResponse("Not found", { status: 404 });
  }

  if ((locale !== "fr" && locale !== "nl") || !slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return new NextResponse("Invalid preview target", { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(new URL(`/${locale}/content/${slug}`, request.url));
}
