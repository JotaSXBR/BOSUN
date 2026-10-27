import { NextResponse } from "next/server";
import { readReady, withCookies } from "@/modules/identity/http.ts";
import { stepUp } from "@/modules/identity/step-up.ts";

export async function POST(req: Request): Promise<NextResponse> {
  const read = await readReady(req);
  if (read instanceof NextResponse) return read;
  const result = await stepUp(read.current, read.body, req.headers);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
  return withCookies(NextResponse.json({ ok: true }), result.headers);
}
