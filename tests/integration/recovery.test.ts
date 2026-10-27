import { spawnSync } from "node:child_process";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as resetPost } from "@/app/api/auth/password-reset-request/route.ts";
import { db } from "@/lib/db.ts";
import { login } from "@/modules/identity/login.ts";
import { issueTempPassword, requestPasswordReset, unlockAccount } from "@/modules/identity/recovery.ts";
import { hmac } from "@/modules/identity/secret.ts";
import { hitIp, throttleKey } from "@/modules/identity/throttle.ts";
import { account, enrolled, randomIp, req, tag } from "./helpers.ts";

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

  it("unlock zera o 2FA, revoga sessões e audita com ator operator; o login volta sem desafio", async () => {
    const { user, secret } = await enrolled();
    expect(secret).not.toBe("");
    const temp = await unlockAccount(user.email, "perdeu o celular");
    expect(await db.twoFactor.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.user.findUnique({ where: { id: user.id } })).toMatchObject({ twoFactorEnabled: false, mustChangePassword: true });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    const audits = await db.auditLog.findMany({ where: { targetId: user.id, actorType: "operator", action: { in: ["auth.password.temp_issued", "auth.2fa.reset"] } } });
    expect(audits).toHaveLength(2);
    expect(audits[0]?.data).toMatchObject({ reason: "perdeu o celular" });
    expect(await login({ identifier: user.email, password: temp }, req())).toMatchObject({ ok: true, twoFactorRedirect: false });
  });

  it("CLI: unlock imprime a senha só no stdout; e-mail desconhecido sai com erro", async () => {
    const { user } = await account();
    const ok = spawnSync("node", ["scripts/bosun.ts", "admin", "unlock", user.email, "--reason", "teste\u0007 de linha"], { encoding: "utf8" });
    expect(ok.status).toBe(0);
    expect(ok.stdout).toMatch(/Senha temporária \(válida por 72 h\): \S{20}/);
    const audit = await db.auditLog.findFirst({ where: { targetId: user.id, action: "auth.password.temp_issued" } });
    expect(audit?.data).toEqual({ reason: "teste  de linha" });
    const missing = spawnSync("node", ["scripts/bosun.ts", "admin", "unlock", `nada-${tag()}@test.local`], { encoding: "utf8" });
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain("Conta não encontrada.");
    expect(spawnSync("node", ["scripts/bosun.ts", "admin", "unlock"], { encoding: "utf8" }).stderr).toContain("Informe um e-mail.");
  });
});
