import { requireSupportedPostgres } from "../src/lib/postgres.ts";
import { createShutdown, startWorker } from "../src/lib/worker.ts";

await requireSupportedPostgres();

const shutdown = createShutdown(await startWorker(), (code) => process.exit(code));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
