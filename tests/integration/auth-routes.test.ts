import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as loginPost } from "@/app/api/auth/login/route.ts";
import { POST as passwordPost } from "@/app/api/account/password/route.ts";
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
    const attrs = res.headers.getSetCookie().find((c) => c.startsWith("bosun.session_token=")) ?? "";
    expect(attrs).toMatch(/HttpOnly/i);
    expect(attrs).toMatch(/SameSite=Lax/i);

    const out = await logoutPost(request("/api/auth/logout", { origin: ORIGIN, cookie }));
    expect(out.status).toBe(303);
    expect(out.headers.get("location")).toBe(`${ORIGIN}/login`);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
  });

  it("login errado dá 401 com a mensagem genérica; corpo inválido dá 400", async () => {
    const wrong = await loginPost(request("/api/auth/login", { origin: ORIGIN, body: JSON.stringify({ identifier: `x-${randomUUID()}@test.local`, password: "senha errada longa" }) }));
    expect(wrong.status).toBe(401);
    expect(await wrong.json()).toEqual({ error: "Usuário ou senha inválidos" });
    expect((await loginPost(request("/api/auth/login", { origin: ORIGIN, body: "não é json" }))).status).toBe(400);
  });

  it("corpo acima de 8 KB dá 413 sem parsear", async () => {
    const big = request("/api/auth/login", { origin: ORIGIN, body: "x".repeat(9000) });
    expect((await loginPost(big)).status).toBe(413);
  });

  it("troca de senha: 401 sem sessão, 400 com a mensagem da política, 200 e cookie mantido", async () => {
    const s = randomUUID().slice(0, 8);
    const { user, tempPassword } = await createAccount({ username: `t${s}`, email: `t${s}@test.local`, name: "T" }, { type: "operator" });
    const body = (next: string) => JSON.stringify({ current: tempPassword, next });
    expect((await passwordPost(request("/api/account/password", { origin: ORIGIN, body: body("cavalo correto bateria grampo") }))).status).toBe(401);

    const res = await loginPost(request("/api/auth/login", { origin: ORIGIN, body: JSON.stringify({ identifier: user.email, password: tempPassword }) }));
    const cookie = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
    const weak = await passwordPost(request("/api/account/password", { origin: ORIGIN, cookie, body: body("curta") }));
    expect(weak.status).toBe(400);
    expect(await weak.json()).toEqual({ error: "A senha nova precisa de 12 caracteres ou mais." });
    const ok = await passwordPost(request("/api/account/password", { origin: ORIGIN, cookie, body: body("cavalo correto bateria grampo") }));
    expect(ok.status).toBe(200);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
  });

  it("origem diferente dá 403 nas duas rotas", async () => {
    expect((await loginPost(request("/api/auth/login", { origin: "https://evil.example", body: "{}" }))).status).toBe(403);
    expect((await logoutPost(request("/api/auth/logout", { origin: "https://evil.example" }))).status).toBe(403);
    expect((await passwordPost(request("/api/account/password", { origin: "https://evil.example", body: "{}" }))).status).toBe(403);
  });
});
