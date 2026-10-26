import { NextResponse } from "next/server";
import { forbidden, sameOrigin, withCookies } from "@/modules/identity/http.ts";
import { login } from "@/modules/identity/login.ts";

const MAX_BODY = 8 * 1024;

function tooLarge(): NextResponse {
  return NextResponse.json({ error: "Corpo grande demais" }, { status: 413 });
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  if (!sameOrigin(req)) return forbidden();
  // Login cabe em poucos bytes: recusa pelo Content-Length e, sem ele, pelo texto lido.
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY) return tooLarge();
  const text = await req.text();
  if (text.length > MAX_BODY) return tooLarge();
  const body = parseJson(text);
  const result = await login(body, req.headers);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
  return withCookies(NextResponse.json({ twoFactorRedirect: result.twoFactorRedirect }), result.headers);
}
