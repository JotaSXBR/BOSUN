import { NextResponse } from "next/server";
import { forbidden, sameOrigin, withCookies } from "@/modules/identity/http.ts";
import { logout } from "@/modules/identity/login.ts";

// Recebe o <form> do cabeçalho; 303 leva o navegador ao login com GET.
export async function POST(req: Request): Promise<NextResponse> {
  if (!sameOrigin(req)) return forbidden();
  const cleared = await logout(req.headers);
  return withCookies(NextResponse.redirect(new URL("/login", req.url), 303), cleared);
}
