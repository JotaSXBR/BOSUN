import { APIError } from "better-auth/api";
import { z } from "zod";
import { db } from "../../lib/db.ts";
import { logger } from "../../lib/logger.ts";
import { type AuditEvent, writeAudit } from "./audit.ts";
import { credentialsVersion } from "./accounts.ts";
import { auth, trimSessions } from "./auth.ts";
import { bindChallenge } from "./challenge.ts";
import { resolveSession } from "./session.ts";
import { hmac } from "./secret.ts";
import { clientIp, crossesTier, hitIp, ipBlocked, reserveAccountAttempt, reset, throttleKey } from "./throttle.ts";

const GENERIC = "Usuário ou senha inválidos";
// Erros do Better Auth que significam credencial errada; o resto é falha nossa e vira 500.
const CREDENTIAL_ERRORS = new Set(["UNAUTHORIZED", "UNPROCESSABLE_ENTITY", "BAD_REQUEST"]);

const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(1024),
});

export type LoginResult =
  | { ok: true; headers: Headers; twoFactorRedirect: boolean }
  | { ok: false; status: 400 | 401 | 429; message: string };

export const tooMany = { ok: false, status: 429, message: "Muitas tentativas. Aguarde e tente de novo." } as const;

// Auditoria de login é best-effort (spec): falhar ao gravar não derruba o login.
export async function auditLogin(event: AuditEvent): Promise<void> {
  try {
    await writeAudit(db, event);
  } catch (err) {
    logger.error("identity", `auditoria ${event.action} falhou`, err);
  }
}

/** Better Auth lê o IP do X-Forwarded-For; passamos só o IP que o throttle usa, para gravar o mesmo na sessão. */
export function forAuth(headers: Headers, ip: string | null): Headers {
  const out = new Headers(headers);
  out.delete("x-forwarded-for");
  if (ip) out.set("x-forwarded-for", ip);
  return out;
}

function signIn(identifier: string, password: string, headers: Headers) {
  const body = { password, rememberMe: true };
  return identifier.includes("@")
    ? auth.api.signInEmail({ body: { ...body, email: identifier }, headers, returnHeaders: true })
    : auth.api.signInUsername({ body: { ...body, username: identifier }, headers, returnHeaders: true });
}

/** Senha temporária (troca forçada pendente) vencida não entra; a pessoa pede outra ao Admin. */
export async function tempPasswordExpired(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { mustChangePassword: true, tempPasswordExpiresAt: true } });
  const expiresAt = user?.tempPasswordExpiresAt?.getTime();
  return Boolean(user?.mustChangePassword && expiresAt !== undefined && expiresAt < Date.now());
}

/**
 * A sessão já foi criada pelo Better Auth: apaga antes de responder, e o cookie não sai.
 * Filtro por usuário e token string: token ausente nunca vira "apague todas".
 */
async function dropExpiredLogin(userId: string, token: unknown): Promise<void> {
  if (typeof token === "string") await db.session.deleteMany({ where: { userId, token } });
}

/** Conta a tentativa do IP. Sem IP confiável não há balde (um balde único travaria todo mundo); o da conta continua. */
async function ipOverLimit(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  const attempts = await hitIp(throttleKey("login-ip", ip));
  // Audita só a primeira recusa da janela: requisição sem login não enche a auditoria.
  if (attempts === 101) await auditLogin({ actor: { type: "system" }, action: "auth.rate_limited", data: { scope: "ip" } });
  return ipBlocked(attempts, "login");
}

