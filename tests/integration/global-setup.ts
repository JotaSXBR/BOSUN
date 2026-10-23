import { execSync } from "node:child_process";

/** Cria o banco de teste pelo banco principal (prisma.config.ts) se faltar. */
export default function setup(): void {
  // O setup cria banco e grava jobs: fora do CI, só num Postgres desta máquina.
  const host = new URL(process.env.DATABASE_URL ?? "postgresql://localhost").hostname;
  if (!process.env.CI && !["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) {
    process.stderr.write(`
Integração recusada: DATABASE_URL aponta para ${host}, não para esta máquina.
`);
    process.exit(1);
  }
  try {
    execSync("pnpm exec prisma db execute --stdin", {
      input: "CREATE DATABASE bosun_test;",
      stdio: ["pipe", "ignore", "pipe"],
    });
  } catch (err) {
    const stderr = err instanceof Error && "stderr" in err ? String(err.stderr) : "";
    if (stderr.includes("already exists")) return;
    // shortcut: o Vitest 5.0.5 quebra ao imprimir erro lançado do globalSetup; sai direto até corrigirem.
    process.stderr.write(`\nPostgres indisponível para a integração; rode \`pnpm services:up\`.\n${stderr.trim()}\n`);
    process.exit(1);
  }
}
