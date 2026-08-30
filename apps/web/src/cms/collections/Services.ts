import type { CollectionConfig } from "payload";

import { canManageContent, isTechnicalAdmin, publishedOrAuthenticated, hasRole } from "../access";
import { approvalFields, protectCollectionApprovalAndPublication } from "../content-approval";
import { cmsEnvironment } from "../environment";

const serviceDomainPaths = {
  "health-tech": { fr: "health-tech", nl: "health-tech" },
  "home-care": { fr: "soins-a-domicile", nl: "thuiszorg" },
  "operating-room": { fr: "blocs-operatoires", nl: "operatiekwartier" },
  "personal-assistance": { fr: "bien-etre", nl: "welzijn" },
  wellbeing: { fr: "bien-etre", nl: "welzijn" }
} as const;

export const Services: CollectionConfig = {
  slug: "services",
  access: {
    create: canManageContent,
    delete: isTechnicalAdmin,
    read: publishedOrAuthenticated,
    readVersions: canManageContent,
    update: canManageContent
  },
  admin: {
    defaultColumns: ["title", "category", "approvalStatus", "_status", "updatedAt"],
    group: "Offres",
    livePreview: {
      breakpoints: [
        { height: 844, label: "Mobile", name: "mobile", width: 390 },
        { height: 900, label: "Bureau", name: "desktop", width: 1440 }
      ],
      url: ({ data, locale }) => {
        const code = locale?.code === "nl" ? "nl" : "fr";
        const category = data.category as keyof typeof serviceDomainPaths;
        const slug = serviceDomainPaths[category]?.[code] ?? serviceDomainPaths.wellbeing[code];
        return `${cmsEnvironment.serverUrl}/${code}/${slug}?preview=1`;
      }
    },
    useAsTitle: "title"
  },
  fields: [
    {
      name: "category",
      type: "select",
      label: "Catégorie",
      options: [
        { label: "Soins à domicile", value: "home-care" },
        { label: "Bloc opératoire", value: "operating-room" },
        { label: "Assistance non médicale", value: "personal-assistance" },
        { label: "Bien-être", value: "wellbeing" },
        { label: "Health-Tech", value: "health-tech" }
      ],
      required: true
    },
    {
      name: "title",
      type: "text",
      label: "Nom du service",
      localized: true,
      required: true
    },
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
    {
      name: "description",
      type: "richText",
      label: "Description",
      localized: true
    },
    {
      name: "prescriptionRequirement",
      type: "select",
      access: {
        update: ({ req }) => hasRole(req, "medical-approver")
      },
      defaultValue: "not-stated",
      label: "Prescription",
      options: [
        { label: "Non communiqué", value: "not-stated" },
        { label: "Prescription requise", value: "required" },
        { label: "Prescription non requise", value: "not-required" },
        { label: "Selon évaluation", value: "case-by-case" }
      ],
      required: true
    },
    {
      name: "reimbursement",
      type: "select",
      access: {
        update: ({ req }) => hasRole(req, "medical-approver")
      },
      defaultValue: "not-stated",
      label: "Information de remboursement",
      options: [
        { label: "Non communiquée", value: "not-stated" },
        { label: "Couverture possible selon conditions", value: "conditional" },
        { label: "À charge du client", value: "client-paid" }
      ],
      required: true
    },
    ...approvalFields
  ],
  hooks: {
    beforeChange: [protectCollectionApprovalAndPublication]
  },
  versions: {
    drafts: { autosave: { interval: 8000 }, schedulePublish: true, validate: false },
    maxPerDoc: 50
  }
};
