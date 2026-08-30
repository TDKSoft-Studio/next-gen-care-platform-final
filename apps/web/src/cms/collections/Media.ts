import path from "node:path";
import type { CollectionConfig } from "payload";

import { canManageContent, isTechnicalAdmin } from "../access";

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: canManageContent,
    delete: isTechnicalAdmin,
    read: () => true,
    update: canManageContent
  },
  admin: {
    defaultColumns: ["filename", "alt", "mimeType", "filesize", "updatedAt"],
    group: "Contenu",
    useAsTitle: "alt"
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Texte alternatif",
      localized: true,
      required: true
    },
    {
      name: "caption",
      type: "textarea",
      label: "Légende",
      localized: true
    },
    {
      name: "credit",
      type: "text",
      label: "Crédit et droits"
    }
  ],
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (req.file && req.file.size > MAX_IMAGE_SIZE_BYTES) {
          throw new Error("Les images sont limitées à 20 Mo.");
        }
        return data;
      }
    ]
  },
  upload: {
    adminThumbnail: "card",
    bulkUpload: false,
    crop: true,
    displayPreview: true,
    focalPoint: true,
    imageSizes: [
      { height: 480, name: "card", width: 720 },
      { height: 900, name: "hero", width: 1600 }
    ],
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    pasteURL: false,
    staticDir: path.resolve(process.cwd(), "media"),
    withMetadata: false
  }
};
