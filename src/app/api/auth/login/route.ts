import { NextResponse } from "next/server";
import { guarded } from "@/lib/route.ts";
import { readPublic, withCookies } from "@/modules/identity/http.ts";
import { login } from "@/modules/identity/login.ts";

export const POST = guarded(async (req: Request): Promise<NextResponse> => {
  const read = await readPublic(req);
  if (read instanceof NextResponse) return read;
  const result = await login(read.body, req.headers);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
  return withCookies(NextResponse.json({ twoFactorRedirect: result.twoFactorRedirect }), result.headers);
});
