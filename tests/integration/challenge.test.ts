import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db.ts";
import { changePassword } from "@/modules/identity/accounts.ts";
import { auth } from "@/modules/identity/auth.ts";
import { resolveSession } from "@/modules/identity/session.ts";
import { verifySecondFactor } from "@/modules/identity/totp.ts";
import { challenge, cookieFrom, enrolled, nextCode } from "./helpers.ts";

afterEach(() => vi.restoreAllMocks());
afterAll(() => db.$disconnect());

const bump = (userId: string) => db.user.update({ where: { id: userId }, data: { credentialsVersion: { increment: 1 } } });
const sessions = (userId: string) => db.session.count({ where: { userId } });

/** Cabeçalhos com um cookie a mais antes do desafio verdadeiro. */
function withExtraCookie(headers: Headers, extra: string): Headers {
  const out = new Headers(headers);
  out.set("cookie", `${extra}; ${headers.get("cookie") ?? ""}`);
  return out;
}

describe("vínculo do desafio de 2FA (Postgres real)", () => {
  it("o vínculo de outra conta, num cookie com outro nome, não salva um desafio de senha trocada", async () => {
    const a = await enrolled();
    const b = await enrolled();
    const cookieA = await challenge(a.user.email, a.password);
    const cookieB = await challenge(b.user.email, b.password);
    await bump(a.user.id);
    const bValue = (cookieB.get("cookie") ?? "").split("; ").find((c) => c.startsWith("bosun.two_factor=")) ?? "";
    const forged = withExtraCookie(cookieA, bValue.replace("bosun.two_factor=", "evil.two_factor="));
    const before = await sessions(a.user.id);
    expect(await verifySecondFactor("totp", { code: nextCode(a.secret) }, forged)).toMatchObject({ status: 401 });
    expect(await sessions(a.user.id)).toBe(before);
  });

  it("sem vínculo falha fechado; cookie malformado antes do verdadeiro não deixa sessão órfã", async () => {
    const { user, password, secret } = await enrolled();
    const cookie = await challenge(user.email, password);
    await db.verification.deleteMany({ where: { identifier: { startsWith: "bosun-cv-" }, value: { startsWith: `${user.id}:` } } });
    const before = await sessions(user.id);
    expect(await verifySecondFactor("totp", { code: nextCode(secret) }, withExtraCookie(cookie, "evil.two_factor=%E0%A4%A"))).toMatchObject({ status: 401 });
    expect(await sessions(user.id)).toBe(before);
  });

  it("código errado não gasta o vínculo: o certo, em seguida, entra", async () => {
    const { user, password, secret } = await enrolled();
    const cookie = await challenge(user.email, password);
    const right = nextCode(secret);
    const wrong = String((Number(right) + 1) % 1_000_000).padStart(6, "0");
    expect(await verifySecondFactor("totp", { code: wrong }, cookie)).toMatchObject({ status: 401 });
    expect((await verifySecondFactor("totp", { code: right }, cookie)).ok).toBe(true);
  });

  it("código de recuperação com a senha trocada no meio não vira sessão", async () => {
    const { user, password, enroll } = await enrolled();
    if (!enroll.ok) throw new Error("setup falhou");
    const cookie = await challenge(user.email, password);
    const original = auth.api.verifyBackupCode.bind(auth.api);
    vi.spyOn(auth.api, "verifyBackupCode").mockImplementation(async (...args: Parameters<typeof auth.api.verifyBackupCode>) => {
      const result = await original(...args);
      await bump(user.id);
      return result;
    });
    const before = await sessions(user.id);
    expect(await verifySecondFactor("recovery", { code: enroll.recoveryCodes[0] }, cookie)).toMatchObject({ status: 401 });
    expect(await sessions(user.id)).toBe(before);
  });

  it("trocar a senha apaga os desafios pendentes", async () => {
    const { user, password, secret, confirm } = await enrolled();
    if (!confirm.ok) throw new Error("setup falhou");
    const pending = await challenge(user.email, password);
    const current = await resolveSession(cookieFrom(confirm.headers));
    if (!current) throw new Error("sem sessão");
    expect(await changePassword(current, { current: password, next: "cavalo correto bateria grampo azul" })).toBeNull();
    expect(await verifySecondFactor("totp", { code: nextCode(secret) }, pending)).toMatchObject({ status: 401 });
  });
});
