import type { CollectionConfig } from "payload";
import { Forbidden } from "payload";

import { canEditContent, canPublishContent } from "../access";

const publicPageKinds = [
  "editorial",
  "landing",
  "home-care",
  "operating-room",
  "well-being",
  "travel-team-building",
  "health-tech",
  "legal"
] as const;

function relationId(value: unknown): string | number | undefined {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object") {
    const id = Reflect.get(value, "id");
    if (typeof id === "string" || typeof id === "number") return id;
  }
  return undefined;
}

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    preview: (doc) => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      const secret = process.env.PREVIEW_SECRET;
      const slug = typeof doc.slug === "string" ? doc.slug : "";

      if (!baseUrl || !secret || !slug) return null;

      return `${baseUrl}/api/preview?secret=${encodeURIComponent(secret)}&locale=fr&slug=${encodeURIComponent(slug)}`;
    }
  },
  access: {
    create: ({ req }) => canEditContent(req.user),
    delete: ({ req }) => canPublishContent(req.user),
    read: ({ req }) => (req.user ? true : { _status: { equals: "published" } }),
    readVersions: ({ req }) => canEditContent(req.user),
    update: ({ req }) => canEditContent(req.user)
  },
  versions: {
    maxPerDoc: 25,
    drafts: {
      autosave: {
        interval: 800
      },
      localizeStatus: true,
      schedulePublish: true,
      validate: true
    }
  },
  fields: [
    {
      name: "pageKind",
      type: "select",
      required: true,
      defaultValue: "editorial",
      options: publicPageKinds.map((value) => ({ label: value, value })),
      admin: {
        description:
          "Public presentation family. It does not create an intake form or a service promise."
      }
    },
    {
      name: "title",
      type: "text",
      required: true,
      localized: true
    },
    {
      name: "slug",
      type: "text",
      required: true,
      localized: true,
      index: true,
      admin: {
        description:
          "Localized public path segment. Each locale must be reviewed before publication."
      }
    },
    {
      name: "summary",
      type: "textarea",
      localized: true,
      maxLength: 320
    },
    {
      name: "content",
      type: "richText",
      localized: true
    },
    {
      name: "seo",
      type: "group",
      admin: {
        description:
          "Localized metadata. Canonical host and crawler release remain environment-level gates."
      },
      fields: [
        {
          name: "metaTitle",
          type: "text",
          localized: true,
          maxLength: 70
        },
        {
          name: "metaDescription",
          type: "textarea",
          localized: true,
          maxLength: 160
        },
        {
          name: "socialImage",
          type: "upload",
          relationTo: "media"
        },
        {
          name: "noIndex",
          type: "checkbox",
          defaultValue: true,
          admin: {
            description: "Keep enabled until the production domain and release gate are approved."
          }
        }
      ]
    },
    {
      name: "editorial",
      type: "group",
      admin: {
        readOnly: true
      },
      fields: [
        {
          name: "lastEditedBy",
          type: "relationship",
          relationTo: "users",
          access: {
            update: () => false
          }
        }
      ]
    },
    {
      name: "review",
      type: "group",
      admin: {
        description: "Editorial and clinical review remains a human responsibility."
      },
      fields: [
        {
          name: "approvedBy",
          type: "relationship",
          relationTo: "users",
          access: {
            update: ({ req }) => canPublishContent(req.user)
          },
          admin: {
            condition: (_, siblingData) => siblingData?.approvalRequired === true,
            description: "The reviewer must be different from the last content editor."
          }
        },
        {
          name: "approvalRequired",
          type: "checkbox",
          defaultValue: true
        },
        {
          name: "contentOwnerConfirmed",
          type: "checkbox",
          defaultValue: false,
          access: {
            update: ({ req }) => canPublishContent(req.user)
          },
          admin: {
            description:
              "Required before publication; legal, medical, safety, price, and travel review remains human-owned."
          }
        },
        {
          name: "approvalNotes",
          type: "textarea"
        }
      ]
    }
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        const wantsPublication =
          data._status === "published" && originalDoc?._status !== "published";
        if (wantsPublication) {
          if (!canPublishContent(req.user) || !originalDoc) throw new Forbidden(req.t);

          const review = data.review ?? originalDoc.review;
          const approvedBy = relationId(review?.approvedBy);
          const contentOwnerConfirmed = review?.contentOwnerConfirmed;
          const lastEditedBy = relationId(originalDoc.editorial?.lastEditedBy);
          const publisherId = relationId(req.user);

          if (!approvedBy || !contentOwnerConfirmed || lastEditedBy === publisherId) {
            throw new Forbidden(req.t);
          }
        }

        return {
          ...data,
          editorial: {
            ...data.editorial,
            lastEditedBy: relationId(req.user)
          }
        };
      }
    ]
  }
};
