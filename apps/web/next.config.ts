import type { NextConfig } from "next";
import path from "node:path";
import { withPayload } from "@payloadcms/next/withPayload";

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
    return [
      {
        source: "/(.*)",
        headers: securityHeaders(process.env.NODE_ENV === "production")
      }
    ];
  }
};

export default withPayload(nextConfig);
