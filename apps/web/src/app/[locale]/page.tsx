import { isLocale, localePath, translate } from "@next-gen-care/localization";
import Image from "next/image";
import { notFound } from "next/navigation";

interface FoundationPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FoundationPage({ params }: FoundationPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const commitments = [
    "foundation.commitment_clarity",
    "foundation.commitment_human",
    "foundation.commitment_quality"
  ] as const;

  const domains = [
    {
      alt: "foundation.image_alt_home_care",
      index: "01",
      image: "/brand/landing-v2/service-home-care.jpg",
      path: "/home-care",
      text: "domain.home_care.introduction",
      title: "domain.home_care.heading",
      tone: "home"
    },
    {
      alt: "foundation.image_alt_operating_room",
      index: "02",
      image: "/brand/landing-v2/service-operating-room.jpg",
      path: "/operating-room",
      text: "domain.operating_room.introduction",
      title: "domain.operating_room.heading",
      tone: "operating-room"
    },
    {
      alt: "foundation.image_alt_well_being",
      index: "03",
      image: "/brand/landing-v2/service-wellbeing.jpg",
      path: "/well-being",
      text: "domain.well_being.introduction",
      title: "domain.well_being.heading",
      tone: "well-being"
    },
    {
      alt: "foundation.image_alt_travel",
      index: "04",
      image: "/brand/landing-v2/service-mindful-travel.jpg",
      path: "/travel-team-building",
      subBrand: true,
      text: "domain.travel_team_building.introduction",
      title: "domain.travel_team_building.heading",
      tone: "travel"
    },
    {
      alt: "foundation.image_alt_health_tech",
      index: "05",
      image: "/brand/landing-v2/service-health-tech.jpg",
      path: "/health-tech",
      text: "domain.health_tech.introduction",
      title: "domain.health_tech.heading",
      tone: "health-tech"
    }
  ] as const;

  return (
    <main id="main-content" tabIndex={-1}>
      <section aria-labelledby="foundation-heading" className="landing-hero">
        <div className="landing-hero__content">
          <p className="eyebrow eyebrow--accent">{translate(locale, "foundation.eyebrow")}</p>
          <h1 id="foundation-heading">{translate(locale, "foundation.heading")}</h1>
          <p className="lede">{translate(locale, "foundation.introduction")}</p>
          <div className="landing-hero__actions">
            <a className="button button--primary" href="#domains">
              {translate(locale, "foundation.discover_domains")}
              <span aria-hidden="true">↓</span>
            </a>
            <a className="button button--secondary" href="#commitments">
              {translate(locale, "foundation.discover_commitments")}
            </a>
          </div>
        </div>
        <div className="landing-hero__visual">
          <div className="landing-hero__image-frame">
            <Image
              alt={translate(locale, "foundation.image_alt_hero")}
              className="landing-hero__image"
              fill
              priority
              sizes="(max-width: 52rem) 100vw, 46vw"
              src="/brand/landing-v2/hero-care-healthtech.jpg"
            />
          </div>
          <span aria-hidden="true" className="landing-hero__ring landing-hero__ring--large" />
          <span aria-hidden="true" className="landing-hero__ring landing-hero__ring--small" />
          <p className="landing-hero__caption">{translate(locale, "foundation.hero_caption")}</p>
        </div>
      </section>

      <section aria-labelledby="domain-overview-heading" className="domain-overview" id="domains">
        <div className="section-heading">
          <p className="eyebrow eyebrow--accent">
            {translate(locale, "foundation.domains_eyebrow")}
          </p>
          <h2 id="domain-overview-heading">{translate(locale, "foundation.domains_heading")}</h2>
          <p>{translate(locale, "foundation.domains_introduction")}</p>
        </div>
        <ol className="domain-grid">
          {domains.map((domain) => (
            <li key={domain.path}>
              <article className={`domain-card domain-card--${domain.tone}`}>
                <div className="domain-card__image-wrap">
                  <Image
                    alt={translate(locale, domain.alt)}
                    className="domain-card__image"
                    fill
                    sizes="(max-width: 38rem) 100vw, (max-width: 52rem) 50vw, 33vw"
                    src={domain.image}
                  />
                  <span className="domain-card__index">{domain.index}</span>
                  {"subBrand" in domain && domain.subBrand ? (
                    <span className="domain-card__sub-brand">
                      <Image
                        alt="Mindful Healing Trips"
                        height={80}
                        src="/brand/logo-mindfultrip-historic-transparent.png"
                        width={80}
                      />
                    </span>
                  ) : null}
                </div>
                <div className="domain-card__content">
                  <h3>{translate(locale, domain.title)}</h3>
                  <p>{translate(locale, domain.text)}</p>
                  <a className="text-link" href={localePath(locale, domain.path)}>
                    {translate(locale, "foundation.service_cta")}
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="commitments-heading" className="commitments" id="commitments">
        <div className="commitments__intro">
          <p className="eyebrow eyebrow--accent">
            {translate(locale, "foundation.commitments_eyebrow")}
          </p>
          <h2 id="commitments-heading">{translate(locale, "foundation.commitments_heading")}</h2>
        </div>
        <ul className="commitments__list">
          {commitments.map((key, index) => (
            <li key={key}>
              <span aria-hidden="true">0{index + 1}</span>
              <p>{translate(locale, key)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="contact-heading" className="contact-callout">
        <div>
          <p className="eyebrow eyebrow--light">
            {translate(locale, "foundation.contact_eyebrow")}
          </p>
          <h2 id="contact-heading">{translate(locale, "foundation.contact_heading")}</h2>
          <p>{translate(locale, "foundation.contact_introduction")}</p>
        </div>
        <a className="button button--light" href="mailto:hello@nextgen-cares.org">
          {translate(locale, "foundation.contact_cta")}
          <span aria-hidden="true">↗</span>
        </a>
      </section>

      <p className="foundation-notice" role="note">
        {translate(locale, "foundation.notice")}
      </p>
    </main>
  );
}
