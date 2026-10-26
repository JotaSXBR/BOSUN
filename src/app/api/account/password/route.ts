import { NextResponse } from "next/server";
import { type ChangePasswordError, changePassword } from "@/modules/identity/accounts.ts";
import { forbidden, readJson, sameOrigin } from "@/modules/identity/http.ts";
import { resolveSession } from "@/modules/identity/session.ts";

const MESSAGES: Record<ChangePasswordError, string> = {
  invalid: "Preencha a senha atual e a nova.",
  wrong_current: "A senha atual não confere.",
  too_short: "A senha nova precisa de 12 caracteres ou mais.",
  too_long: "A senha nova pode ter até 128 caracteres.",
  common: "Essa senha é comum demais. Escolha outra.",
  context: "A senha nova não pode conter seu usuário, seu e-mail ou o nome do sistema.",
  same_as_current: "A senha nova precisa ser diferente da atual.",
  rate_limited: "Muitas tentativas. Aguarde e tente de novo.",
};

export async function POST(req: Request): Promise<NextResponse> {
  if (!sameOrigin(req)) return forbidden();
  const current = await resolveSession(req.headers);
  if (!current) return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });
  const read = await readJson(req);
  if (read instanceof NextResponse) return read;
  const error = await changePassword(current, read.body);
  if (error) return NextResponse.json({ error: MESSAGES[error] }, { status: error === "rate_limited" ? 429 : 400 });
  return NextResponse.json({ ok: true });
}
