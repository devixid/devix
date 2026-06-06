import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

/** Bump when EstimatorLead / SiteSettings schema changes to bust hot-reload cache */
const PRISMA_SCHEMA_VERSION = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion: number | undefined;
};

function isStalePrismaClient(client: PrismaClient): boolean {
  if (globalForPrisma.prismaSchemaVersion !== PRISMA_SCHEMA_VERSION) {
    return true;
  }

  return (
    typeof client.siteSettings === "undefined" ||
    typeof client.siteSettings.findUnique !== "function"
  );
}

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  // Initialize the pool with an explicit max size and idle timeout
  // to prevent connection exhaustion in serverless or highly concurrent environments
  const pool = new Pool({
    connectionString,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

function resolvePrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;

  // After schema changes + `prisma generate`, Next.js hot reload can keep an old
  // singleton whose delegates (e.g. siteSettings) were never attached.
  if (cached && isStalePrismaClient(cached)) {
    void cached.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
  }

  const client = globalForPrisma.prisma ?? createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  }

  return client;
}

export const prisma = resolvePrismaClient();
