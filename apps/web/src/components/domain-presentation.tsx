import {
  formatCurrency,
  formatDate,
  formatNumber,
  translate,
  type CatalogKey,
  type Locale
} from "@next-gen-care/localization";
import Image from "next/image";

import type { Media, Page, Service, Trip } from "../cms/payload-types";
import type { PortalDomainRoute } from "../content/portal-routes";
import { CmsRichText } from "./cms-rich-text";
import { ContactPanel } from "./contact-panel";
import { PreviewBanner } from "./preview-banner";

const prescriptionKeys: Partial<Record<Service["prescriptionRequirement"], CatalogKey>> = {
  "case-by-case": "portal.services.prescription.case-by-case",
  "not-required": "portal.services.prescription.not-required",
  required: "portal.services.prescription.required"
};

const reimbursementKeys: Partial<Record<Service["reimbursement"], CatalogKey>> = {
  "client-paid": "portal.services.reimbursement.client-paid",
  conditional: "portal.services.reimbursement.conditional"
};

const tripStatusKeys: Record<Trip["eventStatus"], CatalogKey> = {
  archived: "portal.trips.status.archived",
  closed: "portal.trips.status.closed",
  full: "portal.trips.status.full",
  open: "portal.trips.status.open",
  planned: "portal.trips.status.planned"
};

function PageHero({
  fallbackSummary,
  fallbackTitle,
  page
}: {
  fallbackSummary: string;
  fallbackTitle: string;
  page: Page | null;
}) {
  const media = page?.heroMedia && typeof page.heroMedia === "object" ? page.heroMedia : null;
  const image = media as Media | null;

  return (
    <section className="domain-hero">
      <div className="domain-hero__content">
        <p className="eyebrow">NEXT GEN CARE</p>
        <h1>{page?.title ?? fallbackTitle}</h1>
        <p className="lede">{page?.summary ?? fallbackSummary}</p>
      </div>
      {image?.url && image.width && image.height ? (
        <Image
          alt={image.alt}
          className="domain-hero__image"
          height={image.height}
          priority
          sizes="(max-width: 52rem) 100vw, 42vw"
          src={image.url}
          width={image.width}
        />
      ) : (
        <div aria-hidden="true" className="domain-hero__mark">
          <span>N</span>
          <span>G</span>
          <span>C</span>
        </div>
      )}
    </section>
  );
}

