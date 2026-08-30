import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { fr } from "@payloadcms/translations/languages/fr";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import sharp from "sharp";

import { hasRole } from "./src/cms/access";
import { Media } from "./src/cms/collections/Media";
import { Pages } from "./src/cms/collections/Pages";
import { CaseStudies } from "./src/cms/collections/CaseStudies";
import { ServiceAreas } from "./src/cms/collections/ServiceAreas";
import { Services } from "./src/cms/collections/Services";
import { TeamMembers } from "./src/cms/collections/TeamMembers";
import { Trips } from "./src/cms/collections/Trips";
import { Users } from "./src/cms/collections/Users";
import { cmsEnvironment } from "./src/cms/environment";
import { SiteSettings } from "./src/cms/globals/SiteSettings";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(currentDirectory, "src")
    },
    livePreview: {
      collections: ["pages"],
      globals: ["site-settings"]
    },
    meta: {
      description: "Administration des contenus publics NEXT GEN CARE",
      titleSuffix: "— NEXT GEN CARE"
    },
    user: "users"
  },
  collections: [Users, Media, Pages, Services, Trips, TeamMembers, ServiceAreas, CaseStudies],
  csrf: [cmsEnvironment.serverUrl],
  db: postgresAdapter({
    idType: "uuid",
    migrationDir: path.resolve(currentDirectory, "src/cms/migrations"),
    pool: { connectionString: cmsEnvironment.databaseUrl },
    push: false
  }),
  editor: lexicalEditor(),
  globals: [SiteSettings],
  i18n: {
    fallbackLanguage: "fr",
    supportedLanguages: { fr }
  },
  jobs: {
    access: {
      cancel: ({ req }) => hasRole(req, "technical-admin"),
      queue: ({ req }) => hasRole(req, "technical-admin", "medical-approver"),
      run: ({ req }) => hasRole(req, "technical-admin")
    },
    autoRun: [{ allQueues: true, cron: "0 * * * * *", limit: 10 }],
    deleteJobOnComplete: false
  },
  localization: {
    defaultLocale: "fr",
    fallback: false,
    locales: [
      { code: "fr", label: "Français" },
      { code: "nl", label: "Nederlands" }
    ]
  },
  routes: {
    admin: "/admin",
    api: "/cms-api",
    graphQL: "/cms-graphql",
    graphQLPlayground: "/cms-graphql-playground"
  },
  secret: cmsEnvironment.secret,
  serverURL: cmsEnvironment.serverUrl,
  sharp,
  typescript: {
    outputFile: path.resolve(currentDirectory, "src/cms/payload-types.ts")
  }
});
