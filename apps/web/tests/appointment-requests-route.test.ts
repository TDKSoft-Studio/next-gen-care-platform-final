import { NextRequest } from "next/server";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { submitAppointmentRequest } from "../src/appointment/appointment-client";
import { POST } from "../src/app/api/home-care/appointment-requests/route";

vi.mock("../src/appointment/appointment-client", () => ({
  submitAppointmentRequest: vi.fn()
}));

const submitMock = vi.mocked(submitAppointmentRequest);
const holdId = "8d6c5b4a-3210-4fed-8abc-1234567890ab";

function request(body: string, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/home-care/appointment-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": "request-key-1", ...headers },
    body
  });
}

describe("POST /api/home-care/appointment-requests", () => {
  beforeEach(() => submitMock.mockReset());

  it("forwards the renamed `client` payload and preserves 202 semantics", async () => {
    submitMock.mockResolvedValue({
      requestId: holdId,
      status: "PENDING_REVIEW",
      reviewExpiresAt: "2026-09-01T12:00:00Z"
    });

    const response = await POST(
      request(
        JSON.stringify({
          holdId,
          client: { firstName: "Test", lastName: "Client", email: "test@example.test" }
        })
      )
    );

    expect(response.status).toBe(202);
    expect(submitMock).toHaveBeenCalledWith(
      expect.objectContaining({ client: expect.objectContaining({ firstName: "Test" }) }),
      "request-key-1"
    );
  });

  it("rejects the legacy `patient` shape as an invalid request", async () => {
    const response = await POST(
      request(
        JSON.stringify({
          holdId,
          patient: { firstName: "Test", lastName: "Client", email: "test@example.test" }
        })
      )
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ code: "INVALID_APPOINTMENT_REQUEST" });
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("requires a usable Idempotency-Key", async () => {
    const response = await POST(
      request(JSON.stringify({ holdId, client: {} }), { "Idempotency-Key": "" })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: "IDEMPOTENCY_KEY_REQUIRED" });
  });

  it("rejects a body that is not valid JSON", async () => {
    const response = await POST(request("{not json"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: "INVALID_JSON" });
  });
});
