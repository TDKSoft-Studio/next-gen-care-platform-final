export interface SecurityHeader {
  key: string;
  value: string;
}

export function contentSecurityPolicy(production: boolean, allowSameOriginFraming = false): string {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self'",
    "form-action 'self'",
    `frame-ancestors ${allowSameOriginFraming ? "'self'" : "'none'"}`,
    "img-src 'self' data: blob:",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'"
  ];

  if (production) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

export function securityHeaders(
  production: boolean,
  allowSameOriginFraming = false
): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    {
      key: "Content-Security-Policy",
      value: contentSecurityPolicy(production, allowSameOriginFraming)
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    {
      key: "X-Frame-Options",
      value: allowSameOriginFraming ? "SAMEORIGIN" : "DENY"
    }
  ];

  if (production) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains"
    });
  }

  return headers;
}
