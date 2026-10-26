import { APIError } from "better-auth/api";
import { z } from "zod";
import { db } from "../../lib/db.ts";
import { writeAudit } from "./audit.ts";
import { auth } from "./auth.ts";
import { resolveSession } from "./session.ts";
import { hmac } from "./secret.ts";
import { accountBlockMs, block, blockedFor, clientIp, hit, ipBlocked, reset, throttleKey } from "./throttle.ts";

const GENERIC = "Usuário ou senha inválidos";

const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(1024),
});

export type LoginResult =
  | { ok: true; headers: Headers; twoFactorRedirect: boolean }
  | { ok: false; status: 400 | 401 | 429; message: string };

const tooMany = { ok: false, status: 429, message: "Muitas tentativas. Aguarde e tente de novo." } as const;

/** Login por e-mail ou usuário. Mesma resposta para conta inexistente e senha errada. */
export async function login(input: unknown, headers: Headers): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: 400, message: GENERIC };
  const { identifier, password } = parsed.data;
  const accountKey = throttleKey("login-acct", identifier);
  const ipKey = throttleKey("login-ip", clientIp(headers));
  const identifierRef = hmac(identifier.toLowerCase());

  if ((await blockedFor(accountKey)) > 0 || ipBlocked(await hit(ipKey), "login")) {
    await writeAudit(db, { actor: { type: "system" }, action: "auth.rate_limited", data: { identifierRef } });
    return tooMany;
  }

  try {
    const { headers: out, response } = await signIn(identifier.toLowerCase(), password, headers);
    await reset(accountKey);
    const twoFactorRedirect = "twoFactorRedirect" in response && response.twoFactorRedirect === true;
    if ("user" in response && response.user) {
      await writeAudit(db, { actor: { type: "user", id: response.user.id }, action: "auth.login.succeeded" });
    }
    return { ok: true, headers: out, twoFactorRedirect };
  } catch (err) {
    if (!(err instanceof APIError)) throw err;
    const failures = await hit(accountKey);
    const wait = accountBlockMs(failures);
    if (wait > 0) await block(accountKey, wait);
    await writeAudit(db, { actor: { type: "system" }, action: "auth.login.failed", data: { identifierRef, failures } });
    return { ok: false, status: 401, message: GENERIC };
  }
}

function signIn(identifier: string, password: string, headers: Headers) {
  const body = { password, rememberMe: true };
  return identifier.includes("@")
    ? auth.api.signInEmail({ body: { ...body, email: identifier }, headers, returnHeaders: true })
    : auth.api.signInUsername({ body: { ...body, username: identifier }, headers, returnHeaders: true });
}

/** Apaga a sessão do cookie e devolve os headers que limpam o cookie. */
export async function logout(headers: Headers): Promise<Headers> {
  const current = await resolveSession(headers);
  const { headers: out } = await auth.api.signOut({ headers, returnHeaders: true });
  if (current) await writeAudit(db, { actor: { type: "user", id: current.user.id }, action: "auth.logout" });
  return out;
}
