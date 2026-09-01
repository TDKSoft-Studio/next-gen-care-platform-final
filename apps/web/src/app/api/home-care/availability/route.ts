import { NextRequest, NextResponse } from "next/server";

import { appointmentApiUrl } from "../../../../appointment/appointment-client";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function problem(status: number, code: string, detail: string) {
  return NextResponse.json({ status, code, detail }, { status });
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const serviceId = query.get("serviceId");
  const locationId = query.get("locationId");
  const date = query.get("date");
  const mode = query.get("mode");
  if (
    !serviceId ||
    !uuidPattern.test(serviceId) ||
    !locationId ||
    !uuidPattern.test(locationId) ||
    !date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    (mode !== "HOME" && mode !== "CLINIC")
  ) {
    return problem(400, "INVALID_AVAILABILITY_QUERY", "The availability search is invalid.");
  }

  const baseUrl = appointmentApiUrl();
  if (!baseUrl)
    return problem(503, "APPOINTMENT_API_UNAVAILABLE", "Availability is temporarily unavailable.");

  const upstream = new URL(`${baseUrl}/api/v1/availability`);
  upstream.searchParams.set("serviceId", serviceId);
  upstream.searchParams.set("locationId", locationId);
  upstream.searchParams.set("date", date);
  upstream.searchParams.set("mode", mode);
  // Upstream renamed Patient -> Client (API repo Phase 12/13); the availability query
  // parameters are now clientLat / clientLng.
  for (const name of ["clientLat", "clientLng"]) {
    const value = query.get(name);
    if (value) upstream.searchParams.set(name, value);
  }

  try {
    const response = await fetch(upstream, {
      signal: AbortSignal.timeout(8_000),
      cache: "no-store"
    });
    if (!response.ok)
      return problem(
        response.status >= 400 ? response.status : 502,
        "AVAILABILITY_UNAVAILABLE",
        "Availability is temporarily unavailable."
      );
    return NextResponse.json(await response.json(), { status: 200 });
  } catch {
    return problem(502, "AVAILABILITY_UNAVAILABLE", "Availability is temporarily unavailable.");
  }
}
