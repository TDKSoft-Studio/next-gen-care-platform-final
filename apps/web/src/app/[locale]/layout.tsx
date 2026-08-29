import { isLocale, localePath, locales, translate, type Locale } from "@next-gen-care/localization";
import { LanguageSwitcher, SkipLink } from "@next-gen-care/ui";
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
        {children}
      </body>
    </html>
  );
}
