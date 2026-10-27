import { db } from "../../lib/db.ts";

// Mesma validade do desafio do plugin (10 min).
const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const PREFIX = "bosun-cv-";

/**
 * Identificador do desafio de 2FA a partir de cookies "nome=valor" (Set-Cookie ou Cookie).
 * O valor é `encodeURIComponent("<id>.<assinatura>")`; a assinatura é conferida pelo plugin, não aqui.
 */
export function challengeId(cookies: string[]): string | null {
  for (const cookie of cookies) {
    const [pair = ""] = cookie.split(";");
    const eq = pair.indexOf("=");
    if (eq < 0 || !pair.slice(0, eq).trim().endsWith(".two_factor")) continue;
    const value = decodeURIComponent(pair.slice(eq + 1).trim());
    const dot = value.lastIndexOf(".");
    if (dot > 0) return value.slice(0, dot);
  }
  return null;
}

/** Cabeçalho Cookie como lista de "nome=valor". */
export const requestCookies = (headers: Headers): string[] => (headers.get("cookie") ?? "").split(";");

/** Guarda a versão da credencial com que o desafio foi emitido (a senha conferida no login). */
export async function bindChallenge(out: Headers, version: number): Promise<void> {
  const id = challengeId(out.getSetCookie());
  if (!id) throw new Error("2FA: desafio sem cookie");
  await db.verification.create({ data: { identifier: `${PREFIX}${id}`, value: String(version), expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS) } });
}

/**
 * A credencial ainda é a do desafio? Lê e apaga o vínculo (uso único, como o desafio). Sem vínculo, falha fechado:
 * um desafio de antes desta regra, ou cuja senha mudou depois de emitido, não vira sessão.
 */
export async function challengeStillValid(userId: string, headers: Headers): Promise<boolean> {
  const id = challengeId(requestCookies(headers));
  if (!id) return false;
  const rows = await db.verification.findMany({ where: { identifier: `${PREFIX}${id}` }, select: { value: true } });
  await db.verification.deleteMany({ where: { identifier: `${PREFIX}${id}` } });
  const user = await db.user.findUnique({ where: { id: userId }, select: { credentialsVersion: true } });
  return rows.length === 1 && user !== null && rows[0]?.value === String(user.credentialsVersion);
}
