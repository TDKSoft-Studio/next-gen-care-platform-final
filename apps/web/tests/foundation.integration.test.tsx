import { locales, localePath, translate } from "@next-gen-care/localization";
import { LanguageSwitcher } from "@next-gen-care/ui";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GET as live } from "../src/app/health/live/route";
import { GET as ready } from "../src/app/health/ready/route";

describe("web foundation integration", () => {
  it("connects localized routes to the localization-neutral switcher", () => {
    render(
      <LanguageSwitcher
        currentLocale="nl"
        label={translate("nl", "foundation.language_selector")}
        options={locales.map((locale) => ({
          href: localePath(locale),
          label: translate("nl", `foundation.locale.${locale}`),
          locale
        }))}
      />
    );

    expect(screen.getByRole("navigation", { name: "Kies de taal" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nederlands" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("exposes non-sensitive liveness and readiness responses", async () => {
    const liveResponse = live();
    const readyResponse = ready();
    expect(liveResponse.status).toBe(200);
    expect(await liveResponse.json()).toEqual({ status: "ok" });
    expect(await readyResponse.json()).toEqual({
      checks: { application: "ready" },
      status: "ok"
    });
  });
});
