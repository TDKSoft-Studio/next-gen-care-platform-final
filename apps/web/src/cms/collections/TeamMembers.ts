import type { CollectionConfig } from "payload";

import { canManageContent, isTechnicalAdmin, publishedOrAuthenticated } from "../access";
import { approvalFields, protectCollectionApprovalAndPublication } from "../content-approval";

export const TeamMembers: CollectionConfig = {
  slug: "team-members",
  access: {
    create: canManageContent,
    delete: isTechnicalAdmin,
    read: publishedOrAuthenticated,
    readVersions: canManageContent,
    update: canManageContent
  },
  admin: {
    defaultColumns: ["displayName", "roleTitle", "approvalStatus", "_status"],
    group: "Organisation",
    useAsTitle: "displayName"
  },
  fields: [
    { name: "displayName", type: "text", label: "Nom public", required: true },
    {
      name: "roleTitle",
      type: "text",
      label: "Fonction publique",
      localized: true,
      required: true
    },
    {
      name: "biography",
      type: "richText",
      label: "Présentation",
      localized: true
    },
    { name: "portrait", type: "upload", label: "Portrait", relationTo: "media" },
    {
      name: "displayOrder",
      type: "number",
      defaultValue: 100,
      label: "Ordre d’affichage",
      min: 0,
      required: true
    },
    ...approvalFields
  ],
  hooks: { beforeChange: [protectCollectionApprovalAndPublication] },
  versions: {
    drafts: { autosave: { interval: 8000 }, schedulePublish: true, validate: false },
    maxPerDoc: 50
  }
};
