import { z } from "zod";
import { db } from "../../lib/db.ts";
import { AccountError, TEMP_PASSWORD_TTL_MS } from "./accounts.ts";
import { type AuditActor, writeAudit } from "./audit.ts";
import { auditLogin } from "./login.ts";
import { generateTempPassword, hashPassword } from "./password.ts";
import { hmac } from "./secret.ts";
import { clientIp, hitIp, ipBlocked, throttleKey } from "./throttle.ts";

const requestSchema = z.object({ identifier: z.string().trim().toLowerCase().min(1).max(254) });

/** Usuário pelo e-mail ou pelo nome de usuário (a mesma regra do login). */
function findUser(identifier: string) {
  return db.user.findFirst({ where: identifier.includes("@") ? { email: identifier } : { username: identifier }, select: { id: true } });
}

/**
 * "Esqueci a senha" (fluxo 6): a resposta é sempre a mesma, exista a conta ou não.
 * Conta existente ganha um pedido pendente (um por pessoa, índice único parcial); a Admin resolve no `workspace`.
 * false = IP acima do limite (100 em 15 min, o mesmo do login).
 */
export async function requestPasswordReset(input: unknown, headers: Headers): Promise<boolean> {
  const ip = clientIp(headers);
  if (ip && ipBlocked(await hitIp(throttleKey("reset-ip", ip)), "login")) return false;
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return true;
  const user = await findUser(parsed.data.identifier);
  if (!user) {
    await auditLogin({ actor: { type: "system" }, action: "auth.password.reset_requested", data: { identifierRef: hmac(parsed.data.identifier), known: false } });
    return true;
  }
  // ON CONFLICT DO NOTHING: com pedido pendente, não cria outro.
  const { count } = await db.passwordResetRequest.createMany({ data: [{ userId: user.id }], skipDuplicates: true });
  await auditLogin({ actor: { type: "system" }, action: "auth.password.reset_requested", targetType: "user", targetId: user.id, data: { created: count === 1 } });
  return true;
}

interface IssueOptions {
  /** `unlock`: também zera o 2FA (segredo e códigos). */
  resetTwoFactor?: boolean;
  reason?: string;
}

/**
 * Senha temporária gerada pelo sistema (decisão 8), mostrada uma vez, válida por 72 h e com troca forçada.
 * Na mesma transação: grava o hash, revoga todas as sessões, resolve os pedidos pendentes e audita.
 */
export async function issueTempPassword(userId: string, actor: AuditActor, options: IssueOptions = {}): Promise<string> {
  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  const resolvedByUserId = actor.type === "user" ? actor.id : null;
  const data = options.reason ? { reason: options.reason } : undefined;
  await db.$transaction(async (tx) => {
    const { count } = await tx.account.updateMany({ where: { userId, providerId: "credential" }, data: { password: passwordHash } });
    if (count !== 1) throw new AccountError("Conta sem senha local.");
    await tx.user.update({
      where: { id: userId },
      data: { mustChangePassword: true, tempPasswordExpiresAt: new Date(Date.now() + TEMP_PASSWORD_TTL_MS), ...(options.resetTwoFactor ? { twoFactorEnabled: false } : {}) },
    });
    await tx.session.deleteMany({ where: { userId } });
    await tx.passwordResetRequest.updateMany({ where: { userId, status: "pending" }, data: { status: "resolved", resolvedAt: new Date(), resolvedByUserId } });
    await writeAudit(tx, { actor, action: "auth.password.temp_issued", targetType: "user", targetId: userId, data });
    if (!options.resetTwoFactor) return;
    await tx.twoFactor.deleteMany({ where: { userId } });
    await tx.usedTotpCode.deleteMany({ where: { userId } });
    await writeAudit(tx, { actor, action: "auth.2fa.reset", targetType: "user", targetId: userId, data });
  });
  return tempPassword;
}

/** `bosun admin unlock` (fluxo 7): último recurso quando o celular e os códigos se perderam. */
export async function unlockAccount(email: string, reason: string | undefined): Promise<string> {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true } });
  if (!user) throw new AccountError("Conta não encontrada.");
  return issueTempPassword(user.id, { type: "operator" }, { resetTwoFactor: true, reason });
}
