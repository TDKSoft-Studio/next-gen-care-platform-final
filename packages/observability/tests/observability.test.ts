import { describe, expect, it } from "vitest";

import { createLogRecord, validateSafeAttributes } from "../src/index";

describe("privacy-preserving telemetry", () => {
  it("creates structured records from a fixed safe schema", () => {
    expect(
      createLogRecord(
        "info",
        "application.started",
        { component: "web", operation: "startup", outcome: "success" },
        new Date("2026-08-29T12:00:00.000Z")
      )
    ).toEqual({
      timestamp: "2026-08-29T12:00:00.000Z",
      level: "info",
      event: "application.started",
      component: "web",
      operation: "startup",
      outcome: "success"
    });
  });

  it("rejects arbitrary personal or health-data fields", () => {
    expect(() => validateSafeAttributes({ patientId: "synthetic-example" })).toThrow(
      "Unsafe telemetry attribute: patientId"
    );
    expect(() => validateSafeAttributes({ requestBody: { note: "example" } })).toThrow(
      "Unsafe telemetry attribute: requestBody"
    );
  });

  it("rejects unbounded correlation values", () => {
    expect(() => validateSafeAttributes({ traceId: "untrusted-header-value" })).toThrow(
      "Trace ID must contain exactly 32 lowercase hexadecimal characters"
    );
  });
});
