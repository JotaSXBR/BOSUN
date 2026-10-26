import { db } from "../../lib/db.ts";
import { hmac } from "./secret.ts";

const WINDOW_MS = 15 * 60 * 1000;
const IP_LIMIT = { login: 100, "2fa": 50 } as const;

export type ThrottleScope = keyof typeof IP_LIMIT;

/** Espera depois de N falhas da mesma conta na janela (spec do identity). */
export function accountBlockMs(failures: number): number {
  if (failures >= 20) return 15 * 60_000;
  if (failures >= 10) return 5 * 60_000;
  if (failures >= 5) return 30_000;
  return 0;
}

export function ipBlocked(attempts: number, scope: ThrottleScope): boolean {
  return attempts > IP_LIMIT[scope];
}

/** Chave sem o identificador cru: conta desconhecida não fica legível no banco. */
export function throttleKey(kind: string, value: string): string {
  return `${kind}:${hmac(value.trim().toLowerCase())}`;
}

/** Última entrada do X-Forwarded-For: a que o proxy da VPS acrescentou (as anteriores vêm do cliente). */
export function clientIp(headers: Headers): string {
  const last = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return last || "unknown";
}

/** Ms até liberar, ou 0. */
export async function blockedFor(key: string): Promise<number> {
  const row = await db.authThrottle.findUnique({ where: { key }, select: { blockedUntil: true } });
  return Math.max(0, (row?.blockedUntil?.getTime() ?? 0) - Date.now());
}

/** Soma uma ocorrência na janela de 15 min, atomicamente, e devolve o total da janela. */
export async function hit(key: string): Promise<number> {
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO auth_throttle (key, count, "windowStartedAt", "updatedAt")
    VALUES (${key}, 1, now(), now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN auth_throttle."windowStartedAt" < now() - make_interval(secs => ${WINDOW_MS / 1000})
              THEN 1 ELSE auth_throttle.count + 1 END,
      "windowStartedAt" = CASE WHEN auth_throttle."windowStartedAt" < now() - make_interval(secs => ${WINDOW_MS / 1000})
              THEN now() ELSE auth_throttle."windowStartedAt" END,
      "updatedAt" = now()
    RETURNING count`;
  return rows[0]?.count ?? 1;
}

export async function block(key: string, ms: number): Promise<void> {
  await db.authThrottle.update({ where: { key }, data: { blockedUntil: new Date(Date.now() + ms) } });
}

export async function reset(key: string): Promise<void> {
  await db.authThrottle.deleteMany({ where: { key } });
}
