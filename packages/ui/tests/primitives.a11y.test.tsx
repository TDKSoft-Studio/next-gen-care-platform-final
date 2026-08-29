import axe from "axe-core";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ErrorSummary, LanguageSwitcher, SkipLink } from "../src/index";

describe("UI primitive accessibility baseline", () => {
  it("has no automatically detectable violations in the composed foundation", async () => {
    const { container } = render(
      <>
        <SkipLink>Main content</SkipLink>
        <LanguageSwitcher
          currentLocale="fr"
          label="Language"
          options={[
            { href: "/fr", label: "Français", locale: "fr" },
            { href: "/nl", label: "Nederlands", locale: "nl" }
          ]}
        />
        <main id="main-content">
          <h1>Foundation</h1>
          <ErrorSummary
            errors={[{ fieldId: "email", message: "Email is required" }]}
            title="Check the form"
          />
          <label htmlFor="email">Email</label>
          <input aria-describedby="email-error" aria-invalid="true" id="email" />
          <p id="email-error">Email is required</p>
        </main>
      </>
    );

    const result = await axe.run(container);
    expect(result.violations).toEqual([]);
  });
});
