import type { GlobalConfig } from "payload";

import { approvalFields, protectGlobalApprovalAndPublication } from "../content-approval";
import { cmsEnvironment } from "../environment";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    read: ({ req }) => Boolean(req.user),
    readVersions: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user)
  },
  admin: {
    group: "Contenu",
    livePreview: {
      breakpoints: [
        { height: 844, label: "Mobile", name: "mobile", width: 390 },
        { height: 900, label: "Bureau", name: "desktop", width: 1440 }
      ],
      url: ({ locale }) => {
        const code = locale?.code === "nl" ? "nl" : "fr";
        return `${cmsEnvironment.serverUrl}/${code}?preview=1`;
      }
    }
  },
  fields: [
    {
      name: "brandName",
      type: "text",
      defaultValue: "NEXT GEN CARE",
      label: "Nom public",
      required: true
    },
    {
      name: "publicEmail",
      type: "email",
      defaultValue: "hello@nextgen-cares.org",
      label: "E-mail public",
      required: true
    },
    {
      name: "publicPhone",
      type: "text",
      defaultValue: "+32 460 96 02 94",
      label: "Téléphone public",
      required: true
    },
    {
      name: "legalAddress",
      type: "group",
      fields: [
        { name: "street", type: "text", defaultValue: "Rue Vaudree 64", required: true },
        { name: "postalCode", type: "text", defaultValue: "403", required: true },
        { name: "city", type: "text", defaultValue: "Angleur", required: true },
        { name: "country", type: "text", defaultValue: "Belgique", required: true }
      ],
      label: "Adresse légale"
    },
    {
      name: "serviceArea",
      type: "text",
      defaultValue: "Province de Liège",
      label: "Zone de service",
      localized: true,
      required: true
    },
    {
      name: "emergencyNotice",
      type: "textarea",
      defaultValue:
        "NEXT GEN CARE ne traite pas les urgences médicales. En cas d’urgence médicale ou de danger vital, appelez immédiatement le 112.",
      label: "Avertissement d’urgence",
      localized: true,
      required: true
    },
    ...approvalFields
  ],
  hooks: {
    beforeChange: [protectGlobalApprovalAndPublication]
  },
  versions: {
    drafts: { autosave: { interval: 8000 }, schedulePublish: true, validate: false },
    max: 50
  }
};
