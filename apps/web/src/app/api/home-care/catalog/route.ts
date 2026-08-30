import { NextResponse } from "next/server";

import { appointmentApiUrl } from "../../../../appointment/appointment-client";

export const runtime = "nodejs";

function problem(status: number, code: string, detail: string) {
  return NextResponse.json({ status, code, detail }, { status });
}

export async function GET() {
  const baseUrl = appointmentApiUrl();
  if (!baseUrl)
    return problem(
      503,
      "APPOINTMENT_API_UNAVAILABLE",
      "Home-care services are temporarily unavailable."
    );
  try {
    const [servicesResponse, locationsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/v1/services`, {
        signal: AbortSignal.timeout(8_000),
        cache: "no-store"
      }),
      fetch(`${baseUrl}/api/v1/locations`, {
        signal: AbortSignal.timeout(8_000),
        cache: "no-store"
      })
    ]);
    if (!servicesResponse.ok || !locationsResponse.ok)
      return problem(
        502,
        "APPOINTMENT_API_UNAVAILABLE",
        "Home-care services are temporarily unavailable."
      );
    const services = (await servicesResponse.json()) as Array<Record<string, unknown>>;
    const locations = (await locationsResponse.json()) as Array<Record<string, unknown>>;
    const service = services.find(
      (item) =>
        item.paymentMode === "PAY_ON_SITE" &&
        item.supportsHome === true &&
        typeof item.id === "string"
    );
    const location = locations.find((item) => {
      const searchable = [item.name, item.city, item.addressLine, item.postalCode]
        .filter((value): value is string => typeof value === "string")
        .join(" ")
        .toLocaleLowerCase("fr-BE");
      return (
        item.supportsHomeCare === true && /li[eè]ge/.test(searchable) && typeof item.id === "string"
      );
    });
    if (!service || !location)
      return NextResponse.json({ service: null, location: null, serviceArea: "Province de Liège" });
    return NextResponse.json({
      service: { id: service.id, name: typeof service.name === "string" ? service.name : "" },
      location: { id: location.id, name: typeof location.name === "string" ? location.name : "" },
      serviceArea: "Province de Liège"
    });
  } catch {
    return problem(
      502,
      "APPOINTMENT_API_UNAVAILABLE",
      "Home-care services are temporarily unavailable."
    );
  }
}
