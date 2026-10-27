import { NextResponse } from "next/server";
import { writeAudit } from "@/modules/identity/audit.ts";
import { auth } from "@/modules/identity/auth.ts";
import { db } from "@/lib/db.ts";
import { notFresh, readReady } from "@/modules/identity/http.ts";
import { isFresh } from "@/modules/identity/session.ts";

/** Códigos de recuperação que ainda valem: só com sessão recente (senha + código há até 10 min). */
export async function POST(req: Request): Promise<NextResponse> {
  const read = await readReady(req);
  if (read instanceof NextResponse) return read;
  if (!isFresh(read.current)) return notFresh();
  const userId = read.current.user.id;
  const { backupCodes } = await auth.api.viewBackupCodes({ body: { userId } });
  await writeAudit(db, { actor: { type: "user", id: userId }, action: "auth.recovery_code.viewed", targetType: "user", targetId: userId });
  return NextResponse.json({ codes: backupCodes }, { headers: { "cache-control": "no-store" } });
}
