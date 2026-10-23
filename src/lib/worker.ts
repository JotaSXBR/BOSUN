import type { PgBoss } from "pg-boss";
import { logger } from "./logger.ts";
import { EXAMPLE_QUEUE, getQueue } from "./queue.ts";

/** Registra os handlers do worker. Só o id vai para log: payload real não (engineering.md). */
export async function startWorker(): Promise<PgBoss> {
  const boss = await getQueue("worker");
  await boss.work(EXAMPLE_QUEUE, async ([job]) => {
    if (job) logger.info("worker", `job ${job.id} concluído`);
  });
  logger.info("worker", "aguardando jobs");
  return boss;
}

/** Encerramento que ignora sinais repetidos e sai com 1 se o stop falhar. */
export function createShutdown(boss: Pick<PgBoss, "stop">, exit: (code: number) => void): () => void {
  let stopping = false;
  return () => {
    if (stopping) return;
    stopping = true;
    boss.stop().then(
      () => exit(0),
      (err: unknown) => {
        logger.error("worker", "falha ao encerrar", err);
        exit(1);
      },
    );
  };
}
