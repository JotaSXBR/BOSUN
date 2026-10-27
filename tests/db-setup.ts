import { execSync } from "node:child_process";

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1", "[::1]"];

/**
 * Cria o banco `name` pelo banco principal (`baseUrl`) se faltar e aplica as migrations nele.
 * Devolve a URL do banco criado. Usado pela integração (`bosun_test`) e pelo E2E (`bosun_e2e`).
 */
export function prepareDatabase(baseUrl: string, name: string): string {
  // O setup cria banco e grava dados: fora do CI, só num Postgres desta máquina.
  const host = new URL(baseUrl).hostname;
  if (!process.env.CI && !LOCAL_HOSTS.includes(host)) {
    fail(`Teste recusado: DATABASE_URL aponta para ${host}, não para esta máquina.`, "");
  }
  try {
    execSync("pnpm exec prisma db execute --stdin", {
      input: `CREATE DATABASE ${name};`,
      env: { ...process.env, DATABASE_URL: baseUrl },
      stdio: ["pipe", "ignore", "pipe"],
    });
  } catch (err) {
    const stderr = stderrOf(err);
    if (!stderr.includes("already exists")) fail("Postgres indisponível para os testes; rode `pnpm services:up`.", stderr);
  }
  const url = new URL(baseUrl);
  url.pathname = `/${name}`;
  try {
    execSync("pnpm exec prisma migrate deploy", { env: { ...process.env, DATABASE_URL: url.toString() }, stdio: ["ignore", "ignore", "pipe"] });
  } catch (err) {
    fail(`Falha ao aplicar as migrations no ${name}.`, stderrOf(err));
  }
  return url.toString();
}

function stderrOf(err: unknown): string {
  return err instanceof Error && "stderr" in err ? String(err.stderr) : "";
}

// shortcut: o Vitest 5.0.5 quebra ao imprimir erro lançado do globalSetup; sai direto até corrigirem.
function fail(message: string, detail: string): never {
  process.stderr.write(`\n${message}\n${detail.trim()}\n`);
  process.exit(1);
}
