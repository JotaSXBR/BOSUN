import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { POST as recoveryCodesPost } from "@/app/api/account/recovery-codes/route.ts";
import { POST as revokeOthersPost } from "@/app/api/account/sessions/revoke-others/route.ts";
import { POST as logoutAllPost } from "@/app/api/auth/logout-all/route.ts";
import { POST as stepUpPost } from "@/app/api/auth/step-up/route.ts";
import { db } from "@/lib/db.ts";
import { login } from "@/modules/identity/login.ts";
import { isFresh, listSessions, resolveSession } from "@/modules/identity/session.ts";
import { verifySecondFactor } from "@/modules/identity/totp.ts";
import { account, challenge, cookieFrom, enrolled, nextCode, randomIp, req } from "./helpers.ts";

const ORIGIN = "http://localhost:3000";

beforeEach(() => vi.stubEnv("BETTER_AUTH_URL", ORIGIN));
afterAll(async () => {
  vi.unstubAllEnvs();
  await db.$disconnect();
});

function post(path: string, cookie: Headers, body?: unknown) {
  const headers = new Headers(cookie);
  headers.set("origin", ORIGIN);
  headers.set("content-type", "application/json");
  return new Request(`${ORIGIN}${path}`, { method: "POST", headers, body: JSON.stringify(body ?? {}) });
}

/** Conta com 2FA e a sessão aberta depois do setup (cookie de quem está na área principal). */
async function inside() {
  const done = await enrolled();
  if (!done.confirm.ok) throw new Error("setup falhou");
  return { ...done, cookie: cookieFrom(done.confirm.headers) };
}

/** Mais um dispositivo: login completo com um código de recuperação. */
async function recoveryLogin(email: string, password: string, code: string): Promise<void> {
  const res = await verifySecondFactor("recovery", { code }, await challenge(email, password));
  if (!res.ok) throw new Error("recuperação recusada");
}

// Em sequência: o plugin gasta códigos com troca atômica, e usos paralelos dão conflito.
function recoveryLogins(email: string, password: string, codes: string[]): Promise<void> {
  return codes.reduce<Promise<void>>((prev, c) => prev.then(() => recoveryLogin(email, password, c)), Promise.resolve());
}

const age = (userId: string, ms: number) => db.session.updateMany({ where: { userId }, data: { createdAt: new Date(Date.now() - ms) } });

describe("sessões (Postgres real)", () => {
  it("12 h sem uso derrubam a sessão", async () => {
    const { user, password } = await account();
    const res = await login({ identifier: user.email, password }, req());
    if (!res.ok) throw new Error("login falhou");
    await db.session.updateMany({ where: { userId: user.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await resolveSession(cookieFrom(res.headers))).toBeNull();
  });

  it("encerrar as outras mantém só a atual e audita", async () => {
    const { user, password, cookie } = await inside();
    await db.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false } });
    await Promise.all([1, 2].map(() => login({ identifier: user.email, password }, req())));
    await db.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
    const res = await revokeOthersPost(post("/api/account/sessions/revoke-others", cookie));
    expect(res.status).toBe(303);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
    expect((await resolveSession(cookie))?.user.id).toBe(user.id);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.session.revoked" } })).toBe(1);
  });

  it("sair de todos apaga inclusive a atual, limpa o cookie e volta ao login", async () => {
    const { user, cookie } = await inside();
    const res = await logoutAllPost(post("/api/auth/logout-all", cookie));
    expect(res.headers.get("location")).toBe(`${ORIGIN}/login`);
    expect(res.headers.getSetCookie().join(";")).toMatch(/session_token=;/);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.logout_all" } })).toBe(1);
  });

  it("formulário de outra origem é recusado", async () => {
    const { user, cookie } = await inside();
    const foreign = new Headers(cookie);
    foreign.set("origin", "https://evil.example");
    const res = await logoutAllPost(new Request(`${ORIGIN}/api/auth/logout-all`, { method: "POST", headers: foreign }));
    expect(res.status).toBe(403);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
  });
});

describe("tela de segurança (Postgres real)", () => {
  it("lista só as sessões que ainda valem", async () => {
    const { user, cookie } = await inside();
    const current = await resolveSession(cookie);
    await db.session.create({ data: { userId: user.id, token: `t${randomIp()}`, expiresAt: new Date(Date.now() - 1000) } });
    await db.session.create({ data: { userId: user.id, token: `u${randomIp()}`, expiresAt: new Date(Date.now() + 3_600_000), createdAt: new Date(Date.now() - 8 * 86_400_000) } });
    expect((await listSessions(user.id)).map((x) => x.id)).toEqual([current?.session.id]);
  });

  it("encerrar as outras sem nenhuma outra não audita", async () => {
    const { user, cookie } = await inside();
    await revokeOthersPost(post("/api/account/sessions/revoke-others", cookie));
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.session.revoked" } })).toBe(0);
  });

  it("formulários sem sessão vão ao login; com primeiro acesso pendente, à página inicial", async () => {
    const none = await logoutAllPost(post("/api/auth/logout-all", req()));
    expect(none.headers.get("location")).toBe(`${ORIGIN}/login`);
    const { user, password } = await account();
    const res = await login({ identifier: user.email, password }, req());
    if (!res.ok) throw new Error("login falhou");
    const pending = await revokeOthersPost(post("/api/account/sessions/revoke-others", cookieFrom(res.headers)));
    expect(pending.headers.get("location")).toBe(`${ORIGIN}/`);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
  });
});

