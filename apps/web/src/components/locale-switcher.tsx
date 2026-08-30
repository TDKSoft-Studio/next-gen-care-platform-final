"use client";

import { locales, switchLocalePath, translate, type Locale } from "@next-gen-care/localization";
import { LanguageSwitcher } from "@next-gen-care/ui";
import { usePathname } from "next/navigation";

interface LocaleSwitcherProps {
  currentLocale: Locale;
}

/**
 * Keeps a visitor on the equivalent public route when changing language.
 * A missing localized CMS document is handled as a 404, never by silently
 * presenting French content under the Dutch route (or the reverse).
 */
export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const pathname = usePathname();

  return (
    <LanguageSwitcher
      currentLocale={currentLocale}
      label={translate(currentLocale, "foundation.language_selector")}
      options={locales.map((targetLocale) => ({
        href: switchLocalePath(pathname, targetLocale),
        label: translate(currentLocale, `foundation.locale.${targetLocale}`),
        locale: targetLocale
      }))}
    />
  );
}
