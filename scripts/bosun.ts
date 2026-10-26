// CLI de operação na VPS: `pnpm bosun admin create ...`. Nunca recebe senha por argumento.
import { parseArgs } from "node:util";
import { db } from "../src/lib/db.ts";
import { AccountError, createAccount } from "../src/modules/identity/accounts.ts";

const USAGE = `Uso:
  pnpm bosun admin create --username <usuário> --email <e-mail> --name "<nome>"`;

function fail(message: string): never {
  process.stderr.write(`${message}\n\n${USAGE}\n`);
  process.exit(1);
}

async function adminCreate(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: { username: { type: "string" }, email: { type: "string" }, name: { type: "string" } },
  });
  const { username, email, name } = values;
  if (!username || !email || !name) fail("Faltam argumentos.");
  const { user, tempPassword } = await createAccount({ username, email, name }, { type: "operator" });
  // Só stdout, uma vez; nunca pelo logger.
  process.stdout.write(
    `Conta criada: ${user.username} <${user.email}>\nSenha temporária (válida por 72 h): ${tempPassword}\n` +
      `Entre em ${process.env.BETTER_AUTH_URL ?? "<endereço da BOSUN>"}/login e troque a senha.\n`,
  );
}

const [group, command, ...rest] = process.argv.slice(2);
try {
  if (group === "admin" && command === "create") await adminCreate(rest);
  else fail("Comando desconhecido.");
} catch (err) {
  if (err instanceof AccountError || (err instanceof TypeError && "code" in err)) fail(err.message);
  throw err;
} finally {
  await db.$disconnect();
}
