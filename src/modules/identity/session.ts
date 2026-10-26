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
