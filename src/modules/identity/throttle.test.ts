import { describe, expect, it } from "vitest";
import { accountBlockMs, clientIp, ipBlocked, throttleKey } from "./throttle.ts";

describe("accountBlockMs (falhas por conta em 15 min)", () => {
  it("segue a tabela 5 → 30 s, 10 → 5 min, 20 → 15 min", () => {
    expect(accountBlockMs(4)).toBe(0);
    expect(accountBlockMs(5)).toBe(30_000);
    expect(accountBlockMs(9)).toBe(30_000);
    expect(accountBlockMs(10)).toBe(300_000);
    expect(accountBlockMs(19)).toBe(300_000);
    expect(accountBlockMs(20)).toBe(900_000);
    expect(accountBlockMs(500)).toBe(900_000);
  });
});

describe("ipBlocked", () => {
  it("bloqueia depois de 100 tentativas na janela", () => {
    expect(ipBlocked(100, "login")).toBe(false);
    expect(ipBlocked(101, "login")).toBe(true);
    expect(ipBlocked(50, "2fa")).toBe(false);
    expect(ipBlocked(51, "2fa")).toBe(true);
  });
});

describe("throttleKey", () => {
  it("não guarda o identificador cru e ignora maiúsculas e espaços", () => {
    const key = throttleKey("acct", "  Maria@Example.com ");
    expect(key).not.toContain("maria");
    expect(key).toBe(throttleKey("acct", "maria@example.com"));
    expect(key).not.toBe(throttleKey("ip", "maria@example.com"));
  });
});

describe("clientIp", () => {
  it("usa a última entrada do X-Forwarded-For, a que o nosso proxy pôs", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "6.6.6.6, 10.0.0.1, 203.0.113.9" }))).toBe("203.0.113.9");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
