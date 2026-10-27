import { NextResponse } from "next/server";
import { guarded } from "@/lib/route.ts";
import { readPublic } from "@/modules/identity/http.ts";
import { requestPasswordReset } from "@/modules/identity/recovery.ts";

// Sempre 202 com a mesma mensagem: a resposta não diz se a conta existe.
export const POST = guarded(async (req: Request): Promise<NextResponse> => {
  const read = await readPublic(req);
  if (read instanceof NextResponse) return read;
  if (!(await requestPasswordReset(read.body, req.headers))) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde e tente de novo." }, { status: 429 });
  }
  return NextResponse.json({ ok: true }, { status: 202 });
});
