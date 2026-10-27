import { APIError } from "better-auth/api";
import { z } from "zod";
import { db } from "../../lib/db.ts";
import { passwordCheckKey } from "./accounts.ts";
import { writeAudit } from "./audit.ts";
import { auth, trimSessions } from "./auth.ts";
import { challengeStillValid } from "./challenge.ts";
import { auditLogin, forAuth, tempPasswordExpired, tooMany } from "./login.ts";
import { hmac } from "./secret.ts";
import { type AuthSession, resolveSession } from "./session.ts";
import { clientIp, hitIp, ipBlocked, reserveAccountAttempt, reset, throttleKey } from "./throttle.ts";

export type SecondFactor = "totp" | "recovery";

type Failure = { ok: false; status: 400 | 401 | 409 | 429; message: string };
export type EnrollResult = { ok: true; secret: string; uri: string; recoveryCodes: string[] } | Failure;
export type CodesResult = { ok: true; recoveryCodes: string[] } | Failure;
export type VerifyResult = { ok: true; headers: Headers } | Failure;

const INVALID_CODE: Failure = { ok: false, status: 401, message: "Código inválido ou expirado. Se persistir, entre de novo." };
// Erros do plugin que significam código ou desafio inválido; o resto é falha nossa e vira 500.
const CODE_ERRORS = new Set(["UNAUTHORIZED", "BAD_REQUEST", "CONFLICT"]);
// Cobre a janela que o plugin aceita (código anterior, atual e seguinte de 30 s = 90 s).
const USED_CODE_TTL_MS = 120_000;

const codeSchema = z.object({ code: z.string().max(64) });
const passwordSchema = z.object({ password: z.string().min(1).max(1024) });

/** Segredo base32 do URI em grupos de 4, para digitar no app autenticador (sem QR no piloto). */
export function groupSecret(uri: string): string {
  return (new URL(uri).searchParams.get("secret") ?? "").match(/.{1,4}/g)?.join(" ") ?? "";
}

/**
 * Uso único do TOTP (ASVS 6.5.1): grava o HMAC do código; o segundo uso na janela não grava.
 * ON CONFLICT DO NOTHING decide entre requisições concorrentes. Antes, apaga os vencidos da pessoa.
 */
export async function markTotpUsed(userId: string, code: string): Promise<boolean> {
  await db.usedTotpCode.deleteMany({ where: { userId, expiresAt: { lt: new Date() } } });
  const { count } = await db.usedTotpCode.createMany({
    data: [{ userId, codeHash: hmac(`${userId}:${code}`), expiresAt: new Date(Date.now() + USED_CODE_TTL_MS) }],
    skipDuplicates: true,
  });
  return count === 1;
}

/** Passo 1 do setup: confere a senha (no mesmo limite da troca de senha) e gera segredo e 10 códigos. */
export async function enrollTotp(current: AuthSession, input: unknown, headers: Headers): Promise<EnrollResult> {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: 400, message: "Digite a sua senha." };
  const { id: userId, mustChangePassword, twoFactorEnabled } = current.user;
  if (mustChangePassword || twoFactorEnabled) return { ok: false, status: 409, message: "O 2FA não pode ser configurado agora." };
  return withPasswordCheck(userId, "enroll_password", async () => {
    const res = await auth.api.enableTwoFactor({ body: { password: parsed.data.password }, headers });
    if (res.method !== "totp") throw new Error("2FA: método inesperado");
    return { ok: true, secret: groupSecret(res.totpURI), uri: res.totpURI, recoveryCodes: res.backupCodes } as const;
  });
}

/**
 * Códigos de recuperação novos (senha + sessão recente, conferida na rota): os 10 anteriores deixam de valer
 * e os novos aparecem uma vez. Ninguém relê os códigos já guardados.
 */
export async function regenerateRecoveryCodes(current: AuthSession, input: unknown, headers: Headers): Promise<CodesResult> {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: 400, message: "Digite a sua senha." };
  const userId = current.user.id;
  return withPasswordCheck(userId, "regenerate_password", async () => {
    const res = await auth.api.generateBackupCodes({ body: { password: parsed.data.password }, headers });
    await writeAudit(db, { actor: { type: "user", id: userId }, action: "auth.recovery_code.regenerated", targetType: "user", targetId: userId });
    return { ok: true, recoveryCodes: res.backupCodes } as const;
  });
}

/** Confere a senha atual pelo plugin, no mesmo limite da troca de senha; senha errada é auditada. */
async function withPasswordCheck<T>(userId: string, step: string, run: () => Promise<T>): Promise<T | Failure> {
  const throttle = passwordCheckKey(userId);
  if ((await reserveAccountAttempt(throttle)).blocked) return tooMany;
  try {
    const result = await run();
    await reset(throttle);
    return result;
  } catch (err) {
    if (!(err instanceof APIError) || err.body?.code !== "INVALID_PASSWORD") throw err;
    await writeAudit(db, { actor: { type: "user", id: userId }, action: "auth.2fa.failed", data: { step } });
    return { ok: false, status: 400, message: "A senha não confere." };
  }
}

/** Conta a tentativa do IP (50 em 15 min); sem IP confiável, só o bloqueio por conta do plugin vale. */
async function ipOverLimit(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  const attempts = await hitIp(throttleKey("2fa-ip", ip));
  if (attempts === 51) await auditLogin({ actor: { type: "system" }, action: "auth.rate_limited", data: { scope: "2fa-ip" } }, ip);
  return ipBlocked(attempts, "2fa");
}

/**
 * Com sessão, só o TOTP de confirmação do setup (sem bloqueio do plugin, mas é a própria pessoa).
 * Recuperação com sessão gastaria um código sem bloqueio; recusa.
 */
