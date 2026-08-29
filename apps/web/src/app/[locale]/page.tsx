import { isLocale, translate } from "@next-gen-care/localization";
import { notFound } from "next/navigation";

interface FoundationPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FoundationPage({ params }: FoundationPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const statusItems = [
    "foundation.status_accessibility",
    "foundation.status_localization",
    "foundation.status_quality"
  ] as const;

  return (
    <main id="main-content" tabIndex={-1}>
      <section aria-labelledby="foundation-heading" className="foundation-hero">
        <div className="foundation-hero__glow" aria-hidden="true" />
        <div className="foundation-hero__content">
          <p className="eyebrow">{translate(locale, "foundation.eyebrow")}</p>
          <h1 id="foundation-heading">{translate(locale, "foundation.heading")}</h1>
          <p className="lede">{translate(locale, "foundation.introduction")}</p>
        </div>
        <aside aria-labelledby="status-heading" className="foundation-status">
          <h2 id="status-heading">{translate(locale, "foundation.status_heading")}</h2>
          <ul>
            {statusItems.map((key) => (
              <li key={key}>{translate(locale, key)}</li>
            ))}
          </ul>
        </aside>
      </section>
      <p className="foundation-notice" role="note">
        {translate(locale, "foundation.notice")}
      </p>
    </main>
  );
}
