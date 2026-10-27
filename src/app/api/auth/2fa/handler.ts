import { NextResponse } from "next/server";
import { guarded } from "@/lib/route.ts";
import { readPublic, withCookies } from "@/modules/identity/http.ts";
import { type SecondFactor, verifySecondFactor } from "@/modules/identity/totp.ts";

/** POST das rotas verify (TOTP) e recovery (código de recuperação); só muda o fator. */
export function secondFactorRoute(kind: SecondFactor) {
  return guarded(async (req: Request): Promise<NextResponse> => {
    const read = await readPublic(req);
    if (read instanceof NextResponse) return read;
    const result = await verifySecondFactor(kind, read.body, req.headers);
    if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
    return withCookies(NextResponse.json({ ok: true }), result.headers);
  });
}
