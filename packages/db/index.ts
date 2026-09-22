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
      // On port 6543 (PgBouncer transaction mode), pgbouncer=true tells Prisma not to reuse prepared statements across transactions.
      if (!u.searchParams.has("pgbouncer") && u.port === "6543") {
        u.searchParams.set("pgbouncer", "true");
      }

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

  const debugQueries = process.env.DEBUG_PRISMA_QUERIES === "true";

  const client = new PrismaClient({
    datasourceUrl: databaseUrl,
    log: debugQueries
      ? [
          { emit: "event", level: "query" },
          { emit: "stdout", level: "warn" },
          { emit: "stdout", level: "error" },
        ]
      : [
          { emit: "stdout", level: "warn" },
          { emit: "stdout", level: "error" },
        ],
  });

  if (debugQueries) {
    // Event-based query logging with durations, enabled only when DEBUG_PRISMA_QUERIES=true
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

// Note: Re-exporting from @prisma/client is required across the monorepo.
// The "unexpected export *" notice is a known Turbopack/Next.js bundler warning
// for CJS interop that does not affect runtime execution.
export * from "@prisma/client";
