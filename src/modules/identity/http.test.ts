import { afterEach, describe, expect, it, vi } from "vitest";
import { sameOrigin, withCookies } from "./http.ts";

afterEach(() => vi.unstubAllEnvs());

const post = (origin?: string) =>
  new Request("http://localhost:3000/api/auth/login", { method: "POST", headers: origin ? { origin } : {} });

describe("sameOrigin", () => {
  it("aceita só o Origin do BETTER_AUTH_URL", () => {
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    expect(sameOrigin(post("http://localhost:3000"))).toBe(true);
    expect(sameOrigin(post("https://evil.example"))).toBe(false);
    expect(sameOrigin(post())).toBe(false);
  });

  it("sem BETTER_AUTH_URL recusa tudo", () => {
    vi.stubEnv("BETTER_AUTH_URL", "");
    expect(sameOrigin(post("http://localhost:3000"))).toBe(false);
  });
});

describe("withCookies", () => {
  it("repassa cada Set-Cookie", () => {
    const from = new Headers();
    from.append("set-cookie", "a=1; Path=/");
    from.append("set-cookie", "b=2; Path=/");
    expect(withCookies(new Response(null), from).headers.getSetCookie()).toEqual(["a=1; Path=/", "b=2; Path=/"]);
  });
});
