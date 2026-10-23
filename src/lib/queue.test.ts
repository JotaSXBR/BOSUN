import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Fila falsa: conta instâncias e permite simular falha no start.
const instances: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[] = [];
let failStart = false;

vi.mock("pg-boss", () => ({
  PgBoss: vi.fn().mockImplementation(function FakeBoss() {
    const boss = {
      on: vi.fn(),
      start: vi.fn(() => (failStart ? Promise.reject(new Error("sem banco")) : Promise.resolve())),
      stop: vi.fn().mockResolvedValue(undefined),
      createQueue: vi.fn().mockResolvedValue(undefined),
    };
    instances.push(boss);
    return boss;
  }),
}));

const { getQueue } = await import("./queue.ts");

beforeEach(() => {
  instances.length = 0;
  failStart = false;
  Reflect.deleteProperty(globalThis, "bosunQueue");
  vi.stubEnv("DATABASE_URL", "postgresql://teste");
});
afterEach(() => vi.unstubAllEnvs());

describe("getQueue", () => {
  it("falha sem DATABASE_URL", async () => {
    vi.stubEnv("DATABASE_URL", "");
    await expect(getQueue("sender")).rejects.toThrow("DATABASE_URL não definida");
  });

  it("cria uma só instância para chamadas simultâneas do mesmo papel", async () => {
    const [a, b] = await Promise.all([getQueue("sender"), getQueue("sender")]);
    expect(a).toBe(b);
    expect(instances).toHaveLength(1);
  });

  it("após falha no start, para a instância e tenta de novo na próxima chamada", async () => {
    failStart = true;
    await expect(getQueue("worker")).rejects.toThrow("sem banco");
    expect(instances[0]?.stop).toHaveBeenCalled();
    failStart = false;
    await expect(getQueue("worker")).resolves.toBeDefined();
    expect(instances).toHaveLength(2);
  });
});
