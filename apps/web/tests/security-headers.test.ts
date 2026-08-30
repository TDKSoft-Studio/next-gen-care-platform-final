import { describe, expect, it } from "vitest";

import { contentSecurityPolicy, securityHeaders } from "../src/security/headers";

describe("security header baseline", () => {
  it("blocks framing, objects, cross-origin forms, and referrer disclosure", () => {
    const headers = Object.fromEntries(
      securityHeaders(false).map(({ key, value }) => [key, value])
    );
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(headers["Content-Security-Policy"]).toContain("form-action 'self'");
    expect(headers["Referrer-Policy"]).toBe("no-referrer");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("adds transport hardening only for production", () => {
    expect(securityHeaders(false).some(({ key }) => key === "Strict-Transport-Security")).toBe(
      false
    );
    expect(securityHeaders(true).some(({ key }) => key === "Strict-Transport-Security")).toBe(true);
    expect(contentSecurityPolicy(true)).toContain("upgrade-insecure-requests");
  });

  it("allows only same-origin framing for CMS live preview of public pages", () => {
    const headers = Object.fromEntries(
      securityHeaders(true, true).map(({ key, value }) => [key, value])
    );
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'self'");
    expect(headers["X-Frame-Options"]).toBe("SAMEORIGIN");
  });
});
