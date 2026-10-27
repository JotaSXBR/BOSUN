import { NextResponse } from "next/server";
import { readAuthed } from "@/modules/identity/http.ts";
import { enrollTotp } from "@/modules/identity/totp.ts";

export async function POST(req: Request): Promise<NextResponse> {
  const read = await readAuthed(req);
  if (read instanceof NextResponse) return read;
  const result = await enrollTotp(read.current, read.body, req.headers);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
  // Segredo e códigos só nesta resposta; não guardar em cache.
  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}
