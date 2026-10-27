import { spawnSync } from "node:child_process";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as resetPost } from "@/app/api/auth/password-reset-request/route.ts";
import { db } from "@/lib/db.ts";
import { auth } from "@/modules/identity/auth.ts";
import { login } from "@/modules/identity/login.ts";
import { issueTempPassword, requestPasswordReset, unlockAccount } from "@/modules/identity/recovery.ts";
import { hmac } from "@/modules/identity/secret.ts";
import { hitIp, throttleKey } from "@/modules/identity/throttle.ts";
import { TEMP_PASSWORD_TTL_MS } from "@/modules/identity/accounts.ts";
import { verifySecondFactor } from "@/modules/identity/totp.ts";
import { account, challenge, enrolled, nextCode, randomIp, req, tag, times } from "./helpers.ts";

const ORIGIN = "http://localhost:3000";

beforeEach(() => vi.stubEnv("BETTER_AUTH_URL", ORIGIN));
afterAll(async () => {
  vi.unstubAllEnvs();
  await db.$disconnect();
});

const pending = (userId: string) => db.passwordResetRequest.count({ where: { userId, status: "pending" } });

function resetRequest(identifier: string) {
  return new Request(`${ORIGIN}/api/auth/password-reset-request`, {
    method: "POST",
    headers: { origin: ORIGIN, "content-type": "application/json", "x-forwarded-for": randomIp() },
    body: JSON.stringify({ identifier }),
  });
}

describe("pedido de reset (Postgres real)", () => {
  it("conta existente ganha um pedido pendente, mesmo pedindo duas vezes (e-mail e usuário)", async () => {
    const { user } = await account();
    expect(await requestPasswordReset({ identifier: user.email.toUpperCase() }, req())).toBe(true);
    expect(await requestPasswordReset({ identifier: user.username }, req())).toBe(true);
    expect(await pending(user.id)).toBe(1);
    expect(await db.auditLog.count({ where: { targetId: user.id, action: "auth.password.reset_requested" } })).toBe(2);
  });

  it("a rota responde igual para conta existente e inexistente, sem o identificador cru na auditoria", async () => {
    const { user } = await account();
    const ghost = `ninguem-${tag()}@test.local`;
    const [known, unknown] = await Promise.all([resetPost(resetRequest(user.email)), resetPost(resetRequest(ghost))]);
    expect([known.status, unknown.status]).toEqual([202, 202]);
    expect(await known.json()).toEqual(await unknown.json());
    const logged = await db.auditLog.findMany({ where: { action: "auth.password.reset_requested", data: { path: ["identifierRef"], equals: hmac(ghost) } } });
    expect(logged).toHaveLength(1);
    expect(JSON.stringify(logged)).not.toContain(ghost);
  });

  it("mais de 3 pedidos do mesmo identificador em 15 min não gravam nada (mesmo sem IP)", async () => {
    const { user } = await account();
    await Promise.all(Array.from({ length: 5 }, () => requestPasswordReset({ identifier: user.email }, req(null))));
    expect(await db.auditLog.count({ where: { targetId: user.id, action: "auth.password.reset_requested" } })).toBe(3);
  });

  it("corpo inválido também dá 202", async () => {
    const res = await resetPost(new Request(`${ORIGIN}/api/auth/password-reset-request`, { method: "POST", headers: { origin: ORIGIN }, body: "{" }));
    expect(res.status).toBe(202);
  });

  it("mais de 100 pedidos do mesmo IP param", async () => {
    const ip = randomIp();
    await Promise.all(Array.from({ length: 100 }, () => hitIp(throttleKey("reset-ip", ip))));
    expect(await requestPasswordReset({ identifier: "x@test.local" }, req(ip))).toBe(false);
  });
});

describe("senha temporária e unlock (Postgres real)", () => {
  it("a Admin emite senha temporária: sessões caem, pedido resolvido, troca forçada e a senha antiga não entra", async () => {
    const { user: admin } = await account();
    const { user, password } = await account();
    await db.user.update({ where: { id: user.id }, data: { mustChangePassword: false, tempPasswordExpiresAt: null } });
    await login({ identifier: user.email, password }, req());
    await requestPasswordReset({ identifier: user.email }, req());
    const temp = await issueTempPassword(user.id, { type: "user", id: admin.id });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.passwordResetRequest.findFirst({ where: { userId: user.id } })).toMatchObject({ status: "resolved", resolvedByUserId: admin.id });
    expect(await db.user.findUnique({ where: { id: user.id } })).toMatchObject({ mustChangePassword: true });
    expect(await login({ identifier: user.email, password }, req())).toMatchObject({ status: 401 });
    expect((await login({ identifier: user.email, password: temp }, req())).ok).toBe(true);
    expect(await db.auditLog.count({ where: { actorId: admin.id, action: "auth.password.temp_issued", targetId: user.id } })).toBe(1);
  });

});

