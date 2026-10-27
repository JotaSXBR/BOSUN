import { PgBoss } from "pg-boss";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db.ts";
import { CLEANUP_QUEUE, getQueue } from "@/lib/queue.ts";
import { CLEANUP_SCHEDULE, createShutdown, startWorker } from "@/lib/worker.ts";
import { cleanupExpired } from "@/modules/identity/cleanup.ts";
import { account, tag } from "./helpers.ts";

afterEach(() => vi.restoreAllMocks());
afterAll(async () => {
  await (await getQueue("sender")).stop();
  await db.$disconnect();
});

const ago = (ms: number) => new Date(Date.now() - ms);
const ahead = (ms: number) => new Date(Date.now() + ms);
const MIN = 60_000;

async function seed() {
  const { user } = await account();
  const t = tag();
  await db.usedTotpCode.createMany({
    data: [
      { userId: user.id, codeHash: `old-${t}`, expiresAt: ago(1000) },
      { userId: user.id, codeHash: `new-${t}`, expiresAt: ahead(MIN) },
    ],
  });
  // Estados reais: parada há 1 h (sai); parada há 20 min (fica); bloqueada há 5 min por 15 (fica).
  await db.$executeRaw`INSERT INTO auth_throttle (key, count, "windowStartedAt", "blockedUntil", "updatedAt") VALUES
    (${`old-${t}`}, 3, ${ago(60 * MIN)}, NULL, ${ago(60 * MIN)}),
    (${`recent-${t}`}, 2, ${ago(20 * MIN)}, NULL, ${ago(20 * MIN)}),
    (${`blocked-${t}`}, 20, ${ago(5 * MIN)}, ${ahead(10 * MIN)}, ${ago(5 * MIN)})`;
  await db.verification.createMany({
    data: [
      { identifier: `old-${t}`, value: "x", expiresAt: ago(1000) },
      { identifier: `new-${t}`, value: "x", expiresAt: ahead(MIN) },
    ],
  });
  await db.session.createMany({
    data: [
      { userId: user.id, token: `old-${t}`, expiresAt: ago(1000) },
      { userId: user.id, token: `new-${t}`, expiresAt: ahead(MIN) },
    ],
  });
  return t;
}

async function survivors(t: string) {
  const [codes, throttles, verifications, sessions] = await Promise.all([
    db.usedTotpCode.findMany({ where: { codeHash: { endsWith: t } }, select: { codeHash: true } }),
    db.authThrottle.findMany({ where: { key: { endsWith: t } }, select: { key: true } }),
    db.verification.findMany({ where: { identifier: { endsWith: t } }, select: { identifier: true } }),
    db.session.findMany({ where: { token: { endsWith: t } }, select: { token: true } }),
  ]);
  return {
    codes: codes.map((c) => c.codeHash).sort(),
    throttles: throttles.map((x) => x.key).sort(),
    verifications: verifications.map((v) => v.identifier).sort(),
    sessions: sessions.map((s) => s.token).sort(),
  };
}

describe("limpeza diária (Postgres real)", () => {
  it("apaga só o vencido; bloqueio ativo e linha recente ficam; rodar de novo (ou em paralelo) não muda nada", async () => {
    const t = await seed();
    await Promise.all([cleanupExpired(), cleanupExpired()]);
    await cleanupExpired();
    expect(await survivors(t)).toEqual({
      codes: [`new-${t}`],
      throttles: [`blocked-${t}`, `recent-${t}`],
      verifications: [`new-${t}`],
      sessions: [`new-${t}`],
    });
  });

  it("o worker cria a fila real com retry e agenda às 3h17 de São Paulo; roda o job e barra duplicado", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const t = await seed();
    // A mesma instância do worker segue para o teste de shutdown (o cache da fila guarda uma por papel).
    const worker = await startWorker();
    expect(await worker.getQueue(CLEANUP_QUEUE)).toMatchObject({ retryLimit: 3, retryDelay: 60, retryBackoff: true });
    expect(await worker.getSchedules(CLEANUP_QUEUE)).toEqual([expect.objectContaining({ cron: CLEANUP_SCHEDULE.cron, timezone: CLEANUP_SCHEDULE.tz })]);
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
  it("job longo demais no shutdown: o stop desiste no prazo e o job volta para nova tentativa", async () => {
    const queue = `test.slow-${tag()}`;
    // Instância própria: este teste para o worker, e o cache da fila guarda uma só por papel.
    const boss = new PgBoss({ connectionString: process.env.DATABASE_URL ?? "", supervise: false, schedule: false });
    await boss.start();
    await boss.createQueue(queue, { retryLimit: 1, retryDelay: 1 });
    let started: () => void = () => undefined;
    const running = new Promise<void>((resolve) => (started = resolve));
    await boss.work(queue, { pollingIntervalSeconds: 0.5 }, async () => {
      started();
      await new Promise((r) => setTimeout(r, 5000));
    });
    const sender = await getQueue("sender");
    const id = await sender.send(queue, {});
    if (!id) throw new Error("job não enfileirado");
    await running;
    const t0 = Date.now();
    await boss.stop({ graceful: true, timeout: 1000 });
    expect(Date.now() - t0).toBeLessThan(4000);
    await vi.waitFor(async () => expect((await sender.getJobById(queue, id))?.state).toMatch(/retry|failed/), { timeout: 5000 });
  });
});

describe("fila: retry e shutdown gracioso (Postgres real)", () => {
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
