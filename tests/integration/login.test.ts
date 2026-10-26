import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db.ts";
import { createAccount } from "@/modules/identity/accounts.ts";
import { login, logout } from "@/modules/identity/login.ts";
import { hmac } from "@/modules/identity/secret.ts";
import { resolveSession } from "@/modules/identity/session.ts";
import { hitIp, throttleKey } from "@/modules/identity/throttle.ts";

afterAll(() => db.$disconnect());

// Tudo aleatório por teste: o bosun_test persiste entre execuções e o throttle dura 15 min.
const tag = () => randomUUID().slice(0, 8);

async function account(username = `u${tag()}`) {
  const { user, tempPassword } = await createAccount(
    { username, email: `${username}@test.local`, name: "Teste" },
    { type: "operator" },
  );
  return { user, password: tempPassword };
}

const randomIp = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

function req(ip: string | null = randomIp()) {
  return new Headers(ip ? { "x-forwarded-for": ip, "user-agent": "vitest" } : { "user-agent": "vitest" });
}

// Em sequência de propósito: cada tentativa muda o contador que a próxima lê.
function times(n: number, fn: () => Promise<unknown>): Promise<unknown> {
  return Array.from({ length: n }).reduce<Promise<unknown>>((prev) => prev.then(fn), Promise.resolve());
}

const badLogin = (identifier: string) => () => login({ identifier, password: "senha errada bem longa" }, req());

function cookieFrom(headers: Headers): Headers {
  return new Headers({ cookie: headers.getSetCookie().map((c) => c.split(";")[0]).join("; ") });
}

const auditCount = (action: string, ref: string) =>
  db.auditLog.count({ where: { action, data: { path: ["identifierRef"], equals: ref } } });

describe("login (Postgres real)", () => {
  it("entra por e-mail e por usuário (com hífen), cria sessão com o IP do throttle e audita", async () => {
    const { user, password } = await account(`ana-${tag()}`);
    const results = await Promise.all(
      [user.email, user.username?.toUpperCase() ?? ""].map((identifier) => login({ identifier, password }, req("6.6.6.6, 203.0.113.7"))),
    );
    const sessions = await Promise.all(results.map((res) => (res.ok ? resolveSession(cookieFrom(res.headers)) : Promise.resolve(null))));
    expect(sessions.map((s) => s?.user.id)).toEqual([user.id, user.id]);
    expect(sessions[0]?.session.ipAddress).toBe("203.0.113.7");
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.login.succeeded" } })).toBe(2);
  });

  it("senha errada e usuário inexistente dão o mesmo 401 genérico, sem o identificador cru na auditoria", async () => {
    const { user } = await account();
    const ghostEmail = `ninguem-${tag()}@test.local`;
    const wrong = await badLogin(user.email)();
    const ghost = await badLogin(ghostEmail)();
    expect(wrong).toEqual({ ok: false, status: 401, message: "Usuário ou senha inválidos" });
    expect(ghost).toEqual(wrong);
    const failed = await db.auditLog.findMany({ where: { action: "auth.login.failed", data: { path: ["identifierRef"], equals: hmac(ghostEmail) } } });
    expect(failed).toHaveLength(1);
    expect(JSON.stringify(failed)).not.toContain(ghostEmail);
  });

  it("5 tentativas bloqueiam a conta mesmo com a senha certa; o bloqueio é auditado uma vez", async () => {
    const { user, password } = await account();
    await times(5, badLogin(user.email));
    expect(await login({ identifier: user.email, password }, req())).toMatchObject({ ok: false, status: 429 });
    await times(3, badLogin(user.email));
    expect(await auditCount("auth.rate_limited", hmac(user.email))).toBe(1);
  });

  it("rajada paralela não passa do limite da conta", async () => {
    const { user } = await account();
    const results = await Promise.all(Array.from({ length: 12 }, badLogin(user.email)));
    const checked = results.filter((r) => !r.ok && r.status === 401).length;
    expect(checked).toBeLessThanOrEqual(5);
    expect(results.filter((r) => !r.ok && r.status === 429).length).toBeGreaterThanOrEqual(7);
  });

  it("acerto zera o contador da conta", async () => {
    const { user, password } = await account();
    await times(4, badLogin(user.email));
    expect((await login({ identifier: user.email, password }, req())).ok).toBe(true);
    await times(4, badLogin(user.email));
    expect((await login({ identifier: user.email, password }, req())).ok).toBe(true);
  });

  it("mais de 100 tentativas do mesmo IP bloqueiam", async () => {
    const ip = randomIp();
    // 100 tentativas já contadas direto no contador (sem 100 Argon2), em paralelo para provar a atomicidade.
    await Promise.all(Array.from({ length: 100 }, () => hitIp(throttleKey("login-ip", ip))));
    expect(await login({ identifier: `y-${tag()}@test.local`, password: "senha errada bem longa" }, req(ip))).toMatchObject({ status: 429 });
  });

  it("sem IP confiável não há balde por IP, mas o da conta vale", async () => {
    const { user } = await account();
    await times(5, () => login({ identifier: user.email, password: "senha errada bem longa" }, req(null)));
    expect(await login({ identifier: user.email, password: "x" }, req(null))).toMatchObject({ status: 429 });
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
});
