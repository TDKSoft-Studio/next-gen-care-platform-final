import frCatalog from "./catalogs/fr.v1.json";
import nlCatalog from "./catalogs/nl.v1.json";

export const locales = ["fr", "nl"] as const;
export type Locale = (typeof locales)[number];
export type CatalogKey = Exclude<keyof typeof frCatalog, "_meta">;

const catalogs = {
  fr: frCatalog,
  nl: nlCatalog
} as const;

const intlLocales: Record<Locale, string> = {
  fr: "fr-BE",
  nl: "nl-BE"
};

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}

export function getCatalog(locale: Locale) {
  const catalog = catalogs[locale];
  if (catalog._meta.locale !== locale) {
    throw new Error(`Catalog locale mismatch for ${locale}`);
  }
  return catalog;
}

export function translate(locale: Locale, key: CatalogKey): string {
  const value = getCatalog(locale)[key];
  if (typeof value !== "string") {
    throw new Error(`Missing ${locale} translation for ${key}`);
  }
  return value;
}

export function localePath(locale: Locale, path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withoutLocale = normalized.replace(/^\/(?:fr|nl)(?=\/|$)/, "") || "/";
  return `/${locale}${withoutLocale === "/" ? "" : withoutLocale}`;
}

export function switchLocalePath(path: string, targetLocale: Locale): string {
  return localePath(targetLocale, path);
}

export function preferredLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return "fr";

  const candidates = acceptLanguage
    .split(",")
    .map((entry) => {
      const [tag = "", quality = "q=1"] = entry.trim().split(";");
      const parsedQuality = Number.parseFloat(quality.replace(/^q=/, ""));
      const primaryLanguage = tag.toLowerCase().split("-")[0] ?? "";
      return {
        locale: primaryLanguage,
        quality: Number.isFinite(parsedQuality) ? parsedQuality : 0
      };
    })
    .sort((left, right) => right.quality - left.quality);

  const match = candidates.find((candidate) => isLocale(candidate.locale));
  return match?.locale && isLocale(match.locale) ? match.locale : "fr";
}

export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(intlLocales[locale]).format(value);
}

export function formatDate(locale: Locale, value: Date): string {
  return new Intl.DateTimeFormat(intlLocales[locale], { dateStyle: "long" }).format(value);
}
