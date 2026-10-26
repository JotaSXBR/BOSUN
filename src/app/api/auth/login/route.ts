import { NextResponse } from "next/server";
import { forbidden, sameOrigin, withCookies } from "@/modules/identity/http.ts";
import { login } from "@/modules/identity/login.ts";

export async function POST(req: Request): Promise<NextResponse> {
  if (!sameOrigin(req)) return forbidden();
  const body: unknown = await req.json().catch(() => null);
  const result = await login(body, req.headers);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
  return withCookies(NextResponse.json({ twoFactorRedirect: result.twoFactorRedirect }), result.headers);
}
