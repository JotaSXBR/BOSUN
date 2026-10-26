import { randomUUID } from "node:crypto";
import { z } from "zod";
import { Prisma, type User } from "../../generated/prisma/client.ts";
import { db } from "../../lib/db.ts";
import { type AuditActor, writeAudit } from "./audit.ts";
import { generateTempPassword, hashPassword } from "./password.ts";

const TEMP_PASSWORD_TTL_MS = 72 * 60 * 60 * 1000;

/** Erro com mensagem segura para mostrar a quem chamou. */
export class AccountError extends Error {}

const newAccountSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9._-]{2,31}$/),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  name: z.string().trim().min(1).max(100),
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
