import type { Locale } from "@next-gen-care/localization";
import type { Metadata } from "next";

import { equivalentLocalePath } from "./portal-routes";
import { siteIndexingEnabled, siteOrigin } from "./site-config";

export function publicMetadata({
  description,
  locale,
  pathname,
  preview = false,
  title
}: {
  description: string;
  locale: Locale;
  pathname: string;
  preview?: boolean;
  title: string;
}): Metadata {
  const origin = siteOrigin();
  const index = siteIndexingEnabled() && !preview;
  const canonical = `${origin}${pathname}`;

  return {
    alternates: {
      canonical,
      languages: {
        fr: `${origin}${equivalentLocalePath(pathname, "fr")}`,
        nl: `${origin}${equivalentLocalePath(pathname, "nl")}`
      }
    },
    description,
    openGraph: {
      alternateLocale: [locale === "fr" ? "nl_BE" : "fr_BE"],
      description,
      locale: locale === "fr" ? "fr_BE" : "nl_BE",
      siteName: "NEXT GEN CARE",
      title,
      type: "website",
      url: canonical
    },
    robots: { follow: index, index },
    title
  };
}
