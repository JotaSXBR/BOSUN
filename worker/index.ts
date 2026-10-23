import { EXAMPLE_QUEUE, getQueue } from "../src/lib/queue.ts";

const boss = await getQueue();

await boss.work(EXAMPLE_QUEUE, async ([job]) => {
  if (job) console.log(`[worker] job ${job.id} concluído`, job.data);
});

console.log("[worker] aguardando jobs");

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => void boss.stop().then(() => process.exit(0)));
}
