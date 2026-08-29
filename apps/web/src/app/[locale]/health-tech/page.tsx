import { isLocale, translate } from "@next-gen-care/localization";
import { notFound } from "next/navigation";

import { DomainPage } from "../../../components/domain-page";

interface HealthTechPageProps {
  params: Promise<{ locale: string }>;
}

export default async function HealthTechPage({ params }: HealthTechPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <DomainPage
      eyebrow={translate(locale, "domain.eyebrow")}
      heading={translate(locale, "domain.health_tech.heading")}
      introduction={translate(locale, "domain.health_tech.introduction")}
      notice={translate(locale, "domain.notice")}
    />
  );
}
