import { isLocale, translate } from "@next-gen-care/localization";
import { notFound } from "next/navigation";

import { DomainPage } from "../../../components/domain-page";

interface OperatingRoomPageProps {
  params: Promise<{ locale: string }>;
}

export default async function OperatingRoomPage({ params }: OperatingRoomPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <DomainPage
      eyebrow={translate(locale, "domain.eyebrow")}
      heading={translate(locale, "domain.operating_room.heading")}
      introduction={translate(locale, "domain.operating_room.introduction")}
      notice={translate(locale, "domain.notice")}
    />
  );
}
