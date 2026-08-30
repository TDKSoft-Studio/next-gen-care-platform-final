import type { PayloadRequest } from "payload";
import { describe, expect, it } from "vitest";

import { protectApprovalAndPublication } from "../src/cms/content-approval";

function request(role: "editor" | "medical-approver" | "technical-admin"): PayloadRequest {
  return { user: { id: "user-1", role } } as unknown as PayloadRequest;
}

describe("CMS publication governance", () => {
  it("rejects approval changes from a non-medical role", () => {
    expect(() =>
      protectApprovalAndPublication({
        data: { approvalStatus: "approved" },
        originalDoc: { approvalStatus: "pending" },
        req: request("technical-admin")
      })
    ).toThrow(/validation médicale/);
  });

  it("resets approval when a non-medical role changes approved content", () => {
    const result = protectApprovalAndPublication({
      data: { summary: "Contenu modifié" },
      originalDoc: {
        _status: "draft",
        approvalStatus: "approved",
        approvedAt: "2026-08-29T08:00:00.000Z",
        approvedBy: "medical-1",
        summary: "Contenu initial"
      },
      req: request("editor")
    });

    expect(result).toMatchObject({
      approvalStatus: "pending",
      approvedAt: null,
      approvedBy: null
    });
  });

  it("blocks publication until medical approval exists", () => {
    expect(() =>
      protectApprovalAndPublication({
        data: { _status: "published", approvalStatus: "pending" },
        originalDoc: {},
        req: request("technical-admin")
      })
    ).toThrow(/validé avant publication/);
  });

  it("stamps medical approval with the named approver", () => {
    const result = protectApprovalAndPublication({
      data: { approvalStatus: "approved" },
      originalDoc: { approvalStatus: "pending" },
      req: request("medical-approver")
    });
    expect(result.approvedBy).toBe("user-1");
    expect(result.approvedAt).toEqual(expect.any(String));
  });
});
