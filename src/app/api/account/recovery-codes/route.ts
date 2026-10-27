import { NextResponse } from "next/server";
import { guarded } from "@/lib/route.ts";
import { readFresh } from "@/modules/identity/http.ts";
import { regenerateRecoveryCodes } from "@/modules/identity/totp.ts";

/** Gera 10 códigos de recuperação novos: senha + sessão recente; os anteriores deixam de valer. */
export const POST = guarded(async (req: Request): Promise<NextResponse> => {
  const read = await readFresh(req);
  if (read instanceof NextResponse) return read;
  const result = await regenerateRecoveryCodes(read.current, read.body, req.headers);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
  return NextResponse.json({ codes: result.recoveryCodes }, { headers: { "cache-control": "no-store" } });
});
