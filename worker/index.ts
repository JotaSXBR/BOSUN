import { EXAMPLE_QUEUE, getQueue } from "../src/lib/queue.ts";

const boss = await getQueue("worker");

await boss.work(EXAMPLE_QUEUE, async ([job]) => {
  // Só o id: payload real não vai para log (engineering.md).
  if (job) console.log(`[worker] job ${job.id} concluído`);
});

console.log("[worker] aguardando jobs");

let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    if (stopping) return;
    stopping = true;
    boss.stop().then(
      () => process.exit(0),
      (err: unknown) => {
        console.error("[worker] falha ao encerrar", err);
        process.exit(1);
      },
    );
  });
}
