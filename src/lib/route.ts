import { NextResponse } from "next/server";
import { Prisma } from "../generated/prisma/client.ts";
import { logger } from "./logger.ts";

// Banco inalcançável, tempo esgotado, conexão fechada (códigos do Prisma).
const UNAVAILABLE = new Set(["P1001", "P1002", "P1017"]);
// Consultas cruas ($queryRaw) pelo adapter pg falham com P2010 e o motivo em meta.driverAdapterError.cause.kind.
const ADAPTER_UNAVAILABLE = new Set(["DatabaseNotReachable", "ConnectionClosed", "SocketTimeout", "TooManyConnections"]);

function adapterKind(err: Prisma.PrismaClientKnownRequestError): unknown {
  const adapter: unknown = err.meta?.driverAdapterError;
  if (adapter === null || typeof adapter !== "object") return undefined;
  const cause: unknown = Reflect.get(adapter, "cause");
  return cause !== null && typeof cause === "object" ? Reflect.get(cause, "kind") : undefined;
}

/** O erro (ou a causa dele, quando o Better Auth embrulha) é o banco fora do ar? */
export function isDbUnavailable(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const kind = adapterKind(err);
    return UNAVAILABLE.has(err.code) || (err.code === "P2010" && typeof kind === "string" && ADAPTER_UNAVAILABLE.has(kind));
  }
  return err instanceof Error && err.cause !== undefined && err.cause !== err && isDbUnavailable(err.cause);
}

/** Rota nossa: banco fora do ar vira 503 genérico (sem detalhe do erro); o resto segue para o 500 do Next. */
export function guarded<A extends unknown[]>(handler: (...args: A) => Promise<Response>): (...args: A) => Promise<Response> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (!isDbUnavailable(err)) throw err;
      logger.error("http", "banco indisponível", err);
      return NextResponse.json({ error: "Serviço indisponível. Tente de novo em instantes." }, { status: 503, headers: { "retry-after": "5" } });
    }
  };
}
