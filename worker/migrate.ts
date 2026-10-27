// Cria ou atualiza o schema do pg-boss; roda junto com as migrations do Prisma.
import { logger } from "../src/lib/logger.ts";
import { requireSupportedPostgres } from "../src/lib/postgres.ts";
import { getQueue } from "../src/lib/queue.ts";

// Junto das migrations: um banco abaixo do 18 para aqui, antes de qualquer login quebrar.
await requireSupportedPostgres();

const boss = await getQueue("worker");
await boss.stop();
logger.info("queue", "schema do pg-boss pronto");
