import { prepareDatabase } from "../tests/db-setup.ts";

/** Banco próprio do E2E: o build de produção e a CLI gravam nele, não no banco do dev. */
export default function setup(): void {
  prepareDatabase(process.env.BOSUN_BASE_DATABASE_URL ?? "postgresql://localhost", "bosun_e2e");
}
