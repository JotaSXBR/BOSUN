import { db } from "../../lib/db.ts";
import { hmac } from "./secret.ts";

const WINDOW_S = 15 * 60;
const IP_LIMIT = { login: 100, "2fa": 50 } as const;
// Tentativas da mesma conta na janela → espera (spec do identity). Acerto zera.
const ACCOUNT_TIERS = [
  { from: 20, ms: 15 * 60_000 },
  { from: 10, ms: 5 * 60_000 },
  { from: 5, ms: 30_000 },
] as const;

export type ThrottleScope = keyof typeof IP_LIMIT;

export function accountBlockMs(attempts: number): number {
  return ACCOUNT_TIERS.find((t) => attempts >= t.from)?.ms ?? 0;
}

export function ipBlocked(attempts: number, scope: ThrottleScope): boolean {
  return attempts > IP_LIMIT[scope];
}

/** Bloqueio novo só quando a tentativa cruza uma faixa (5, 10, 20): é o único momento a auditar. */
export function crossesTier(attempts: number): boolean {
  return ACCOUNT_TIERS.some((t) => attempts === t.from);
}

/** Chave sem o identificador cru: conta desconhecida não fica legível no banco. */
export function throttleKey(kind: string, value: string): string {
  return `${kind}:${hmac(value.trim().toLowerCase())}`;
}

/**
 * Última entrada do X-Forwarded-For: a que o proxy da VPS acrescentou (as anteriores vêm do cliente).
 * shortcut: assume o Traefik do Coolify na frente e a porta da app fechada; conferir no deploy (okf/tech/auth.md).
 */
export function clientIp(headers: Headers): string | null {
  return headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || null;
}

/** Soma uma tentativa do IP na janela de 15 min, atomicamente, e devolve o total. */
export async function hitIp(key: string): Promise<number> {
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO auth_throttle (key, count, "windowStartedAt", "updatedAt")
    VALUES (${key}, 1, now(), now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN auth_throttle."windowStartedAt" < now() - make_interval(secs => ${WINDOW_S})
              THEN 1 ELSE auth_throttle.count + 1 END,
      "windowStartedAt" = CASE WHEN auth_throttle."windowStartedAt" < now() - make_interval(secs => ${WINDOW_S})
              THEN now() ELSE auth_throttle."windowStartedAt" END,
      "updatedAt" = now()
    RETURNING count`;
  return rows[0]?.count ?? 1;
}

/**
 * Reserva uma tentativa da conta antes de verificar a senha (rajada paralela não passa).
 * Numa instrução: soma, grava o bloqueio da faixa e devolve se já havia bloqueio ativo antes desta tentativa
 * (`RETURNING old`, do Postgres 18; um SELECT no WITH volta vazio quando a linha é atualizada).
 */
export async function reserveAccountAttempt(key: string): Promise<{ attempts: number; blocked: boolean }> {
  const [t20, t10, t5] = ACCOUNT_TIERS;
  const rows = await db.$queryRaw<{ count: number; blocked: boolean }[]>`
    INSERT INTO auth_throttle (key, count, "windowStartedAt", "updatedAt")
    VALUES (${key}, 1, now(), now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN auth_throttle."windowStartedAt" < now() - make_interval(secs => ${WINDOW_S})
              THEN 1 ELSE auth_throttle.count + 1 END,
      "windowStartedAt" = CASE WHEN auth_throttle."windowStartedAt" < now() - make_interval(secs => ${WINDOW_S})
              THEN now() ELSE auth_throttle."windowStartedAt" END,
      "blockedUntil" = CASE
        WHEN auth_throttle."blockedUntil" > now() THEN auth_throttle."blockedUntil"
        WHEN auth_throttle."windowStartedAt" < now() - make_interval(secs => ${WINDOW_S}) THEN NULL
        WHEN auth_throttle.count + 1 >= ${t20.from} THEN now() + make_interval(secs => ${t20.ms / 1000})
        WHEN auth_throttle.count + 1 >= ${t10.from} THEN now() + make_interval(secs => ${t10.ms / 1000})
        WHEN auth_throttle.count + 1 >= ${t5.from} THEN now() + make_interval(secs => ${t5.ms / 1000})
        ELSE auth_throttle."blockedUntil" END,
      "updatedAt" = now()
    RETURNING new.count, coalesce(old."blockedUntil" > now(), false) AS blocked`;
  const row = rows[0];
  return { attempts: row?.count ?? 1, blocked: row?.blocked ?? false };
}

export async function reset(key: string): Promise<void> {
  await db.authThrottle.deleteMany({ where: { key } });
}
