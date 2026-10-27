import { db } from "../../lib/db.ts";

// Toda batida renova updatedAt e o bloqueio mais longo é de 15 min: parada há 30 min, a linha já não conta nada.
const THROTTLE_STALE_MS = 30 * 60 * 1000;

export interface CleanupResult {
  usedTotpCodes: number;
  throttles: number;
  verifications: number;
  sessions: number;
}

/**
 * Job diário (fila `identity.cleanup`): apaga o que já venceu, inclusive sessões vencidas (guardam IP e navegador). Idempotente: rodar de novo, ou duas vezes
 * ao mesmo tempo, só apaga o que sobrou.
 */
export async function cleanupExpired(now = new Date()): Promise<CleanupResult> {
  const stale = new Date(now.getTime() - THROTTLE_STALE_MS);
  const [usedTotpCodes, throttles, verifications, sessions] = await Promise.all([
    db.usedTotpCode.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.authThrottle.deleteMany({ where: { updatedAt: { lt: stale }, OR: [{ blockedUntil: null }, { blockedUntil: { lt: now } }] } }),
    db.verification.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.session.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);
  return { usedTotpCodes: usedTotpCodes.count, throttles: throttles.count, verifications: verifications.count, sessions: sessions.count };
}
