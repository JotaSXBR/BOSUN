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

  it("apagar o usuário apaga as sessões dele", async () => {
    const user = await newUser();
    await db.session.create({
      data: { id: randomUUID(), token: randomUUID(), userId: user.id, expiresAt: new Date(Date.now() + 60_000) },
    });
    await db.user.delete({ where: { id: user.id } });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
  });
});