describe("sessão recente e step-up (Postgres real)", () => {
  it("sessão recente vale até 10 min", async () => {
    const { user, cookie } = await inside();
    await age(user.id, 9 * 60_000);
    const nine = await resolveSession(cookie);
    if (!nine) throw new Error("sem sessão");
    expect(isFresh(nine)).toBe(true);
    await age(user.id, 10 * 60_000 + 1000);
    const ten = await resolveSession(cookie);
    if (!ten) throw new Error("sem sessão");
    expect(isFresh(ten)).toBe(false);
  });

  it("códigos novos: sessão velha dá SESSION_NOT_FRESH; depois do step-up, a senha gera 10 novos e os antigos param", async () => {
    const { user, password, secret, cookie, enroll } = await inside();
    if (!enroll.ok) throw new Error("setup falhou");
    await age(user.id, 11 * 60_000);
    const stale = await recoveryCodesPost(post("/api/account/recovery-codes", cookie, { password }));
    expect(stale.status).toBe(403);
    expect(await stale.json()).toMatchObject({ code: "SESSION_NOT_FRESH" });

    const up = await stepUpPost(post("/api/auth/step-up", cookie, { password, code: nextCode(secret) }));
    expect(up.status).toBe(200);
    expect(up.headers.get("cache-control")).toBe("no-store");
    expect(await resolveSession(cookie)).toBeNull();
    const fresh = cookieFrom(up.headers);
    expect((await recoveryCodesPost(post("/api/account/recovery-codes", fresh, { password: "senha errada bem longa" }))).status).toBe(400);
    const res = await recoveryCodesPost(post("/api/account/recovery-codes", fresh, { password }));
    const { codes } = z.object({ codes: z.array(z.string()) }).parse(await res.json());
    expect(codes).toHaveLength(10);
    expect(codes).not.toContain(enroll.recoveryCodes[0]);
    expect(await verifySecondFactor("recovery", { code: enroll.recoveryCodes[0] }, await challenge(user.email, password))).toMatchObject({ status: 401 });
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.step_up.succeeded" } })).toBe(1);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.recovery_code.regenerated" } })).toBe(1);
  });

  it("step-up com senha errada, código errado ou código já usado não troca a sessão e audita", async () => {
    const { user, password, secret, cookie } = await inside();
    const code = nextCode(secret);
    const used = await verifySecondFactor("totp", { code }, await challenge(user.email, password));
    expect(used.ok).toBe(true);
    const attempts = [
      { password: "senha errada bem longa", code: "123456" },
      { password, code: "abcde-fghij" },
      { password, code },
    ];
    const results = await Promise.all(attempts.map((body) => stepUpPost(post("/api/auth/step-up", cookie, body))));
    expect(results.map((r) => r.status)).toEqual([401, 401, 401]);
    expect((await resolveSession(cookie))?.user.id).toBe(user.id);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.step_up.failed" } })).toBe(3);
  });

});

describe("step-up: troca de sessão e acesso (Postgres real)", () => {
  it("step-up com código de recuperação vale e, com 5 sessões, não derruba outro dispositivo", async () => {
    const { user, password, cookie, enroll } = await inside();
    if (!enroll.ok) throw new Error("setup falhou");
    const [first, ...rest] = enroll.recoveryCodes;
    // Mais 4 dispositivos (sessão completa por recuperação), todos mais antigos que a atual.
    await recoveryLogins(user.email, password, rest.slice(0, 4));
    const currentId = (await resolveSession(cookie))?.session.id;
    await db.session.updateMany({ where: { userId: user.id, id: { not: currentId } }, data: { createdAt: new Date(Date.now() - 3_600_000) } });
    const before = (await db.session.findMany({ where: { userId: user.id }, select: { id: true } })).map((x) => x.id);
    expect(before).toHaveLength(5);
    const up = await stepUpPost(post("/api/auth/step-up", cookie, { password, code: first }));
    expect(up.status).toBe(200);
    const after = (await db.session.findMany({ where: { userId: user.id }, select: { id: true } })).map((x) => x.id);
    expect(after).toHaveLength(5);
    const old = await resolveSession(cookie);
    expect(old).toBeNull();
    expect(after.filter((id) => before.includes(id))).toHaveLength(4);
  });

  it("sem sessão ou sem primeiro acesso concluído, as rotas da área principal recusam", async () => {
    expect((await stepUpPost(post("/api/auth/step-up", req(), { password: "x", code: "1" }))).status).toBe(401);
    const { user, password } = await account();
    const res = await login({ identifier: user.email, password }, req(randomIp()));
    if (!res.ok) throw new Error("login falhou");
    expect((await recoveryCodesPost(post("/api/account/recovery-codes", cookieFrom(res.headers), { password }))).status).toBe(403);
  });
});
