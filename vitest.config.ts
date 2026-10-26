import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Local usa o .env.local; no CI as variáveis vêm do ambiente.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// Integração roda num banco próprio, para não disputar jobs com o worker do dev.
function testDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  const url = new URL(raw);
  url.pathname = "/bosun_test";
  return url.toString();
}

const testUrl = testDatabaseUrl();

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    // Segredo só de teste quando o .env.local não define um.
    env: { BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "test-only-secret-with-at-least-32-chars" },
    projects: [
      { extends: true, test: { name: "unit", include: ["src/**/*.test.ts", "worker/**/*.test.ts"] } },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          globalSetup: ["tests/integration/global-setup.ts"],
          env: testUrl ? { DATABASE_URL: testUrl } : {},
          testTimeout: 20_000,
          hookTimeout: 20_000,
        },
      },
    ],
    coverage: {
      provider: "v8",
      // worker/ fica fora: index.ts só liga os sinais ao src/lib/worker.ts e migrate.ts roda no db:migrate.
      include: ["src/**/*.{ts,tsx}"],
      // Páginas, layouts, componentes, hooks de React e o guard (redirect do Next) ficam com o E2E.
      exclude: ["**/*.test.ts", "src/app/**/*.tsx", "src/modules/identity/guard.ts", "src/lib/use-*.ts", "src/generated/**"],
      thresholds: { lines: 80, branches: 80 },
    },
  },
});
