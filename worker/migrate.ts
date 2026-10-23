// Cria ou atualiza o schema do pg-boss; roda junto com as migrations do Prisma.
import { logger } from "../src/lib/logger.ts";
import { getQueue } from "../src/lib/queue.ts";

const boss = await getQueue("worker");
await boss.stop();
logger.info("queue", "schema do pg-boss pronto");
