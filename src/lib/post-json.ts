/** POST JSON das telas para as nossas rotas. Devolve o corpo em sucesso ou a mensagem de erro para mostrar. */
export async function postJson(url: string, data: unknown): Promise<{ ok: true; body: unknown } | { ok: false; error: string }> {
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
  } catch {
    return { ok: false, error: "Sem conexão. Tente de novo." };
  }
  const body: unknown = await res.json().catch(() => ({}));
  if (res.ok) return { ok: true, body };
  const message = body !== null && typeof body === "object" && "error" in body ? String(body.error) : "Algo deu errado. Tente de novo.";
  return { ok: false, error: message };
}
