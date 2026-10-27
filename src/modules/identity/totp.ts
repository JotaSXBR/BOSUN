import { APIError } from "better-auth/api";
import { z } from "zod";
import { db } from "../../lib/db.ts";
import { passwordCheckKey } from "./accounts.ts";
import { writeAudit } from "./audit.ts";
import { auth, trimSessions } from "./auth.ts";
import { auditLogin, forAuth, tooMany } from "./login.ts";
import { hmac } from "./secret.ts";
import { type AuthSession, resolveSession } from "./session.ts";
import { clientIp, hitIp, ipBlocked, reserveAccountAttempt, reset, throttleKey } from "./throttle.ts";

export type SecondFactor = "totp" | "recovery";

type Failure = { ok: false; status: 400 | 401 | 409 | 429; message: string };
export type EnrollResult = { ok: true; secret: string; uri: string; recoveryCodes: string[] } | Failure;
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
  const throttle = passwordCheckKey(userId);
  if ((await reserveAccountAttempt(throttle)).blocked) return tooMany;
  try {
    const res = await auth.api.enableTwoFactor({ body: { password: parsed.data.password }, headers });
    await reset(throttle);
    if (res.method !== "totp") throw new Error("2FA: método inesperado");
    return { ok: true, secret: groupSecret(res.totpURI), uri: res.totpURI, recoveryCodes: res.backupCodes };
  } catch (err) {
    if (!(err instanceof APIError) || err.body?.code !== "INVALID_PASSWORD") throw err;
    await writeAudit(db, { actor: { type: "user", id: userId }, action: "auth.2fa.failed", data: { step: "enroll_password" } });
    return { ok: false, status: 400, message: "A senha não confere." };
  }
}

/** Conta a tentativa do IP (50 em 15 min); sem IP confiável, só o bloqueio por conta do plugin vale. */
async function ipOverLimit(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  const attempts = await hitIp(throttleKey("2fa-ip", ip));
  if (attempts === 51) await auditLogin({ actor: { type: "system" }, action: "auth.rate_limited", data: { scope: "2fa-ip" } });
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

async function audited(kind: SecondFactor, userId: string, setup: boolean): Promise<void> {
  const actor = { type: "user", id: userId } as const;
  if (setup) return auditLogin({ actor, action: "auth.2fa.enrolled" });
  await auditLogin({ actor, action: kind === "totp" ? "auth.2fa.succeeded" : "auth.recovery_code.used" });
  await auditLogin({ actor, action: "auth.login.succeeded" });
}

async function pluginFailed(err: unknown): Promise<Failure> {
  if (!(err instanceof APIError)) throw err;
  if (err.status === "TOO_MANY_REQUESTS") {
    await auditLogin({ actor: { type: "system" }, action: "auth.rate_limited", data: { scope: "2fa-account" } });
    return tooMany;
  }
  if (!CODE_ERRORS.has(String(err.status))) throw err;
  await auditLogin({ actor: { type: "system" }, action: "auth.2fa.failed" });
  return INVALID_CODE;
}

/**
 * Segundo fator: no login (cookie de desafio) cria a sessão; no setup (sessão aberta) confirma o TOTP,
 * e o plugin liga o 2FA e troca a sessão. Código repetido revoga a sessão criada e dá 401.
 */
export async function verifySecondFactor(kind: SecondFactor, input: unknown, headers: Headers): Promise<VerifyResult> {
  const parsed = codeSchema.safeParse(input);
  if (!parsed.success) return INVALID_CODE;
  const code = parsed.data.code.replace(/\s+/g, "");
  const ip = clientIp(headers);
  if (await ipOverLimit(ip)) return tooMany;
  const current = await resolveSession(headers);
  if (!sessionAllows(kind, current)) return { ok: false, status: 409, message: "Você já entrou." };
  try {
    const { headers: out, response } = await callPlugin(kind, code, forAuth(headers, ip));
    const userId = response.user.id;
    if (kind === "totp" && !(await markTotpUsed(userId, code))) {
      // shortcut: no setup o token devolvido é o da sessão antiga; a nova fica sem cookie e expira em 12 h.
      await db.session.deleteMany({ where: { userId, token: response.token } });
      await auditLogin({ actor: { type: "user", id: userId }, action: "auth.2fa.replayed" });
      return INVALID_CODE;
    }
    if (!current) await trimSessions(userId);
    await audited(kind, userId, Boolean(current));
    return { ok: true, headers: out };
  } catch (err) {
    return pluginFailed(err);
  }
}
