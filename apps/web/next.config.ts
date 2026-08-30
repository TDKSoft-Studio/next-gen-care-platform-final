import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import path from "node:path";

import { securityHeaders } from "./src/security/headers";

const nextConfig: NextConfig = {
  experimental: {
    useTypeScriptCli: false
  },
  output: "standalone",
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: [
    "@next-gen-care/localization",
    "@next-gen-care/observability",
    "@next-gen-care/ui"
  ],
  async headers() {
    const production = process.env.NODE_ENV === "production";
    const protectedHeaders = securityHeaders(production);
    const noIndexHeaders = [
      ...protectedHeaders,
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }
    ];
    return [
      {
        source: "/:locale(fr|nl)/:path*",
        headers: securityHeaders(production, true)
      },
      { source: "/", headers: protectedHeaders },
      { source: "/admin/:path*", headers: noIndexHeaders },
      { source: "/cms-api/:path*", headers: noIndexHeaders },
      { source: "/cms-graphql/:path*", headers: noIndexHeaders },
      { source: "/health/:path*", headers: protectedHeaders },
      { source: "/media/:path*", headers: protectedHeaders }
    ];
  }
};

export default withPayload(nextConfig);
