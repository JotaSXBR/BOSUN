import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client.ts";

declare global {
  // Um cliente por processo; o hot reload do next dev reaproveita o mesmo.
  var bosunDb: PrismaClient | undefined;
}

export const db = globalThis.bosunDb ?? new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

if (process.env.NODE_ENV !== "production") globalThis.bosunDb = db;
