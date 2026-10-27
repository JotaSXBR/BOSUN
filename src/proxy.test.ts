import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { buildCsp, proxy } from "./proxy.ts";

describe("buildCsp", () => {
  it("produção: nonce em script e estilo, sem unsafe-*, com upgrade", () => {
    const csp = buildCsp("abc", false);
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp).toContain("style-src 'self' 'nonce-abc'");
    expect(csp).not.toMatch(/unsafe-/);
    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it("dev: unsafe-eval no script e unsafe-inline no estilo, sem upgrade (localhost é HTTP)", () => {
    const csp = buildCsp("abc", true);
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });
});

describe("proxy", () => {
  it("põe a CSP na resposta com um nonce novo a cada requisição", () => {
    const csp = (url: string) => proxy(new NextRequest(url)).headers.get("content-security-policy") ?? "";
    const [a, b] = [csp("http://localhost/login"), csp("http://localhost/login")];
    expect(a).toMatch(/'nonce-[A-Za-z0-9+/=]+'/);
    expect(a).not.toBe(b);
  });
});
