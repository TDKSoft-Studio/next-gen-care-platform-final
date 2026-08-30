import { translate, type Locale } from "@next-gen-care/localization";

import type { Page } from "../cms/payload-types";
import { portalDomainRoutes, publicDomainPath } from "../content/portal-routes";
import { CmsRichText } from "./cms-rich-text";
import { ContactPanel } from "./contact-panel";
import { PreviewBanner } from "./preview-banner";

export function HomePresentation({
  locale,
  page,
  previewMode
}: {
  locale: Locale;
  page: Page | null;
  previewMode: boolean;
}) {
  return (
    <main id="main-content" tabIndex={-1}>
      {previewMode ? <PreviewBanner locale={locale} /> : null}
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="eyebrow">{translate(locale, "portal.hero.eyebrow")}</p>
          <h1>{page?.title ?? translate(locale, "portal.hero.title")}</h1>
          <p className="lede">{page?.summary ?? translate(locale, "portal.hero.summary")}</p>
          <a className="button" href="#domains">
            {translate(locale, "portal.hero.action")}
          </a>
        </div>
        <div aria-hidden="true" className="home-hero__composition">
          <span className="composition__orb" />
          <span className="composition__line" />
          <strong>NGC</strong>
        </div>
      </section>
      {page ? (
        <section className="content-section reading-section">
          <CmsRichText data={page.body} />
        </section>
      ) : null}
      <section aria-labelledby="domains-heading" className="content-section" id="domains">
        <div className="section-heading">
          <p className="eyebrow">NEXT GEN CARE</p>
          <h2 id="domains-heading">{translate(locale, "portal.domains.heading")}</h2>
        </div>
        <div className="domain-grid">
          {portalDomainRoutes.map((route, index) => (
            <article className="domain-card" key={route.domain}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{translate(locale, route.labelKey)}</h3>
              <p>{translate(locale, route.summaryKey)}</p>
              <a href={publicDomainPath(locale, route.domain)}>
                {translate(locale, "portal.domain.discover")}
                <span aria-hidden="true"> →</span>
              </a>
            </article>
          ))}
        </div>
      </section>
      <ContactPanel locale={locale} />
    </main>
  );
}
