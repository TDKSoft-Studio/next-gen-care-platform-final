import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ErrorSummary, LanguageSwitcher, SkipLink } from "../src/index";

describe("accessible UI primitives", () => {
  it("provides a main-content bypass link", () => {
    render(<SkipLink>Main content</SkipLink>);
    expect(screen.getByRole("link", { name: "Main content" })).toHaveAttribute(
      "href",
      "#main-content"
    );
  });

  it("identifies the active language without relying on color", () => {
    render(
      <LanguageSwitcher
        currentLocale="fr"
        label="Language"
        options={[
          { href: "/fr", label: "Français", locale: "fr" },
          { href: "/nl", label: "Nederlands", locale: "nl" }
        ]}
      />
    );
    expect(screen.getByRole("link", { name: "Français" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Nederlands" })).not.toHaveAttribute("aria-current");
  });

  it("links every summarized error back to its field", () => {
    render(
      <ErrorSummary
        errors={[{ fieldId: "email", message: "Email is required" }]}
        title="Check the form"
      />
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email is required" })).toHaveAttribute(
      "href",
      "#email"
    );
  });
});
