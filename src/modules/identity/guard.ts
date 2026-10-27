import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { type AuthSession, resolveSession } from "./session.ts";

// Uma consulta por requisição, mesmo com layout, página e dados chamando.
const currentSession = cache(async () => resolveSession(await headers()));

/**
 * Toda página, server action e rota autenticada chama isto (o layout não re-renderiza na navegação
 * do cliente, então não protege sozinho). Sem sessão válida, volta ao login.
 */
export async function requireSession(): Promise<AuthSession> {
  const current = await currentSession();
  if (!current) redirect("/login");
  return current;
}

/** Área principal: além da sessão, a troca forçada de senha e o 2FA obrigatório já feitos. */
export async function requireReadySession(): Promise<AuthSession> {
  const current = await requireSession();
  if (current.user.mustChangePassword) redirect("/change-password");
  if (!current.user.twoFactorEnabled) redirect("/setup/2fa");
  return current;
}
