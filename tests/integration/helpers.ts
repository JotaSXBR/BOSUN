import { randomUUID } from "node:crypto";
import { createAccount } from "@/modules/identity/accounts.ts";

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
