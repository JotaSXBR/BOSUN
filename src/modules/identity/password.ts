import { randomBytes } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { logger } from "../../lib/logger.ts";
import { COMMON_PASSWORDS } from "./common-passwords.ts";

// Argon2id é o padrão da lib; parâmetros do ADR-102 (64 MiB, 3 iterações, 4 lanes, 32 bytes).
const ARGON2 = { memoryCost: 65_536, timeCost: 3, parallelism: 4, outputLen: 32 } as const;

const MIN_LENGTH = 12;
const MAX_LENGTH = 128;
const CONTEXT_WORDS = ["bosun", "admin", "workspace", "piloto", "senha"];
// Pedaços curtos (ex.: "ana") recusariam senhas boas demais.
const MIN_CONTEXT_PART = 4;

// Teto em unidades UTF-16 antes de segmentar: corta entrada enorme e grafemas com marcas sem fim.
const MAX_CODE_UNITS = MAX_LENGTH * 8;

export type PasswordPolicyError = "too_short" | "too_long" | "common" | "context" | "same_as_current";

export interface PasswordContext {
  username?: string | null;
  email?: string | null;
}

/** null = senha aceita. Sem regra de composição nem normalização (ADR-102). */
export function checkPasswordPolicy(password: string, ctx: PasswordContext): PasswordPolicyError | null {
  if (password.length > MAX_CODE_UNITS) return "too_long";
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

/** Política + a nova não pode ser igual à atual (comparada pelo hash). */
export async function checkNewPassword(
  password: string,
  ctx: PasswordContext,
  currentHash: string,
): Promise<PasswordPolicyError | null> {
  const error = checkPasswordPolicy(password, ctx);
  if (error) return error;
  return (await verifyPassword(currentHash, password)) ? "same_as_current" : null;
}

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch (err) {
    // Hash corrompido ou falha do Argon2: falha fechada, com rastro sem dado sensível.
    logger.error("identity", "verificação de senha falhou", err);
    return false;
  }
}

/** 20 caracteres base64url, mostrados uma vez (ADR-102). */
export function generateTempPassword(): string {
  return randomBytes(15).toString("base64url");
}
