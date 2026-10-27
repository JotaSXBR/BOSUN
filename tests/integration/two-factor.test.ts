import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db.ts";
import { login } from "@/modules/identity/login.ts";
import { hmac } from "@/modules/identity/secret.ts";
import { resolveSession } from "@/modules/identity/session.ts";
import { hitIp, throttleKey } from "@/modules/identity/throttle.ts";
import { enrollTotp, markTotpUsed, verifySecondFactor } from "@/modules/identity/totp.ts";
import { totpCode } from "../totp.ts";
import { account, cookieFrom, randomIp, req } from "./helpers.ts";

afterAll(() => db.$disconnect());

/** Sessão aberta de uma conta com a troca de senha já feita (o setup do 2FA vem depois dela). */
async function readyToEnroll() {
  const { user, password } = await account();
  await db.user.update({ where: { id: user.id }, data: { mustChangePassword: false, tempPasswordExpiresAt: null } });
  const res = await login({ identifier: user.email, password }, req());
  if (!res.ok) throw new Error("login falhou");
  const cookie = cookieFrom(res.headers);
  const current = await resolveSession(cookie);
  if (!current) throw new Error("sem sessão");
  return { user, password, cookie, current };
}

async function enrolled() {
  const ready = await readyToEnroll();
  const enroll = await enrollTotp(ready.current, { password: ready.password }, ready.cookie);
  if (!enroll.ok) throw new Error("setup falhou");
  const secret = enroll.secret.replaceAll(" ", "");
  const confirm = await verifySecondFactor("totp", { code: totpCode(secret) }, ready.cookie);
  return { ...ready, enroll, secret, confirm };
}

/** Login com senha numa conta com 2FA: devolve o cookie de desafio (com o mesmo IP). */
async function challenge(email: string, password: string): Promise<Headers> {
  const ip = randomIp();
  const res = await login({ identifier: email, password }, req(ip));
  if (!res.ok || !res.twoFactorRedirect) throw new Error("sem desafio");
  expect(await resolveSession(cookieFrom(res.headers, req(ip)))).toBeNull();
  return cookieFrom(res.headers, req(ip));
}

// O código do setup já foi usado; o seguinte (aceito pela janela de ±30 s) é outro.
const nextCode = (secret: string) => totpCode(secret, Date.now() + 30_000);

const sessions = (userId: string) => db.session.count({ where: { userId } });

describe("setup do 2FA (Postgres real)", () => {
  it("confere a senha, guarda segredo e 10 códigos cifrados, liga o 2FA e troca a sessão", async () => {
    const { user, cookie, enroll, secret, confirm } = await enrolled();
    if (!enroll.ok || !confirm.ok) throw new Error("setup falhou");
    expect(enroll.recoveryCodes).toHaveLength(10);
    expect(enroll.secret).toMatch(/^[A-Z2-7]{4}( [A-Z2-7]{1,4})+$/);
    const row = await db.twoFactor.findUnique({ where: { userId: user.id } });
    expect(row?.verified).toBe(true);
    expect(row?.backupCodes).not.toContain(enroll.recoveryCodes[0]);
    expect(row?.secret).not.toContain(secret.slice(0, 8));
    expect((await db.user.findUnique({ where: { id: user.id } }))?.twoFactorEnabled).toBe(true);
    expect(await resolveSession(cookie)).toBeNull();
    expect((await resolveSession(cookieFrom(confirm.headers)))?.user.id).toBe(user.id);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.2fa.enrolled" } })).toBe(1);
  });

  it("recusa senha errada, troca de senha pendente e quem já tem 2FA", async () => {
    const ready = await readyToEnroll();
    expect(await enrollTotp(ready.current, { password: "senha errada bem longa" }, ready.cookie)).toMatchObject({ status: 400 });
    const pending = { ...ready.current, user: { ...ready.current.user, mustChangePassword: true } };
    expect(await enrollTotp(pending, { password: ready.password }, ready.cookie)).toMatchObject({ status: 409 });
    const done = await enrolled();
    if (!done.confirm.ok) throw new Error("setup falhou");
    const now = await resolveSession(cookieFrom(done.confirm.headers));
    if (!now) throw new Error("sem sessão");
    expect(await enrollTotp(now, { password: done.password }, cookieFrom(done.confirm.headers))).toMatchObject({ status: 409 });
  });
});

describe("login com 2FA (Postgres real)", () => {
  it("a senha só abre o desafio; o TOTP cria a sessão e audita", async () => {
    const { user, password, secret } = await enrolled();
    const res = await verifySecondFactor("totp", { code: nextCode(secret) }, await challenge(user.email, password));
    if (!res.ok) throw new Error("TOTP recusado");
    expect((await resolveSession(cookieFrom(res.headers)))?.user.id).toBe(user.id);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.2fa.succeeded" } })).toBe(1);
  });

  it("o mesmo código não entra duas vezes, nem em paralelo; a sessão a mais é revogada", async () => {
    const { user, password, secret } = await enrolled();
    const code = nextCode(secret);
    const cookies = await Promise.all([challenge(user.email, password), challenge(user.email, password)]);
    const before = await sessions(user.id);
    const results = await Promise.all(cookies.map((c) => verifySecondFactor("totp", { code }, c)));
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(results.filter((r) => !r.ok && r.status === 401)).toHaveLength(1);
    expect(await sessions(user.id)).toBe(before + 1);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.2fa.replayed" } })).toBe(1);
  });

  it("código de recuperação entra uma vez", async () => {
    const { user, password, enroll } = await enrolled();
    if (!enroll.ok) throw new Error("setup falhou");
    const [first, second] = enroll.recoveryCodes;
    expect((await verifySecondFactor("recovery", { code: first }, await challenge(user.email, password))).ok).toBe(true);
    expect(await verifySecondFactor("recovery", { code: first }, await challenge(user.email, password))).toMatchObject({ status: 401 });
    expect((await verifySecondFactor("recovery", { code: second }, await challenge(user.email, password))).ok).toBe(true);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.recovery_code.used" } })).toBe(2);
  });

  it("código errado, sem desafio ou recuperação com sessão aberta não entram", async () => {
    const { user, password, secret, confirm } = await enrolled();
    if (!confirm.ok) throw new Error("setup falhou");
    const wrong = String((Number(nextCode(secret)) + 1) % 1_000_000).padStart(6, "0");
    expect(await verifySecondFactor("totp", { code: wrong }, await challenge(user.email, password))).toMatchObject({ status: 401 });
    expect(await verifySecondFactor("totp", { code: nextCode(secret) }, req())).toMatchObject({ status: 401 });
    expect(await verifySecondFactor("recovery", { code: "x" }, cookieFrom(confirm.headers))).toMatchObject({ status: 409 });
  });

  it("mais de 50 tentativas do mesmo IP bloqueiam", async () => {
    const ip = randomIp();
    await Promise.all(Array.from({ length: 50 }, () => hitIp(throttleKey("2fa-ip", ip))));
    expect(await verifySecondFactor("totp", { code: "123456" }, req(ip))).toMatchObject({ status: 429 });
  });
});

describe("uso único do TOTP (Postgres real)", () => {
  it("grava o primeiro uso, recusa o segundo e um registro vencido não bloqueia", async () => {
    const { user } = await account();
    await db.usedTotpCode.create({ data: { userId: user.id, codeHash: hmac(`${user.id}:111111`), expiresAt: new Date(Date.now() - 1000) } });
    expect(await markTotpUsed(user.id, "111111")).toBe(true);
    expect(await markTotpUsed(user.id, "111111")).toBe(false);
    expect(await markTotpUsed(user.id, "222222")).toBe(true);
  });
});
