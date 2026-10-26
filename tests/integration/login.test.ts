import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db.ts";
import { createAccount } from "@/modules/identity/accounts.ts";
import { login, logout } from "@/modules/identity/login.ts";
import { resolveSession } from "@/modules/identity/session.ts";
import { clientIp, hit, throttleKey } from "@/modules/identity/throttle.ts";

afterAll(() => db.$disconnect());

async function account() {
  const s = randomUUID().slice(0, 8);
  const { user, tempPassword } = await createAccount(
    { username: `u${s}`, email: `u${s}@test.local`, name: "Teste" },
    { type: "operator" },
  );
  return { user, password: tempPassword };
}

// Cada teste num IP próprio para o limite por IP não vazar entre testes.
function req(ip = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.1`) {
  return new Headers({ "x-forwarded-for": ip, "user-agent": "vitest" });
}

// Em sequência de propósito: cada falha muda o contador que a próxima lê.
function times(n: number, fn: () => Promise<unknown>): Promise<unknown> {
  return Array.from({ length: n }).reduce<Promise<unknown>>((prev) => prev.then(fn), Promise.resolve());
}

const badLogin = (identifier: string) => () => login({ identifier, password: "senha errada bem longa" }, req());

function cookieFrom(headers: Headers): Headers {
  const cookie = headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  return new Headers({ cookie });
}

describe("login (Postgres real)", () => {
  it("entra por e-mail e por usuário, cria sessão e audita", async () => {
    const { user, password } = await account();
    const results = await Promise.all(
      [user.email, user.username?.toUpperCase() ?? ""].map((identifier) => login({ identifier, password }, req())),
    );
    const sessions = await Promise.all(results.map((res) => (res.ok ? resolveSession(cookieFrom(res.headers)) : Promise.resolve(null))));
    expect(sessions.map((s) => s?.user.id)).toEqual([user.id, user.id]);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.login.succeeded" } })).toBe(2);
  });

  it("senha errada e usuário inexistente dão o mesmo 401 genérico", async () => {
    const { user } = await account();
    const wrong = await login({ identifier: user.email, password: "senha errada bem longa" }, req());
    const ghost = await login({ identifier: "ninguem@test.local", password: "senha errada bem longa" }, req());
    expect(wrong).toEqual({ ok: false, status: 401, message: "Usuário ou senha inválidos" });
    expect(ghost).toEqual(wrong);
    const failed = await db.auditLog.findFirstOrThrow({ where: { action: "auth.login.failed" }, orderBy: { createdAt: "desc" } });
    expect(JSON.stringify(failed.data)).not.toContain("ninguem");
  });

  it("5 falhas bloqueiam a conta mesmo com a senha certa; o bloqueio está no banco", async () => {
    const { user, password } = await account();
    await times(5, badLogin(user.email));
    const res = await login({ identifier: user.email, password }, req());
    expect(res).toMatchObject({ ok: false, status: 429 });
    expect(await db.auditLog.count({ where: { action: "auth.rate_limited" } })).toBeGreaterThan(0);
  });

  it("acerto zera o contador da conta", async () => {
    const { user, password } = await account();
    await times(4, badLogin(user.email));
    expect((await login({ identifier: user.email, password }, req())).ok).toBe(true);
    await times(4, badLogin(user.email));
    expect((await login({ identifier: user.email, password }, req())).ok).toBe(true);
  });

  it("mais de 100 tentativas do mesmo IP bloqueiam", async () => {
    const ip = req();
    // 100 tentativas já contadas (direto no contador, sem 100 hashes Argon2), inclusive em paralelo.
    const key = throttleKey("login-ip", clientIp(ip));
    await Promise.all(Array.from({ length: 100 }, () => hit(key)));
    expect(await login({ identifier: "y@test.local", password: "senha errada bem longa" }, ip)).toMatchObject({ status: 429 });
  });

  it("entrada inválida dá 400 sem consultar nada", async () => {
    expect(await login({ identifier: "", password: 1 }, req())).toMatchObject({ ok: false, status: 400 });
  });

});

describe("sessão (Postgres real)", () => {
  it("a sexta sessão apaga a mais antiga", async () => {
    const { user, password } = await account();
    const first = await login({ identifier: user.email, password }, req());
    await times(5, () => login({ identifier: user.email, password }, req()));
    expect(await db.session.count({ where: { userId: user.id } })).toBe(5);
    if (first.ok) expect(await resolveSession(cookieFrom(first.headers))).toBeNull();
  });

  it("sessão com mais de 7 dias é apagada e auditada", async () => {
    const { user, password } = await account();
    const res = await login({ identifier: user.email, password }, req());
    if (!res.ok) throw new Error("login falhou");
    await db.session.updateMany({ where: { userId: user.id }, data: { createdAt: new Date(Date.now() - 7 * 86_400_000 - 1000) } });
    expect(await resolveSession(cookieFrom(res.headers))).toBeNull();
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.auditLog.count({ where: { targetId: user.id, action: "auth.session.absolute_expired" } })).toBe(1);
  });

  it("logout apaga a sessão e audita", async () => {
    const { user, password } = await account();
    const res = await login({ identifier: user.email, password }, req());
    if (!res.ok) throw new Error("login falhou");
    const cookie = cookieFrom(res.headers);
    await logout(cookie);
    expect(await resolveSession(cookie)).toBeNull();
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.logout" } })).toBe(1);
  });

  it("falha do banco no throttle não vira login", async () => {
    const { user, password } = await account();
    const spy = vi.spyOn(db.authThrottle, "findUnique").mockRejectedValueOnce(new Error("down"));
    await expect(login({ identifier: user.email, password }, req())).rejects.toThrow();
    spy.mockRestore();
  });
});
