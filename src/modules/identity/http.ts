import { NextResponse } from "next/server";

/** Mutação só do próprio site (CSRF): Origin igual ao BETTER_AUTH_URL. */
export function sameOrigin(req: Request): boolean {
  const expected = process.env.BETTER_AUTH_URL;
  return Boolean(expected) && req.headers.get("origin") === new URL(expected ?? "").origin;
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: "Origem não permitida" }, { status: 403 });
}

/** Repassa os Set-Cookie do Better Auth para a resposta. */
export function withCookies<T extends Response>(res: T, from: Headers): T {
  for (const cookie of from.getSetCookie()) res.headers.append("set-cookie", cookie);
  return res;
}
