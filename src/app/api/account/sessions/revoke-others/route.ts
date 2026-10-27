import { NextResponse } from "next/server";
import { formSession } from "@/modules/identity/http.ts";
import { revokeOtherSessions } from "@/modules/identity/session.ts";

// Recebe o <form> da tela de segurança; 303 volta a ela com GET.
export async function POST(req: Request): Promise<NextResponse> {
  const current = await formSession(req);
  if (current instanceof NextResponse) return current;
  await revokeOtherSessions(current);
  return NextResponse.redirect(new URL("/security", process.env.BETTER_AUTH_URL), 303);
}
