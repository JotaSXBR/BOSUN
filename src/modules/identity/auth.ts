import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins/username";
import { db } from "../../lib/db.ts";
import { hashPassword, verifyPassword } from "./password.ts";
import { authSecret } from "./secret.ts";

export const SESSION_IDLE_S = 12 * 60 * 60;
export const MAX_SESSIONS = 5;

/** Mantém só as 5 sessões mais novas do usuário, numa instrução (ADR-102). */
export async function trimSessions(userId: string): Promise<void> {
  await db.$executeRaw`
    DELETE FROM session WHERE "userId" = ${userId}::uuid AND id NOT IN (
      SELECT id FROM session WHERE "userId" = ${userId}::uuid ORDER BY "createdAt" DESC, id DESC LIMIT ${MAX_SESSIONS}
    )`;
}

// Sem rota catch-all: a UI só fala com as nossas rotas, que chamam auth.api no servidor.
// Assim nenhuma rota nativa (sign-up, reset, change-password, 2FA) fica exposta.
export const auth = betterAuth({
  appName: "BOSUN",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: authSecret(),
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 1024,
    password: { hash: hashPassword, verify: ({ hash, password }) => verifyPassword(hash, password) },
  },
  user: {
    additionalFields: {
      mustChangePassword: { type: "boolean", defaultValue: false, input: false },
      tempPasswordExpiresAt: { type: "date", required: false, input: false },
    },
  },
  session: {
    expiresIn: SESSION_IDLE_S,
    updateAge: 5 * 60,
    freshAge: 10 * 60,
    // Desligado: revogar (apagar a linha) vale na requisição seguinte.
    cookieCache: { enabled: false },
  },
  advanced: {
    cookiePrefix: "bosun",
    useSecureCookies: process.env.NODE_ENV === "production",
    database: { generateId: "uuid" },
  },
  databaseHooks: {
    session: { create: { after: (session) => trimSessions(session.userId) } },
  },
  plugins: [username({ minUsernameLength: 3, maxUsernameLength: 32, displayUsername: false })],
});
