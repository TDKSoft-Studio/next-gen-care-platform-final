import type { MetadataRoute } from "next";

import { isPublicIndexingEnabled, publicSiteUrl } from "../config/public-site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = publicSiteUrl();
  const indexingEnabled = isPublicIndexingEnabled();

  return {
    rules: {
      userAgent: "*",
      allow: indexingEnabled ? "/" : undefined,
      disallow: indexingEnabled ? ["/admin/", "/api/", "/health/"] : "/"
    },
    sitemap: indexingEnabled && siteUrl ? new URL("/sitemap.xml", siteUrl).toString() : undefined
  };
}
