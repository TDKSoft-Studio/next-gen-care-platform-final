import { isLocale, translate } from "@next-gen-care/localization";
import { notFound } from "next/navigation";

interface LegalPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <main id="main-content" tabIndex={-1}>
      <article className="editorial-page" aria-labelledby="legal-page-heading">
        <p className="eyebrow">{translate(locale, "legal.eyebrow")}</p>
        <h1 id="legal-page-heading">{translate(locale, "legal.heading")}</h1>
        <p className="lede">{translate(locale, "legal.introduction")}</p>
        <p className="foundation-notice" role="note">
          {translate(locale, "legal.notice")}
        </p>
      </article>
    </main>
  );
}
