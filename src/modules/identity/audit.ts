import type { Prisma } from "../../generated/prisma/client.ts";

// Qualquer chave com estes pedaços some antes de gravar: auditoria nunca guarda segredo.
const SECRET_KEY = /pass|secret|token|code|cookie|otp/i;

export type AuditActor = { type: "user"; id: string } | { type: "operator" } | { type: "system" };

export interface AuditEvent {
  actor: AuditActor;
  action: string;
  targetType?: string;
  targetId?: string;
  workspaceId?: string;
  data?: Record<string, unknown>;
}

type AuditWriter = Pick<Prisma.TransactionClient, "auditLog">;

export function sanitizeAuditData(value: unknown): Prisma.InputJsonValue {
  if (Array.isArray(value)) return value.map(sanitizeAuditData);
  if (value !== null && typeof value === "object") {
    const out: Record<string, Prisma.InputJsonValue> = {};
    for (const [key, v] of Object.entries(value)) if (!SECRET_KEY.test(key)) out[key] = sanitizeAuditData(v);
    return out;
  }
  // O Json do Prisma não aceita null aninhado; vazio vira "".
  return value ?? "";
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
      data: sanitizeAuditData(event.data ?? {}),
    },
  });
}
