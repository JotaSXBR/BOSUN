import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

declare global {
  // Um cliente por processo; o hot reload do next dev reaproveita o mesmo.
  var bosunDb: PrismaClient | undefined;
}

function createDb(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  // Sem isto o pg cai em silêncio para PG*/localhost.
  if (!connectionString) throw new Error("DATABASE_URL não definida");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const db = globalThis.bosunDb ?? createDb();

if (process.env.NODE_ENV !== "production") globalThis.bosunDb = db;
