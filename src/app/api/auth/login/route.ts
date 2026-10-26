import { NextResponse } from "next/server";
import { forbidden, readJson, sameOrigin, withCookies } from "@/modules/identity/http.ts";
import { login } from "@/modules/identity/login.ts";

export async function POST(req: Request): Promise<NextResponse> {
  if (!sameOrigin(req)) return forbidden();
  const read = await readJson(req);
  if (read instanceof NextResponse) return read;
  const result = await login(read.body, req.headers);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
  return withCookies(NextResponse.json({ twoFactorRedirect: result.twoFactorRedirect }), result.headers);
}
