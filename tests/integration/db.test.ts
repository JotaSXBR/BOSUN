import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db.ts";

afterAll(() => db.$disconnect());

async function newUser() {
  const id = randomUUID();
  return db.user.create({ data: { id, name: "Teste", email: `${id}@test.local`, username: `u${id.slice(0, 8)}` } });
}

describe("schema do identity (Postgres real, banco bosun_test)", () => {
  it("aceita só um pedido de reset pendente por usuário", async () => {
    const user = await newUser();
    await db.passwordResetRequest.create({ data: { userId: user.id } });
    await expect(db.passwordResetRequest.create({ data: { userId: user.id } })).rejects.toThrow();
    await db.passwordResetRequest.updateMany({ where: { userId: user.id }, data: { status: "resolved" } });
    await expect(db.passwordResetRequest.create({ data: { userId: user.id } })).resolves.toBeTruthy();
  });

  it("rejeita o mesmo código TOTP duas vezes para o mesmo usuário", async () => {
    const user = await newUser();
    const data = { userId: user.id, codeHash: "h", expiresAt: new Date(Date.now() + 120_000) };
    await db.usedTotpCode.create({ data });
    await expect(db.usedTotpCode.create({ data })).rejects.toThrow();
  });

  it("recusa e-mail ou usuário com maiúsculas", async () => {
    const id = randomUUID();
    await expect(db.user.create({ data: { id, name: "T", email: `A${id}@test.local` } })).rejects.toThrow();
    await expect(db.user.create({ data: { id, name: "T", email: `${id}@test.local`, username: "Maria" } })).rejects.toThrow();
  });

  it("aceita um só TwoFactor por usuário", async () => {
    const user = await newUser();
    const data = () => ({ id: randomUUID(), userId: user.id, secret: "s", backupCodes: "b" });
    await db.twoFactor.create({ data: data() });
    await expect(db.twoFactor.create({ data: data() })).rejects.toThrow();
  });

  it("a auditoria não aceita alteração nem exclusão", async () => {
    const row = await db.auditLog.create({ data: { actorType: "system", action: "test.event" } });
    await expect(db.auditLog.update({ where: { id: row.id }, data: { action: "x" } })).rejects.toThrow(/só inserção/);
    await expect(db.auditLog.delete({ where: { id: row.id } })).rejects.toThrow(/só inserção/);
  });

  it("apagar o usuário apaga as sessões dele", async () => {
    const user = await newUser();
    await db.session.create({
      data: { id: randomUUID(), token: randomUUID(), userId: user.id, expiresAt: new Date(Date.now() + 60_000) },
    });
    await db.user.delete({ where: { id: user.id } });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
  });
});
