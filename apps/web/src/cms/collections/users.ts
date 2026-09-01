import type { CollectionConfig } from "payload";

import { cmsRoles, hasCmsRole } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email"
  },
  access: {
    admin: ({ req }) => hasCmsRole(req.user, "technical-admin", "medical-approver", "editor"),
    // Account provisioning is a technical-admin responsibility. The very first account is
    // still created through Payload's first-user setup, which runs with overrideAccess.
    create: ({ req }) => hasCmsRole(req.user, "technical-admin"),
    delete: ({ req }) => hasCmsRole(req.user, "technical-admin"),
    read: ({ req }) => hasCmsRole(req.user, "technical-admin") || { id: { equals: req.user?.id } },
    update: ({ req }) => hasCmsRole(req.user, "technical-admin") || { id: { equals: req.user?.id } }
  },
  fields: [
    {
      name: "roles",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["editor"],
      // Field-level guard so a non-admin cannot escalate their own roles through the
      // self-update path above. First-user setup bypasses this via overrideAccess.
      access: {
        create: ({ req }) => hasCmsRole(req.user, "technical-admin"),
        update: ({ req }) => hasCmsRole(req.user, "technical-admin")
      },
      options: cmsRoles.map((role) => ({ label: role, value: role }))
    }
  ]
};
