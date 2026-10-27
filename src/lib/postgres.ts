import { db } from "./db.ts";

/** O throttle usa `RETURNING old/new` (PostgreSQL 18). Em versão menor, todo login quebraria com erro de SQL. */
export const MIN_POSTGRES = 180_000;

export function isSupportedPostgres(versionNum: number): boolean {
  return versionNum >= MIN_POSTGRES;
}

/** Falha no boot do worker e na migração, com mensagem clara, em vez de 500 em todo login. */
export async function requireSupportedPostgres(): Promise<void> {
  const [row] = await db.$queryRaw<{ server_version_num: string }[]>`SHOW server_version_num`;
  const version = Number(row?.server_version_num ?? 0);
  if (!isSupportedPostgres(version)) throw new Error(`PostgreSQL 18 ou mais novo é obrigatório (o banco é ${version}).`);
}
