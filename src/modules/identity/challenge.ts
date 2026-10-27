import { db } from "../../lib/db.ts";
import { TWO_FACTOR_COOKIE } from "./auth.ts";

// Mesma validade do desafio do plugin (10 min).
const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const PREFIX = "bosun-cv-";

function tryDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/**
 * Identificador do desafio de 2FA a partir de cookies "nome=valor" (Set-Cookie ou Cookie), com a mesma regra
 * do plugin (better-call): nome exato, primeira ocorrência, aspas retiradas. O valor é
 * `encodeURIComponent("<id>.<assinatura>")`; a assinatura é conferida pelo plugin, antes de qualquer uso aqui.
 */
export function challengeId(cookies: string[], name = TWO_FACTOR_COOKIE): string | null {
  for (const cookie of cookies) {
    const [pair = ""] = cookie.split(";");
    const eq = pair.indexOf("=");
    if (eq < 0 || pair.slice(0, eq).trim() !== name) continue;
    const raw = pair.slice(eq + 1).trim().replace(/^"(.*)"$/, "$1");
    const value = tryDecode(raw) ?? "";
    const dot = value.lastIndexOf(".");
    return dot > 0 ? value.slice(0, dot) : null;
  }
  return null;
}

/** Cabeçalho Cookie como lista de "nome=valor". */
export const requestCookies = (headers: Headers): string[] => (headers.get("cookie") ?? "").split(";");

const bond = (userId: string, version: number) => `${userId}:${version}`;

/** Guarda quem e com que versão da credencial o desafio foi emitido (a senha conferida no login). */
export async function bindChallenge(out: Headers, userId: string, version: number): Promise<void> {
  const id = challengeId(out.getSetCookie());
  if (!id) throw new Error("2FA: desafio sem cookie");
  await db.verification.create({ data: { identifier: `${PREFIX}${id}`, value: bond(userId, version), expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS) } });
}

/**
 * O desafio é desta pessoa e a credencial ainda é a mesma? Apaga o vínculo e confere numa instrução (uso único).
 * Sem vínculo, falha fechado: desafio de antes desta regra, de outra conta ou cuja senha mudou não vira sessão.
 */
export async function challengeStillValid(userId: string, headers: Headers): Promise<boolean> {
  const id = challengeId(requestCookies(headers));
  if (!id) return false;
  const rows = await db.$queryRaw<{ value: string }[]>`
    DELETE FROM verification WHERE identifier = ${`${PREFIX}${id}`} RETURNING value`;
  const user = await db.user.findUnique({ where: { id: userId }, select: { credentialsVersion: true } });
  return rows.length === 1 && user !== null && rows[0]?.value === bond(userId, user.credentialsVersion);
}
