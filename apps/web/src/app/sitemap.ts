import { locales, localePath } from "@next-gen-care/localization";
import type { MetadataRoute } from "next";

import { isPublicIndexingEnabled, publicSiteUrl } from "../config/public-site";

const publicPaths = [
  "/",
  "/home-care",
  "/operating-room",
  "/well-being",
  "/travel-team-building",
  "/health-tech",
  "/legal"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = publicSiteUrl();
  if (!siteUrl || !isPublicIndexingEnabled()) return [];

  return locales.flatMap((locale) =>
    publicPaths.map((path) => ({
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
      url: new URL(localePath(locale, path), siteUrl).toString()
    }))
  );
}