function sessionAllows(kind: SecondFactor, current: AuthSession | null): boolean {
  return !current || (kind === "totp" && !current.user.twoFactorEnabled && !current.user.mustChangePassword);
}

function callPlugin(kind: SecondFactor, code: string, headers: Headers) {
  return kind === "totp"
    ? auth.api.verifyTOTP({ body: { code }, headers, returnHeaders: true })
    : auth.api.verifyBackupCode({ body: { code }, headers, returnHeaders: true });
}

async function dropSession(userId: string, token: unknown): Promise<void> {
  if (typeof token === "string") await db.session.deleteMany({ where: { userId, token } });
}

/**
 * Confirmação do setup. O código fica registrado (barra o reuso no login), mas repetido aqui não desfaz nada:
 * o plugin já ligou o 2FA e trocou a sessão. As outras sessões, que só passaram pela senha, caem (ASVS 7.4.3).
 */
async function setupConfirmed(userId: string, code: string, out: Headers, at: { setupKey: string; ip: string | null }): Promise<VerifyResult> {
  const { setupKey, ip } = at;
  await markTotpUsed(userId, code);
  await reset(setupKey);
  const newest = await db.session.findFirst({ where: { userId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { id: true } });
  await db.session.deleteMany({ where: { userId, id: { not: newest?.id } } });
  await auditLogin({ actor: { type: "user", id: userId }, action: "auth.2fa.enrolled" }, ip);
  return { ok: true, headers: out };
}

/** Login: código repetido conta como falha da conta (o plugin já zerou o contador) e revoga a sessão criada. */
interface Verified {
  userId: string;
  token: unknown;
  out: Headers;
  /** Step-up: a sessão antiga sai antes do teto de 5, para não derrubar outro dispositivo. */
  replacing?: string;
  /** Cookies da requisição (o desafio), para conferir a versão da credencial. */
  headers: Headers;
  ip: string | null;
}

/** Motivo para não deixar a sessão nascer: senha temporária vencida ou credencial trocada depois do desafio. */
async function blockedReason(userId: string, headers: Headers): Promise<string | null> {
  if (await tempPasswordExpired(userId)) return "temp_expired";
  return (await challengeStillValid(userId, headers)) ? null : "credentials_reset";
}

async function loginConfirmed(kind: SecondFactor, code: string, { userId, token, out, replacing, headers, ip }: Verified): Promise<VerifyResult> {
  const actor = { type: "user", id: userId } as const;
  if (kind === "totp" && !(await markTotpUsed(userId, code))) {
    await dropSession(userId, token);
    await db.twoFactor.updateMany({ where: { userId }, data: { failedVerificationCount: { increment: 1 } } });
    await auditLogin({ actor, action: "auth.2fa.replayed" }, ip);
    return INVALID_CODE;
  }
  const reason = await blockedReason(userId, headers);
  if (reason) {
    await dropSession(userId, token);
    await auditLogin({ actor: { type: "system" }, action: "auth.login.failed", targetType: "user", targetId: userId, data: { reason } }, ip);
    return INVALID_CODE;
  }
  if (replacing) await db.session.deleteMany({ where: { id: replacing, userId } });
  await trimSessions(userId);
  await auditLogin({ actor, action: kind === "totp" ? "auth.2fa.succeeded" : "auth.recovery_code.used" }, ip);
  await auditLogin({ actor, action: "auth.login.succeeded" }, ip);
  return { ok: true, headers: out };
}

async function pluginFailed(err: unknown, userId: string | undefined, ip: string | null): Promise<Failure> {
  if (!(err instanceof APIError)) throw err;
  const actor = userId ? ({ type: "user", id: userId } as const) : ({ type: "system" } as const);
  if (err.status === "TOO_MANY_REQUESTS") {
    await auditLogin({ actor, action: "auth.rate_limited", data: { scope: "2fa-account" } }, ip);
    return tooMany;
  }
  if (!CODE_ERRORS.has(String(err.status))) throw err;
  await auditLogin({ actor, action: "auth.2fa.failed" }, ip);
  return INVALID_CODE;
}

/**
 * Segundo fator: no login (cookie de desafio) cria a sessão; no setup (sessão aberta) confirma o TOTP,
 * e o plugin liga o 2FA e troca a sessão. Com sessão o plugin não bloqueia a conta: o limite é nosso, por usuário.
 */
export async function verifySecondFactor(kind: SecondFactor, input: unknown, headers: Headers, replacing?: string): Promise<VerifyResult> {
  const parsed = codeSchema.safeParse(input);
  if (!parsed.success) return INVALID_CODE;
  const code = parsed.data.code.replace(/\s+/g, "");
  const ip = clientIp(headers);
  if (await ipOverLimit(ip)) return tooMany;
  const current = await resolveSession(headers);
  if (!sessionAllows(kind, current)) return { ok: false, status: 409, message: "Você já entrou." };
  const setupKey = current ? throttleKey("2fa-setup", current.user.id) : null;
  if (setupKey && (await reserveAccountAttempt(setupKey)).blocked) return tooMany;
  try {
    const { headers: out, response } = await callPlugin(kind, code, forAuth(headers, ip));
    if (setupKey) return await setupConfirmed(response.user.id, code, out, { setupKey, ip });
    const verified = { userId: response.user.id, token: response.token, out, replacing, headers, ip };
    // Falha depois de o plugin criar a sessão (banco caindo, cookie estranho): a sessão não fica órfã.
    return await loginConfirmed(kind, code, verified).catch(async (err: unknown) => {
      await dropSession(verified.userId, verified.token).catch(() => undefined);
      throw err;
    });
  } catch (err) {
    return pluginFailed(err, current?.user.id, ip);
  }
}
