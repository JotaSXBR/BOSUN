import { describe, expect, it, vi } from "vitest";
import { checkNewPassword, checkPasswordPolicy, generateTempPassword, hashPassword, verifyPassword } from "./password.ts";

const ctx = { username: "maria.silva", email: "maria@example.com" };

describe("checkPasswordPolicy", () => {
  it("aceita senha longa sem relação com o contexto", () => {
    expect(checkPasswordPolicy("cavalo correto bateria grampo", ctx)).toBeNull();
  });

  it("recusa menos de 12 e mais de 128 caracteres", () => {
    expect(checkPasswordPolicy("a".repeat(11), ctx)).toBe("too_short");
    expect(checkPasswordPolicy("x".repeat(129), ctx)).toBe("too_long");
  });

  it("aceita exatamente 12 e 128", () => {
    expect(checkPasswordPolicy("k".repeat(12), ctx)).toBeNull();
    expect(checkPasswordPolicy("k".repeat(128), ctx)).toBeNull();
  });

  it("conta grafemas: letra com acento combinante e família ZWJ valem 1", () => {
    expect(checkPasswordPolicy("é".repeat(11), ctx)).toBe("too_short");
    expect(checkPasswordPolicy("é".repeat(12), ctx)).toBeNull();
    expect(checkPasswordPolicy("\u{1F468}‍\u{1F469}‍\u{1F467}".repeat(11), ctx)).toBe("too_short");
  });

  it("recusa entrada enorme antes de segmentar, inclusive marcas combinantes sem fim", () => {
    expect(checkPasswordPolicy("x".repeat(5_000_000), ctx)).toBe("too_long");
    expect(checkPasswordPolicy(`e${"́".repeat(2000)}abcdefghijk`, ctx)).toBe("too_long");
  });

  it("recusa senha comum sem diferenciar maiúsculas", () => {
    expect(checkPasswordPolicy("Password1234", ctx)).toBe("common");
  });

  it("recusa palavras do contexto, o usuário e a parte local do e-mail", () => {
    expect(checkPasswordPolicy("minha-BOSUN-favorita", ctx)).toBe("context");
    expect(checkPasswordPolicy("ola maria.silva tudo bem", ctx)).toBe("context");
    expect(checkPasswordPolicy("sou a MARIA desta empresa", ctx)).toBe("context");
    for (const word of ["admin", "workspace", "piloto", "senha"]) {
      expect(checkPasswordPolicy(`uma ${word} qualquer aqui`, ctx)).toBe("context");
    }
  });

  it("pedaço de contexto com menos de 4 caracteres não bloqueia", () => {
    expect(checkPasswordPolicy("analise de dados longa", { username: "ana", email: "ana@x.com" })).toBeNull();
  });
});

describe("hash Argon2id", () => {
  it("verifica a senha certa e recusa a errada", async () => {
    const hash = await hashPassword("cavalo correto bateria grampo");
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=65536,t=3,p=4\$/);
    expect(await verifyPassword(hash, "cavalo correto bateria grampo")).toBe(true);
    expect(await verifyPassword(hash, "cavalo correto bateria grampO")).toBe(false);
  });

  it("não normaliza: formas Unicode diferentes são senhas diferentes", async () => {
    const hash = await hashPassword("café com leite e pão");
    expect(await verifyPassword(hash, "cafe0301 com leite e pão")).toBe(false);
  });

  it("hash inválido não verifica nem lança", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await verifyPassword("lixo", "qualquer coisa aqui")).toBe(false);
    spy.mockRestore();
  });
});

describe("checkNewPassword", () => {
  it("recusa a nova igual à atual e aplica a política antes", async () => {
    const current = await hashPassword("cavalo correto bateria grampo");
    expect(await checkNewPassword("cavalo correto bateria grampo", ctx, current)).toBe("same_as_current");
    expect(await checkNewPassword("curta", ctx, current)).toBe("too_short");
    expect(await checkNewPassword("outra frase bem diferente", ctx, current)).toBeNull();
  });
});

describe("verifyPassword com hash quebrado", () => {
  it("registra o erro sem a senha", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await verifyPassword("", "frase secreta qualquer")).toBe(false);
    expect(spy).toHaveBeenCalledOnce();
    expect(String(spy.mock.calls[0]?.[0])).not.toContain("frase secreta");
    spy.mockRestore();
  });
});

describe("generateTempPassword", () => {
  it("gera 20 caracteres base64url distintos a cada chamada", () => {
    const a = generateTempPassword();
    expect(a).toMatch(/^[A-Za-z0-9_-]{20}$/);
    expect(generateTempPassword()).not.toBe(a);
  });
});
