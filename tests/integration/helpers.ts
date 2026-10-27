import { randomUUID } from "node:crypto";
import { db } from "@/lib/db.ts";
import { createAccount } from "@/modules/identity/accounts.ts";
import { login } from "@/modules/identity/login.ts";
import { resolveSession } from "@/modules/identity/session.ts";
import { enrollTotp, verifySecondFactor } from "@/modules/identity/totp.ts";
import { totpCode } from "../totp.ts";

// Tudo aleatório por teste: o bosun_test persiste entre execuções e o throttle dura 15 min.
export const tag = () => randomUUID().slice(0, 8);

export async function account(username = `u${tag()}`) {
  const { user, tempPassword } = await createAccount({ username, email: `${username}@test.local`, name: "Teste" }, { type: "operator" });
  return { user, password: tempPassword };
}

const octet = () => Math.floor(Math.random() * 250);
export const randomIp = () => `10.${octet()}.${octet()}.${octet()}`;

export function req(ip: string | null = randomIp()) {
  return new Headers(ip ? { "x-forwarded-for": ip, "user-agent": "vitest" } : { "user-agent": "vitest" });
}

/** Cookies de uma resposta (Set-Cookie) como cabeçalho Cookie da próxima requisição, com o mesmo IP. */
export function cookieFrom(headers: Headers, base = req()): Headers {
  const out = new Headers(base);
  out.set("cookie", headers.getSetCookie().map((c) => c.split(";")[0]).join("; "));
  return out;
}

// Em sequência de propósito: cada tentativa muda o contador que a próxima lê.
export function times(n: number, fn: () => Promise<unknown>): Promise<unknown> {
  return Array.from({ length: n }).reduce<Promise<unknown>>((prev) => prev.then(fn), Promise.resolve());
}

/** Sessão aberta de uma conta com a troca de senha já feita (o setup do 2FA vem depois dela). */
export async function readyToEnroll() {
  const { user, password } = await account();
  await db.user.update({ where: { id: user.id }, data: { mustChangePassword: false, tempPasswordExpiresAt: null } });
  const res = await login({ identifier: user.email, password }, req());
  if (!res.ok) throw new Error("login falhou");
  const cookie = cookieFrom(res.headers);
  const current = await resolveSession(cookie);
  if (!current) throw new Error("sem sessão");
  return { user, password, cookie, current };
}

export async function enrolled() {
  const ready = await readyToEnroll();
  const enroll = await enrollTotp(ready.current, { password: ready.password }, ready.cookie);
  if (!enroll.ok) throw new Error("setup falhou");
  const secret = enroll.secret.replaceAll(" ", "");
  const confirm = await verifySecondFactor("totp", { code: totpCode(secret) }, ready.cookie);
  return { ...ready, enroll, secret, confirm };
}

/** Login com senha numa conta com 2FA: devolve o cookie de desafio (com o mesmo IP). */
export async function challenge(email: string, password: string): Promise<Headers> {
  const ip = randomIp();
  const res = await login({ identifier: email, password }, req(ip));
  if (!res.ok || !res.twoFactorRedirect) throw new Error("sem desafio");
  return cookieFrom(res.headers, req(ip));
}

// O código do setup já foi usado; o seguinte (aceito pela janela de ±30 s) é outro.
export const nextCode = (secret: string) => totpCode(secret, Date.now() + 30_000);

