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
        headers: { authorization: "Bearer x", apiKey: "x", api_key: "x", privateKey: "x", pwd: "x", jwt: "x" },
      }),
    ).toEqual({ reason: "perdeu o celular", nested: { ip: "1.2.3.4" }, list: [{ ok: 1 }], headers: {} });
  });

  it("mantém null, descarta undefined e serializa data e bigint", () => {
    const at = new Date("2026-10-26T12:00:00Z");
    expect(sanitizeAuditData({ a: null, b: undefined, at, n: 10n })).toEqual({ a: null, at: "2026-10-26T12:00:00.000Z", n: "10" });
  });
});
