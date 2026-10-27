import { describe, expect, it, vi } from "vitest";
import { Prisma } from "../generated/prisma/client.ts";
import { guarded, isDbUnavailable } from "./route.ts";

const unreachable = () => new Prisma.PrismaClientKnownRequestError("Can't reach database server", { code: "P1001", clientVersion: "7" });

describe("guarded (banco fora do ar)", () => {
  it("devolve 503 genérico, sem o detalhe do erro", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const res = await guarded(async () => Promise.reject(unreachable()))();
    expect(res.status).toBe(503);
    expect(res.headers.get("retry-after")).toBe("5");
    const body = JSON.stringify(await res.json());
    expect(body).toContain("Serviço indisponível");
    expect(body).not.toContain("database");
  });

  it("reconhece a causa embrulhada e deixa passar os outros erros", async () => {
    expect(isDbUnavailable(new Error("auth", { cause: unreachable() }))).toBe(true);
    expect(isDbUnavailable(new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "7" }))).toBe(false);
    await expect(guarded(async () => Promise.reject(new Error("bug")))()).rejects.toThrow("bug");
  });

  it("sem erro, devolve a resposta da rota", async () => {
    const res = await guarded(async () => new Response("ok"))();
    expect(await res.text()).toBe("ok");
  });
});
