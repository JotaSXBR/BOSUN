import { afterEach, describe, expect, it, vi } from "vitest";
import { createShutdown } from "./worker.ts";

afterEach(() => vi.restoreAllMocks());

describe("createShutdown", () => {
  it("para a fila e sai com 0", async () => {
    const stop = vi.fn().mockResolvedValue(undefined);
    const exit = vi.fn();
    createShutdown({ stop }, exit)();
    await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(0));
    expect(stop).toHaveBeenCalledWith({ graceful: true, timeout: 10_000 });
  });

  it("ignora o segundo sinal", async () => {
    const stop = vi.fn().mockResolvedValue(undefined);
    const shutdown = createShutdown({ stop }, vi.fn());
    shutdown();
    shutdown();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("sai com 1 quando o stop falha", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const exit = vi.fn();
    createShutdown({ stop: vi.fn().mockRejectedValue(new Error("x")) }, exit)();
    await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(1));
  });
});
