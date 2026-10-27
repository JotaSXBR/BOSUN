import { db } from "../../lib/db.ts";
import { writeAudit } from "./audit.ts";
import { auth } from "./auth.ts";

export const ABSOLUTE_MAX_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

/** Sessão do cookie, já com o teto absoluto de 7 dias (o Better Auth não tem). null = sem sessão. */
export async function resolveSession(headers: Headers): Promise<AuthSession | null> {
  const current = await auth.api.getSession({ headers });
  if (!current) return null;
  if (Date.now() - current.session.createdAt.getTime() <= ABSOLUTE_MAX_MS) return current;
  await db.$transaction(async (tx) => {
    await tx.session.deleteMany({ where: { id: current.session.id } });
    await writeAudit(tx, {
      actor: { type: "system" },
      action: "auth.session.absolute_expired",
      targetType: "user",
      targetId: current.user.id,
    });
  });
  return null;
}

export const FRESH_MS = 10 * 60 * 1000;

/** Sessão recente (ADR-102): criada há até 10 min. Fora disso, ação sensível pede o step-up. */
export function isFresh(current: AuthSession): boolean {
  return Date.now() - current.session.createdAt.getTime() <= FRESH_MS;
}

/** Sessões da própria pessoa para a tela de segurança; o token nunca sai daqui. */
export function listSessions(userId: string) {
  return db.session.findMany({
    // Só as que ainda valem: a linha vencida (12 h sem uso ou 7 dias) fica no banco até alguém usar o cookie.
    where: { userId, expiresAt: { gt: new Date() }, createdAt: { gt: new Date(Date.now() - ABSOLUTE_MAX_MS) } },
    select: { id: true, userAgent: true, ipAddress: true, createdAt: true, updatedAt: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

/** Encerra as outras sessões da pessoa e audita na mesma transação. Devolve quantas caíram. */
export async function revokeOtherSessions(current: AuthSession): Promise<number> {
  const { id: userId } = current.user;
  return db.$transaction(async (tx) => {
    const { count } = await tx.session.deleteMany({ where: { userId, id: { not: current.session.id } } });
    if (count === 0) return 0;
    await writeAudit(tx, { actor: { type: "user", id: userId }, action: "auth.session.revoked", targetType: "user", targetId: userId, data: { scope: "others", count } });
    return count;
  });
}

/** Sair de todos: apaga todas as sessões da pessoa, inclusive a atual. */
export async function revokeAllSessions(current: AuthSession): Promise<void> {
  const { id: userId } = current.user;
  await db.$transaction(async (tx) => {
    const { count } = await tx.session.deleteMany({ where: { userId } });
    await writeAudit(tx, { actor: { type: "user", id: userId }, action: "auth.logout_all", targetType: "user", targetId: userId, data: { count } });
  });
}
