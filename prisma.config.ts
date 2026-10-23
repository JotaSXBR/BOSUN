import { existsSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

// O Prisma 7 não lê env sozinho; .env.local sobrescreve .env, como no Next. No CI vêm do ambiente.
for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
