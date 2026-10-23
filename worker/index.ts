import { createShutdown, startWorker } from "../src/lib/worker.ts";

const shutdown = createShutdown(await startWorker(), (code) => process.exit(code));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