describe("senha temporária pela Admin (Postgres real)", () => {
  it("pela Admin o 2FA fica, a senha vale 72 h e quem estava bloqueada entra", async () => {
    const { user: admin } = await account();
    const { user, password } = await enrolled();
    await times(6, () => login({ identifier: user.email, password: "senha errada bem longa" }, req()));
    expect(await login({ identifier: user.email, password }, req())).toMatchObject({ status: 429 });
    const temp = await issueTempPassword(user.id, { type: "user", id: admin.id }, { reason: "esqueceu\u2028a senha" });
    const after = await db.user.findUnique({ where: { id: user.id } });
    expect(after?.twoFactorEnabled).toBe(true);
    expect(await db.twoFactor.count({ where: { userId: user.id } })).toBe(1);
    const ttl = (after?.tempPasswordExpiresAt?.getTime() ?? 0) - Date.now();
    expect(Math.abs(ttl - TEMP_PASSWORD_TTL_MS)).toBeLessThan(60_000);
    expect(await login({ identifier: user.email, password: temp }, req())).toMatchObject({ ok: true, twoFactorRedirect: true });
    const audit = await db.auditLog.findFirst({ where: { targetId: user.id, action: "auth.password.temp_issued" } });
    expect(audit?.data).toEqual({ reason: "esqueceu a senha" });
  });

  it("conta sem senha local: nada muda (a transação desfaz)", async () => {
    const { user, password } = await account();
    await login({ identifier: user.email, password }, req());
    await db.account.deleteMany({ where: { userId: user.id } });
    await expect(issueTempPassword(user.id, { type: "operator" })).rejects.toThrow("Conta sem senha local.");
    expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
    expect(await db.auditLog.count({ where: { targetId: user.id, action: "auth.password.temp_issued" } })).toBe(0);
  });

  it("unlock zera o 2FA, revoga sessões e audita com ator operator; o login volta sem desafio", async () => {
    const { user, secret } = await enrolled();
    expect(secret).not.toBe("");
    const temp = await unlockAccount(user.email, "perdeu o celular", "ops@vps");
    expect(await db.twoFactor.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.user.findUnique({ where: { id: user.id } })).toMatchObject({ twoFactorEnabled: false, mustChangePassword: true });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    const audits = await db.auditLog.findMany({ where: { targetId: user.id, actorType: "operator", action: { in: ["auth.password.temp_issued", "auth.2fa.reset"] } } });
    expect(audits).toHaveLength(2);
    expect(audits[0]?.data).toEqual({ reason: "perdeu o celular", operator: "ops@vps" });
    expect(await login({ identifier: user.email, password: temp }, req())).toMatchObject({ ok: true, twoFactorRedirect: false });
  });

  it("CLI: unlock imprime a senha só no stdout; e-mail desconhecido sai com erro", async () => {
    const { user } = await account();
    const ok = spawnSync("node", ["scripts/bosun.ts", "admin", "unlock", user.email, "--reason", "teste\u0007 de linha"], { encoding: "utf8" });
    expect(ok.status).toBe(0);
    expect(ok.stdout).toMatch(/Senha temporária \(válida por 72 h\): \S{20}/);
    const audit = await db.auditLog.findFirst({ where: { targetId: user.id, action: "auth.password.temp_issued" } });
    expect(audit?.data).toMatchObject({ reason: "teste de linha" });
    expect(audit?.data).toMatchObject({ operator: expect.stringMatching(/@/) });
    const missing = spawnSync("node", ["scripts/bosun.ts", "admin", "unlock", `nada-${tag()}@test.local`, "--reason", "x"], { encoding: "utf8" });
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain("Conta não encontrada.");
    expect(spawnSync("node", ["scripts/bosun.ts", "admin", "unlock"], { encoding: "utf8" }).stderr).toContain("Informe um e-mail.");
    expect(spawnSync("node", ["scripts/bosun.ts", "admin", "unlock", user.email], { encoding: "utf8" }).stderr).toContain("Informe o motivo");
  });
});

describe("corrida login × senha temporária (Postgres real)", () => {
  afterEach(() => vi.restoreAllMocks());

  /** Simula a troca de credencial caindo no meio do login: sobe a versão logo depois de o Better Auth conferir a senha. */
  function resetDuringSignIn(userId: string) {
    const original = auth.api.signInEmail.bind(auth.api);
    vi.spyOn(auth.api, "signInEmail").mockImplementation(async (...args: Parameters<typeof auth.api.signInEmail>) => {
      const result = await original(...args);
      await db.user.update({ where: { id: userId }, data: { credentialsVersion: { increment: 1 } } });
      return result;
    });
  }

  it("login sem 2FA que conferiu a senha antes da troca não vira sessão", async () => {
    const { user, password } = await account();
    resetDuringSignIn(user.id);
    const res = await login({ identifier: user.email, password }, req());
    expect(res).toMatchObject({ ok: false, status: 401 });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
  });

  it("com 2FA, o desafio não sai se a credencial trocar no meio do login", async () => {
    const { user, password } = await enrolled();
    resetDuringSignIn(user.id);
    const res = await login({ identifier: user.email, password }, req());
    expect(res).toMatchObject({ ok: false, status: 401 });
  });

  it("um desafio de 2FA pendente para de valer quando a Admin emite a senha", async () => {
    const { user: admin } = await account();
    const { user, password, secret } = await enrolled();
    const pendingChallenge = await challenge(user.email, password);
    await issueTempPassword(user.id, { type: "user", id: admin.id });
    expect(await verifySecondFactor("totp", { code: nextCode(secret) }, pendingChallenge)).toMatchObject({ status: 401 });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect((await db.user.findUnique({ where: { id: user.id } }))?.twoFactorResetAt).toBeNull();
  });

  it("unlock marca a data para o aviso no setup do 2FA", async () => {
    const { user } = await enrolled();
    await unlockAccount(user.email, "perdeu o celular", "ops@vps");
    const after = await db.user.findUnique({ where: { id: user.id } });
    expect(Math.abs((after?.twoFactorResetAt?.getTime() ?? 0) - Date.now())).toBeLessThan(60_000);
  });
});
