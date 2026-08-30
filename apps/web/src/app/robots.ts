import type { MetadataRoute } from "next";

import { siteIndexingEnabled, siteOrigin } from "../content/site-config";

export default function robots(): MetadataRoute.Robots {
  if (!siteIndexingEnabled()) {
    return { rules: { disallow: "/", userAgent: "*" } };
  }

  return {
    rules: {
      allow: "/",
      disallow: ["/admin", "/cms-api", "/cms-graphql", "/health"],
      userAgent: "*"
    },
    sitemap: `${siteOrigin()}/sitemap.xml`
  };
}
