import { describe, expect, it, vi } from "vitest";

import { submitAppointmentRequest } from "../src/appointment/appointment-client";

describe("appointment anti-corruption adapter", () => {
  it("submits the accepted pay-on-site review request contract and preserves 202 semantics", async () => {
    vi.stubEnv("APPOINTMENT_API_URL", "https://appointments.example.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            requestId: "8d6c5b4a-3210-4fed-8abc-1234567890ab",
            status: "PENDING_REVIEW",
            reviewExpiresAt: "2026-09-01T12:00:00Z"
          }),
          { status: 202, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    const result = await submitAppointmentRequest(
      {
        holdId: "8d6c5b4a-3210-4fed-8abc-1234567890ab",
        client: { firstName: "Test", lastName: "Patient", email: "test@example.test" }
      },
      "request-key-1"
    );

    expect(result.status).toBe("PENDING_REVIEW");
    expect(fetch).toHaveBeenCalledWith(
      "https://appointments.example.test/api/v1/appointment-requests",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Idempotency-Key": "request-key-1" })
      })
    );
    vi.unstubAllGlobals();
  });

  it("normalizes upstream errors without forwarding their detail", async () => {
    vi.stubEnv("APPOINTMENT_API_URL", "https://appointments.example.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: "SLOT_UNAVAILABLE", detail: "patient data" }), {
          status: 409
        })
      )
    );

    await expect(
      submitAppointmentRequest(
        {
          holdId: "8d6c5b4a-3210-4fed-8abc-1234567890ab",
          client: { firstName: "Test", lastName: "Patient", email: "test@example.test" }
        },
        "request-key-2"
      )
    ).rejects.toMatchObject({
      status: 409,
      code: "SLOT_UNAVAILABLE",
      detail: expect.not.stringContaining("patient")
    });
    vi.unstubAllGlobals();
  });
});
