import { translate, type Locale } from "@next-gen-care/localization";

import { legalRoutes, portalDomainRoutes, publicDomainPath } from "../content/portal-routes";
import { PortalLanguageSwitcher } from "./portal-language-switcher";

export function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="wordmark" href={`/${locale}`}>
          {translate(locale, "foundation.brand")}
        </a>
        <nav
          aria-label={translate(locale, "foundation.primary_navigation")}
          className="primary-navigation"
        >
          <ul>
            <li>
              <a href={`/${locale}`}>{translate(locale, "portal.home")}</a>
            </li>
            {portalDomainRoutes.map((route) => (
              <li key={route.domain}>
                <a href={publicDomainPath(locale, route.domain)}>
                  {translate(locale, route.labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <PortalLanguageSwitcher locale={locale} />
      </div>
      <div className="site-header__utility">
        <a href={`/${locale}/${legalRoutes.privacy[locale]}`}>
          {translate(locale, "portal.privacy.label")}
        </a>
      </div>
    </header>
  );
}
