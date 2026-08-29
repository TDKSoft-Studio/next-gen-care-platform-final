import { isLocale, translate } from "@next-gen-care/localization";
import { notFound } from "next/navigation";

import { DomainPage } from "../../../components/domain-page";

interface WellBeingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function WellBeingPage({ params }: WellBeingPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <DomainPage
      eyebrow={translate(locale, "domain.eyebrow")}
      heading={translate(locale, "domain.well_being.heading")}
      introduction={translate(locale, "domain.well_being.introduction")}
      notice={translate(locale, "domain.notice")}
    />
  );
}
