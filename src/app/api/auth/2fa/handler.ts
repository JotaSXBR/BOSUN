import { NextResponse } from "next/server";
import { forbidden, readJson, sameOrigin, withCookies } from "@/modules/identity/http.ts";
import { type SecondFactor, verifySecondFactor } from "@/modules/identity/totp.ts";

/** POST das rotas verify (TOTP) e recovery (código de recuperação); só muda o fator. */
export function secondFactorRoute(kind: SecondFactor) {
  return async function POST(req: Request): Promise<NextResponse> {
    if (!sameOrigin(req)) return forbidden();
    const read = await readJson(req);
    if (read instanceof NextResponse) return read;
    const result = await verifySecondFactor(kind, read.body, req.headers);
    if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
    return withCookies(NextResponse.json({ ok: true }), result.headers);
  };
}
