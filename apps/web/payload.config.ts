import { postgresAdapter } from "@payloadcms/db-postgres";
import { fr } from "@payloadcms/translations/languages/fr";
import { nl } from "@payloadcms/translations/languages/nl";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Media } from "./src/cms/collections/media";
import { Pages } from "./src/cms/collections/pages";
import { Users } from "./src/cms/collections/users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, "src/app/(payload)")
    },
    user: Users.slug
  },
  collections: [Users, Pages, Media],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? ""
    }
  }),
  editor: lexicalEditor(),
  experimental: {
    localizeStatus: true
  },
  i18n: {
    fallbackLanguage: "fr",
    supportedLanguages: {
      fr,
      nl
    }
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
    api: "/api"
  },
  secret: process.env.PAYLOAD_SECRET ?? "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts")
  }
});
