import { describe, expect, it } from "vitest";
import { challengeId } from "./challenge.ts";

const NAME = "bosun.two_factor";
const signed = encodeURIComponent("2fa-abc123.c2lnbmF0dXJh+/w==");

describe("challengeId", () => {
  it("tira o identificador do cookie de desafio assinado (Set-Cookie e Cookie)", () => {
    expect(challengeId([`${NAME}=${signed}; Path=/; HttpOnly`], NAME)).toBe("2fa-abc123");
    expect(challengeId(["bosun.session_token=x", ` ${NAME}=${signed}`], NAME)).toBe("2fa-abc123");
    expect(challengeId([`__Secure-${NAME}=${signed}`], `__Secure-${NAME}`)).toBe("2fa-abc123");
  });

  it("como o plugin: só o nome exato, a primeira ocorrência e sem aspas", () => {
    const other = encodeURIComponent("2fa-outro.c2lnbmF0dXJh+/w==");
    expect(challengeId([`evil.two_factor=${other}`, `${NAME}=${signed}`], NAME)).toBe("2fa-abc123");
    expect(challengeId([`${NAME}=${signed}`, `${NAME}=${other}`], NAME)).toBe("2fa-abc123");
    expect(challengeId([`${NAME}="${signed}"`], NAME)).toBe("2fa-abc123");
  });

  it("sem o cookie, sem assinatura ou malformado: não há desafio (sem lançar)", () => {
    expect(challengeId(["bosun.session_token=x"], NAME)).toBeNull();
    expect(challengeId([`${NAME}=semassinatura`], NAME)).toBeNull();
    expect(challengeId([`${NAME}=%E0%A4%A`], NAME)).toBeNull();
    expect(challengeId([""], NAME)).toBeNull();
  });
});
