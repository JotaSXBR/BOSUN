import { execSync } from "node:child_process";

/** Cria o banco de teste pelo banco principal (prisma.config.ts) se faltar e aplica as migrations nele. */
export default function setup(): void {
  // O setup cria banco e grava jobs: fora do CI, só num Postgres desta máquina.
  const host = new URL(process.env.DATABASE_URL ?? "postgresql://localhost").hostname;
  if (!process.env.CI && !["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) {
    fail(`Integração recusada: DATABASE_URL aponta para ${host}, não para esta máquina.`, "");
  }
  try {
    execSync("pnpm exec prisma db execute --stdin", {
      input: "CREATE DATABASE bosun_test;",
      stdio: ["pipe", "ignore", "pipe"],
    });
  } catch (err) {
    const stderr = stderrOf(err);
    if (!stderr.includes("already exists")) fail("Postgres indisponível para a integração; rode `pnpm services:up`.", stderr);
  }
  const url = new URL(process.env.DATABASE_URL ?? "postgresql://localhost");
  url.pathname = "/bosun_test";
  try {
    execSync("pnpm exec prisma migrate deploy", {
      env: { ...process.env, DATABASE_URL: url.toString() },
      stdio: ["ignore", "ignore", "pipe"],
    });
  } catch (err) {
    fail("Falha ao aplicar as migrations no bosun_test.", stderrOf(err));
  }
}

function stderrOf(err: unknown): string {
  return err instanceof Error && "stderr" in err ? String(err.stderr) : "";
}

// shortcut: o Vitest 5.0.5 quebra ao imprimir erro lançado do globalSetup; sai direto até corrigirem.
function fail(message: string, detail: string): never {
  process.stderr.write(`\n${message}\n${detail.trim()}\n`);
  process.exit(1);
}
