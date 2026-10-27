import { NextResponse } from "next/server";
import { guarded } from "@/lib/route.ts";
import { readReady, withCookies } from "@/modules/identity/http.ts";
import { stepUp } from "@/modules/identity/step-up.ts";

export const POST = guarded(async (req: Request): Promise<NextResponse> => {
  const read = await readReady(req);
  if (read instanceof NextResponse) return read;
  const result = await stepUp(read.current, read.body, req.headers);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
  return withCookies(NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } }), result.headers);
});
