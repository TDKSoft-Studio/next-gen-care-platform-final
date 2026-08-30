import { describe, expect, it } from "vitest";

import {
  domainRouteFromSlug,
  equivalentLocalePath,
  publicDomainPath
} from "../src/content/portal-routes";

describe("localized public routes", () => {
  it("maps every domain to its approved FR/NL path", () => {
    expect(publicDomainPath("fr", "home-care")).toBe("/fr/soins-a-domicile");
    expect(publicDomainPath("nl", "home-care")).toBe("/nl/thuiszorg");
    expect(domainRouteFromSlug("nl", "operatiekwartier")?.domain).toBe("operating-room");
  });

  it("keeps the equivalent page when switching language", () => {
    expect(equivalentLocalePath("/fr/voyages-team-building", "nl")).toBe(
      "/nl/reizen-team-building"
    );
    expect(equivalentLocalePath("/nl/wettelijke-vermeldingen", "fr")).toBe("/fr/mentions-legales");
  });
});
