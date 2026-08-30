import { locales } from "@next-gen-care/localization";
import type { MetadataRoute } from "next";

import { legalRoutes, portalDomainRoutes, publicDomainPath } from "../content/portal-routes";
import { siteIndexingEnabled, siteOrigin } from "../content/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteIndexingEnabled()) return [];

  const origin = siteOrigin();
  return locales.flatMap((locale) => [
    { url: `${origin}/${locale}` },
    ...portalDomainRoutes.map((route) => ({
      url: `${origin}${publicDomainPath(locale, route.domain)}`
    })),
    { url: `${origin}/${locale}/${legalRoutes.legal[locale]}` },
    { url: `${origin}/${locale}/${legalRoutes.privacy[locale]}` }
  ]);
}
