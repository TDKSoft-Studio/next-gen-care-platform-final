"use client";

import { locales, translate, type Locale } from "@next-gen-care/localization";
import { LanguageSwitcher } from "@next-gen-care/ui";
import { usePathname } from "next/navigation";

import { equivalentLocalePath } from "../content/portal-routes";

export function PortalLanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <LanguageSwitcher
      currentLocale={locale}
      label={translate(locale, "foundation.language_selector")}
      options={locales.map((targetLocale) => ({
        href: equivalentLocalePath(pathname, targetLocale),
        label: translate(locale, `foundation.locale.${targetLocale}`),
        locale: targetLocale
      }))}
    />
  );
}
