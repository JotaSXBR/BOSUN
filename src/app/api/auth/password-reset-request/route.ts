import { NextResponse } from "next/server";
import { forbidden, readJson, sameOrigin } from "@/modules/identity/http.ts";
import { requestPasswordReset } from "@/modules/identity/recovery.ts";

// Sempre 202 com a mesma mensagem: a resposta não diz se a conta existe.
export async function POST(req: Request): Promise<NextResponse> {
  if (!sameOrigin(req)) return forbidden();
  const read = await readJson(req);
  if (read instanceof NextResponse) return read;
  if (!(await requestPasswordReset(read.body, req.headers))) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde e tente de novo." }, { status: 429 });
  }
  return NextResponse.json({ ok: true }, { status: 202 });
}
