import type { CollectionConfig } from "payload";

import { canManageContent, isTechnicalAdmin, publishedOrAuthenticated } from "../access";
import { approvalFields, protectCollectionApprovalAndPublication } from "../content-approval";
import { cmsEnvironment } from "../environment";

const pageDomainPaths = {
  corporate: { fr: "", nl: "" },
  "health-tech": { fr: "health-tech", nl: "health-tech" },
  "home-care": { fr: "soins-a-domicile", nl: "thuiszorg" },
  legal: { fr: "mentions-legales", nl: "wettelijke-vermeldingen" },
  "operating-room": { fr: "blocs-operatoires", nl: "operatiekwartier" },
  privacy: { fr: "vie-privee", nl: "privacy" },
  travel: { fr: "voyages-team-building", nl: "reizen-team-building" },
  wellbeing: { fr: "bien-etre", nl: "welzijn" }
} as const;

export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    create: canManageContent,
    delete: isTechnicalAdmin,
    read: publishedOrAuthenticated,
    update: canManageContent,
    readVersions: canManageContent
  },
  admin: {
    defaultColumns: ["title", "domain", "approvalStatus", "_status", "updatedAt"],
    group: "Contenu",
    livePreview: {
      breakpoints: [
        { height: 844, label: "Mobile", name: "mobile", width: 390 },
        { height: 900, label: "Bureau", name: "desktop", width: 1440 }
      ],
      url: ({ data, locale }) => {
        const code = locale?.code === "nl" ? "nl" : "fr";
        const domain = data.domain as keyof typeof pageDomainPaths;
        const slug = pageDomainPaths[domain]?.[code] ?? "";
        return `${cmsEnvironment.serverUrl}/${code}${slug ? `/${slug}` : ""}?preview=1`;
      }
    },
    useAsTitle: "title"
  },
  fields: [
    {
      name: "domain",
      type: "select",
      label: "Contexte métier",
      options: [
        { label: "Accueil", value: "corporate" },
        { label: "Soins à domicile", value: "home-care" },
        { label: "Bloc opératoire", value: "operating-room" },
        { label: "Assistance et bien-être", value: "wellbeing" },
        { label: "Voyages et team building", value: "travel" },
        { label: "Health-Tech", value: "health-tech" },
        { label: "Mentions légales", value: "legal" },
        { label: "Vie privée", value: "privacy" }
      ],
      required: true
    },
    {
      name: "title",
      type: "text",
      label: "Titre",
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
      name: "body",
      type: "richText",
      label: "Contenu",
      localized: true,
      required: true
    },
    {
      name: "heroMedia",
      type: "upload",
      label: "Visuel principal",
      relationTo: "media"
    },
    {
      name: "navigationOrder",
      type: "number",
      defaultValue: 100,
      label: "Ordre de navigation",
      min: 0,
      required: true
    },
    {
      name: "showInNavigation",
      type: "checkbox",
      defaultValue: true,
      label: "Afficher dans la navigation"
    },
    {
      name: "seo",
      type: "group",
      fields: [
        {
          name: "title",
          type: "text",
          label: "Titre SEO",
          localized: true,
          maxLength: 65
        },
        {
          name: "description",
          type: "textarea",
          label: "Description SEO",
          localized: true,
          maxLength: 160
        }
      ],
      label: "Référencement"
    },
    ...approvalFields
  ],
  hooks: {
    beforeChange: [protectCollectionApprovalAndPublication]
  },
  versions: {
    drafts: {
      autosave: { interval: 8000 },
      schedulePublish: true,
      validate: false
    },
    maxPerDoc: 50
  }
};
