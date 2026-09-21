import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const isDev = process.env.NODE_ENV === "development";
  const databaseUrl = process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;

  const client = new PrismaClient({
    datasourceUrl: databaseUrl,
    log: isDev
      ? [
          { emit: "event", level: "query" },
          { emit: "stdout", level: "warn" },
          { emit: "stdout", level: "error" },
        ]
      : ["error"],
  });

  if (isDev) {
    // Event-based query logging with durations, no query params printed
    (client as any).$on("query", (e: any) => {
      console.log(`[PRISMA QUERY] ${e.query.slice(0, 100)}... duration: ${e.duration}ms`);
    });
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";
