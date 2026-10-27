import { createHmac } from "node:crypto";

/** Segredo do Better Auth; também cifra o 2FA, então nunca rotacione sem plano (ADR-102). */
export function authSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("BETTER_AUTH_SECRET ausente ou com menos de 32 caracteres");
  return secret;
}

/** HMAC-SHA-256 em hex: guarda referência a um valor sem guardar o valor. */
export function hmac(value: string): string {
  return createHmac("sha256", authSecret()).update(value).digest("hex");
}
