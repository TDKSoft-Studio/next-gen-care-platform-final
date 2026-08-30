import { NextRequest, NextResponse } from "next/server";

import { appointmentApiUrl } from "../../../../appointment/appointment-client";

export const runtime = "nodejs";

function problem(status: number, code: string, detail: string) {
  return NextResponse.json({ status, code, detail }, { status });
}

export async function POST(request: NextRequest) {
  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey || idempotencyKey.length > 128 || !/^[\x21-\x7e]+$/.test(idempotencyKey)) {
    return problem(400, "IDEMPOTENCY_KEY_REQUIRED", "A valid Idempotency-Key is required.");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return problem(400, "INVALID_JSON", "The request body must be valid JSON.");
  }
  if (!body || typeof body !== "object")
    return problem(422, "INVALID_HOLD_REQUEST", "The hold request is invalid.");

  const baseUrl = appointmentApiUrl();
  if (!baseUrl)
    return problem(503, "APPOINTMENT_API_UNAVAILABLE", "Slots are temporarily unavailable.");
  try {
    const response = await fetch(`${baseUrl}/api/v1/booking-holds`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store"
    });
    if (response.status !== 201)
      return problem(
        response.status >= 400 ? response.status : 502,
        "HOLD_UNAVAILABLE",
        "This slot is no longer available."
      );
    return NextResponse.json(await response.json(), { status: 201 });
  } catch {
    return problem(502, "HOLD_UNAVAILABLE", "This slot is no longer available.");
  }
}
