export type LogLevel = "info" | "warn" | "error";
export type SafeEventName =
  "application.started" | "http.request.completed" | "dependency.request.completed";

export interface SafeTelemetryAttributes {
  component?: "web";
  durationMs?: number;
  httpStatus?: number;
  locale?: "fr" | "nl";
  operation?: "render" | "redirect" | "startup";
  outcome?: "success" | "failure" | "degraded";
  traceId?: string;
}

export interface SafeLogRecord extends SafeTelemetryAttributes {
  event: SafeEventName;
  level: LogLevel;
  timestamp: string;
}

const allowedAttributeKeys = new Set([
  "component",
  "durationMs",
  "httpStatus",
  "locale",
  "operation",
  "outcome",
  "traceId"
]);
const traceIdPattern = /^[a-f0-9]{32}$/;

export function validateSafeAttributes(
  candidate: Record<string, unknown>
): SafeTelemetryAttributes {
  for (const key of Object.keys(candidate)) {
    if (!allowedAttributeKeys.has(key)) throw new Error(`Unsafe telemetry attribute: ${key}`);
  }
  if (candidate.traceId !== undefined) {
    if (typeof candidate.traceId !== "string" || !traceIdPattern.test(candidate.traceId)) {
      throw new Error("Trace ID must contain exactly 32 lowercase hexadecimal characters");
    }
  }
  if (candidate.durationMs !== undefined) {
    if (typeof candidate.durationMs !== "number" || candidate.durationMs < 0) {
      throw new Error("Telemetry duration must be a non-negative number");
    }
  }
  if (candidate.httpStatus !== undefined) {
    if (
      typeof candidate.httpStatus !== "number" ||
      !Number.isInteger(candidate.httpStatus) ||
      candidate.httpStatus < 100 ||
      candidate.httpStatus > 599
    ) {
      throw new Error("HTTP status must be an integer between 100 and 599");
    }
  }
  return candidate as SafeTelemetryAttributes;
}

export function createLogRecord(
  level: LogLevel,
  event: SafeEventName,
  attributes: SafeTelemetryAttributes,
  now = new Date()
): SafeLogRecord {
  validateSafeAttributes(attributes as unknown as Record<string, unknown>);
  return {
    timestamp: now.toISOString(),
    level,
    event,
    ...attributes
  };
}
