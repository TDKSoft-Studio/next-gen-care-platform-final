import type { CollectionConfig } from "payload";

import { canManageContent, isTechnicalAdmin, publishedOrAuthenticated } from "../access";
import { approvalFields, protectCollectionApprovalAndPublication } from "../content-approval";
import { cmsEnvironment } from "../environment";

export const Trips: CollectionConfig = {
  slug: "trips",
  access: {
    create: canManageContent,
    delete: isTechnicalAdmin,
    read: publishedOrAuthenticated,
    readVersions: canManageContent,
    update: canManageContent
  },
  admin: {
    defaultColumns: ["title", "eventStatus", "startDate", "approvalStatus", "_status"],
    group: "Offres",
    livePreview: {
      breakpoints: [
        { height: 844, label: "Mobile", name: "mobile", width: 390 },
        { height: 900, label: "Bureau", name: "desktop", width: 1440 }
      ],
      url: ({ locale }) => {
        const code = locale?.code === "nl" ? "nl" : "fr";
        const slug = code === "nl" ? "reizen-team-building" : "voyages-team-building";
        return `${cmsEnvironment.serverUrl}/${code}/${slug}?preview=1`;
      }
    },
    useAsTitle: "title"
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Événement ou voyage",
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
      name: "destination",
      type: "text",
      label: "Destination",
      localized: true,
      required: true
    },
    {
      name: "eventStatus",
      type: "select",
      defaultValue: "planned",
      label: "État commercial",
      options: [
        { label: "Projet", value: "planned" },
        { label: "Ouvert", value: "open" },
        { label: "Complet", value: "full" },
        { label: "Clôturé", value: "closed" },
        { label: "Archivé", value: "archived" }
      ],
      required: true
    },
    {
      name: "startDate",
      type: "date",
      label: "Date de début",
      required: true
    },
    {
      name: "endDate",
      type: "date",
      label: "Date de fin"
    },
    {
      name: "summary",
      type: "textarea",
      label: "Résumé",
      localized: true,
      required: true
    },
    {
      name: "capacity",
      type: "number",
      label: "Capacité maximale",
      min: 1
    },
    {
      name: "availabilityNote",
      type: "text",
      label: "Disponibilité affichée",
      localized: true
    },
    {
      name: "packages",
      type: "array",
      fields: [
        {
          name: "tier",
          type: "select",
          label: "Niveau",
          options: [
            { label: "Classic", value: "classic" },
            { label: "Gold", value: "gold" },
            { label: "Signature", value: "signature" }
          ],
          required: true
        },
        {
          name: "priceEur",
          type: "number",
          admin: { step: 0.01 },
          label: "Prix en EUR",
          min: 0
        },
        {
          name: "taxAndOccupancyTerms",
          type: "textarea",
          label: "TVA, taxes et occupation",
          localized: true
        },
        {
          name: "inclusions",
          type: "textarea",
          label: "Inclus",
          localized: true,
          required: true
        },
        {
          name: "exclusions",
          type: "textarea",
          label: "Non inclus",
          localized: true,
          required: true
        }
      ],
      label: "Forfaits",
      maxRows: 3
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
