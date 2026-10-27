import type { PgBoss } from "pg-boss";
import { logger } from "./logger.ts";
import { cleanupExpired } from "../modules/identity/cleanup.ts";
import { CLEANUP_QUEUE, EXAMPLE_QUEUE, getQueue } from "./queue.ts";

// Madrugada no fuso da cliente, fora do minuto cheio.
const CLEANUP_CRON = "17 3 * * *";
// Tempo para o job em andamento terminar no SIGTERM antes de o pg-boss desistir dele.
export const SHUTDOWN_TIMEOUT_MS = 10_000;

/** Registra os handlers do worker. Só o id vai para log: payload real não (engineering.md). */
export async function startWorker(): Promise<PgBoss> {
  const boss = await getQueue("worker");
  await boss.work(EXAMPLE_QUEUE, async ([job]) => {
    if (job) logger.info("worker", `job ${job.id} concluído`);
  });
  await boss.work(CLEANUP_QUEUE, async () => {
    const removed = await cleanupExpired();
    logger.info("worker", `limpeza: ${removed.usedTotpCodes} códigos, ${removed.throttles} limites, ${removed.verifications} desafios`);
  });
  await boss.schedule(CLEANUP_QUEUE, CLEANUP_CRON, null, { tz: "America/Sao_Paulo" });
  logger.info("worker", "aguardando jobs");
  return boss;
}

/** Encerramento que espera o job em andamento (até 10 s), ignora sinais repetidos e sai com 1 se o stop falhar. */
export function createShutdown(boss: Pick<PgBoss, "stop">, exit: (code: number) => void): () => void {
  let stopping = false;
  return () => {
    if (stopping) return;
    stopping = true;
    boss.stop({ graceful: true, timeout: SHUTDOWN_TIMEOUT_MS }).then(
      () => exit(0),
      (err: unknown) => {
        logger.error("worker", "falha ao encerrar", err);
        exit(1);
      },
    );
  };
}
