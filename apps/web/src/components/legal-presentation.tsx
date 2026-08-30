import { translate, type CatalogKey, type Locale } from "@next-gen-care/localization";

import type { Page } from "../cms/payload-types";
import { CmsRichText } from "./cms-rich-text";
import { ContactPanel } from "./contact-panel";
import { PreviewBanner } from "./preview-banner";

export function LegalPresentation({
  kind,
  locale,
  page,
  previewMode
}: {
  kind: "legal" | "privacy";
  locale: Locale;
  page: Page | null;
  previewMode: boolean;
}) {
  const titleKey = `portal.${kind}.title` as CatalogKey;
  const summaryKey = `portal.${kind}.summary` as CatalogKey;

  return (
    <main id="main-content" tabIndex={-1}>
      {previewMode ? <PreviewBanner locale={locale} /> : null}
      <section className="legal-hero">
        <p className="eyebrow">NEXT GEN CARE</p>
        <h1>{page?.title ?? translate(locale, titleKey)}</h1>
        <p className="lede">{page?.summary ?? translate(locale, summaryKey)}</p>
      </section>
      <section className="content-section reading-section">
        {page ? (
          <CmsRichText data={page.body} />
        ) : (
          <p className="empty-state">{translate(locale, summaryKey)}</p>
        )}
      </section>
      <ContactPanel locale={locale} />
    </main>
  );
}
