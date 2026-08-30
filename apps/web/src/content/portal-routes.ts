import type { CatalogKey, Locale } from "@next-gen-care/localization";

export type PublicDomain = "home-care" | "operating-room" | "wellbeing" | "travel" | "health-tech";

export interface PortalDomainRoute {
  domain: PublicDomain;
  labelKey: CatalogKey;
  slugs: Record<Locale, string>;
  summaryKey: CatalogKey;
}

export const portalDomainRoutes: readonly PortalDomainRoute[] = [
  {
    domain: "home-care",
    labelKey: "portal.domain.home-care.label",
    slugs: { fr: "soins-a-domicile", nl: "thuiszorg" },
    summaryKey: "portal.domain.home-care.summary"
  },
  {
    domain: "operating-room",
    labelKey: "portal.domain.operating-room.label",
    slugs: { fr: "blocs-operatoires", nl: "operatiekwartier" },
    summaryKey: "portal.domain.operating-room.summary"
  },
  {
    domain: "wellbeing",
    labelKey: "portal.domain.wellbeing.label",
    slugs: { fr: "bien-etre", nl: "welzijn" },
    summaryKey: "portal.domain.wellbeing.summary"
  },
  {
    domain: "travel",
    labelKey: "portal.domain.travel.label",
    slugs: { fr: "voyages-team-building", nl: "reizen-team-building" },
    summaryKey: "portal.domain.travel.summary"
  },
  {
    domain: "health-tech",
    labelKey: "portal.domain.health-tech.label",
    slugs: { fr: "health-tech", nl: "health-tech" },
    summaryKey: "portal.domain.health-tech.summary"
  }
] as const;

export const legalRoutes = {
  legal: { fr: "mentions-legales", nl: "wettelijke-vermeldingen" },
  privacy: { fr: "vie-privee", nl: "privacy" }
} as const;

export function publicDomainPath(locale: Locale, domain: PublicDomain): string {
  const route = portalDomainRoutes.find((candidate) => candidate.domain === domain);
  if (!route) return `/${locale}`;
  return `/${locale}/${route.slugs[locale]}`;
}

export function domainRouteFromSlug(locale: Locale, slug: string): PortalDomainRoute | undefined {
  return portalDomainRoutes.find((route) => route.slugs[locale] === slug);
}

export function equivalentLocalePath(pathname: string, targetLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  const slug = segments[1];
  if (!slug) return `/${targetLocale}`;

  const domainRoute = portalDomainRoutes.find((route) => Object.values(route.slugs).includes(slug));
  if (domainRoute) return publicDomainPath(targetLocale, domainRoute.domain);

  const legalRoute = Object.values(legalRoutes).find((route) =>
    Object.values(route).some((candidate) => candidate === slug)
  );
  if (legalRoute) return `/${targetLocale}/${legalRoute[targetLocale]}`;

  return `/${targetLocale}`;
}
