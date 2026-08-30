import { isLocale, localePath, translate } from "@next-gen-care/localization";
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

  const domains = [
    {
      path: "/home-care",
      title: "domain.home_care.heading",
      text: "domain.home_care.introduction"
    },
    {
      path: "/operating-room",
      title: "domain.operating_room.heading",
      text: "domain.operating_room.introduction"
    },
    {
      path: "/well-being",
      title: "domain.well_being.heading",
      text: "domain.well_being.introduction"
    },
    {
      path: "/travel-team-building",
      title: "domain.travel_team_building.heading",
      text: "domain.travel_team_building.introduction"
    },
    {
      path: "/health-tech",
      title: "domain.health_tech.heading",
      text: "domain.health_tech.introduction"
    }
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
      <section className="domain-overview" aria-labelledby="domain-overview-heading">
        <div className="domain-overview__heading">
          <p className="eyebrow">{translate(locale, "foundation.domains_eyebrow")}</p>
          <h2 id="domain-overview-heading">{translate(locale, "foundation.domains_heading")}</h2>
        </div>
        <ul className="domain-grid">
          {domains.map((domain) => (
            <li key={domain.path}>
              <a className="domain-card" href={localePath(locale, domain.path)}>
                <h3>{translate(locale, domain.title)}</h3>
                <p>{translate(locale, domain.text)}</p>
                <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
