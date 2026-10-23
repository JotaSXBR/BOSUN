import { execSync } from "node:child_process";

/** Cria o banco de teste pelo banco principal (prisma.config.ts) se faltar. */
export default function setup(): void {
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
