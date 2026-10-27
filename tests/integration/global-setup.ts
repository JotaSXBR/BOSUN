import { prepareDatabase } from "../db-setup.ts";

/** Banco de teste da integração: criado pelo banco principal (prisma.config.ts) e migrado. */
export default function setup(): void {
  prepareDatabase(process.env.DATABASE_URL ?? "postgresql://localhost", "bosun_test");
}