/** Login por e-mail ou usuário. Mesma resposta para conta inexistente e senha errada. */
export async function login(input: unknown, headers: Headers): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: 400, message: GENERIC };
  const identifier = parsed.data.identifier.toLowerCase();
  const identifierRef = hmac(identifier);
  const ip = clientIp(headers);

  if (await ipOverLimit(ip)) return tooMany;

  const accountKey = throttleKey("login-acct", identifier);
  const { attempts, blocked } = await reserveAccountAttempt(accountKey);
  if (blocked) return tooMany;

  // Antes de conferir a senha: se a credencial trocar durante o login, ele não vira sessão nem desafio.
  const version = await credentialsVersion(identifier);
  try {
    const { headers: out, response } = await signIn(identifier, parsed.data.password, forAuth(headers, ip));
    const attempt = { identifier, identifierRef, attempts, accountKey, version };
    // Com 2FA o plugin já apagou a sessão e devolve só o cookie de desafio (sem `user`); a sessão nasce no totp.ts.
    if ("twoFactorRedirect" in response && response.twoFactorRedirect === true) return challengeIssued(out, attempt);
    return sessionCreated(response.user.id, response.token, out, attempt);
  } catch (err) {
    return credentialFailed(err, identifierRef, attempts);
  }
}

interface Attempt {
  identifier: string;
  identifierRef: string;
  attempts: number;
  accountKey: string;
  version: number | null;
}

/** A senha conferida ainda é a atual? Conta que não existia na primeira leitura falha fechado. */
async function credentialsUnchanged(attempt: Attempt): Promise<boolean> {
  return attempt.version !== null && (await credentialsVersion(attempt.identifier)) === attempt.version;
}

const refused = async (attempt: Attempt, reason: string): Promise<LoginResult> => {
  const { identifierRef, attempts } = attempt;
  await auditLogin({ actor: { type: "system" }, action: "auth.login.failed", data: { identifierRef, attempts, reason } });
  return { ok: false, status: 401, message: GENERIC };
};

/** Senha certa numa conta com 2FA. Reset no meio do caminho: o cookie de desafio não sai. */
async function challengeIssued(out: Headers, attempt: Attempt): Promise<LoginResult> {
  // Recusado: o cookie de desafio fica em `out` e não sai.
  if (attempt.version === null || !(await credentialsUnchanged(attempt))) return refused(attempt, "credentials_reset");
  // A confirmação do 2FA confere se a senha ainda é a desta versão (troca entre o desafio e a sessão).
  await bindChallenge(out, attempt.version);
  await reset(attempt.accountKey);
  await auditLogin({ actor: { type: "system" }, action: "auth.2fa.challenge", data: { identifierRef: attempt.identifierRef } });
  return { ok: true, headers: out, twoFactorRedirect: true };
}

async function sessionCreated(userId: string, token: unknown, out: Headers, attempt: Attempt): Promise<LoginResult> {
  if (await tempPasswordExpired(userId)) {
    await dropExpiredLogin(userId, token);
    return refused(attempt, "temp_expired");
  }
  if (!(await credentialsUnchanged(attempt))) {
    await dropExpiredLogin(userId, token);
    return refused(attempt, "credentials_reset");
  }
  await reset(attempt.accountKey);
  await trimSessions(userId);
  await auditLogin({ actor: { type: "user", id: userId }, action: "auth.login.succeeded" });
  return { ok: true, headers: out, twoFactorRedirect: false };
}

async function credentialFailed(err: unknown, identifierRef: string, attempts: number): Promise<LoginResult> {
  if (!(err instanceof APIError) || !CREDENTIAL_ERRORS.has(String(err.status))) throw err;
  await auditLogin({ actor: { type: "system" }, action: "auth.login.failed", data: { identifierRef, attempts } });
  if (crossesTier(attempts)) {
    await auditLogin({ actor: { type: "system" }, action: "auth.rate_limited", data: { scope: "account", identifierRef } });
  }
  return { ok: false, status: 401, message: GENERIC };
}

/** Apaga a sessão do cookie e devolve os headers que limpam o cookie. */
export async function logout(headers: Headers): Promise<Headers> {
  const current = await resolveSession(headers);
  const { headers: out } = await auth.api.signOut({ headers, returnHeaders: true });
  if (current) await auditLogin({ actor: { type: "user", id: current.user.id }, action: "auth.logout" });
  return out;
}
