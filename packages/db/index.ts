import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const isDev = process.env.NODE_ENV === "development";
  const isProd = process.env.NODE_ENV === "production";

  // In production, ignore DATABASE_URL_LOCAL and always use the production DATABASE_URL
  let rawUrl = (!isProd && process.env.DATABASE_URL_LOCAL) ? process.env.DATABASE_URL_LOCAL : process.env.DATABASE_URL;

  let databaseUrl = rawUrl;
  if (databaseUrl && !databaseUrl.startsWith("file:")) {
    try {
      const u = new URL(databaseUrl);
      // Prisma's Rust query engine treats `pgbouncer=true` by forcing a BEGIN -> DEALLOCATE ALL -> query -> COMMIT wrapper
      // on EVERY query to prevent prepared statement leaks in transaction poolers.
      // Removing pgbouncer=true eliminates this 4x round-trip overhead for queries while keeping direct execution.
      u.searchParams.delete("pgbouncer");

      if (!u.searchParams.has("connection_limit")) {
        u.searchParams.set("connection_limit", isDev ? "5" : "10");
      }
      if (!u.searchParams.has("pool_timeout")) {
        u.searchParams.set("pool_timeout", "30");
      }
      if (!u.searchParams.has("connect_timeout")) {
        u.searchParams.set("connect_timeout", "30");
      }
      databaseUrl = u.toString();
    } catch {
      // Keep rawUrl if URL parsing fails
    }
  }

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
