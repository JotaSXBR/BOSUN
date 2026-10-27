import { describe, expect, it } from "vitest";
import { cleanReason } from "./recovery.ts";

describe("cleanReason", () => {
  it("vira uma linha: controle e separadores de linha (U+2028/2029) viram espaço", () => {
    expect(cleanReason("perdeu\u0007 o\ncelular linha nova")).toBe("perdeu o celular linha nova");
  });

  it("corta em 200 code points sem partir um emoji", () => {
    const out = cleanReason(`${"x".repeat(199)}😀😀`) ?? "";
    expect(Array.from(out)).toHaveLength(200);
    expect(out.endsWith("😀")).toBe(true);
  });

  it("vazio ou só espaço some", () => {
    expect(cleanReason("  \u0000 ")).toBeUndefined();
    expect(cleanReason(undefined)).toBeUndefined();
  });
});
