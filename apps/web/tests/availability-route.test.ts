import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "../src/app/api/home-care/availability/route";

const uuid = "8d6c5b4a-3210-4fed-8abc-1234567890ab";

function availabilityRequest(params: Record<string, string>) {
  const query = new URLSearchParams({
    serviceId: uuid,
    locationId: uuid,
    date: "2026-09-01",
    mode: "HOME",
    ...params
  });
  return new NextRequest(`http://localhost/api/home-care/availability?${query}`);
}

function stubUpstream() {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ slots: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  );
  vi.stubEnv("APPOINTMENT_API_URL", "https://appointments.example.test");
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("GET /api/home-care/availability", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("forwards the renamed clientLat / clientLng geo parameters upstream", async () => {
    const fetchMock = stubUpstream();

    const response = await GET(availabilityRequest({ clientLat: "50.6", clientLng: "5.5" }));

    expect(response.status).toBe(200);
    const upstream = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(upstream.pathname).toBe("/api/v1/availability");
    expect(upstream.searchParams.get("clientLat")).toBe("50.6");
    expect(upstream.searchParams.get("clientLng")).toBe("5.5");
  });

  it("does not forward the legacy patientLat / patientLng parameters", async () => {
    const fetchMock = stubUpstream();

    await GET(availabilityRequest({ patientLat: "50.6", patientLng: "5.5" }));

    const upstream = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(upstream.searchParams.has("patientLat")).toBe(false);
    expect(upstream.searchParams.has("clientLat")).toBe(false);
  });
});
