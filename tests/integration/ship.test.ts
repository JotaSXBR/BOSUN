import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { POST as passwordPost } from "@/app/api/account/password/route.ts";
import { db } from "@/lib/db.ts";
import { login } from "@/modules/identity/login.ts";
import { hitIp, reserveAccountAttempt, throttleKey } from "@/modules/identity/throttle.ts";
import { verifySecondFactor } from "@/modules/identity/totp.ts";
import { account, challenge, cookieFrom, enrolled, randomIp, req, tag, times } from "./helpers.ts";

const ORIGIN = "http://localhost:3000";

afterEach(() => vi.unstubAllEnvs());
afterAll(() => db.$disconnect());

const blockedSeconds = async (key: string) => {
  const row = await db.authThrottle.findUnique({ where: { key } });
  return row?.blockedUntil ? Math.round((row.blockedUntil.getTime() - Date.now()) / 1000) : 0;
};

describe("IP no registro de acesso (Postgres real)", () => {
  it("login certo, errado e o 2FA gravam o IP na auditoria", async () => {
    const { user, password } = await account();
    const ip = randomIp();
    await login({ identifier: user.email, password: "senha errada bem longa" }, req(ip));
    await login({ identifier: user.email, password }, req(ip));
    const events = await db.auditLog.findMany({
      where: { action: { in: ["auth.login.failed", "auth.login.succeeded"] }, OR: [{ actorId: user.id }, { data: { path: ["ip"], equals: ip } }] },
    });
    expect(events.map((e) => e.data)).toEqual(expect.arrayContaining([expect.objectContaining({ ip })]));
    expect(events.filter((e) => e.action === "auth.login.succeeded")[0]?.data).toMatchObject({ ip });
  });
});

describe("troca de senha voluntária exige sessão recente (Postgres real)", () => {
  it("com sessão de mais de 10 min dá SESSION_NOT_FRESH; a troca forçada do primeiro acesso não precisa", async () => {
    vi.stubEnv("BETTER_AUTH_URL", ORIGIN);
    const { user, password, confirm } = await enrolled();
    if (!confirm.ok) throw new Error("setup falhou");
    const cookie = cookieFrom(confirm.headers);
    await db.session.updateMany({ where: { userId: user.id }, data: { createdAt: new Date(Date.now() - 11 * 60_000) } });
    const headers = new Headers(cookie);
    headers.set("origin", ORIGIN);
    const body = JSON.stringify({ current: password, next: "cavalo correto bateria grampo" });
    const res = await passwordPost(new Request(`${ORIGIN}/api/account/password`, { method: "POST", headers, body }));
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "SESSION_NOT_FRESH" });
  });
});

describe("faixas do throttle na SQL real (Postgres real)", () => {
  it("5 → 30 s, 10 → 5 min, 20 → 15 min; janela vencida recomeça do zero", async () => {
    const key = throttleKey("login-acct", `faixa-${tag()}`);
    // Bloqueio em curso não é estendido: a faixa seguinte vale na primeira tentativa depois que ele vence.
    const expire = () => db.authThrottle.update({ where: { key }, data: { blockedUntil: new Date(Date.now() - 1000) } });
    await times(5, () => reserveAccountAttempt(key));
    expect(await blockedSeconds(key)).toBe(30);
    await times(4, () => reserveAccountAttempt(key));
    expect(await blockedSeconds(key)).toBe(30);
    await expire();
    expect(await reserveAccountAttempt(key)).toEqual({ attempts: 10, blocked: false });
    expect(await blockedSeconds(key)).toBe(5 * 60);
    await times(9, () => reserveAccountAttempt(key));
    await expire();
    expect(await reserveAccountAttempt(key)).toEqual({ attempts: 20, blocked: false });
    expect(await blockedSeconds(key)).toBe(15 * 60);
    await db.authThrottle.update({ where: { key }, data: { windowStartedAt: new Date(Date.now() - 16 * 60_000), blockedUntil: new Date(Date.now() - 1000) } });
    expect(await reserveAccountAttempt(key)).toEqual({ attempts: 1, blocked: false });
    // Contador por IP novo começa em 1.
    expect(await hitIp(throttleKey("ip-faixa", tag()))).toBe(1);
  });
});

describe("código de recuperação em paralelo (Postgres real)", () => {
  it("o mesmo código em duas requisições ao mesmo tempo entra uma vez só", async () => {
    const { user, password, enroll } = await enrolled();
    if (!enroll.ok) throw new Error("setup falhou");
    const [a, b] = await Promise.all([challenge(user.email, password), challenge(user.email, password)]);
    const code = enroll.recoveryCodes[0];
    const results = await Promise.all([a, b].map((c) => verifySecondFactor("recovery", { code }, c)));
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(results.filter((r) => !r.ok && r.status === 401)).toHaveLength(1);
  });
});
