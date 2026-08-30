import axe from "axe-core";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomePresentation } from "../src/components/home-presentation";

describe("public portal accessibility baseline", () => {
  it("has no automatically detectable violation on the French landing page", async () => {
    const { container } = render(<HomePresentation locale="fr" page={null} previewMode={false} />);
    const result = await axe.run(container);
    expect(result.violations).toEqual([]);
  });
});
