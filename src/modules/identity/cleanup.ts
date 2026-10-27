import { db } from "../../lib/db.ts";

// Janela do throttle (15 min) mais o bloqueio mais longo (15 min): linha mais velha que isso não conta mais nada.
const THROTTLE_STALE_MS = 30 * 60 * 1000;

export interface CleanupResult {
  usedTotpCodes: number;
  throttles: number;
  verifications: number;
}

/**
 * Job diário (fila `identity.cleanup`): apaga o que já venceu. Idempotente: rodar de novo, ou duas vezes
 * ao mesmo tempo, só apaga o que sobrou.
 */
export async function cleanupExpired(now = new Date()): Promise<CleanupResult> {
  const stale = new Date(now.getTime() - THROTTLE_STALE_MS);
  const [usedTotpCodes, throttles, verifications] = await Promise.all([
    db.usedTotpCode.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.authThrottle.deleteMany({ where: { updatedAt: { lt: stale }, OR: [{ blockedUntil: null }, { blockedUntil: { lt: now } }] } }),
    db.verification.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);
  return { usedTotpCodes: usedTotpCodes.count, throttles: throttles.count, verifications: verifications.count };
}
