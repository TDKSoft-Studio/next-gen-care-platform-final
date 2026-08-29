import { isLocale, localePath, locales, translate, type Locale } from "@next-gen-care/localization";
import { LanguageSwitcher, MainNav, SkipLink } from "@next-gen-care/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import "@next-gen-care/ui/tokens.css";
import "@next-gen-care/ui/foundation.css";
import "../global.css";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

function metadataFor(locale: Locale): Metadata {
  return {
    title: translate(locale, "foundation.brand"),
    description: translate(locale, "foundation.introduction"),
    robots: { follow: false, index: false }
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
          <div className="site-header__inner">
            <span className="wordmark">{translate(locale, "foundation.brand")}</span>
            <LanguageSwitcher
              currentLocale={locale}
              label={translate(locale, "foundation.language_selector")}
              options={locales.map((targetLocale) => ({
                href: localePath(targetLocale),
                label: translate(locale, `foundation.locale.${targetLocale}`),
                locale: targetLocale
              }))}
            />
          </div>
        </header>
        <div className="site-nav">
          <MainNav
            label={translate(locale, "foundation.primary_navigation")}
            items={domainRoutes.map((route) => ({
              href: localePath(locale, route.path),
              label: translate(locale, route.translationKey)
            }))}
          />
        </div>
        {children}
      </body>
    </html>
  );
}
