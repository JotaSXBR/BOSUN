import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type AuthSession, resolveSession } from "./session.ts";

/** Página autenticada: sem sessão válida, volta ao login. */
export async function requireSession(): Promise<AuthSession> {
  const current = await resolveSession(await headers());
  if (!current) redirect("/login");
  return current;
}
