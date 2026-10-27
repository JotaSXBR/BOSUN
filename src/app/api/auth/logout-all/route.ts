import { NextResponse } from "next/server";
import { guarded } from "@/lib/route.ts";
import { auth } from "@/modules/identity/auth.ts";
import { formSession, withCookies } from "@/modules/identity/http.ts";
import { revokeAllSessions } from "@/modules/identity/session.ts";

// Sair de todos: apaga todas as sessões (inclusive esta), limpa o cookie e volta ao login.
export const POST = guarded(async (req: Request): Promise<NextResponse> => {
  const current = await formSession(req);
  if (current instanceof NextResponse) return current;
  await revokeAllSessions(current);
  // A sessão já não existe; o signOut só devolve os cabeçalhos que limpam o cookie.
  const { headers } = await auth.api.signOut({ headers: req.headers, returnHeaders: true });
  return withCookies(NextResponse.redirect(new URL("/login", process.env.BETTER_AUTH_URL), 303), headers);
});
