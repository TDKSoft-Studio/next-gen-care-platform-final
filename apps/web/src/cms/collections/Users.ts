import type { CollectionConfig } from "payload";

import { cmsRoles, cmsUser, hasRole } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    create: async ({ req }) => {
      const existing = await req.payload.count({ collection: "users", overrideAccess: true });
      if (existing.totalDocs >= 2) return false;
      return existing.totalDocs === 0 || hasRole(req, "technical-admin");
    },
    delete: ({ req }) => hasRole(req, "technical-admin"),
    read: ({ req }) => {
      if (hasRole(req, "technical-admin")) return true;
      const user = cmsUser(req);
      return user?.id ? { id: { equals: user.id } } : false;
    },
    update: ({ req }) => {
      if (hasRole(req, "technical-admin")) return true;
      const user = cmsUser(req);
      return user?.id ? { id: { equals: user.id } } : false;
    }
  },
  admin: {
    defaultColumns: ["email", "displayName", "role", "updatedAt"],
    group: "Administration",
    useAsTitle: "displayName"
  },
  auth: {
    cookies: {
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production"
    },
    lockTime: 15 * 60 * 1000,
    maxLoginAttempts: 5,
    removeTokenFromResponses: true,
    tokenExpiration: 30 * 60,
    useAPIKey: false,
    useSessions: true
  },
  fields: [
    {
      name: "displayName",
      type: "text",
      label: "Nom affiché",
      required: true
    },
    {
      name: "role",
      type: "select",
      access: {
        update: ({ req }) => hasRole(req, "technical-admin")
      },
      label: "Rôle",
      options: cmsRoles.map((role) => ({
        label:
          role === "technical-admin"
            ? "Administration technique"
            : role === "medical-approver"
              ? "Validation médicale"
              : "Édition",
        value: role
      })),
      required: true
    }
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === "create") {
          const existing = await req.payload.count({
            collection: "users",
            overrideAccess: true
          });
          if (existing.totalDocs >= 2) {
            throw new Error(
              "La dérogation MFA temporaire limite le CMS à deux comptes nominatifs."
            );
          }
        }

        const password = data?.password;
        if (typeof password === "string" && password.length < 20) {
          throw new Error("Le mot de passe CMS doit contenir au moins 20 caractères.");
        }
        return data;
      }
    ]
  }
};
