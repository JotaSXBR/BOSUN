import { randomUUID } from "node:crypto";
import { z } from "zod";
import { Prisma, type User } from "../../generated/prisma/client.ts";
import { db } from "../../lib/db.ts";
import { type AuditActor, writeAudit } from "./audit.ts";
import { reserveAccountAttempt, reset, throttleKey } from "./throttle.ts";
import { type PasswordPolicyError, checkNewPassword, generateTempPassword, hashPassword, verifyPassword } from "./password.ts";

/** Mesma regra na criação e no login (plugin username). */
export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;

const TEMP_PASSWORD_TTL_MS = 72 * 60 * 60 * 1000;

/** Erro com mensagem segura para mostrar a quem chamou. */
export class AccountError extends Error {
  override name = "AccountError";
}

const newAccountSchema = z.object({
  username: z.string().trim().toLowerCase().regex(USERNAME_RE),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  // Sem caracteres de controle ou invisíveis no nome que aparece na UI e na auditoria.
  name: z.string().trim().min(1).max(100).regex(/^\P{C}+$/u),
});

export type NewAccount = z.input<typeof newAccountSchema>;

/** Cria a conta com senha temporária gerada (mostrada uma vez) e troca forçada no primeiro login. */
export async function createAccount(input: NewAccount, actor: AuditActor): Promise<{ user: User; tempPassword: string }> {
  const parsed = newAccountSchema.safeParse(input);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new AccountError(`Dados inválidos: ${fields}`);
  }
  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  const id = randomUUID();
  try {
    const user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          id,
          ...parsed.data,
          // Sem canal de e-mail no piloto: quem provisiona responde pelo endereço (ADR-102).
          emailVerified: true,
          mustChangePassword: true,
          tempPasswordExpiresAt: new Date(Date.now() + TEMP_PASSWORD_TTL_MS),
        },
      });
      await tx.account.create({
        data: { id: randomUUID(), accountId: id, providerId: "credential", userId: id, password: passwordHash },
      });
      await writeAudit(tx, { actor, action: "auth.account.created", targetType: "user", targetId: id });
      return created;
    });
    return { user, tempPassword };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new AccountError("Usuário ou e-mail já existe");
    }
    throw err;
  }
}

const changeSchema = z.object({ current: z.string().min(1).max(1024), next: z.string().min(1).max(1024) });

export type ChangePasswordError = PasswordPolicyError | "wrong_current" | "invalid" | "rate_limited";

interface CurrentSession {
  user: { id: string; username?: string | null; email: string };
  session: { id: string };
}

/**
 * Troca a senha de quem está logado: confere a atual, aplica a política, zera a troca forçada,
 * apaga as outras sessões e audita na mesma transação (ADR-102). null = trocada.
 */
/** Um só limite para toda conferência da senha atual com sessão aberta (troca de senha, cadastro do 2FA). */
export const passwordCheckKey = (userId: string) => throttleKey("password-check", userId);

export async function changePassword(current: CurrentSession, input: unknown): Promise<ChangePasswordError | null> {
  const parsed = changeSchema.safeParse(input);
  if (!parsed.success) return "invalid";
  const { id: userId, username, email } = current.user;
  // Quem tem a sessão (ou um cookie roubado) também não adivinha a senha atual sem limite (ASVS 6.3.1).
  const throttle = passwordCheckKey(userId);
  if ((await reserveAccountAttempt(throttle)).blocked) return "rate_limited";
  const account = await db.account.findFirst({ where: { userId, providerId: "credential" } });
  if (!account?.password || !(await verifyPassword(account.password, parsed.data.current))) {
    await writeAudit(db, { actor: { type: "user", id: userId }, action: "auth.password.change_failed", targetType: "user", targetId: userId });
    return "wrong_current";
  }
  const error = await checkNewPassword(parsed.data.next, { username, email }, account.password);
  if (error) return error;
  const passwordHash = await hashPassword(parsed.data.next);
  await db.$transaction(async (tx) => {
    // Só troca se o hash ainda é o que conferimos: duas trocas simultâneas não passam as duas.
    const { count } = await tx.account.updateMany({ where: { id: account.id, password: account.password }, data: { password: passwordHash } });
    if (count !== 1) throw new AccountError("A senha mudou durante a troca. Tente de novo.");
    await tx.user.update({ where: { id: userId }, data: { mustChangePassword: false, tempPasswordExpiresAt: null } });
    await tx.session.deleteMany({ where: { userId, id: { not: current.session.id } } });
    await writeAudit(tx, { actor: { type: "user", id: userId }, action: "auth.password.changed", targetType: "user", targetId: userId });
  });
  await reset(throttle);
  return null;
}
