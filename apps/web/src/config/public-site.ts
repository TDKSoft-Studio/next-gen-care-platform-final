/**
 * Public indexing is fail-closed. A named production domain and an explicit
 * release switch are both required before canonical URLs, sitemap entries, or
 * crawler access are emitted.
 */
export function publicSiteUrl(): URL | null {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function isPublicIndexingEnabled(): boolean {
  return process.env.PUBLIC_SEO_ENABLED === "true" && publicSiteUrl() !== null;
}
