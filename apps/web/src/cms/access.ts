type CmsUser = unknown;

export const cmsRoles = ["technical-admin", "medical-approver", "editor"] as const;
export type CmsRole = (typeof cmsRoles)[number];

export function hasCmsRole(user: CmsUser, ...roles: CmsRole[]): boolean {
  if (!user || typeof user !== "object") return false;
  const userRoles = Reflect.get(user, "roles");
  if (!Array.isArray(userRoles)) return false;
  return userRoles.some((role) => typeof role === "string" && roles.includes(role as CmsRole));
}

export function canEditContent(user: CmsUser): boolean {
  return hasCmsRole(user, "technical-admin", "medical-approver", "editor");
}

export function canPublishContent(user: CmsUser): boolean {
  return hasCmsRole(user, "technical-admin", "medical-approver");
}
