import type { CollectionConfig } from "payload";

import { canManageContent, isTechnicalAdmin, publishedOrAuthenticated } from "../access";
import { approvalFields, protectCollectionApprovalAndPublication } from "../content-approval";

export const ServiceAreas: CollectionConfig = {
  slug: "service-areas",
  access: {
    create: canManageContent,
    delete: isTechnicalAdmin,
    read: publishedOrAuthenticated,
    readVersions: canManageContent,
    update: canManageContent
  },
  admin: {
    defaultColumns: ["name", "areaType", "approvalStatus", "_status"],
    group: "Organisation",
    useAsTitle: "name"
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nom de la zone",
      localized: true,
      required: true
    },
    {
      name: "areaType",
      type: "select",
      label: "Type de zone",
      options: [
        { label: "Province", value: "province" },
        { label: "Commune", value: "municipality" },
        { label: "Code postal", value: "postal-code" },
        { label: "Autre", value: "other" }
      ],
      required: true
    },
    {
      name: "postalCodes",
      type: "array",
      fields: [{ name: "value", type: "text", label: "Code postal", required: true }],
      label: "Codes postaux"
    },
    {
      name: "description",
      type: "textarea",
      label: "Précisions publiques",
      localized: true
    },
    ...approvalFields
  ],
  hooks: { beforeChange: [protectCollectionApprovalAndPublication] },
  versions: {
    drafts: { autosave: { interval: 8000 }, schedulePublish: true, validate: false },
    maxPerDoc: 50
  }
};
