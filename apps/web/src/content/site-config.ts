export const approvedSiteOrigin = "https://www.nextgen-cares.org";
export const publicEmail = "hello@nextgen-cares.org";
export const publicPhoneDisplay = "+32 460 96 02 94";
export const publicPhoneHref = "+32460960294";

export function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? approvedSiteOrigin;
}

export function siteIndexingEnabled(): boolean {
  return process.env.SITE_INDEXING_ENABLED === "true";
}
