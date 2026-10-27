import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { globSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { Prisma, PrismaClient } from "../generated/prisma/client.ts";
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

  it("reconhece a causa embrulhada; outro erro vira 500 genérico pelo logger", async () => {
    expect(isDbUnavailable(new Error("auth", { cause: unreachable() }))).toBe(true);
    expect(isDbUnavailable(new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "7" }))).toBe(false);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const res = await guarded(async () => Promise.reject(new Error("bug com senha=segredo123")))();
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("segredo123");
    expect(error).toHaveBeenCalledWith(expect.stringContaining("[http] falha na rota"));
  });

  it("sem erro, devolve a resposta da rota", async () => {
    const res = await guarded(async () => new Response("ok"))();
    expect(await res.text()).toBe("ok");
  });
});

describe("erros reais com o banco fora do ar", () => {
  it("consulta do Prisma (P1001) e consulta crua pelo adapter (P2010) contam como indisponível", async () => {
    const down = new PrismaClient({ adapter: new PrismaPg({ connectionString: "postgresql://u:p@127.0.0.1:1/nada" }) });
    const errors = await Promise.all([
      down.user.count().catch((err: unknown) => err),
      down.$queryRaw`SELECT 1`.catch((err: unknown) => err),
    ]);
    await down.$disconnect();
    expect(errors.map((err) => isDbUnavailable(err))).toEqual([true, true]);
  });
});

describe("todas as rotas passam por guarded", () => {
  it("nenhuma rota de API exporta POST sem o 503", () => {
    const files = [...globSync("src/app/api/**/route.ts"), "src/app/api/auth/2fa/handler.ts"];
    // verify e recovery usam secondFactorRoute, que é guarded (o handler.ts está na lista).
    const unguarded = files.filter((f) => !/guarded\(|secondFactorRoute\(/.test(readFileSync(f, "utf8")));
    expect(files.length).toBeGreaterThan(5);
    expect(unguarded).toEqual([]);
  });
});
