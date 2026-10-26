import { describe, expect, it } from "vitest";
import { sanitizeAuditData } from "./audit.ts";

describe("sanitizeAuditData", () => {
  it("remove chaves de segredo em qualquer nível e mantém o resto", () => {
    expect(
      sanitizeAuditData({
        reason: "perdeu o celular",
        password: "x",
        tempPassword: "x",
        nested: { sessionToken: "x", backupCodes: ["x"], totpCode: "1", secret: "x", cookie: "x", ip: "1.2.3.4" },
        list: [{ token: "x", ok: 1 }],
      }),
    ).toEqual({ reason: "perdeu o celular", nested: { ip: "1.2.3.4" }, list: [{ ok: 1 }] });
  });
});