function ServiceList({ locale, services }: { locale: Locale; services: Service[] }) {
  return (
    <section aria-labelledby="services-heading" className="content-section">
      <div className="section-heading">
        <p className="eyebrow">NEXT GEN CARE</p>
        <h2 id="services-heading">{translate(locale, "portal.services.heading")}</h2>
      </div>
      {services.length === 0 ? (
        <p className="empty-state">{translate(locale, "portal.services.empty")}</p>
      ) : (
        <ul className="offer-grid">
          {services.map((service) => {
            const prescriptionKey = prescriptionKeys[service.prescriptionRequirement];
            const reimbursementKey = reimbursementKeys[service.reimbursement];
            return (
              <li className="offer-card" key={service.id}>
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
                <ul className="offer-card__facts">
                  {prescriptionKey ? <li>{translate(locale, prescriptionKey)}</li> : null}
                  {reimbursementKey ? <li>{translate(locale, reimbursementKey)}</li> : null}
                  <li>{translate(locale, "portal.services.quote")}</li>
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function TripList({ locale, trips }: { locale: Locale; trips: Trip[] }) {
  return (
    <section aria-labelledby="trips-heading" className="content-section">
      <div className="section-heading">
        <p className="eyebrow">NEXT GEN CARE</p>
        <h2 id="trips-heading">{translate(locale, "portal.trips.heading")}</h2>
      </div>
      {trips.length === 0 ? (
        <p className="empty-state">{translate(locale, "portal.trips.empty")}</p>
      ) : (
        <div className="trip-list">
          {trips.map((trip) => (
            <article className="trip-card" key={trip.id}>
              <div>
                <p className="status-chip">{translate(locale, tripStatusKeys[trip.eventStatus])}</p>
                <h3>{trip.title}</h3>
                <p>{trip.summary}</p>
                <p>
                  <time dateTime={trip.startDate}>
                    {formatDate(locale, new Date(trip.startDate))}
                  </time>
                  {trip.endDate ? (
                    <>
                      {" — "}
                      <time dateTime={trip.endDate}>
                        {formatDate(locale, new Date(trip.endDate))}
                      </time>
                    </>
                  ) : null}
                </p>
                {trip.capacity ? (
                  <p>
                    {translate(locale, "portal.trips.capacity")}:{" "}
                    {formatNumber(locale, trip.capacity)}
                  </p>
                ) : null}
                {trip.availabilityNote ? <p>{trip.availabilityNote}</p> : null}
              </div>
              {trip.packages?.length ? (
                <div>
                  <h4>{translate(locale, "portal.trips.packages")}</h4>
                  <ul className="package-list">
                    {trip.packages.map((travelPackage) => (
                      <li key={travelPackage.id ?? travelPackage.tier}>
                        <strong>
                          {translate(locale, `portal.trips.tier.${travelPackage.tier}`)} —{" "}
                          {travelPackage.priceEur === null || travelPackage.priceEur === undefined
                            ? translate(locale, "portal.trips.price_pending")
                            : formatCurrency(locale, travelPackage.priceEur)}
                        </strong>
                        <p>
                          {translate(locale, "portal.trips.inclusions")}: {travelPackage.inclusions}
                        </p>
                        <p>
                          {translate(locale, "portal.trips.exclusions")}: {travelPackage.exclusions}
                        </p>
                        {travelPackage.taxAndOccupancyTerms ? (
                          <p>{travelPackage.taxAndOccupancyTerms}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function HealthTechPillars({ locale }: { locale: Locale }) {
  const pillars = ["product", "cloud", "architecture"] as const;
  return (
    <section aria-labelledby="pillars-heading" className="content-section">
      <div className="section-heading">
        <p className="eyebrow">Health-Tech</p>
        <h2 id="pillars-heading">{translate(locale, "portal.health-tech.pillars")}</h2>
      </div>
      <div className="pillar-grid">
        {pillars.map((pillar, index) => (
          <article key={pillar}>
            <span aria-hidden="true">0{index + 1}</span>
            <h3>{translate(locale, `portal.health-tech.pillar.${pillar}.title`)}</h3>
            <p>{translate(locale, `portal.health-tech.pillar.${pillar}.summary`)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function DomainPresentation({
  locale,
  page,
  previewMode,
  route,
  services,
  trips
}: {
  locale: Locale;
  page: Page | null;
  previewMode: boolean;
  route: PortalDomainRoute;
  services: Service[];
  trips: Trip[];
}) {
  return (
    <main id="main-content" tabIndex={-1}>
      {previewMode ? <PreviewBanner locale={locale} /> : null}
      <PageHero
        fallbackSummary={translate(locale, route.summaryKey)}
        fallbackTitle={translate(locale, route.labelKey)}
        page={page}
      />
      <section aria-labelledby="content-heading" className="content-section reading-section">
        <h2 id="content-heading">{translate(locale, "portal.content.heading")}</h2>
        {page ? (
          <CmsRichText data={page.body} />
        ) : (
          <p className="empty-state">{translate(locale, "portal.content.pending")}</p>
        )}
      </section>
      {route.domain === "travel" ? <TripList locale={locale} trips={trips} /> : null}
      {route.domain === "health-tech" ? <HealthTechPillars locale={locale} /> : null}
      {route.domain !== "travel" ? <ServiceList locale={locale} services={services} /> : null}
      <ContactPanel locale={locale} />
    </main>
  );
}
