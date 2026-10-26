import type { Prisma } from "../../generated/prisma/client.ts";

// Qualquer chave com estes pedaços some antes de gravar: auditoria nunca guarda segredo.
// Rede de segurança, não licença: quem chama passa só o necessário. Remove até falso positivo (statusCode).
const SECRET_KEY = /pass|pwd|secret|token|code|cookie|otp|authorization|bearer|jwt|credential|api.?key|private.?key/i;

export type AuditAction =
  | "auth.account.created"
  | "auth.login.failed"
  | "auth.login.succeeded"
  | "auth.2fa.challenge"
  | "auth.2fa.succeeded"
  | "auth.2fa.failed"
  | "auth.2fa.replayed"
  | "auth.2fa.enrolled"
  | "auth.2fa.reset"
  | "auth.recovery_code.used"
  | "auth.password.changed"
  | "auth.password.change_failed"
  | "auth.password.temp_issued"
  | "auth.password.reset_requested"
  | "auth.session.revoked"
  | "auth.session.absolute_expired"
  | "auth.rate_limited"
  | "auth.logout"
  | "auth.logout_all"
  | "auth.step_up.succeeded"
  | "auth.step_up.failed";

export type AuditActor = { type: "user"; id: string } | { type: "operator" } | { type: "system" };

export interface AuditEvent {
  actor: AuditActor;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  workspaceId?: string;
  data?: Record<string, unknown>;
}

type AuditWriter = Pick<Prisma.TransactionClient, "auditLog">;

type JsonOut = Prisma.InputJsonValue | null;

export function sanitizeAuditData(value: unknown): JsonOut {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(sanitizeAuditData);
  if (value !== null && typeof value === "object") {
    const out: Record<string, JsonOut> = {};
    for (const [key, v] of Object.entries(value)) {
      if (v !== undefined && !SECRET_KEY.test(key)) out[key] = sanitizeAuditData(v);
    }
    return out;
  }
  if (typeof value === "bigint") return value.toString();
  return value ?? null;
}

/** Grava um evento. Passe o `tx` da transação quando o evento acompanha uma mudança de estado. */
export async function writeAudit(writer: AuditWriter, event: AuditEvent): Promise<void> {
  await writer.auditLog.create({
    data: {
      actorType: event.actor.type,
      actorId: event.actor.type === "user" ? event.actor.id : null,
      action: event.action,
      targetType: event.targetType,
      targetId: event.targetId,
      workspaceId: event.workspaceId,
      data: sanitizeAuditData(event.data ?? {}) ?? {},
    },
  });
}
