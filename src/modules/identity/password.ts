import { randomBytes } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { COMMON_PASSWORDS } from "./common-passwords.ts";

// Argon2id é o padrão da lib; parâmetros do ADR-102 (64 MiB, 3 iterações, 4 lanes, 32 bytes).
const ARGON2 = { memoryCost: 65_536, timeCost: 3, parallelism: 4, outputLen: 32 } as const;

const MIN_LENGTH = 12;
const MAX_LENGTH = 128;
const CONTEXT_WORDS = ["bosun", "admin", "workspace", "piloto", "senha"];
// Pedaços curtos (ex.: "ana") recusariam senhas boas demais.
const MIN_CONTEXT_PART = 4;

export type PasswordPolicyError = "too_short" | "too_long" | "common" | "context";

export interface PasswordContext {
  username?: string | null;
  email?: string | null;
}

/** null = senha aceita. Sem regra de composição nem normalização (ADR-102). */
export function checkPasswordPolicy(password: string, ctx: PasswordContext): PasswordPolicyError | null {
  // Conta o que a pessoa vê como caractere (emoji = 1).
  const length = [...new Intl.Segmenter().segment(password)].length;
  if (length < MIN_LENGTH) return "too_short";
  if (length > MAX_LENGTH) return "too_long";
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) return "common";
  const parts = [...CONTEXT_WORDS, ctx.username, ctx.email?.split("@")[0]];
  const hit = parts.some((p) => p && p.length >= MIN_CONTEXT_PART && lower.includes(p.toLowerCase()));
  return hit ? "context" : null;
}

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    // Hash corrompido ou de outro formato: falha fechada.
    return false;
  }
}

/** 20 caracteres base64url, mostrados uma vez (ADR-102). */
export function generateTempPassword(): string {
  return randomBytes(15).toString("base64url");
}
