import { describe, expect, it } from "vitest";
import { checkPasswordPolicy, generateTempPassword, hashPassword, verifyPassword } from "./password.ts";

const ctx = { username: "maria.silva", email: "maria@example.com" };

describe("checkPasswordPolicy", () => {
  it("aceita senha longa sem relação com o contexto", () => {
    expect(checkPasswordPolicy("cavalo correto bateria grampo", ctx)).toBeNull();
  });

  it("recusa menos de 12 e mais de 128 caracteres", () => {
    expect(checkPasswordPolicy("a".repeat(11), ctx)).toBe("too_short");
    expect(checkPasswordPolicy("x".repeat(129), ctx)).toBe("too_long");
  });

  it("conta caracteres, não bytes nem unidades UTF-16", () => {
    expect(checkPasswordPolicy("🐟".repeat(12), ctx)).toBeNull();
  });

  it("recusa senha comum sem diferenciar maiúsculas", () => {
    expect(checkPasswordPolicy("Password1234", ctx)).toBe("common");
  });

  it("recusa palavras do contexto, o usuário e a parte local do e-mail", () => {
    expect(checkPasswordPolicy("minha-BOSUN-favorita", ctx)).toBe("context");
    expect(checkPasswordPolicy("ola maria.silva tudo bem", ctx)).toBe("context");
    expect(checkPasswordPolicy("sou a MARIA desta empresa", ctx)).toBe("context");
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
    expect(await verifyPassword(hash, "café com leite e pão")).toBe(false);
  });

  it("hash inválido não verifica nem lança", async () => {
    expect(await verifyPassword("lixo", "qualquer coisa aqui")).toBe(false);
  });
});

describe("generateTempPassword", () => {
  it("gera 20 caracteres base64url distintos a cada chamada", () => {
    const a = generateTempPassword();
    expect(a).toMatch(/^[A-Za-z0-9_-]{20}$/);
    expect(generateTempPassword()).not.toBe(a);
  });
});
