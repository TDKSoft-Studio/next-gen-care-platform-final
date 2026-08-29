import { isLocale, translate } from "@next-gen-care/localization";
import { notFound } from "next/navigation";

import { DomainPage } from "../../../components/domain-page";

interface TravelTeamBuildingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TravelTeamBuildingPage({ params }: TravelTeamBuildingPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <DomainPage
      eyebrow={translate(locale, "domain.eyebrow")}
      heading={translate(locale, "domain.travel_team_building.heading")}
      introduction={translate(locale, "domain.travel_team_building.introduction")}
      notice={translate(locale, "domain.notice")}
    />
  );
}
