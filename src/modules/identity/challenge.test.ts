import { describe, expect, it } from "vitest";
import { challengeId } from "./challenge.ts";

describe("challengeId", () => {
  const signed = encodeURIComponent("2fa-abc123.c2lnbmF0dXJh+/w==");

  it("tira o identificador do cookie de desafio assinado, em dev e com __Secure-", () => {
    expect(challengeId([`bosun.two_factor=${signed}; Path=/; HttpOnly`])).toBe("2fa-abc123");
    expect(challengeId(["bosun.session_token=x", ` __Secure-bosun.two_factor=${signed}`])).toBe("2fa-abc123");
  });

  it("sem o cookie, ou sem assinatura, não há desafio", () => {
    expect(challengeId(["bosun.session_token=x"])).toBeNull();
    expect(challengeId(["bosun.two_factor=semassinatura"])).toBeNull();
    expect(challengeId([""])).toBeNull();
  });
});
