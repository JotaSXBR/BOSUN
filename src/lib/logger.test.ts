import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger.ts";

afterEach(() => vi.restoreAllMocks());

describe("logger", () => {
  it("escreve info com o escopo entre colchetes", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    logger.info("worker", "aguardando jobs");
    expect(info).toHaveBeenCalledWith("[worker] aguardando jobs");
  });

  it("loga só nome e mensagem do erro, sem propriedades extras", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const err = Object.assign(new Error("falha"), { query: "SELECT segredo" });
    logger.error("queue", "erro do pg-boss", err);
    expect(error).toHaveBeenCalledWith("[queue] erro do pg-boss (Error: falha)");
  });

  it("não expõe valores que não são Error", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    logger.error("queue", "erro", { token: "abc" });
    expect(error).toHaveBeenCalledWith("[queue] erro (erro não identificado)");
  });

  it("omite o parêntese quando não há erro", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    logger.error("worker", "parado");
    expect(error).toHaveBeenCalledWith("[worker] parado");
  });
});
