import type { CollectionConfig } from "payload";

import { canManageContent, isTechnicalAdmin, publishedOrAuthenticated } from "../access";
import { approvalFields, protectCollectionApprovalAndPublication } from "../content-approval";

export const CaseStudies: CollectionConfig = {
  slug: "case-studies",
  access: {
    create: canManageContent,
    delete: isTechnicalAdmin,
    read: publishedOrAuthenticated,
    readVersions: canManageContent,
    update: canManageContent
  },
  admin: {
    defaultColumns: ["title", "domain", "approvalStatus", "_status"],
    group: "Contenu",
    useAsTitle: "title"
  },
  fields: [
    {
      name: "domain",
      type: "select",
      label: "Domaine",
      options: [
        { label: "Soins à domicile", value: "home-care" },
        { label: "Bloc opératoire", value: "operating-room" },
        { label: "Assistance et bien-être", value: "wellbeing" },
        { label: "Voyages et team building", value: "travel" },
        { label: "Health-Tech", value: "health-tech" }
      ],
      required: true
    },
    { name: "title", type: "text", label: "Titre", localized: true, required: true },
    {
      name: "slug",
      type: "text",
      index: true,
      label: "Chemin URL",
      localized: true,
      required: true
    },
    {
      name: "summary",
      type: "textarea",
      label: "Résumé",
      localized: true,
      required: true
    },
    { name: "body", type: "richText", label: "Contenu", localized: true },
    {
      name: "evidenceReference",
      type: "textarea",
      admin: {
        description:
          "Référence interne contrôlable. Ne pas saisir de donnée patient, secret ou donnée de santé."
      },
      label: "Preuve interne avant publication"
    },
    ...approvalFields
  ],
  hooks: { beforeChange: [protectCollectionApprovalAndPublication] },
  versions: {
    drafts: { autosave: { interval: 8000 }, schedulePublish: true, validate: false },
    maxPerDoc: 50
  }
};
