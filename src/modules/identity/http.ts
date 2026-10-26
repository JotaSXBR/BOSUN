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

const MAX_BODY = 8 * 1024;

/**
 * Corpo JSON de uma mutação nossa, até 8 KB (recusa pelo Content-Length e, sem ele, pelo texto lido).
 * Devolve a resposta de erro pronta quando não passa; JSON inválido vira `null` para o zod recusar.
 */
export async function readJson(req: Request): Promise<{ body: unknown } | NextResponse> {
  const tooLarge = () => NextResponse.json({ error: "Corpo grande demais" }, { status: 413 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY) return tooLarge();
  const text = await req.text();
  if (text.length > MAX_BODY) return tooLarge();
  try {
    return { body: JSON.parse(text) };
  } catch {
    return { body: null };
  }
}
