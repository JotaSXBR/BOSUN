import { NextResponse } from "next/server";
import { guarded } from "@/lib/route.ts";
import { type ChangePasswordError, changePassword } from "@/modules/identity/accounts.ts";
import { notFresh, readAuthed } from "@/modules/identity/http.ts";
import { isFresh } from "@/modules/identity/session.ts";

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

export const POST = guarded(async (req: Request): Promise<NextResponse> => {
  const read = await readAuthed(req);
  if (read instanceof NextResponse) return read;
  // Troca voluntária é ação sensível (ADR-102): sessão recente. A troca forçada do primeiro acesso vem logo após o login.
  if (!read.current.user.mustChangePassword && !isFresh(read.current)) return notFresh();
  const error = await changePassword(read.current, read.body);
  if (error) return NextResponse.json({ error: MESSAGES[error] }, { status: error === "rate_limited" ? 429 : 400 });
  return NextResponse.json({ ok: true });
});
