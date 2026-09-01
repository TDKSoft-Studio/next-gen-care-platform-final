export interface SecurityHeader {
  key: string;
  value: string;
}

export function contentSecurityPolicy(production: boolean): string {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob:",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    // The Payload admin code-editor field (Monaco) runs its language services in
    // blob: web workers; without this they fall back to script-src and are blocked.
    "worker-src 'self' blob:"
  ];

  if (production) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

export function securityHeaders(production: boolean): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(production) },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" }
  ];

  if (production) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains"
    });
  }

  return headers;
}
