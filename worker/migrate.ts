// Cria ou atualiza o schema do pg-boss; roda junto com as migrations do Prisma.
import { getQueue } from "../src/lib/queue.ts";

const boss = await getQueue("worker");
await boss.stop();
console.log("[queue] schema do pg-boss pronto");
