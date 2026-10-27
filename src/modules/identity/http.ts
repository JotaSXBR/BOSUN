import { NextResponse } from "next/server";
import { type AuthSession, isFresh, resolveSession } from "./session.ts";

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

/** Mutação autenticada: Origin, sessão (com o teto de 7 dias) e corpo JSON. Devolve o erro pronto quando não passa. */
export async function readAuthed(req: Request): Promise<{ current: AuthSession; body: unknown } | NextResponse> {
  if (!sameOrigin(req)) return forbidden();
  const current = await resolveSession(req.headers);
  if (!current) return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });
  const read = await readJson(req);
  if (read instanceof NextResponse) return read;
  return { current, body: read.body };
}

/** Rota da área principal: como `readAuthed`, mas recusa quem ainda não trocou a senha ou não ligou o 2FA. */
export async function readReady(req: Request): Promise<{ current: AuthSession; body: unknown } | NextResponse> {
  const read = await readAuthed(req);
  if (read instanceof NextResponse) return read;
  if (!isReady(read.current)) return NextResponse.json({ error: "Conclua o primeiro acesso." }, { status: 403 });
  return read;
}

/** Primeiro acesso concluído: senha trocada e 2FA ligado (mesma regra do `requireReadySession`). */
function isReady(current: AuthSession): boolean {
  return !current.user.mustChangePassword && current.user.twoFactorEnabled === true;
}

/**
 * Ação sensível (o `requireFreshSession()` da spec): `readReady` + sessão recente de 10 min.
 * Fora disso, 403 `SESSION_NOT_FRESH` e a tela faz o step-up.
 */
export async function readFresh(req: Request): Promise<{ current: AuthSession; body: unknown } | NextResponse> {
  const read = await readReady(req);
  if (read instanceof NextResponse || isFresh(read.current)) return read;
  return notFresh();
}

/** Ação sensível com sessão de mais de 10 min (ADR-102): a tela pede senha e código e repete. */
export function notFresh(): NextResponse {
  return NextResponse.json({ error: "Confirme a senha e o código para continuar.", code: "SESSION_NOT_FRESH" }, { status: 403 });
}

/** Set-Cookie de uma resposta do Better Auth como cabeçalho Cookie de uma chamada seguinte no servidor. */
export function cookieHeader(from: Headers): string {
  return from.getSetCookie().map((c) => c.split(";")[0]).join("; ");
}

/** Mutação por <form> HTML (sem JSON): Origin, sessão e primeiro acesso concluído. Devolve o erro pronto quando não passa. */
export async function formSession(req: Request): Promise<AuthSession | NextResponse> {
  if (!sameOrigin(req)) return forbidden();
  const current = await resolveSession(req.headers);
  if (!current) return NextResponse.redirect(new URL("/login", process.env.BETTER_AUTH_URL), 303);
  // Primeiro acesso pendente: a página inicial manda para a troca de senha ou o setup do 2FA.
  return isReady(current) ? current : NextResponse.redirect(new URL("/", process.env.BETTER_AUTH_URL), 303);
}
