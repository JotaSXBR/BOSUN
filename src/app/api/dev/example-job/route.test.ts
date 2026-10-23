import { afterEach, describe, expect, it, vi } from "vitest";
import { getQueue } from "@/lib/queue.ts";
import { POST } from "./route.ts";

vi.mock("@/lib/queue.ts", () => ({ EXAMPLE_QUEUE: "example", getQueue: vi.fn() }));

afterEach(() => vi.unstubAllEnvs());

describe("POST /api/dev/example-job", () => {
  it.each(["production", "test", ""])("responde 404 com NODE_ENV=%j sem tocar na fila", async (env) => {
    vi.stubEnv("NODE_ENV", env);
    const res = await POST();
    expect(res.status).toBe(404);
    expect(getQueue).not.toHaveBeenCalled();
  });
});
