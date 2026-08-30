import { translate, type Locale } from "@next-gen-care/localization";

import { legalRoutes } from "../content/portal-routes";
import { publicEmail, publicPhoneDisplay, publicPhoneHref } from "../content/site-config";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <p className="wordmark">{translate(locale, "foundation.brand")}</p>
          <p>{translate(locale, "portal.footer.area")}</p>
        </div>
        <address>
          <a href={`mailto:${publicEmail}`}>{publicEmail}</a>
          <a href={`tel:${publicPhoneHref}`}>{publicPhoneDisplay}</a>
        </address>
        <nav aria-label={translate(locale, "portal.legal.label")}>
          <a href={`/${locale}/${legalRoutes.legal[locale]}`}>
            {translate(locale, "portal.legal.label")}
          </a>
          <a href={`/${locale}/${legalRoutes.privacy[locale]}`}>
            {translate(locale, "portal.privacy.label")}
          </a>
        </nav>
      </div>
    </footer>
  );
}
