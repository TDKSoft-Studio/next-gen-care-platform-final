import type { Locale } from "@next-gen-care/localization";
import { headers } from "next/headers";
import type { Payload, TypedUser } from "payload";
import { getPayload } from "payload";

import type { Page, Service, SiteSetting, Trip } from "./payload-types";

export type PublicPageDomain =
  | "corporate"
  | "health-tech"
  | "home-care"
  | "legal"
  | "operating-room"
  | "privacy"
  | "travel"
  | "wellbeing";

export interface PublicPortalContent {
  cmsConfigured: boolean;
  page: Page | null;
  previewDenied: boolean;
  previewMode: boolean;
  services: Service[];
  settings: SiteSetting | null;
  trips: Trip[];
}

let payloadInstance: Promise<Payload> | undefined;

export function isCmsRuntimeConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
}

async function publicPayload(): Promise<Payload | null> {
  if (!isCmsRuntimeConfigured()) return null;

  payloadInstance ??= import("@payload-config").then(({ default: config }) =>
    getPayload({ config })
  );
  return payloadInstance;
}

async function previewUser(payload: Payload, preview: boolean): Promise<TypedUser | null> {
  if (!preview) return null;
  const requestHeaders = new Headers(await headers());
  return (await payload.auth({ headers: requestHeaders })).user;
}

function publicationFilter(preview: boolean) {
  return preview
    ? []
    : [{ approvalStatus: { equals: "approved" } }, { _status: { equals: "published" } }];
}

function categoriesFor(domain: PublicPageDomain): string[] {
  if (domain === "wellbeing") return ["personal-assistance", "wellbeing"];
  if (domain === "home-care" || domain === "operating-room" || domain === "health-tech") {
    return [domain];
  }
  return [];
}

export async function getPublicPortalContent(
  locale: Locale,
  domain: PublicPageDomain,
  previewRequested: boolean
): Promise<PublicPortalContent> {
  const payload = await publicPayload();
  if (!payload) {
    return {
      cmsConfigured: false,
      page: null,
      previewDenied: previewRequested,
      previewMode: false,
      services: [],
      settings: null,
      trips: []
    };
  }

  const user = await previewUser(payload, previewRequested);
  if (previewRequested && !user) {
    return {
      cmsConfigured: true,
      page: null,
      previewDenied: true,
      previewMode: false,
      services: [],
      settings: null,
      trips: []
    };
  }

  const previewMode = previewRequested && Boolean(user);
  const access = previewMode
    ? { overrideAccess: false as const, user: user ?? undefined }
    : { overrideAccess: false as const };
  const filters = publicationFilter(previewMode);

  const [pagesResult, servicesResult, tripsResult, settingsResult] = await Promise.all([
    payload.find({
      ...access,
      collection: "pages",
      depth: 1,
      draft: previewMode,
      fallbackLocale: false,
      limit: 1,
      locale,
      pagination: false,
      sort: "navigationOrder",
      where: { and: [{ domain: { equals: domain } }, ...filters] }
    }),
    categoriesFor(domain).length > 0
      ? payload.find({
          ...access,
          collection: "services",
          depth: 1,
          draft: previewMode,
          fallbackLocale: false,
          limit: 100,
          locale,
          pagination: false,
          sort: "title",
          where: {
            and: [{ category: { in: categoriesFor(domain) } }, ...filters]
          }
        })
      : Promise.resolve({ docs: [] as Service[] }),
    domain === "travel"
      ? payload.find({
          ...access,
          collection: "trips",
          depth: 1,
          draft: previewMode,
          fallbackLocale: false,
          limit: 100,
          locale,
          pagination: false,
          sort: "startDate",
          where: { and: filters }
        })
      : Promise.resolve({ docs: [] as Trip[] }),
    payload.findGlobal({
      ...access,
      depth: 1,
      draft: previewMode,
      fallbackLocale: false,
      locale,
      slug: "site-settings"
    })
  ]);

  const settings =
    previewMode ||
    (settingsResult._status === "published" && settingsResult.approvalStatus === "approved")
      ? settingsResult
      : null;

  return {
    cmsConfigured: true,
    page: pagesResult.docs[0] ?? null,
    previewDenied: false,
    previewMode,
    services: servicesResult.docs,
    settings,
    trips: tripsResult.docs
  };
}
