import { describe, expect, it } from "vitest";

import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";

describe("public metadata routes", () => {
  it("fails closed until a named HTTPS domain and release switch are supplied", () => {
    expect(robots()).toMatchObject({
      rules: {
        disallow: "/",
        userAgent: "*"
      }
    });
    expect(sitemap()).toEqual([]);
  });
});
