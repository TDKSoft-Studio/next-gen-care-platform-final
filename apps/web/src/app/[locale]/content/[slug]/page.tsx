import { isLocale, type Locale } from "@next-gen-care/localization";
import config from "@payload-config";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayload } from "payload";

import { isPublicIndexingEnabled, publicSiteUrl } from "../../../../config/public-site";

interface CmsContentPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamic = "force-dynamic";

async function findPage(locale: Locale, slug: string, preview: boolean) {
  const payload = await getPayload({ config });
  return payload.find({
    collection: "pages",
    depth: 0,
    draft: preview,
    fallbackLocale: false,
    limit: 1,
    locale,
    overrideAccess: preview,
    where: {
      slug: {
        equals: slug
      }
    }
  });
}

function textValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function seoValues(page: Record<string, unknown>) {
  const seo = page.seo;
  return seo && typeof seo === "object" ? (seo as Record<string, unknown>) : {};
}

export async function generateMetadata({ params }: CmsContentPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const { isEnabled: preview } = await draftMode();
  const result = await findPage(locale, slug, preview);
  const page = result.docs[0] as Record<string, unknown> | undefined;
  if (!page) return {};

  const seo = seoValues(page);
  const title = textValue(seo.metaTitle) ?? textValue(page.title);
  const description = textValue(seo.metaDescription) ?? textValue(page.summary);
  const siteUrl = publicSiteUrl();
  const canonical = siteUrl ? new URL(`/${locale}/content/${slug}`, siteUrl).toString() : undefined;
  const noIndex = seo.noIndex !== false || !isPublicIndexingEnabled();

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      description,
      locale: locale === "fr" ? "fr_BE" : "nl_BE",
      title,
      type: "article",
      url: canonical
    },
    robots: { follow: !noIndex, index: !noIndex }
  };
}

export default async function CmsContentPage({ params }: CmsContentPageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const { isEnabled: preview } = await draftMode();
  const result = await findPage(locale, slug, preview);
  const page = result.docs[0];
  if (!page) notFound();

  return (
    <main>
      <article aria-labelledby="cms-page-title">
        <p className="eyebrow">NEXT GEN CARE</p>
        <h1 id="cms-page-title">{page.title}</h1>
        {page.summary ? <p className="lede">{page.summary}</p> : null}
        {page.content ? <RichText className="cms-rich-text" data={page.content} /> : null}
      </article>
    </main>
  );
}
