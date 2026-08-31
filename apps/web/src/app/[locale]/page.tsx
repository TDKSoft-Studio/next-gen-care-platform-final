import { isLocale, localePath, translate } from "@next-gen-care/localization";
import Image from "next/image";
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
      text: "domain.home_care.introduction",
      tone: "home",
      index: "01"
    },
    {
      path: "/operating-room",
      title: "domain.operating_room.heading",
      text: "domain.operating_room.introduction",
      tone: "operating-room",
      index: "02"
    },
    {
      path: "/well-being",
      title: "domain.well_being.heading",
      text: "domain.well_being.introduction",
      tone: "well-being",
      index: "03"
    },
    {
      path: "/travel-team-building",
      title: "domain.travel_team_building.heading",
      text: "domain.travel_team_building.introduction",
      tone: "travel",
      index: "04",
      subBrand: "mindful"
    },
    {
      path: "/health-tech",
      title: "domain.health_tech.heading",
      text: "domain.health_tech.introduction",
      tone: "health-tech",
      index: "05"
    }
  ] as const;

  return (
    <main id="main-content" tabIndex={-1}>
      <section aria-labelledby="foundation-heading" className="foundation-hero">
        <div className="foundation-hero__art" aria-hidden="true">
          <span className="foundation-hero__orb" />
          <span className="foundation-hero__arc foundation-hero__arc--one" />
          <span className="foundation-hero__arc foundation-hero__arc--two" />
        </div>
        <div className="foundation-hero__content">
          <p className="eyebrow eyebrow--accent">{translate(locale, "foundation.eyebrow")}</p>
          <h1 id="foundation-heading">{translate(locale, "foundation.heading")}</h1>
          <p className="lede">{translate(locale, "foundation.introduction")}</p>
        </div>
        <aside aria-labelledby="status-heading" className="foundation-status">
          <h2 id="status-heading">{translate(locale, "foundation.status_heading")}</h2>
          <ul>
            {statusItems.map((key) => (
              <li key={key}>
                <span aria-hidden="true" className="foundation-status__marker" />
                {translate(locale, key)}
              </li>
            ))}
          </ul>
        </aside>
      </section>
      <p className="foundation-notice" role="note">
        {translate(locale, "foundation.notice")}
      </p>
      <section className="domain-overview" aria-labelledby="domain-overview-heading">
        <div className="domain-overview__heading">
          <p className="eyebrow eyebrow--accent">
            {translate(locale, "foundation.domains_eyebrow")}
          </p>
          <h2 id="domain-overview-heading">{translate(locale, "foundation.domains_heading")}</h2>
        </div>
        <ul className="domain-grid">
          {domains.map((domain) => (
            <li key={domain.path}>
              <a
                className={`domain-card domain-card--${domain.tone}`}
                href={localePath(locale, domain.path)}
              >
                <span className="domain-card__topline">
                  <span className="domain-card__index">{domain.index}</span>
                  {"subBrand" in domain && domain.subBrand === "mindful" ? (
                    <Image
                      alt="Mindful Healing Trips"
                      className="domain-card__sub-brand"
                      height={96}
                      src="/brand/logo-mindfultrip-historic-transparent.png"
                      width={96}
                    />
                  ) : (
                    <span aria-hidden="true" className="domain-card__motif" />
                  )}
                </span>
                <h3>{translate(locale, domain.title)}</h3>
                <p>{translate(locale, domain.text)}</p>
                <span aria-hidden="true" className="domain-card__arrow">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
