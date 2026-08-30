import { isLocale, translate } from "@next-gen-care/localization";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicPortalContent } from "../../cms/public-content";
import { HomePresentation } from "../../components/home-presentation";
import { publicMetadata } from "../../content/metadata";

interface FoundationPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ preview?: string | string[] }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams
}: FoundationPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const preview = (await searchParams).preview === "1";
  const content = await getPublicPortalContent(locale, "corporate", false);
  const title =
    content.page?.seo?.title ?? content.page?.title ?? translate(locale, "portal.hero.title");
  const description =
    content.page?.seo?.description ??
    content.page?.summary ??
    translate(locale, "portal.hero.summary");
  return publicMetadata({ description, locale, pathname: `/${locale}`, preview, title });
}

export default async function HomePage({ params, searchParams }: FoundationPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const preview = (await searchParams).preview === "1";
  const content = await getPublicPortalContent(locale, "corporate", preview);
  if (content.previewDenied) notFound();

  return <HomePresentation locale={locale} page={content.page} previewMode={content.previewMode} />;
}
