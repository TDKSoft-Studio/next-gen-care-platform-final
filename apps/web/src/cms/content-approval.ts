import type {
  CollectionBeforeChangeHook,
  Field,
  GlobalBeforeChangeHook,
  PayloadRequest
} from "payload";

import { cmsUser, hasRole } from "./access";

export const approvalFields: Field[] = [
  {
    name: "approvalStatus",
    type: "select",
    access: {
      update: ({ req }) => hasRole(req, "medical-approver")
    },
    defaultValue: "pending",
    label: "Validation du contenu",
    options: [
      { label: "À valider", value: "pending" },
      { label: "Approuvé", value: "approved" },
      { label: "Refusé", value: "rejected" }
    ],
    required: true
  },
  {
    name: "approvedBy",
    type: "relationship",
    admin: { readOnly: true },
    hasMany: false,
    label: "Validé par",
    relationTo: "users"
  },
  {
    name: "approvedAt",
    type: "date",
    admin: { readOnly: true },
    label: "Validé le"
  }
];

function approvalChanged(
  data: Record<string, unknown>,
  original: Record<string, unknown>
): boolean {
  return ["approvalStatus", "approvedBy", "approvedAt"].some(
    (field) => field in data && data[field] !== original[field]
  );
}

const workflowFields = new Set([
  "_status",
  "approvalStatus",
  "approvedAt",
  "approvedBy",
  "createdAt",
  "id",
  "updatedAt"
]);

function contentSnapshot(document: Record<string, unknown>): string {
  return JSON.stringify(
    Object.fromEntries(Object.entries(document).filter(([key]) => !workflowFields.has(key)))
  );
}

interface ApprovalHookArguments {
  data: Record<string, unknown>;
  originalDoc?: Record<string, unknown>;
  req: PayloadRequest;
}

export function protectApprovalAndPublication({ data, originalDoc, req }: ApprovalHookArguments) {
  const original = (originalDoc ?? {}) as Record<string, unknown>;
  const next = data as Record<string, unknown>;
  const approver = hasRole(req, "medical-approver");
  const hasOriginal = Object.keys(original).length > 0;
  const explicitlyChangedApproval = hasOriginal
    ? approvalChanged(next, original)
    : (next.approvalStatus !== undefined && next.approvalStatus !== "pending") ||
      next.approvedBy !== undefined ||
      next.approvedAt !== undefined;
  const merged = { ...original, ...next };
  const changedContent = hasOriginal && contentSnapshot(merged) !== contentSnapshot(original);

  if (explicitlyChangedApproval && !approver) {
    throw new Error("Seul le rôle de validation médicale peut modifier la validation du contenu.");
  }

  if (changedContent && original.approvalStatus === "approved" && !approver) {
    next.approvalStatus = "pending";
    next.approvedBy = null;
    next.approvedAt = null;
  }

  if (next.approvalStatus === "approved") {
    if (approver && (explicitlyChangedApproval || changedContent)) {
      const user = cmsUser(req);
      next.approvedBy = user?.id;
      next.approvedAt = new Date().toISOString();
    }
  }

  const targetStatus = next._status ?? original._status;
  const targetApproval = next.approvalStatus ?? original.approvalStatus;

  if (targetStatus === "published") {
    if (!hasRole(req, "technical-admin", "medical-approver")) {
      throw new Error("Ce rôle peut enregistrer des brouillons mais ne peut pas publier.");
    }
    if (targetApproval !== "approved") {
      throw new Error("Le contenu doit être validé avant publication.");
    }
  }

  return data;
}

export const protectCollectionApprovalAndPublication: CollectionBeforeChangeHook =
  protectApprovalAndPublication;

export const protectGlobalApprovalAndPublication: GlobalBeforeChangeHook =
  protectApprovalAndPublication;
