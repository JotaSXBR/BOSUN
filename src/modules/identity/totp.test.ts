import { describe, expect, it } from "vitest";
import { totpCode } from "../../../tests/totp.ts";
import { groupSecret } from "./totp.ts";

describe("groupSecret", () => {
  it("tira o segredo base32 do URI e separa em grupos de 4", () => {
    expect(groupSecret("otpauth://totp/BOSUN:ana%40x.com?secret=ABCDEFGHIJ234&issuer=BOSUN")).toBe("ABCD EFGH IJ23 4");
  });

  it("URI sem segredo dá texto vazio", () => {
    expect(groupSecret("otpauth://totp/BOSUN:ana?issuer=BOSUN")).toBe("");
  });
});

describe("gerador TOTP dos testes", () => {
  it("bate com o vetor da RFC 6238 (SHA-1, T = 59 s)", () => {
    // "12345678901234567890" em base32; o vetor de 8 dígitos é 94287082.
    expect(totpCode("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", 59_000)).toBe("287082");
  });
});
