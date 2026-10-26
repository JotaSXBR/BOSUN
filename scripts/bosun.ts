// CLI de operação na VPS: `pnpm bosun admin create ...`. Nunca recebe senha por argumento.
import { parseArgs } from "node:util";
import { logger } from "../src/lib/logger.ts";

const USAGE = `Uso:
  pnpm bosun admin create --username <usuário> --email <e-mail> --name "<nome>"`;

class UsageError extends Error {}

async function adminCreate(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: { username: { type: "string" }, email: { type: "string" }, name: { type: "string" } },
  });
  const { username, email, name } = values;
  if (!username || !email || !name) throw new UsageError("Faltam argumentos.");
  // Import tardio: erro de uso não depende do DATABASE_URL.
  const { db } = await import("../src/lib/db.ts");
  const { createAccount } = await import("../src/modules/identity/accounts.ts");
  try {
    const { user, tempPassword } = await createAccount({ username, email, name }, { type: "operator" });
    // Só stdout, uma vez; nunca pelo logger.
    process.stdout.write(
      `Conta criada: ${user.username} <${user.email}>\nSenha temporária (válida por 72 h): ${tempPassword}\n` +
        `Entre em ${process.env.BETTER_AUTH_URL ?? "<endereço da BOSUN>"}/login e troque a senha.\n`,
    );
  } finally {
    await db.$disconnect();
  }
}

async function main(argv: string[]): Promise<void> {
  const [group, command, ...rest] = argv;
  if (group === "admin" && command === "create") return adminCreate(rest);
  throw new UsageError("Comando desconhecido.");
}

try {
  await main(process.argv.slice(2));
} catch (err) {
  process.exitCode = 1;
  if (err instanceof UsageError || (err instanceof TypeError && "code" in err)) {
    process.stderr.write(`${err.message}\n\n${USAGE}\n`);
  } else if (err instanceof Error && err.name === "AccountError") {
    process.stderr.write(`${err.message}\n`);
  } else {
    // Erro do Prisma pode trazer argumentos (o hash); o logger corta e não imprime stack.
    logger.error("cli", "comando falhou", err);
  }
}
