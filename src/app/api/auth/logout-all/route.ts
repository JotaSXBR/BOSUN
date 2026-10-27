import { NextResponse } from "next/server";
import { guarded } from "@/lib/route.ts";
import { formSession, withCookies } from "@/modules/identity/http.ts";
import { revokeAllSessions } from "@/modules/identity/session.ts";

// Sair de todos: apaga todas as sessões (inclusive esta), limpa o cookie e volta ao login.
export const POST = guarded(async (req: Request): Promise<NextResponse> => {
  const current = await formSession(req);
  if (current instanceof NextResponse) return current;
  const cleared = await revokeAllSessions(current, req.headers);
  return withCookies(NextResponse.redirect(new URL("/login", process.env.BETTER_AUTH_URL), 303), cleared);
});
