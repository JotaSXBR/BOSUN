import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db.ts";
import { login } from "@/modules/identity/login.ts";
import { issueTempPassword, unlockAccount } from "@/modules/identity/recovery.ts";
import { listSessions, revokeOtherSessions, resolveSession } from "@/modules/identity/session.ts";
import { verifySecondFactor } from "@/modules/identity/totp.ts";
import { account, challenge, cookieFrom, enrolled, nextCode, req } from "./helpers.ts";

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

/** Console, respostas de erro e toda a auditoria da pessoa, num texto só. */
async function everywhere(userId: string, responses: unknown[]): Promise<string> {
  const audits = await db.auditLog.findMany({ where: { OR: [{ actorId: userId }, { targetId: userId }] } });
  return [...printed, JSON.stringify(responses), JSON.stringify(audits)].join("\n");
}

/** Token cru (o que fica na tabela) e o valor do cookie assinado, cru e decodificado. */
function cookieForms(headers: Headers): string[] {
  const raw = headers.getSetCookie().find((c) => c.includes("session_token="))?.split(";")[0]?.split("=")[1] ?? "";
  const decoded = decodeURIComponent(raw);
  return [raw, decoded, decoded.split(".")[0] ?? ""];
}

describe("critério 9: nenhum segredo em log, resposta de erro ou auditoria (Postgres real)", () => {
  it("senha, temporária, TOTP, recuperação, token de sessão e o segredo do Better Auth não aparecem", async () => {
    const { user, password, secret, enroll } = await enrolled();
    if (!enroll.ok) throw new Error("setup falhou");
    const code = nextCode(secret);
    const responses: unknown[] = [await login({ identifier: user.email, password: `${password}x` }, req())];
    const ok = await verifySecondFactor("totp", { code }, await challenge(user.email, password));
    responses.push(await verifySecondFactor("totp", { code }, await challenge(user.email, password)));
    responses.push(await verifySecondFactor("totp", { code: "000000" }, await challenge(user.email, password)));
    await verifySecondFactor("recovery", { code: enroll.recoveryCodes[0] }, await challenge(user.email, password));
    if (!ok.ok) throw new Error("TOTP recusado");
    // Antes do unlock, que apaga as sessões: os tokens crus que precisam ficar fora de tudo.
    const tokens = (await db.session.findMany({ where: { userId: user.id }, select: { token: true } })).map((s) => s.token);
    expect(tokens.length).toBeGreaterThan(0);
    // Caminho de erro: banco caindo no meio do login, com a senha em voo.
    vi.spyOn(db.authThrottle, "deleteMany").mockRejectedValueOnce(new Error("banco caiu"));
    await login({ identifier: user.email, password }, req()).catch((err: unknown) => responses.push(String(err)));
    const { user: admin } = await account();
    const temp = await issueTempPassword(user.id, { type: "user", id: admin.id });
    const unlocked = await unlockAccount(user.email, "teste", "ops@vps");

    const out = await everywhere(user.id, responses);
    const secrets = [password, temp, unlocked, code, secret, ...enroll.recoveryCodes, ...tokens, ...cookieForms(ok.headers), process.env.BETTER_AUTH_SECRET ?? ""];
    for (const value of secrets.filter((v) => v.length >= 6)) expect(out).not.toContain(value);
  });
});

describe("critério 10: cada pessoa só alcança as próprias sessões (Postgres real)", () => {
  it("listar e encerrar as outras não tocam sessões de outra conta", async () => {
    const a = await enrolled();
    const b = await enrolled();
    if (!a.confirm.ok || !b.confirm.ok) throw new Error("setup falhou");
    const current = await resolveSession(cookieFrom(a.confirm.headers));
    if (!current) throw new Error("sem sessão");
    const bIds = (await db.session.findMany({ where: { userId: b.user.id }, select: { id: true } })).map((s) => s.id);
    expect((await listSessions(a.user.id)).filter((s) => bIds.includes(s.id))).toEqual([]);
    const bBefore = await db.session.count({ where: { userId: b.user.id } });
    await revokeOtherSessions(current);
    expect(await db.session.count({ where: { userId: b.user.id } })).toBe(bBefore);
    expect(await resolveSession(cookieFrom(b.confirm.headers))).not.toBeNull();
  });
});
