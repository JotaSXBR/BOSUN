import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db.ts";
import { changePassword, createAccount } from "@/modules/identity/accounts.ts";
import { login } from "@/modules/identity/login.ts";
import { resolveSession } from "@/modules/identity/session.ts";

afterAll(() => db.$disconnect());

const NEW = "cavalo correto bateria grampo";
const ip = () => new Headers({ "x-forwarded-for": `10.7.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` });
const cookieFrom = (h: Headers) => new Headers({ cookie: h.getSetCookie().map((c) => c.split(";")[0]).join("; ") });

async function signedIn() {
  const s = randomUUID().slice(0, 8);
  const { user, tempPassword } = await createAccount({ username: `p${s}`, email: `p${s}@test.local`, name: "P" }, { type: "operator" });
  const sessions = await Promise.all(
    [1, 2].map(async () => {
      const res = await login({ identifier: user.email, password: tempPassword }, ip());
      if (!res.ok) throw new Error("login falhou");
      const current = await resolveSession(cookieFrom(res.headers));
      if (!current) throw new Error("sem sessão");
      return current;
    }),
  );
  return { user, tempPassword, current: sessions[0], other: sessions[1] };
}

describe("changePassword (Postgres real)", () => {
  it("troca a senha, zera a troca forçada, mantém a sessão atual, apaga as outras e audita", async () => {
    const { user, tempPassword, current, other } = await signedIn();
    expect(current?.user.mustChangePassword).toBe(true);
    expect(await changePassword(current!, { current: tempPassword, next: NEW })).toBeNull();

    const fresh = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(fresh).toMatchObject({ mustChangePassword: false, tempPasswordExpiresAt: null });
    const ids = (await db.session.findMany({ where: { userId: user.id } })).map((s) => s.id);
    expect(ids).toEqual([current?.session.id]);
    expect(ids).not.toContain(other?.session.id);
    expect(await login({ identifier: user.email, password: tempPassword }, ip())).toMatchObject({ status: 401 });
    expect((await login({ identifier: user.email, password: NEW }, ip())).ok).toBe(true);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.password.changed" } })).toBe(1);
  });

  it("senha atual errada, nova igual à atual ou fora da política não mudam nada", async () => {
    const { user, tempPassword, current } = await signedIn();
    expect(await changePassword(current!, { current: "errada errada errada", next: NEW })).toBe("wrong_current");
    expect(await changePassword(current!, { current: tempPassword, next: tempPassword })).toBe("same_as_current");
    expect(await changePassword(current!, { current: tempPassword, next: "curta" })).toBe("too_short");
    expect(await changePassword(current!, { current: tempPassword, next: `${user.username} e mais coisa` })).toBe("context");
    expect(await db.session.count({ where: { userId: user.id } })).toBe(2);
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).mustChangePassword).toBe(true);
  });

  it("senha temporária vencida não entra e não deixa sessão", async () => {
    const s = randomUUID().slice(0, 8);
    const { user, tempPassword } = await createAccount({ username: `v${s}`, email: `v${s}@test.local`, name: "V" }, { type: "operator" });
    await db.user.update({ where: { id: user.id }, data: { tempPasswordExpiresAt: new Date(Date.now() - 1000) } });
    expect(await login({ identifier: user.email, password: tempPassword }, ip())).toEqual({
      ok: false,
      status: 401,
      message: "Usuário ou senha inválidos",
    });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
  });
});
