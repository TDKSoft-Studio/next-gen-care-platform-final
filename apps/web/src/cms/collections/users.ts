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
    create: ({ req }) => !req.user || hasCmsRole(req.user, "technical-admin"),
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
      options: cmsRoles.map((role) => ({ label: role, value: role }))
    }
  ]
};
