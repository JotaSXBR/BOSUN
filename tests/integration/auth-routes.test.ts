import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as loginPost } from "@/app/api/auth/login/route.ts";
import { POST as logoutPost } from "@/app/api/auth/logout/route.ts";
import { db } from "@/lib/db.ts";
import { createAccount } from "@/modules/identity/accounts.ts";

const ORIGIN = "http://localhost:3000";

beforeEach(() => vi.stubEnv("BETTER_AUTH_URL", ORIGIN));
afterAll(async () => {
  vi.unstubAllEnvs();
  await db.$disconnect();
});

function request(path: string, init: { body?: string; origin?: string; cookie?: string } = {}) {
  const headers: Record<string, string> = { "content-type": "application/json", "x-forwarded-for": `10.9.${Math.floor(Math.random() * 250)}.1` };
  if (init.origin !== undefined) headers.origin = init.origin;
  if (init.cookie) headers.cookie = init.cookie;
  return new Request(`${ORIGIN}${path}`, { method: "POST", headers, body: init.body });
}

describe("rotas de login e logout", () => {
  it("login certo devolve cookie de sessão; logout limpa e leva ao login", async () => {
    const s = randomUUID().slice(0, 8);
    const { user, tempPassword } = await createAccount({ username: `r${s}`, email: `r${s}@test.local`, name: "R" }, { type: "operator" });
    const res = await loginPost(request("/api/auth/login", { origin: ORIGIN, body: JSON.stringify({ identifier: user.email, password: tempPassword }) }));
    expect(res.status).toBe(200);
    const cookie = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
    expect(cookie).toContain("bosun.session_token=");

    const out = await logoutPost(request("/api/auth/logout", { origin: ORIGIN, cookie }));
    expect(out.status).toBe(303);
    expect(out.headers.get("location")).toBe(`${ORIGIN}/login`);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
  });

  it("login errado dá 401 com a mensagem genérica; corpo inválido dá 400", async () => {
    const wrong = await loginPost(request("/api/auth/login", { origin: ORIGIN, body: JSON.stringify({ identifier: "x@test.local", password: "senha errada longa" }) }));
    expect(wrong.status).toBe(401);
    expect(await wrong.json()).toEqual({ error: "Usuário ou senha inválidos" });
    expect((await loginPost(request("/api/auth/login", { origin: ORIGIN, body: "não é json" }))).status).toBe(400);
  });

  it("origem diferente dá 403 nas duas rotas", async () => {
    expect((await loginPost(request("/api/auth/login", { origin: "https://evil.example", body: "{}" }))).status).toBe(403);
    expect((await logoutPost(request("/api/auth/logout", { origin: "https://evil.example" }))).status).toBe(403);
  });
});
