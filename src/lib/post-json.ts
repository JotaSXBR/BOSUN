export type PostResult = { ok: true; body: unknown } | { ok: false; error: string; code?: string };

function stringField(body: unknown, key: string): string | undefined {
  if (body === null || typeof body !== "object") return undefined;
  const value: unknown = Reflect.get(body, key);
  return typeof value === "string" ? value : undefined;
}

/**
 * POST JSON das telas para as nossas rotas. Devolve o corpo em sucesso ou a mensagem de erro para mostrar,
 * com o `code` quando a rota manda um código de máquina (ex.: `SESSION_NOT_FRESH`).
 */
export async function postJson(url: string, data: unknown): Promise<PostResult> {
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
  } catch {
    return { ok: false, error: "Sem conexão. Tente de novo." };
  }
  const body: unknown = await res.json().catch(() => ({}));
  if (res.ok) return { ok: true, body };
  const error = stringField(body, "error") ?? "Algo deu errado. Tente de novo.";
  const code = stringField(body, "code");
  return code ? { ok: false, error, code } : { ok: false, error };
}
