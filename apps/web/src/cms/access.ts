import type { Access, FieldAccess, PayloadRequest, Where } from "payload";

export const cmsRoles = ["technical-admin", "medical-approver", "editor"] as const;
export type CmsRole = (typeof cmsRoles)[number];

interface CmsUserIdentity {
  id?: number | string;
  role?: CmsRole;
}

export function cmsUser(req: PayloadRequest): CmsUserIdentity | null {
  return req.user as CmsUserIdentity | null;
}

export function hasRole(req: PayloadRequest, ...roles: CmsRole[]): boolean {
  const role = cmsUser(req)?.role;
  return role ? roles.includes(role) : false;
}

export const isAuthenticated: Access = ({ req }) => Boolean(req.user);

export const isTechnicalAdmin: Access = ({ req }) => hasRole(req, "technical-admin");

export const canManageContent: Access = ({ req }) =>
  hasRole(req, "technical-admin", "medical-approver", "editor");

export const canPublishContent: Access = ({ req }) =>
  hasRole(req, "technical-admin", "medical-approver");

export const canApproveContent: FieldAccess = ({ req }) => hasRole(req, "medical-approver");

export const publishedOrAuthenticated: Access = ({ req }): boolean | Where => {
  if (req.user) return true;
  return { _status: { equals: "published" } };
};
