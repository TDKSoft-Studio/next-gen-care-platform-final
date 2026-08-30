import { translate, type Locale } from "@next-gen-care/localization";

import { publicEmail, publicPhoneDisplay, publicPhoneHref } from "../content/site-config";

export function ContactPanel({ locale }: { locale: Locale }) {
  return (
    <section aria-labelledby="contact-heading" className="contact-panel">
      <div>
        <p className="eyebrow">NEXT GEN CARE</p>
        <h2 id="contact-heading">{translate(locale, "portal.contact.heading")}</h2>
        <p>{translate(locale, "portal.contact.summary")}</p>
      </div>
      <div className="contact-panel__actions">
        <a className="button" href={`mailto:${publicEmail}`}>
          {translate(locale, "portal.contact.email")}
        </a>
        <a className="button button--secondary" href={`tel:${publicPhoneHref}`}>
          {translate(locale, "portal.contact.phone")}: {publicPhoneDisplay}
        </a>
      </div>
    </section>
  );
}
