import { logger } from "../src/lib/logger.ts";
import { EXAMPLE_QUEUE, getQueue } from "../src/lib/queue.ts";

const boss = await getQueue("worker");

await boss.work(EXAMPLE_QUEUE, async ([job]) => {
  // Só o id: payload real não vai para log (engineering.md).
  if (job) logger.info("worker", `job ${job.id} concluído`);
});

logger.info("worker", "aguardando jobs");

let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    if (stopping) return;
    stopping = true;
    boss.stop().then(
      () => process.exit(0),
      (err: unknown) => {
        logger.error("worker", "falha ao encerrar", err);
        process.exit(1);
      },
    );
  });
}
