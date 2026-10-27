import { defineConfig, devices } from "@playwright/test";

const port = 3100;

// O .env.local do dev (no CI, as variáveis já vêm do job); nada é sobrescrito.
try {
  process.loadEnvFile(".env.local");
} catch {
  // sem .env.local: CI
}

// Banco próprio do E2E. O servidor, os testes e a CLI (que herdam este env) gravam no bosun_e2e.
const base = process.env.BOSUN_BASE_DATABASE_URL ?? process.env.DATABASE_URL ?? "postgresql://localhost";
const e2eDb = new URL(base);
e2eDb.pathname = "/bosun_e2e";
process.env.BOSUN_BASE_DATABASE_URL = base;
process.env.DATABASE_URL = e2eDb.toString();

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${port}`, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Build de produção, como o usuário recebe.
  webServer: {
    command: `pnpm build && pnpm start -p ${port}`,
    port,
    timeout: 180_000,
    reuseExistingServer: false,
    // A origem do login precisa bater com a porta do teste.
    env: { BETTER_AUTH_URL: `http://localhost:${port}`, DATABASE_URL: e2eDb.toString() },
  },
});
