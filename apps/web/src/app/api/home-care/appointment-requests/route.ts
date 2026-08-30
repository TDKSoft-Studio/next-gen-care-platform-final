import { NextRequest, NextResponse } from "next/server";

import {
  submitAppointmentRequest,
  type AppointmentRequestPayload
} from "../../../../appointment/appointment-client";

export const runtime = "nodejs";

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function isPayload(value: unknown): value is AppointmentRequestPayload {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  const patient = body.patient;
  if (!patient || typeof patient !== "object") return false;
  const person = patient as Record<string, unknown>;
  return (
    isUuid(body.holdId) &&
    typeof person.firstName === "string" &&
    person.firstName.trim().length > 0 &&
    typeof person.lastName === "string" &&
    person.lastName.trim().length > 0 &&
    typeof person.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email)
  );
}

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
  if (!isPayload(body)) {
    return problem(422, "INVALID_APPOINTMENT_REQUEST", "The appointment request is invalid.");
  }

  try {
    const accepted = await submitAppointmentRequest(body, idempotencyKey);
    return NextResponse.json(accepted, { status: 202 });
  } catch (error) {
    if (error instanceof Error && error.message === "APPOINTMENT_API_NOT_CONFIGURED") {
      return problem(
        503,
        "APPOINTMENT_API_UNAVAILABLE",
        "Appointment requests are temporarily unavailable."
      );
    }
    if (error && typeof error === "object" && "status" in error) {
      const upstream = error as { status?: unknown; code?: unknown; detail?: unknown };
      const status = typeof upstream.status === "number" ? upstream.status : 502;
      return problem(
        status >= 400 && status <= 599 ? status : 502,
        typeof upstream.code === "string" ? upstream.code : "APPOINTMENT_API_ERROR",
        typeof upstream.detail === "string"
          ? upstream.detail
          : "The appointment request could not be submitted."
      );
    }
    return problem(
      502,
      "APPOINTMENT_API_UNAVAILABLE",
      "Appointment requests are temporarily unavailable."
    );
  }
}
