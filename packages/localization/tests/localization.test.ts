import { describe, expect, it } from "vitest";

import {
  formatNumber,
  getCatalog,
  localePath,
  locales,
  preferredLocale,
  switchLocalePath,
  translate
} from "../src/index";

describe("localization policy", () => {
  it("keeps every versioned catalog in exact key parity", () => {
    const [firstLocale, ...otherLocales] = locales;
    const expectedKeys = Object.keys(getCatalog(firstLocale)).sort();

    for (const locale of otherLocales) {
      expect(Object.keys(getCatalog(locale)).sort()).toEqual(expectedKeys);
      expect(getCatalog(locale)._meta.locale).toBe(locale);
      expect(getCatalog(locale)._meta.version).toBe(1);
    }
  });

  it("never substitutes the French value for a Dutch translation", () => {
    expect(translate("nl", "foundation.skip_to_content")).toBe("Naar de hoofdinhoud");
    expect(translate("nl", "foundation.skip_to_content")).not.toBe(
      translate("fr", "foundation.skip_to_content")
    );
  });

  it("preserves the page path while changing locale", () => {
    expect(switchLocalePath("/fr/example/details", "nl")).toBe("/nl/example/details");
    expect(localePath("fr", "/nl/example/details")).toBe("/fr/example/details");
  });

  it("negotiates supported languages by quality and falls back explicitly", () => {
    expect(preferredLocale("en;q=0.8,nl-BE;q=0.9,fr;q=0.7")).toBe("nl");
    expect(preferredLocale("de-DE,en;q=0.8")).toBe("fr");
    expect(preferredLocale(null)).toBe("fr");
  });

  it("uses Belgian locale conventions for number formatting", () => {
    expect(formatNumber("fr", 1234.5)).not.toBe(formatNumber("nl", 1234.5));
  });
});
