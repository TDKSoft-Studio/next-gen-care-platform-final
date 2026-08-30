import { describe, expect, it } from "vitest";

import { canEditContent, canPublishContent, hasCmsRole } from "../src/cms/access";
import { Media } from "../src/cms/collections/media";
import { Pages } from "../src/cms/collections/pages";
import { Users } from "../src/cms/collections/users";

describe("CMS technical spike", () => {
  it("allows one editor account to accumulate content-governance roles", () => {
    const medicalEditor = { roles: ["editor", "medical-approver"] };

    expect(hasCmsRole(medicalEditor, "editor")).toBe(true);
    expect(canEditContent(medicalEditor)).toBe(true);
    expect(canPublishContent(medicalEditor)).toBe(true);
    expect(canPublishContent({ roles: ["editor"] })).toBe(false);
  });

  it("models versioned FR/NL content with drafts and scheduled publication", () => {
    expect(Pages.slug).toBe("pages");
    expect(Pages.versions).toMatchObject({
      drafts: {
        localizeStatus: true,
        schedulePublish: true
      },
      maxPerDoc: 25
    });

    const localizedFields = Pages.fields.filter(
      (field) => "localized" in field && field.localized === true
    );
    expect(localizedFields.map((field) => field.name)).toEqual([
      "title",
      "slug",
      "summary",
      "content"
    ]);
    expect(Pages.fields.find((field) => field.name === "pageKind")).toMatchObject({
      defaultValue: "editorial",
      type: "select"
    });
    expect(Pages.fields.find((field) => field.name === "seo")).toMatchObject({ type: "group" });
  });

  it("uses restrictive access controls for people, pages, and uploads", () => {
    expect(Users.auth).toBe(true);
    expect(Pages.access?.read?.({ req: { user: null } } as never)).toEqual({
      _status: { equals: "published" }
    });
    expect(Media.upload).toMatchObject({
      mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "application/pdf"],
      staticDir: "media"
    });
  });
});
