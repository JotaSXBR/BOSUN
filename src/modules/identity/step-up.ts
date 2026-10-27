import { z } from "zod";
import { cookieHeader } from "./http.ts";
import { auditLogin, login } from "./login.ts";
import type { AuthSession } from "./session.ts";
import { clientIp } from "./throttle.ts";
import { verifySecondFactor } from "./totp.ts";

export type StepUpResult = { ok: true; headers: Headers } | { ok: false; status: 400 | 401 | 409 | 429; message: string };

const schema = z.object({ password: z.string().min(1).max(1024), code: z.string().min(1).max(64) });
const INVALID = { ok: false, status: 401, message: "Senha ou código inválidos." } as const;

/** Cabeçalhos da requisição sem o cookie de sessão (o plugin usaria a sessão em vez do desafio), com outro cookie. */
function withCookie(headers: Headers, cookie: string | null): Headers {
  const out = new Headers(headers);
  out.delete("cookie");
  if (cookie) out.set("cookie", cookie);
  return out;
}

/**
 * Step-up (ADR-102, decisão 7): refaz o login com senha e segundo fator pelos mesmos caminhos do login
 * (throttle, uso único do TOTP, auditoria), e a sessão antiga é apagada antes do teto de 5 sessões. Código com hífen = recuperação.
 */
export async function stepUp(current: AuthSession, input: unknown, headers: Headers): Promise<StepUpResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, status: 400, message: "Digite a senha e o código." };
  const actor = { type: "user", id: current.user.id } as const;
  const ip = clientIp(headers);
  const password = await login({ identifier: current.user.email, password: parsed.data.password }, withCookie(headers, null));
  // requireReady garante 2FA ligado, então senha certa sempre volta com desafio.
  if (!password.ok || !password.twoFactorRedirect) {
    await auditLogin({ actor, action: "auth.step_up.failed", data: { step: "password" } }, ip);
    return password.ok ? INVALID : { ...password, message: password.status === 429 ? password.message : INVALID.message };
  }
  const kind = parsed.data.code.includes("-") ? "recovery" : "totp";
  const second = await verifySecondFactor(kind, { code: parsed.data.code }, withCookie(headers, cookieHeader(password.headers)), current.session.id);
  if (!second.ok) {
    await auditLogin({ actor, action: "auth.step_up.failed", data: { step: kind } }, ip);
    return second.status === 429 ? second : INVALID;
  }
  await auditLogin({ actor, action: "auth.step_up.succeeded" }, ip);
  return { ok: true, headers: second.headers };
}
