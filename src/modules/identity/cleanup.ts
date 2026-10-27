import { db } from "../../lib/db.ts";

// Toda batida renova updatedAt e o bloqueio mais longo é de 15 min: parada há 30 min, a linha já não conta nada.
const THROTTLE_STALE_MS = 30 * 60 * 1000;

export interface CleanupResult {
  usedTotpCodes: number;
  throttles: number;
  verifications: number;
  sessions: number;
  auditLogs: number;
}

/** Retenção da auditoria (Marco Civil, art. 15): 6 meses. O trigger do banco recusa apagar antes disso. */
export const AUDIT_RETENTION_MONTHS = 6;

/**
 * Job diário (fila `identity.cleanup`): apaga o que já venceu, inclusive sessões vencidas (guardam IP e navegador). Idempotente: rodar de novo, ou duas vezes
 * ao mesmo tempo, só apaga o que sobrou.
 */
export async function cleanupExpired(now = new Date()): Promise<CleanupResult> {
  const stale = new Date(now.getTime() - THROTTLE_STALE_MS);
  const auditCutoff = new Date(now);
  auditCutoff.setMonth(auditCutoff.getMonth() - AUDIT_RETENTION_MONTHS);
  // Um dia de folga: o trigger compara com o relógio do banco (`now() - interval '6 months'`).
  auditCutoff.setDate(auditCutoff.getDate() - 1);
  const [usedTotpCodes, throttles, verifications, sessions, auditLogs] = await Promise.all([
    db.usedTotpCode.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.authThrottle.deleteMany({ where: { updatedAt: { lt: stale }, OR: [{ blockedUntil: null }, { blockedUntil: { lt: now } }] } }),
    db.verification.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.auditLog.deleteMany({ where: { createdAt: { lt: auditCutoff } } }),
  ]);
  return { usedTotpCodes: usedTotpCodes.count, throttles: throttles.count, verifications: verifications.count, sessions: sessions.count, auditLogs: auditLogs.count };
}
