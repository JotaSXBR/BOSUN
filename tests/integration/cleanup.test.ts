import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db.ts";
import { CLEANUP_QUEUE, getQueue } from "@/lib/queue.ts";
import { createShutdown, startWorker } from "@/lib/worker.ts";
import { cleanupExpired } from "@/modules/identity/cleanup.ts";
import { account, tag } from "./helpers.ts";

afterEach(() => vi.restoreAllMocks());
afterAll(async () => {
  await (await getQueue("sender")).stop();
  await db.$disconnect();
});

const ago = (ms: number) => new Date(Date.now() - ms);

async function seed() {
  const { user } = await account();
  const t = tag();
  await db.usedTotpCode.createMany({
    data: [
      { userId: user.id, codeHash: `old-${t}`, expiresAt: ago(1000) },
      { userId: user.id, codeHash: `new-${t}`, expiresAt: new Date(Date.now() + 60_000) },
    ],
  });
  await db.$executeRaw`INSERT INTO auth_throttle (key, count, "windowStartedAt", "blockedUntil", "updatedAt") VALUES
    (${`old-${t}`}, 3, ${ago(3_600_000)}, NULL, ${ago(3_600_000)}),
    (${`blocked-${t}`}, 20, ${ago(3_600_000)}, ${new Date(Date.now() + 60_000)}, ${ago(3_600_000)}),
    (${`fresh-${t}`}, 1, now(), NULL, now())`;
  await db.verification.createMany({
    data: [
      { identifier: `old-${t}`, value: "x", expiresAt: ago(1000) },
      { identifier: `new-${t}`, value: "x", expiresAt: new Date(Date.now() + 60_000) },
    ],
  });
  return t;
}

async function survivors(t: string) {
  const [codes, throttles, verifications] = await Promise.all([
    db.usedTotpCode.findMany({ where: { codeHash: { endsWith: t } }, select: { codeHash: true } }),
    db.authThrottle.findMany({ where: { key: { endsWith: t } }, select: { key: true } }),
    db.verification.findMany({ where: { identifier: { endsWith: t } }, select: { identifier: true } }),
  ]);
  return {
    codes: codes.map((c) => c.codeHash).sort(),
    throttles: throttles.map((x) => x.key).sort(),
    verifications: verifications.map((v) => v.identifier).sort(),
  };
}

describe("limpeza diária (Postgres real)", () => {
  it("apaga só o vencido; bloqueio ativo e linha recente ficam; rodar de novo (ou em paralelo) não muda nada", async () => {
    const t = await seed();
    await Promise.all([cleanupExpired(), cleanupExpired()]);
    await cleanupExpired();
    expect(await survivors(t)).toEqual({
      codes: [`new-${t}`],
      throttles: [`blocked-${t}`, `fresh-${t}`],
      verifications: [`new-${t}`],
    });
  });

  it("o worker roda o job da fila; um job duplicado (mesma chave) não entra", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const t = await seed();
    // A mesma instância do worker segue para o teste de shutdown (o cache da fila guarda uma por papel).
    await startWorker();
    const sender = await getQueue("sender");
    const key = `cleanup-${t}`;
    const id = await sender.send(CLEANUP_QUEUE, null, { singletonKey: key, singletonSeconds: 60 });
    expect(await sender.send(CLEANUP_QUEUE, null, { singletonKey: key, singletonSeconds: 60 })).toBeNull();
    if (!id) throw new Error("job não enfileirado");
    await vi.waitFor(async () => expect((await sender.getJobById(CLEANUP_QUEUE, id))?.state).toBe("completed"), { timeout: 10_000 });
    expect((await survivors(t)).codes).toEqual([`new-${t}`]);
  });
});

describe("fila: retry e shutdown (Postgres real)", () => {
  it("job que falha é tentado de novo e conclui; o shutdown espera o job em andamento", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const queue = `test.retry-${tag()}`;
    const boss = await getQueue("worker");
    await boss.createQueue(queue, { retryLimit: 2, retryDelay: 1 });
    let calls = 0;
    let release: () => void = () => undefined;
    const running = new Promise<void>((resolve) => (release = resolve));
    await boss.work(queue, { pollingIntervalSeconds: 0.5 }, async () => {
      calls += 1;
      if (calls === 1) throw new Error("falha passageira");
      release();
      await new Promise((r) => setTimeout(r, 1500));
    });
    const sender = await getQueue("sender");
    const id = await sender.send(queue, {});
    if (!id) throw new Error("job não enfileirado");
    await running;
    // SIGTERM com o job no meio: o stop espera ele terminar antes de sair.
    const exit = vi.fn();
    createShutdown(boss, exit)();
    await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(0), { timeout: 10_000 });
    expect(calls).toBe(2);
    expect((await sender.getJobById(queue, id))?.state).toBe("completed");
  });
});
