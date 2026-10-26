import { NextResponse } from "next/server";
import { forbidden, sameOrigin, withCookies } from "@/modules/identity/http.ts";
import { logout } from "@/modules/identity/login.ts";

// Recebe o <form> do cabeçalho; 303 leva o navegador ao login com GET.
// Base no BETTER_AUTH_URL: atrás do proxy o req.url traz o host interno.
export async function POST(req: Request): Promise<NextResponse> {
  if (!sameOrigin(req)) return forbidden();
  const cleared = await logout(req.headers);
  return withCookies(NextResponse.redirect(new URL("/login", process.env.BETTER_AUTH_URL), 303), cleared);
}
