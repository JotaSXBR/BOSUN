import { afterEach, describe, expect, it, vi } from "vitest";
import { postJson } from "./post-json.ts";

afterEach(() => vi.unstubAllGlobals());

const reply = (status: number, body: unknown) => vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status })));

describe("postJson", () => {
  it("devolve o corpo em sucesso", async () => {
    reply(200, { a: 1 });
    expect(await postJson("/x", {})).toEqual({ ok: true, body: { a: 1 } });
  });

  it("usa a mensagem da rota ou uma genérica", async () => {
    reply(400, { error: "Senha comum" });
    expect(await postJson("/x", {})).toEqual({ ok: false, error: "Senha comum" });
    reply(500, "x");
    expect(await postJson("/x", {})).toEqual({ ok: false, error: "Algo deu errado. Tente de novo." });
  });

  it("rede caída vira mensagem, sem lançar", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("fetch failed"))));
    expect(await postJson("/x", {})).toEqual({ ok: false, error: "Sem conexão. Tente de novo." });
  });
});
