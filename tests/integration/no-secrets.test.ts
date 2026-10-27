import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db.ts";
import { login } from "@/modules/identity/login.ts";
import { issueTempPassword, unlockAccount } from "@/modules/identity/recovery.ts";
import { verifySecondFactor } from "@/modules/identity/totp.ts";
import { account, challenge, enrolled, nextCode, req } from "./helpers.ts";

afterEach(() => vi.restoreAllMocks());
afterAll(() => db.$disconnect());

const printed: string[] = [];

beforeEach(() => {
  printed.length = 0;
  for (const level of ["log", "info", "warn", "error", "debug"] as const) {
    vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
      printed.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a) ?? String(a))).join(" "));
    });
  }
});

/** Tudo o que saiu no console e tudo o que a auditoria da pessoa guardou. */
async function everywhere(userId: string): Promise<string> {
  const audits = await db.auditLog.findMany({ where: { OR: [{ actorId: userId }, { targetId: userId }] } });
  return [...printed, JSON.stringify(audits)].join("\n");
}

describe("critério 9: nenhum segredo em log ou auditoria (Postgres real)", () => {
  it("senha, senha temporária, TOTP, código de recuperação, token de sessão e o segredo do Better Auth não aparecem", async () => {
    const { user, password, secret, enroll } = await enrolled();
    if (!enroll.ok) throw new Error("setup falhou");
    const wrong = await login({ identifier: user.email, password: `${password}x` }, req());
    expect(wrong.ok).toBe(false);
    const code = nextCode(secret);
    const ok = await verifySecondFactor("totp", { code }, await challenge(user.email, password));
    await verifySecondFactor("totp", { code }, await challenge(user.email, password));
    await verifySecondFactor("recovery", { code: enroll.recoveryCodes[0] }, await challenge(user.email, password));
    const { user: admin } = await account();
    const temp = await issueTempPassword(user.id, { type: "user", id: admin.id });
    const unlocked = await unlockAccount(user.email, "teste", "ops@vps");
    const tokens = (await db.session.findMany({ where: { userId: user.id }, select: { token: true } })).map((s) => s.token);
    const cookieToken = ok.ok ? (ok.headers.getSetCookie().find((c) => c.includes("session_token")) ?? "") : "";

    const out = await everywhere(user.id);
    const secrets = [password, temp, unlocked, code, secret, ...enroll.recoveryCodes, ...tokens, process.env.BETTER_AUTH_SECRET ?? ""];
    for (const value of secrets.filter((v) => v.length >= 6)) expect(out).not.toContain(value);
    expect(cookieToken).not.toBe("");
    expect(out).not.toContain(cookieToken.split(";")[0]?.split("=")[1] ?? "");
  });
});
