export interface AppointmentRequestPayload {
  holdId: string;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: {
      addressLine?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
  };
}

export interface AppointmentRequestAccepted {
  requestId: string;
  status: "PENDING_REVIEW";
  reviewExpiresAt: string;
}

export interface AppointmentClientError {
  status: number;
  code: string;
  detail: string;
}

const REQUEST_TIMEOUT_MS = 8_000;

export function appointmentApiUrl(): string | null {
  const value = process.env.APPOINTMENT_API_URL;
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.hostname === "localhost"
      ? url.toString().replace(/\/$/, "")
      : null;
  } catch {
    return null;
  }
}

export async function submitAppointmentRequest(
  payload: AppointmentRequestPayload,
  idempotencyKey: string
): Promise<AppointmentRequestAccepted> {
  const baseUrl = appointmentApiUrl();
  if (!baseUrl) throw new Error("APPOINTMENT_API_NOT_CONFIGURED");

  const response = await fetch(`${baseUrl}/api/v1/appointment-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store"
  });

  if (response.status !== 202) {
    let code = "APPOINTMENT_API_ERROR";
    try {
      const problem = (await response.json()) as { code?: unknown };
      if (typeof problem.code === "string" && /^[A-Z0-9_]+$/.test(problem.code))
        code = problem.code;
    } catch {
      // The upstream body is intentionally not forwarded or logged.
    }
    const error: AppointmentClientError = {
      status: response.status >= 400 && response.status <= 599 ? response.status : 502,
      code,
      detail: "The appointment request could not be submitted."
    };
    throw error;
  }

  const accepted = (await response.json()) as Partial<AppointmentRequestAccepted>;
  if (
    typeof accepted.requestId !== "string" ||
    accepted.status !== "PENDING_REVIEW" ||
    typeof accepted.reviewExpiresAt !== "string"
  ) {
    throw new Error("APPOINTMENT_API_INVALID_RESPONSE");
  }
  return accepted as AppointmentRequestAccepted;
}
