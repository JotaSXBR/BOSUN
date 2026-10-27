import { PgBoss } from "pg-boss";
import { logger } from "./logger.ts";

export const EXAMPLE_QUEUE = "example";
/** Limpeza diária do `identity` (idempotente): 3 novas tentativas com espera crescente a partir de 1 min. */
export const CLEANUP_QUEUE = "identity.cleanup";

/**
 * "sender": só envia (web). Sem manutenção nem DDL, para rodar com o papel mínimo do banco.
 * "worker": processa, mantém a fila e migra o schema do pg-boss.
 */
export type QueueRole = "sender" | "worker";

// Em globalThis para o HMR do next dev não abrir um pool novo a cada recarga.
const cache = globalThis as typeof globalThis & {
  bosunQueue?: Partial<Record<QueueRole, Promise<PgBoss>>>;
};

async function connect(role: QueueRole): Promise<PgBoss> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL não definida");
  const full = role === "worker";
  const boss = new PgBoss({ connectionString, supervise: full, schedule: full, migrate: full });
  boss.on("error", (err) => logger.error("queue", "erro do pg-boss", err));
  try {
    await boss.start();
    if (full) {
      await boss.createQueue(EXAMPLE_QUEUE);
      await boss.createQueue(CLEANUP_QUEUE, { retryLimit: 3, retryDelay: 60, retryBackoff: true });
    }
    return boss;
  } catch (err) {
    await boss.stop().catch(() => undefined);
    throw err;
  }
}

/** Uma instância por papel e processo; a promessa em cache evita corrida entre chamadas simultâneas. */
export function getQueue(role: QueueRole): Promise<PgBoss> {
  const store = (cache.bosunQueue ??= {});
  const pending = store[role] ?? connect(role);
  store[role] = pending;
  pending.catch(() => {
    if (store[role] === pending) delete store[role];
  });
  return pending;
}
