import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db.ts";
import { createAccount } from "@/modules/identity/accounts.ts";
import { verifyPassword } from "@/modules/identity/password.ts";

afterAll(() => db.$disconnect());

function uniq() {
  const s = randomUUID().slice(0, 8);
  return { username: `u${s}`, email: `u${s}@test.local`, name: "Maria Teste" };
}

describe("createAccount (Postgres real)", () => {
  it("cria usuário, credencial Argon2id com senha temporária de 72 h e auditoria do operador", async () => {
    const input = uniq();
    const before = Date.now();
    const { user, tempPassword } = await createAccount(input, { type: "operator" });

    expect(user).toMatchObject({ ...input, emailVerified: true, mustChangePassword: true });
    const expires = user.tempPasswordExpiresAt?.getTime() ?? 0;
    expect(expires - before).toBeGreaterThanOrEqual(72 * 3600_000 - 1000);
    expect(expires - before).toBeLessThanOrEqual(72 * 3600_000 + 5000);

    const account = await db.account.findFirstOrThrow({ where: { userId: user.id } });
    expect(account).toMatchObject({ providerId: "credential", accountId: user.id });
    expect(await verifyPassword(account.password ?? "", tempPassword)).toBe(true);

    const audit = await db.auditLog.findFirstOrThrow({ where: { targetId: user.id } });
    expect(audit).toMatchObject({ actorType: "operator", action: "auth.account.created", targetType: "user" });
    expect(JSON.stringify(audit.data)).not.toContain(tempPassword);
  });

  it("normaliza e-mail e usuário para minúsculas", async () => {
    const input = uniq();
    const { user } = await createAccount(
      { ...input, username: input.username.toUpperCase(), email: input.email.toUpperCase() },
      { type: "operator" },
    );
    expect(user).toMatchObject({ username: input.username, email: input.email });
  });

  it("recusa entrada inválida e duplicada sem gravar nada", async () => {
    const input = uniq();
    await expect(createAccount({ ...input, username: "a" }, { type: "operator" })).rejects.toThrow(/inválid/);
    await expect(createAccount({ ...input, email: "sem-arroba" }, { type: "operator" })).rejects.toThrow(/inválid/);
    await createAccount(input, { type: "operator" });
    await expect(createAccount({ ...input, username: `${input.username}x` }, { type: "operator" })).rejects.toThrow(/já existe/);
    expect(await db.user.count({ where: { username: `${input.username}x` } })).toBe(0);
  });
});

describe("CLI bosun admin create", () => {
  it("imprime a senha temporária uma vez e cria a conta", () => {
    const input = uniq();
    const out = execFileSync(
      "node",
      ["scripts/bosun.ts", "admin", "create", "--username", input.username, "--email", input.email, "--name", input.name],
      { encoding: "utf8" },
    );
    const match = /Senha temporária \(válida por 72 h\): (\S+)/.exec(out);
    expect(match?.[1]).toMatch(/^[A-Za-z0-9_-]{20}$/);
    expect(out.split(match?.[1] ?? "").length).toBe(2);
  });

  it("sai com erro e mensagem de uso sem argumentos", () => {
    expect(() => execFileSync("node", ["scripts/bosun.ts", "admin", "create"], { encoding: "utf8", stdio: "pipe" })).toThrow(/Uso:/);
  });
});
