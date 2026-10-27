import { afterAll, describe, expect, it, vi } from "vitest";
import { EXAMPLE_QUEUE, getQueue } from "@/lib/queue.ts";
import { startWorker } from "@/lib/worker.ts";

afterAll(async () => {
  await (await getQueue("worker")).stop();
  await (await getQueue("sender")).stop();
});

describe("fila de exemplo (Postgres real, banco bosun_test)", () => {
  it("o worker conclui o job que o web enfileirou (pelo estado no pg-boss, não pelo log)", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    // O worker migra o schema e cria a fila; o web (sender) não faz DDL.
    await startWorker();
    const sender = await getQueue("sender");
    const id = await sender.send(EXAMPLE_QUEUE, { from: "web" });
    if (!id) throw new Error("job não enfileirado");
    await vi.waitFor(async () => expect((await sender.getJobById(EXAMPLE_QUEUE, id))?.state).toBe("completed"), { timeout: 10_000 });
  });
});
