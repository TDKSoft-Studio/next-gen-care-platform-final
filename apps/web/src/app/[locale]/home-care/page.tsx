import { isLocale, translate } from "@next-gen-care/localization";
import { notFound } from "next/navigation";

import { DomainPage } from "../../../components/domain-page";
import { AppointmentSlotSelector } from "../../../components/appointment-slot-selector";
import { slotSelectorCopy } from "../../../components/appointment-slot-selector.copy";

interface HomeCarePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomeCarePage({ params }: HomeCarePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <DomainPage
      eyebrow={translate(locale, "domain.eyebrow")}
      heading={translate(locale, "domain.home_care.heading")}
      introduction={translate(locale, "domain.home_care.introduction")}
      notice={translate(locale, "domain.notice")}
    >
      <AppointmentSlotSelector locale={locale} copy={slotSelectorCopy(locale)} />
    </DomainPage>
  );
}
