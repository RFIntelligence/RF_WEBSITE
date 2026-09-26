# Deployment Diagnosis & Resolution: Production – rf-dashboard

## Summary
The Vercel deployment for the "Production – rf-dashboard" environment failed during the build/type-check step with errors originating from `../../packages/db/index.ts`:

```
../../packages/db/index.ts(95,3): error TS2305: Module '"@prisma/client"' has no exported member 'InventoryItem'.
../../packages/db/index.ts(96,3): error TS2305: Module '"@prisma/client"' has no exported member 'InventoryBatch'.
...
Failed to type check.
Command "pnpm build" exited with 1
```

## Root Cause
1. In commit `dbce04e` ("connected the inventory to backend, implmented crud operations"), new Prisma schema models (`InventoryCategory`, `InventoryItem`, `InventoryBatch`, `InventoryStockLevel`, `InventoryMovement`, `Supplier`, `PurchaseOrder`, `PurchaseOrderItem`, etc.) and enums were defined in `packages/db/prisma/schema.prisma` and exported from `packages/db/index.ts`.
2. Vercel builds the dashboard in isolation using `apps/dashboard/vercel.json` (or root settings with Root Directory set to `apps/dashboard`).
3. In `apps/dashboard/vercel.json`, the configuration was:
   ```json
   {
     "buildCommand": "pnpm build",
     "devCommand": "pnpm dev",
     "installCommand": "pnpm install",
     "framework": "nextjs",
     "outputDirectory": ".next"
   }
   ```
4. Neither `apps/dashboard/package.json`'s `build` script (`next build`) nor `apps/dashboard/vercel.json` triggered `prisma generate` in `packages/db`. When Vercel ran `pnpm install` in CI, pnpm created standard package node_modules without running Prisma generation for the newly added schema models in `@prisma/client`.
5. When Next.js executed its TypeScript verification during `next build`, TypeScript checked `packages/db/index.ts` against the stale/un-generated `@prisma/client` types and failed with `TS2305: Module '"@prisma/client"' has no exported member '...'`.

Notice that `apps/website/vercel.json` was already configured with monorepo root traversal:
```json
{
  "framework": "nextjs",
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm --filter rf-intelligence build",
  "outputDirectory": ".next"
}
```
`apps/dashboard/vercel.json` was missing this root command coordination and prisma client generation before building.

## Fix Applied
1. **Added `prebuild` hook to [apps/dashboard/package.json](file:///apps/dashboard/package.json)**:
   ```json
   "prebuild": "pnpm --filter @rf-intelligence/db db:generate",
   "build": "next build"
   ```
   Ensures that anytime `pnpm build` (or Next.js build) is invoked within the dashboard app, `@prisma/client` is automatically generated first.

2. **Updated [apps/dashboard/vercel.json](file:///apps/dashboard/vercel.json)**:
   Aligned `installCommand` and `buildCommand` with monorepo standards to ensure full workspace resolution and explicit Prisma generation:
   ```json
   {
     "buildCommand": "cd ../.. && pnpm --filter @rf-intelligence/db db:generate && pnpm --filter @rf-intelligence/dashboard build",
     "devCommand": "pnpm dev",
     "installCommand": "cd ../.. && pnpm install",
     "framework": "nextjs",
     "outputDirectory": ".next"
   }
   ```

## Verification
- `pnpm --filter @rf-intelligence/dashboard typecheck` passed (exit code 0).
- `pnpm run build` inside `apps/dashboard` passed with 0 errors (generating Prisma Client v5.22.0 and compiling all 15 static/dynamic routes).
- Monorepo website `apps/website` was not modified in any way.

## Manual Steps Required
1. **Database Migration to Production Database**:
   Commit `dbce04e` added the migration `packages/db/prisma/migrations/20260926_add_inventory_models/migration.sql`.
   Apply this migration to the production database:
   ```bash
   pnpm --filter @rf-intelligence/db prisma migrate deploy
   ```
   *(or run `npx prisma migrate deploy` within `packages/db` with `DATABASE_URL` pointing to production database)*.
2. **Push git commit**:
   Push the commit with the updated `apps/dashboard/package.json` and `apps/dashboard/vercel.json`.
3. **Verify Vercel Environment Variables**:
   Ensure `DATABASE_URL` and `DIRECT_URL` (if configured) are present in the Vercel dashboard environment settings for "Production – rf-dashboard".
