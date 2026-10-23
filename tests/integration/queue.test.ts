import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/dev/example-job/route.ts";
import { getQueue } from "@/lib/queue.ts";
import { startWorker } from "@/lib/worker.ts";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

afterAll(async () => {
  await (await getQueue("worker")).stop();
  await (await getQueue("sender")).stop();
});

function jobIdFrom(body: unknown): string {
  if (typeof body === "object" && body !== null && "id" in body && typeof body.id === "string") return body.id;
  throw new Error("resposta sem id");
}

describe("fila de exemplo (Postgres real, banco bosun_test)", () => {
  it("o worker conclui o job que a rota enfileirou", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    // O worker migra o schema e cria a fila; o web (sender) não faz DDL.
    await startWorker();

    vi.stubEnv("NODE_ENV", "development");
    const res = await POST();
    expect(res.status).toBe(200);
    const id = jobIdFrom(await res.json());

    await vi.waitFor(() => expect(info).toHaveBeenCalledWith(`[worker] job ${id} concluído`), { timeout: 10_000 });
  });
});
