import { spawnSync } from "node:child_process";
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
    await expect(createAccount({ ...input, email: `x${input.email}` }, { type: "operator" })).rejects.toThrow(/já existe/);
    await expect(createAccount({ ...input, name: "Maria\u0000" }, { type: "operator" })).rejects.toThrow(/inválid/);
    expect(await db.user.count({ where: { username: `${input.username}x` } })).toBe(0);
  });
});

function cli(args: string[]) {
  const res = spawnSync("node", ["scripts/bosun.ts", ...args], { encoding: "utf8" });
  return { code: res.status, out: res.stdout, err: res.stderr };
}

function createArgs(input: ReturnType<typeof uniq>) {
  return ["admin", "create", "--username", input.username, "--email", input.email, "--name", input.name];
}

describe("CLI bosun admin create", () => {
  it("imprime a senha temporária uma vez, só no stdout, e cria a conta", async () => {
    const input = uniq();
    const { code, out, err } = cli(createArgs(input));
    expect(code).toBe(0);
    expect(err).toBe("");
    const match = /Senha temporária \(válida por 72 h\): (\S+)/.exec(out);
    expect(match?.[1]).toMatch(/^[A-Za-z0-9_-]{20}$/);
    expect(out.split(match?.[1] ?? "").length).toBe(2);
    expect(await db.user.count({ where: { username: input.username } })).toBe(1);
  });

  it("conta duplicada sai 1 com mensagem limpa, sem stack nem senha", () => {
    const input = uniq();
    cli(createArgs(input));
    const { code, out, err } = cli(createArgs(input));
    expect(code).toBe(1);
    expect(out).toBe("");
    expect(err.trim()).toBe("Usuário ou e-mail já existe");
  });

  it("sem argumentos, comando ou opção desconhecidos: uso e saída 1", () => {
    for (const args of [["admin", "create"], ["admin", "nada"], ["admin", "create", "--senha", "x"]]) {
      const { code, err } = cli(args);
      expect(code).toBe(1);
      expect(err).toContain("Uso:");
    }
  });
});
