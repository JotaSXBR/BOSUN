import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// O Prisma 7 não lê env sozinho; local usa o .env.local, no CI as variáveis vêm do ambiente.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Sem env() porque o generate (postinstall, CI) roda sem banco; migrate sem URL falha sozinho.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
