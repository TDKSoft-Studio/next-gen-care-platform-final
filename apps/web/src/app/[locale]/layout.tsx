import { isLocale, locales, translate } from "@next-gen-care/localization";
import { SkipLink } from "@next-gen-care/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { siteIndexingEnabled, siteOrigin } from "../../content/site-config";

import "@next-gen-care/ui/tokens.css";
import "@next-gen-care/ui/foundation.css";
import "../global.css";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const index = siteIndexingEnabled();
  return {
    description: translate(locale, "portal.hero.summary"),
    metadataBase: new URL(siteOrigin()),
    robots: { follow: index, index },
    title: {
      default: translate(locale, "foundation.brand"),
      template: `%s — ${translate(locale, "foundation.brand")}`
    }
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale}>
      <body>
        <SkipLink>{translate(locale, "foundation.skip_to_content")}</SkipLink>
        <SiteHeader locale={locale} />
        {children}
        <aside className="emergency-notice" role="note">
          {translate(locale, "portal.emergency")}
        </aside>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
