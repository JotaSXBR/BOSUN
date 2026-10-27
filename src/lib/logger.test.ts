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

  it("troca quebra de linha e caractere de controle por espaço, para não forjar linha de log", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    logger.error("webhook", "falhou\r\n[admin] login ok", new Error("a\nb\u0000c"));
    expect(error).toHaveBeenCalledWith("[webhook] falhou [admin] login ok (Error: a b c)");
  });

  it("separadores de linha Unicode (U+2028/2029, NEL) também viram espaço", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    logger.info("x", "a b c\u0085d");
    expect(info).toHaveBeenCalledWith("[x] a b c d");
  });

  it("corta a mensagem do erro em 300 caracteres", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    logger.error("queue", "erro", new Error("x".repeat(500)));
    expect(error).toHaveBeenCalledWith(`[queue] erro (Error: ${"x".repeat(300)}…)`);
  });

  it("omite o parêntese quando não há erro", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    logger.error("worker", "parado");
    expect(error).toHaveBeenCalledWith("[worker] parado");
  });
});
