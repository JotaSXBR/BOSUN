import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as stepUpPost } from "@/app/api/auth/step-up/route.ts";
import { db } from "@/lib/db.ts";
import { login } from "@/modules/identity/login.ts";
import { verifySecondFactor } from "@/modules/identity/totp.ts";
import { account, challenge, cookieFrom, enrolled, nextCode, req, times } from "./helpers.ts";

const ORIGIN = "http://localhost:3000";

beforeEach(() => vi.stubEnv("BETTER_AUTH_URL", ORIGIN));
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
afterAll(() => db.$disconnect());

const sessions = (userId: string) => db.session.count({ where: { userId } });
const wrongOf = (code: string) => String((Number(code) + 1) % 1_000_000).padStart(6, "0");

/** Um desafio novo com 5 códigos errados (o limite do desafio). */
async function failChallenge(email: string, password: string, wrong: string): Promise<void> {
  const cookie = await challenge(email, password);
  await times(5, () => verifySecondFactor("totp", { code: wrong }, cookie));
}

function stepUp(cookie: Headers, body: unknown) {
  const headers = new Headers(cookie);
  headers.set("origin", ORIGIN);
  return stepUpPost(new Request(`${ORIGIN}/api/auth/step-up`, { method: "POST", headers, body: JSON.stringify(body) }));
}

describe("caminhos de erro do login (Postgres real)", () => {
  it("falha de banco depois de a sessão nascer: a sessão é apagada e o erro sobe", async () => {
    const { user, password } = await account();
    vi.spyOn(db.authThrottle, "deleteMany").mockRejectedValueOnce(new Error("banco caiu"));
    await expect(login({ identifier: user.email, password }, req())).rejects.toThrow("banco caiu");
    expect(await sessions(user.id)).toBe(0);
  });

  it("auditoria que falha não derruba o login (best-effort, vai para o logger)", async () => {
    const { user, password } = await account();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(db.auditLog, "create").mockRejectedValue(new Error("auditoria fora"));
    expect((await login({ identifier: user.email, password }, req())).ok).toBe(true);
  });
});

describe("caminhos de erro do 2FA (Postgres real)", () => {
  it("falha depois de o plugin criar a sessão: a sessão não fica órfã", async () => {
    const { user, password, secret } = await enrolled();
    const cookie = await challenge(user.email, password);
    const before = await sessions(user.id);
    vi.spyOn(db.usedTotpCode, "createMany").mockRejectedValueOnce(new Error("banco caiu"));
    await expect(verifySecondFactor("totp", { code: nextCode(secret) }, cookie)).rejects.toThrow("banco caiu");
    expect(await sessions(user.id)).toBe(before);
  });

  it("10 códigos errados na conta (em dois desafios) bloqueiam: o próximo, mesmo certo, dá 429", async () => {
    const { user, password, secret } = await enrolled();
    const wrong = wrongOf(nextCode(secret));
    // Em sequência: 5 erros por desafio (limite do desafio), dois desafios = 10 na conta.
    await times(2, () => failChallenge(user.email, password, wrong));
    const res = await verifySecondFactor("totp", { code: nextCode(secret) }, await challenge(user.email, password));
    expect(res).toMatchObject({ ok: false, status: 429 });
    expect(await db.auditLog.count({ where: { actorType: "system", action: "auth.rate_limited", data: { path: ["scope"], equals: "2fa-account" } } })).toBeGreaterThan(0);
  });
});

describe("caminhos de erro do step-up (Postgres real)", () => {
  it("corpo inválido dá 400; senha errada repetida bloqueia com 429", async () => {
    const { confirm } = await enrolled();
    if (!confirm.ok) throw new Error("setup falhou");
    const cookie = cookieFrom(confirm.headers);
    expect((await stepUp(cookie, { password: "" })).status).toBe(400);
    await times(5, () => stepUp(cookie, { password: "senha errada bem longa", code: "123456" }));
    expect((await stepUp(cookie, { password: "senha errada bem longa", code: "123456" })).status).toBe(429);
  });
});
