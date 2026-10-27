import { afterEach, describe, expect, it, vi } from "vitest";
import { twoFactorCookieName } from "./auth.ts";
import { bindChallenge, challengeStillValid } from "./challenge.ts";
import { authSecret } from "./secret.ts";
import { onlyRow } from "./throttle.ts";

afterEach(() => vi.unstubAllEnvs());

describe("authSecret", () => {
  it("recusa segredo ausente ou com menos de 32 caracteres", () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    expect(() => authSecret()).toThrow("BETTER_AUTH_SECRET");
    vi.stubEnv("BETTER_AUTH_SECRET", "curto");
    expect(() => authSecret()).toThrow("BETTER_AUTH_SECRET");
  });
});

describe("cookie de desafio", () => {
  it("com cookies seguros ganha o prefixo __Secure-", () => {
    expect(twoFactorCookieName(true)).toBe("__Secure-bosun.two_factor");
    expect(twoFactorCookieName(false)).toBe("bosun.two_factor");
  });

  it("sem cookie de desafio: vincular é defeito (lança) e conferir falha fechado", async () => {
    await expect(bindChallenge(new Headers(), "u", 0)).rejects.toThrow("desafio sem cookie");
    expect(await challengeStillValid("u", new Headers())).toBe(false);
  });
});

describe("onlyRow", () => {
  it("devolve a única linha e lança sem linha ou com mais de uma", () => {
    expect(onlyRow([1])).toBe(1);
    expect(() => onlyRow([])).toThrow("uma linha");
    expect(() => onlyRow([1, 2])).toThrow("uma linha");
  });
});
