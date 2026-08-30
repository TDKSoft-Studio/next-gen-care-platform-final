import { isLocale, translate } from "@next-gen-care/localization";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicPortalContent, type PublicPageDomain } from "../../../cms/public-content";
import { DomainPresentation } from "../../../components/domain-presentation";
import { LegalPresentation } from "../../../components/legal-presentation";
import { publicMetadata } from "../../../content/metadata";
import {
  domainRouteFromSlug,
  legalRoutes,
  type PortalDomainRoute
} from "../../../content/portal-routes";

interface PublicPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ preview?: string | string[] }>;
}

interface ResolvedRoute {
  domain: PublicPageDomain;
  portalRoute?: PortalDomainRoute;
}

export const dynamic = "force-dynamic";

function resolveRoute(locale: "fr" | "nl", slug: string): ResolvedRoute | null {
  const portalRoute = domainRouteFromSlug(locale, slug);
  if (portalRoute) return { domain: portalRoute.domain, portalRoute };
  if (legalRoutes.legal[locale] === slug) return { domain: "legal" };
  if (legalRoutes.privacy[locale] === slug) return { domain: "privacy" };
  return null;
}

function fallbackMetadata(locale: "fr" | "nl", route: ResolvedRoute) {
  if (route.portalRoute) {
    return {
      description: translate(locale, route.portalRoute.summaryKey),
      title: translate(locale, route.portalRoute.labelKey)
    };
  }
  const kind = route.domain === "privacy" ? "privacy" : "legal";
  return {
    description: translate(locale, `portal.${kind}.summary`),
    title: translate(locale, `portal.${kind}.title`)
  };
}

export async function generateMetadata({
  params,
  searchParams
}: PublicPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const route = resolveRoute(locale, slug);
  if (!route) return {};
  const preview = (await searchParams).preview === "1";
  const content = await getPublicPortalContent(locale, route.domain, false);
  const fallback = fallbackMetadata(locale, route);
  return publicMetadata({
    description: content.page?.seo?.description ?? content.page?.summary ?? fallback.description,
    locale,
    pathname: `/${locale}/${slug}`,
    preview,
    title: content.page?.seo?.title ?? content.page?.title ?? fallback.title
  });
}

export default async function PublicPage({ params, searchParams }: PublicPageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const route = resolveRoute(locale, slug);
  if (!route) notFound();

  const preview = (await searchParams).preview === "1";
  const content = await getPublicPortalContent(locale, route.domain, preview);
  if (content.previewDenied) notFound();

  if (!route.portalRoute) {
    return (
      <LegalPresentation
        kind={route.domain === "privacy" ? "privacy" : "legal"}
        locale={locale}
        page={content.page}
        previewMode={content.previewMode}
      />
    );
  }

  return (
    <DomainPresentation
      locale={locale}
      page={content.page}
      previewMode={content.previewMode}
      route={route.portalRoute}
      services={content.services}
      trips={content.trips}
    />
  );
}
