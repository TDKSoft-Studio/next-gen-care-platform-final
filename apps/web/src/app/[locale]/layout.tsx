import { isLocale, localePath, locales, translate, type Locale } from "@next-gen-care/localization";
import { MainNav, SkipLink } from "@next-gen-care/ui";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { LocaleSwitcher } from "../../components/locale-switcher";
import { CookieConsentBanner } from "../../components/cookie-consent-banner";
import { isPublicIndexingEnabled, publicSiteUrl } from "../../config/public-site";

import "@next-gen-care/ui/tokens.css";
import "@next-gen-care/ui/foundation.css";
import "../global.css";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

function metadataFor(locale: Locale): Metadata {
  const siteUrl = publicSiteUrl();
  const indexingEnabled = isPublicIndexingEnabled();
  const canonical = siteUrl ? new URL(localePath(locale), siteUrl).toString() : undefined;

  return {
    title: translate(locale, "foundation.brand"),
    description: translate(locale, "foundation.introduction"),
    alternates: siteUrl
      ? {
          canonical,
          languages: {
            "fr-BE": new URL(localePath("fr"), siteUrl).toString(),
            "nl-BE": new URL(localePath("nl"), siteUrl).toString(),
            "x-default": new URL(localePath("fr"), siteUrl).toString()
          }
        }
      : undefined,
    openGraph: {
      description: translate(locale, "foundation.introduction"),
      locale: locale === "fr" ? "fr_BE" : "nl_BE",
      siteName: translate(locale, "foundation.brand"),
      title: translate(locale, "foundation.brand"),
      type: "website",
      url: canonical
    },
    robots: { follow: indexingEnabled, index: indexingEnabled }
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return metadataFor(locale);
}

const domainRoutes = [
  { path: "/", translationKey: "nav.home" },
  { path: "/home-care", translationKey: "nav.home_care" },
  { path: "/operating-room", translationKey: "nav.operating_room" },
  { path: "/well-being", translationKey: "nav.well_being" },
  { path: "/travel-team-building", translationKey: "nav.travel_team_building" },
  { path: "/health-tech", translationKey: "nav.health_tech" }
] as const;

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale}>
      <body>
        <SkipLink>{translate(locale, "foundation.skip_to_content")}</SkipLink>
        <header className="site-header">
          <div className="contact-strip">
            <div className="contact-strip__inner">
              <a href="tel:+32460960294">+32 460 96 02 94</a>
              <a href="mailto:hello@nextgen-cares.org">hello@nextgen-cares.org</a>
              <span>nextgen-cares.org</span>
            </div>
          </div>
          <div className="site-header__inner">
            <a className="brand-lockup" href={localePath(locale)}>
              <Image
                alt={translate(locale, "foundation.brand")}
                className="brand-lockup__mark"
                height={512}
                priority
                src="/brand/logo-mfr.webp"
                unoptimized
                width={512}
              />
              <span className="brand-lockup__name">{translate(locale, "foundation.brand")}</span>
            </a>
            <div className="site-header__actions">
              <LocaleSwitcher currentLocale={locale} />
              <a className="site-header__contact" href="mailto:hello@nextgen-cares.org">
                {translate(locale, "foundation.contact_cta")}
              </a>
            </div>
          </div>
          <div className="site-nav">
            <MainNav
              label={translate(locale, "foundation.primary_navigation")}
              items={domainRoutes.map((route) => ({
                href: localePath(locale, route.path),
                label: translate(locale, route.translationKey)
              }))}
            />
          </div>
        </header>
        {children}
        <CookieConsentBanner locale={locale} />
        <footer className="site-footer">
          <div>
            <span className="site-footer__brand">{translate(locale, "foundation.brand")}</span>
            <p>{translate(locale, "foundation.notice")}</p>
          </div>
          <a href={localePath(locale, "/legal")}>{translate(locale, "foundation.legal_link")}</a>
        </footer>
      </body>
    </html>
  );
}
