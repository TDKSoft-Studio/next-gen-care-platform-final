import type { CollectionConfig } from "payload";

import { canEditContent, canPublishContent } from "../access";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "alt"
  },
  access: {
    create: ({ req }) => canEditContent(req.user),
    delete: ({ req }) => canPublishContent(req.user),
    read: () => true,
    update: ({ req }) => canEditContent(req.user)
  },
  upload: {
    adminThumbnail: "thumbnail",
    imageSizes: [
      {
        name: "thumbnail",
        width: 480,
        height: 320,
        position: "centre"
      }
    ],
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "application/pdf"],
    staticDir: "media"
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      localized: true,
      admin: {
        description:
          "Required accessible alternative text. Decorative assets are still recorded explicitly for review."
      }
    },
    {
      name: "isDecorative",
      type: "checkbox",
      defaultValue: false
    },
    {
      name: "rightsNote",
      type: "textarea",
      admin: {
        description:
          "Record the source and reuse rights before publication; never enter patient or health data."
      }
    }
  ]
};
