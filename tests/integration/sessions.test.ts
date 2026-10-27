import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as recoveryCodesPost } from "@/app/api/account/recovery-codes/route.ts";
import { POST as revokeOthersPost } from "@/app/api/account/sessions/revoke-others/route.ts";
import { POST as logoutAllPost } from "@/app/api/auth/logout-all/route.ts";
import { POST as stepUpPost } from "@/app/api/auth/step-up/route.ts";
import { db } from "@/lib/db.ts";
import { login } from "@/modules/identity/login.ts";
import { resolveSession } from "@/modules/identity/session.ts";
import { account, cookieFrom, enrolled, nextCode, randomIp, req } from "./helpers.ts";

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

describe("sessão recente e step-up (Postgres real)", () => {
  it("ação sensível com sessão de mais de 10 min dá SESSION_NOT_FRESH; o step-up troca a sessão e libera", async () => {
    const { user, password, secret, cookie, enroll } = await inside();
    if (!enroll.ok) throw new Error("setup falhou");
    await age(user.id, 11 * 60_000);
    const stale = await recoveryCodesPost(post("/api/account/recovery-codes", cookie));
    expect(stale.status).toBe(403);
    expect(await stale.json()).toMatchObject({ code: "SESSION_NOT_FRESH" });

    const up = await stepUpPost(post("/api/auth/step-up", cookie, { password, code: nextCode(secret) }));
    expect(up.status).toBe(200);
    expect(await resolveSession(cookie)).toBeNull();
    const fresh = cookieFrom(up.headers);
    const codes = await recoveryCodesPost(post("/api/account/recovery-codes", fresh));
    expect(await codes.json()).toEqual({ codes: enroll.recoveryCodes });
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.step_up.succeeded" } })).toBe(1);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.recovery_code.viewed" } })).toBe(1);
  });

  it("step-up com senha ou código errado não troca a sessão e audita", async () => {
    const { user, password, cookie } = await inside();
    const wrongPassword = await stepUpPost(post("/api/auth/step-up", cookie, { password: "senha errada bem longa", code: "123456" }));
    expect(wrongPassword.status).toBe(401);
    const wrongCode = await stepUpPost(post("/api/auth/step-up", cookie, { password, code: "abcde-fghij" }));
    expect(wrongCode.status).toBe(401);
    expect((await resolveSession(cookie))?.user.id).toBe(user.id);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.step_up.failed" } })).toBe(2);
  });

  it("step-up com código de recuperação também vale", async () => {
    const { password, cookie, enroll } = await inside();
    if (!enroll.ok) throw new Error("setup falhou");
    const up = await stepUpPost(post("/api/auth/step-up", cookie, { password, code: enroll.recoveryCodes[0] }));
    expect(up.status).toBe(200);
  });

  it("quem não terminou o primeiro acesso não usa as rotas da área principal", async () => {
    const { user, password } = await account();
    const res = await login({ identifier: user.email, password }, req(randomIp()));
    if (!res.ok) throw new Error("login falhou");
    expect((await recoveryCodesPost(post("/api/account/recovery-codes", cookieFrom(res.headers)))).status).toBe(403);
  });
});
